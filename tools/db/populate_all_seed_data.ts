import type { Db } from "mongodb"
import path from "path"
import url from "url"
import {connectToCoreDb, disconnectCoreClient} from "../../src/api/db/coredb";
import DateTimeUtils from "../../src/common/utils/date_time_utils"
import {getAllFilesAsync} from "../../src/api/fw/utils/file_utils"


*/ Gets all migration files by their name */
async function getFileNames(): Promise<string[]> {
  const migrationFilesPath = path.resolve(path.join(__dirname, "core"))
  const files = await getAllFilesAsync(migrationFilesPath)
  const filePaths = files.map((f) => f.path)
  return filePaths.sort() // making sure the files are sorted before running migrations
}

async function loadAndRunSeedFile(db: Db, filePath: string) {
  // import module needs files to start with "file://" and not C:\
  console.log(`Running seed: ${filePath}`)
  const fileUrl = url.pathToFileURL(filePath).toString()
  const m = await import(fileUrl)
  await m.default(db)
}

async function populate_all_seed_data() {
  const fileNames = await getFileNames()
  if (fileNames.length <= 0) throw Error("No seed file found.")

  const db: Db = await connectToCoreDb()

  let isSuccessful = false
  const startedAt = DateTimeUtils.getCurrentDateTimeUtc()
  try {
    for (let i = 0; i < fileNames.length; i++) {
      const filePath = fileNames[i] || ""

      await loadAndRunSeedFile(db, filePath)
    }

    isSuccessful = true
  } finally {
    try {
      console.log("Seeds completed", { isSuccessful, startedAt, endedAt: DateTimeUtils.getCurrentDateTimeUtc() })
      // await endMigrations(startedAt, isSuccessful)
    } finally {
      await disconnectCoreClient()
    }
  }
}

populate_all_seed_data()
  .then(() => {
    console.log("seed data population completed!")
    process.exit(0)
  })
  .catch((e) => {
    console.log("seed data population failed!")
    console.error(e)
    process.exit(1)
  })
