import { FileNameUtils } from "@src/common/utils/filename_utils.ts";

export interface FileInfo {
	path: string;
	name: string;
	size: number;
	createdAt: Date;
	ext?: string;
	isFolder?: boolean;
	isFile?: boolean;
}

type FileStats = {
	size: number;
	ctime: Date;
	isDirectory: () => boolean;
	isFile: () => boolean;
};

type FsModule = {
	constants: { F_OK: number };
	existsSync: (path: string) => boolean;
	lstatSync: (path: string) => FileStats;
	readdirSync: (path: string) => string[];
	readFileSync: (path: string, encoding: "utf-8") => string;
	mkdirSync: (path: string, options?: { recursive?: boolean }) => void;
	access: (path: string, mode: number, callback: (err: unknown) => void) => void;
	promises: {
		readFile: (path: string, encoding?: "utf-8") => Promise<string | Uint8Array>;
		readdir: (path: string) => Promise<string[]>;
		mkdir: (path: string, options?: { recursive?: boolean }) => Promise<void>;
		writeFile: (path: string, data: Uint8Array) => Promise<void>;
		unlink: (path: string) => Promise<void>;
	};
};

type PathModule = {
	join: (...paths: string[]) => string;
	dirname: (path: string) => string;
	sep: string;
};

function getBuiltinModule(moduleName: string): unknown | null {
	const g = globalThis as {
		process?: { getBuiltinModule?: (name: string) => unknown };
	};
	const getBuiltin = g.process?.getBuiltinModule;
	if (typeof getBuiltin !== "function") return null;
	try {
		return getBuiltin(moduleName) ?? getBuiltin(moduleName.replace(/^node:/, ""));
	} catch {
		return null;
	}
}

function getFs(): FsModule | null {
	return (getBuiltinModule("node:fs") as FsModule | null) ?? null;
}

function getPath(): PathModule | null {
	return (getBuiltinModule("node:path") as PathModule | null) ?? null;
}

function joinPath(...parts: string[]): string {
	const path = getPath();
	if (path) return path.join(...parts);
	return parts.filter(Boolean).join("/").replace(/\/+/g, "/");
}

function dirnamePath(pathValue: string): string {
	const path = getPath();
	if (path) return path.dirname(pathValue);
	const normalized = pathValue.replace(/\\/g, "/");
	const lastSlash = normalized.lastIndexOf("/");
	return lastSlash <= 0 ? "." : normalized.slice(0, lastSlash);
}

function pathSeparator(): string {
	const path = getPath();
	return path?.sep ?? "/";
}

function isWorkerRuntime(): boolean {
	return typeof WebSocketPair !== "undefined";
}

function workerUnsupported(methodName: string): never {
	throw new Error(`FileUtils.${methodName} is not supported in Cloudflare Workers (no local filesystem).`);
}

export class FileUtils {

	/**
	 * Gets file information from the hard disk
	 * Because lstatSync throws an exception, we had to wrap it in case it failed (like file deleted in the middle)
	 * @param fileFullName
	 * @return {fs.Stats | null}
	 */
	static getFileStats(fileFullName: string): FileStats | null {
		const fs = getFs();
		if (!fs) return null;
		if (!fs.existsSync(fileFullName)) return null
		try {
			return fs.lstatSync(fileFullName)
		} catch {
			return null
		}
	}

	/**
	 * Gets array of all folders using provided source folder
	 * @param source source folder to search within
	 * @return {Array<FileInfo>}
	 */
	getAllFolders(source: string): FileInfo[] {
		const folders: FileInfo[] = []
		const fs = getFs();
		if (!fs) return folders;

		const list = fs.readdirSync(source)
		for (const item of list) {
			const stats = FileUtils.getFileStats(joinPath(source, item))
			if (!stats) continue
			if (stats.isDirectory()) {
				const name = item.split(pathSeparator()).pop()!
				folders.push({
					path: joinPath(source, item),
					name,
					ext: FileNameUtils.getFileExt(name),
					size: stats.size,
					createdAt: stats.ctime,
				})
			}
		}

		return folders
	}

	/**
	 * Gets array of all files and folders using the provided source folder
	 * @param source {string} source folder to search within
	 * @return {Array<FileInfo>}
	 */
	getAllFilesAndFolders(source: string): FileInfo[] {
		const result: FileInfo[] = []
		const fs = getFs();
		if (!fs) return result;

		const list = fs.readdirSync(source)
		for (const item of list) {
			const stats = FileUtils.getFileStats(joinPath(source, item))
			if (!stats) continue

			const name = item.split(pathSeparator()).pop()!
			result.push({
				path: joinPath(source, item),
				name,
				ext: FileNameUtils.getFileExt(name),
				size: stats.size,
				createdAt: stats.ctime,
				isFolder: stats.isDirectory(),
				isFile: stats.isFile(),
			})
		}

		return result
	}

	/**
	 * Reads the whole file as a string in UTF-8 format
	 * @param {string} fileFullName - file full name
	 * @return {string|null} file content as string
	 */
	readAllText(fileFullName: string): string | null {
		const fs = getFs();
		if (!fs) return null;
		if (!fs.existsSync(fileFullName)) return null
		return fs.readFileSync(fileFullName, "utf-8")
	}

//
// /**
//  * Creates a read stream for a file on the local hard disk
//  * @param {string} fileFullName  - file full name
//  * @return {ReadStream|null}
//  */
// export function createReadStream(fileFullName: string): ReadStream | null {
//   if (!fs.existsSync(fileFullName)) return null;
//   return fs.createReadStream(fileFullName);
// }

	/**
	 * Reads the whole file as a Buffer
	 * @param {string} fileFullName - file full name
	 * @return {Promise<Uint8Array>} file content as Buffer
	 */
	async readAllBytesAsync(fileFullName: string): Promise<Uint8Array | null> {
		const fs = getFs();
		if (!fs) return null;
		const fsPromises = fs.promises
		if (!fs.existsSync(fileFullName)) return null
		return (await fsPromises.readFile(fileFullName)) as Uint8Array
	}

// /**
//  * Reads a text file encoded using gzip encoding
//  * @param {string|null} fileFullName - file full name
//  * @return {Promise<string|null>} file content as string
//  */
// export async function readAllTextGzip(
//   fileFullName: string | null,
// ): Promise<string | null> {
//   if (!fs.existsSync(fileFullName)) return null;
//   const r = fs.createReadStream(fileFullName);
//   const z = zlib.createGunzip();
//   return getStream(r.pipe(z));
// }

	/**
	 * Create the folder on local computer if it does not exit
	 * It checks whether the folder exists first and if not, it makes the directory
	 * @param {string} pathFullName - the full path
	 */
	createFolderIfNotExist(pathFullName: string): void {
		const fs = getFs();
		if (!fs) {
			if (isWorkerRuntime()) workerUnsupported("createFolderIfNotExist");
			return;
		}
		if (!pathFullName) return
		if (!fs.existsSync(pathFullName)) fs.mkdirSync(pathFullName, { recursive: true })
	}

	/**
	 * Make the file size bytes look better
	 * @param bytes
	 * @param decimals
	 * @returns {string}
	 */
	formatBytes(bytes: number, decimals: number = 2): string {
		if (bytes === 0) return "0 Bytes"
		const k = 1024
		const dm = decimals < 0 ? 0 : decimals
		const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]
		const i = Math.floor(Math.log(bytes) / Math.log(k))
		return `${parseFloat((bytes / k ** i).toFixed(dm))} ${sizes[i]}`
	}

// /**
//  * Gets file mime type by file name. If it couldn't get it, it will return application/octet      * @param {string} fileName - file name or extension
//  * @returns {string}
//  */
// export function getMimeTypeByFileName(fileName: string): string {
//   let contentType = mime.lookup(fileName);
//   // lookup returns false for types that can't be find like .sqlite.
//   if (contentType === false) {
//     contentType = "application/octet-stream";
//   }
//   return contentType; // must be string
// }
//
	/**
	 * Reads Text file as json object
	 * @param {string} fileFullName - file full name
	 * @return {Promise<Object|null>} file content as json object or null if didn't work
	 */
	async readFileAsJsonAsync(fileFullName: string): Promise<object | null> {
		const fs = getFs();
		if (!fs) return null;
		const fsPromises = fs.promises // needs node 11
		if (!fs.existsSync(fileFullName)) return null
		const fileContent = (await fsPromises.readFile(fileFullName, "utf-8")) as string
		let metaObject
		try {
			metaObject = JSON.parse(fileContent)
		} catch (e) {
			metaObject = null
		}
		return metaObject
	}

	/**
	 * Gets array of all files using provided source folder
	 * @param {string} source source folder to search within
	 * @return {Promise<Array<FileInfo>>}
	 */
	async getAllFilesAsync(source: string): Promise<Array<FileInfo>> {
		const folders: Array<FileInfo> = []
		const fs = getFs();
		if (!fs) return folders;
		if (!fs.existsSync(source)) return []
		const fsPromises = fs.promises // needs node 11
		const list = await fsPromises.readdir(source)
		for (const item of list) {
			const stats = FileUtils.getFileStats(joinPath(source, item))
			if (!stats) continue

			if (!stats.isDirectory()) {
				const name = item.split(pathSeparator()).pop()
				if (name) {
					folders.push({
						path: joinPath(source, item),
						name,
						ext: FileNameUtils.getFileExt(name),
						size: stats.size,
						createdAt: stats.ctime,
					})
				}
			}
		}

		return folders
	}

	/**
	 * Gets array of all file names using provided source folder
	 * @param {string} source source folder to search within
	 * @return {Promise<Array<string>>}
	 */
	async getAllFileNamesAsync(source: string): Promise<Array<string>> {
		const result: Array<string> = []
		const fs = getFs();
		if (!fs) return result;
		if (!fs.existsSync(source)) return []
		const fsPromises = fs.promises // needs node 11
		const list = await fsPromises.readdir(source)
		for (const item of list) {
			const stats = FileUtils.getFileStats(joinPath(source, item))
			if (!stats) continue

			if (!stats.isDirectory()) {
				result.push(item)
			}
		}
		return result
	}

	/**
	 * Saves file bytes
	 * @param {string} fileFullName  - file full name (for storing on the drive)
	 * @param {Uint8Array} fileBuffer  - actual file bytes to be written
	 * @returns {Promise<string>}
	 */
	async saveAllBytes(fileFullName: string, fileBuffer: Uint8Array): Promise<string> {
		const fs = getFs();
		if (!fs) workerUnsupported("saveAllBytes");
		const fsPromises = fs.promises // needs node 11
		await fsPromises.mkdir(dirnamePath(fileFullName), { recursive: true })
		await fsPromises.writeFile(fileFullName, fileBuffer)
		return fileFullName
	}

	/**
	 * Saves the file to hard disk
	 * @param {string} textContent - actual file bytes to be written
	 * @param {string} fileFullName - file full name (for storing on the drive)
	 */
	async writeFileAllText(fileFullName: string, textContent: string): Promise<string> {
		const fs = getFs();
		if (!fs) workerUnsupported("writeFileAllText");
		const buffer = new TextEncoder().encode(textContent)
		const fsPromises = fs.promises // needs node 11
		await fsPromises.mkdir(dirnamePath(fileFullName), { recursive: true })
		await fsPromises.writeFile(fileFullName, buffer)
		return fileFullName
	}

// /**
//  * Creates a read stream for a file on the local hard disk
//  * @param {string} fileFullName  - file full name
//  * @return {ReadStream|null}
//  */
// export function createReadStream(fileFullName: string): ReadStream | null {
//   if (!fs.existsSync(fileFullName)) return null;
//   return fs.createReadStream(fileFullName);
// }

	/**
	 * Deletes a file from hard disk and does not throw an exception if it couldn't
	 * @param fileFullName
	 * @return {Promise<void>}
	 */
	async deleteFile(fileFullName: string): Promise<void> {
		const fs = getFs();
		if (!fs) workerUnsupported("deleteFile");
		const fsPromises = fs.promises
		return fsPromises.unlink(fileFullName)
	}

	/**
	 * Deletes a file from hard disk and does not throw an exception if it couldn't
	 * @param fileFullName
	 * @return {Promise<void>}
	 */
	async deleteFileIgnoreError(fileFullName: string): Promise<void> {
		const fs = getFs();
		if (!fs) return;
		const fsPromises = fs.promises
		try {
			await fsPromises.unlink(fileFullName)
		} catch (e) {
			console.error(e)
		}
	}

	/**
	 * Checks if file exists for the provided storage path
	 * @param {string} filePath
	 * @return {Promise<boolean>}
	 */
	async doesLocalFileExists(filePath: string): Promise<boolean> {
		const fs = getFs();
		if (!fs) return false;
		return new Promise((r) => {
			fs.access(filePath, fs.constants.F_OK, (e) => r(!e))
		})
	}
}
