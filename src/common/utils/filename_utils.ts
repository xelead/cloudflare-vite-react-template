// This class has Browser friendly file name manipulation

export class FileNameUtils {
  /**
   * Gets file extension by its name
   * @param {string} fileName - file name like myfileName.json
   * @return {string} like json
   */
  static getFileExt(fileName: string): string {
    if (!fileName) return ""
    const dotIndex = fileName.indexOf(".")
    if (dotIndex === -1) return ""
    return fileName.substring(dotIndex + 1)
  }

  /**
   * Gets file extension by its name
   * @param {string} fileUrl - file name like file://c/temp/myfileName.json
   * @return {string} like myfileName.json
   */
  static getFileNameFromUrl(fileUrl: string): string {
    if (!fileUrl) return ""
    const slash = fileUrl.lastIndexOf("/")
    if (slash === -1) return ""
    return fileUrl.substring(slash + 1)
  }

  /**
   * Gets file name from the path. Path can be Windows or Linux
   * @param filePath
   */
  static getFileNameFromPath(filePath: string) {
    // workaround for windows by converting \\ to / and using the same method as above. not performant but OK for now
    if (filePath.indexOf("\\") > 0) {
      filePath = filePath.replaceAll("\\", "/")
    }
    return getFileNameFromUrl(filePath)
  }

}
