export interface FileInfo {
	path: string;
	name: string;
	size: number;
	createdAt: Date;
	ext?: string;
}

export async function getAllFilesAsync(_source: string): Promise<FileInfo[]> {
	throw new Error("getAllFilesAsync is only available in Node tooling.");
}
