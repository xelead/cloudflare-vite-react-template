import { connectToCoreDb, disconnectCoreClient } from "@/src/core/dataAccess/api/MongoDbConnection"

async function cleanCoreDb() {
  console.log("Deleting everything in core.db")
  const db = await connectToCoreDb()
  try {
    const collections = await db.collections({})
    console.log(`There are ${collections.length} collections in the database to delete.`)
    for (let i = 0; i < collections.length; i++) {
      const c = collections[i]
      if (!c) continue

      console.log(`Deleting collection ${c.collectionName}`)
      await c.drop()
    }
  } finally {
    await disconnectCoreClient()
  }
}

cleanCoreDb()
  .then(() => {
    console.log("clean database done!")
    process.exit(0)
  })
  .catch((e) => {
    console.log("clean database error!")
    console.error(e)
    process.exit(1)
  })
