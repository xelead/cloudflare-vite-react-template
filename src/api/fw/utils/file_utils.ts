import { join } from "path"

interface FileInfo {
  path: string
  name: string
  size: number
  createdAt: Date
  isFolder?: boolean
  isFile?: boolean
  ext?: string
}

export class FileUtils {
  /**
   * Gets file information from the hard disk
   * Because lstatSync throws an exception, we had to wrap it in case it failed (like file deleted in the middle)
   * @param fileFullName
   * @return {fs.Stats | null}
   */
  getFileStats(fileFullName: string): fs.Stats | null {
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
  export function getAllFolders(source: string): FileInfo[] {
    const folders: FileInfo[] = []

    const list = fs.readdirSync(source)
    _.forEach(list, function getItem(item) {
      const stats = getFileStats(path.join(source, item))
      if (!stats) return
      if (stats.isDirectory()) {
        const name = item.split(path.sep).pop()!
        folders.push({
          path: path.join(source, item),
          name,
          ext: getFileExt(name),
          size: stats.size,
          createdAt: stats.ctime,
        })
      }
    })

    return folders
  }

  /**
   * Gets array of all files and folders using the provided source folder
   * @param source {string} source folder to search within
   * @return {Array<FileInfo>}
   */
  export function getAllFilesAndFolders(source: string): FileInfo[] {
    const result: FileInfo[] = []

    const list = fs.readdirSync(source)
    _.forEach(list, function getItem(item) {
      const stats = getFileStats(path.join(source, item))
      if (!stats) return

      const name = item.split(path.sep).pop()!
      result.push({
        path: path.join(source, item),
        name,
        ext: getFileExt(name),
        size: stats.size,
        createdAt: stats.ctime,
        isFolder: stats.isDirectory(),
        isFile: stats.isFile(),
      })
    })

    return result
  }

  /**
   * Reads the whole file as a string in UTF-8 format
   * @param {string} fileFullName - file full name
   * @return {string|null} file content as string
   */
  export function readAllText(fileFullName: string): string | null {
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
  export async function readAllBytesAsync(fileFullName: string): Promise<Buffer | null> {
    const fsPromises = fs.promises
    if (!fs.existsSync(fileFullName)) return null
    return fsPromises.readFile(fileFullName)
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
  export function createFolderIfNotExist(pathFullName: string): void {
    if (!pathFullName) return
    if (!fs.existsSync(pathFullName)) fs.mkdirSync(pathFullName, { recursive: true })
  }

  /**
   * Make the file size bytes look better
   * @param bytes
   * @param decimals
   * @returns {string}
   */
  export function formatBytes(bytes: number, decimals: number = 2): string {
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
  export async function readFileAsJsonAsync(fileFullName: string): Promise<Object | null> {
    const fsPromises = fs.promises // needs node 11
    if (!fs.existsSync(fileFullName)) return null
    const fileContent = await fsPromises.readFile(fileFullName, "utf-8")
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
  export async function getAllFilesAsync(source: string): Promise<Array<FileInfo>> {
    const folders: Array<FileInfo> = []
    if (!fs.existsSync(source)) return []
    const fsPromises = fs.promises // needs node 11
    const list = await fsPromises.readdir(source)
    _.forEach(list, function getItem(item) {
      const stats = getFileStats(join(source, item))
      if (!stats) return

      if (!stats.isDirectory()) {
        const name = item.split(path.sep).pop()
        if (name) {
          folders.push({
            path: path.join(source, item),
            name,
            ext: getFileExt(name),
            size: stats.size,
            createdAt: stats.ctime,
          })
        }
      }
    })

    return folders
  }

  /**
   * Gets array of all file names using provided source folder
   * @param {string} source source folder to search within
   * @return {Promise<Array<string>>}
   */
  export async function getAllFileNamesAsync(source: string): Promise<Array<string>> {
    const result: Array<string> = []
    if (!fs.existsSync(source)) return []
    const fsPromises = fs.promises // needs node 11
    const list = await fsPromises.readdir(source)
    _.forEach(list, function getItem(item) {
      const stats = getFileStats(join(source, item))
      if (!stats) return

      if (!stats.isDirectory()) {
        result.push(item)
      }
    })
    return result
  }

  /**
   * Saves file bytes
   * @param {string} fileFullName  - file full name (for storing on the drive)
   * @param {Uint8Array} fileBuffer  - actual file bytes to be written
   * @returns {Promise<string>}
   */
  export async function saveAllBytes(fileFullName: string, fileBuffer: Buffer): Promise<string> {
    const fsPromises = fs.promises // needs node 11
    await fsPromises.mkdir(path.dirname(fileFullName), { recursive: true })
    await fsPromises.writeFile(fileFullName, fileBuffer)
    return fileFullName
  }

  /**
   * Saves the file to hard disk
   * @param {string} textContent - actual file bytes to be written
   * @param {string} fileFullName - file full name (for storing on the drive)
   */
  export async function writeFileAllText(fileFullName: string, textContent: string): Promise<string> {
    const buffer = Buffer.from(textContent, "utf-8")
    const fsPromises = fs.promises // needs node 11
    await fsPromises.mkdir(path.dirname(fileFullName), { recursive: true })
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
  export async function deleteFile(fileFullName: string): Promise<void> {
    const fsPromises = fs.promises
    return fsPromises.unlink(fileFullName)
  }

  /**
   * Deletes a file from hard disk and does not throw an exception if it couldn't
   * @param fileFullName
   * @return {Promise<void>}
   */
  export async function deleteFileIgnoreError(fileFullName: string): Promise<void> {
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
  export async function doesLocalFileExists(filePath: string): Promise<boolean> {
    return new Promise((r) => {
      fs.access(filePath, fs.constants.F_OK, (e) => r(!e))
    })
  }

}
