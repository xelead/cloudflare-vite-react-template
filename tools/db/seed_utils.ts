import type { Db } from "mongodb"
import MongoDbRepo from "../../src/api/fw/db/mongo_repo";
import {connectToCoreDb} from "../../src/api/fw/db/mongo_db_connection";

/**
 * Checks that there is not duplicated (.id) fields in the list
 * And each row has an id
 * @param rows
 * @param collectionName - collection name
 */
function validateIds(collectionName: string, rows: any[]) {
  const ids: string[] = []
  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i]
    if (!row) continue
    if (!row.id) throw Error(`No id defined for row with this data ${JSON.stringify(row)}`)

    if (ids.includes(String(rows[i].id))) throw Error(`${collectionName} has duplicated id: ${row.id}`)

    ids.push(rows[i].id)
  }
}

/**
 * Saves the rows in the database
 * @param db
 * @param rows
 * @param collectionName
 */
async function populateDb(db: Db, rows: any[], collectionName: string) {
  const repo = new MongoDbRepo(db, collectionName)

  const promises = []
  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i]
    if (!row) continue

    promises.push(repo.upsert(row))
  }

  await Promise.all(promises)

  // console.log(`${collectionName} completed.`);
}

async function populateCoreDb(rows: any[], collectionName: string) {
  console.log(`populating ${collectionName}`)
  validateIds(collectionName, rows)
  const db = await connectToCoreDb()
  await populateDb(db, rows, collectionName)
}

export { populateCoreDb }
