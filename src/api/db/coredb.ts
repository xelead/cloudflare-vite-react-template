import type { Db } from "mongodb"
import { MongoClient } from "mongodb"
import {getEnvString} from "@src/api/fw/config/env_helpers.ts";

declare global {
    var dbCoreCachedClient: MongoClient | undefined
    var dbCoreCachedDb: Db | undefined
}

const connectToDatabase = async (url: string, dbName: string): Promise<Db> => {
    if (globalThis.dbCoreCachedDb) {
        return globalThis.dbCoreCachedDb
    }

    if (!globalThis.dbCoreCachedClient) {
        console.log("connecting to MongoDb")
        globalThis.dbCoreCachedClient = await MongoClient.connect(url, {})
        console.log("MongoDb connection successful")
    }

    globalThis.dbCoreCachedDb = globalThis.dbCoreCachedClient.db(dbName)
    return globalThis.dbCoreCachedDb
}

export async function disconnectCoreClient() {
    if (!globalThis.dbCoreCachedClient) return
    const force = true
    await globalThis.dbCoreCachedClient.close(force)
}

export const connectToCoreDb = async (): Promise<Db> => {
    // noinspection UnnecessaryLocalVariableJS
    const url = await getEnvString("XE_CORE_DB_URL")
    const dbName = await getEnvString("XE_CORE_DB_NAME")
    const connection = await connectToDatabase(url, dbName)
    return connection
}
