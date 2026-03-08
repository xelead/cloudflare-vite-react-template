import type { Collection, Db } from "mongodb"
import {LookupDefinition, LookupsConfig, Projection} from "@src/common/crud/entity_interfaces.ts";
import {IPagingQuery} from "@src/common/crud/api_crud";
import {FilterExpr} from "@src/common/crud/filter_expr.ts";
import {IFilter} from "@src/common/crud/filter.ts";

export interface IXDbCreateResult {
  isSuccessful: boolean
  errorMessage: string
}

export interface IXDbUpsertResult {
  isSuccessful: boolean
  inserted: boolean
  updated: boolean
}

export interface IXDbUpdateResult {
  isSuccessful: boolean
  modifiedCount: number
}

export interface IXDbDeleteResult {
  isSuccessful: boolean
  deletedCount: number
}

export function createPipelineWithLookups(lookups: LookupsConfig, match?: any) {
  const pipeline: any[] = []
  if (match) {
    pipeline.push({
      $match: match,
    })
  }
  Object.keys(lookups).forEach((key) => {
    const { from, localField, foreignField, as } = lookups[key] as LookupDefinition
    pipeline.push({
      $lookup: {
        from,
        localField,
        foreignField,
        as,
      },
    })
  })

  return pipeline
}

const DEFAULT_PAGE_SIZE = 10

/**
 * Repository object to access MongoDb collections
 */
export default class MongoDbRepo<QueryModelT, OutputModelT, PatchModelT, FilterFieldNamesT> {
  private db: Db

  private collection: Collection

  constructor(db: Db, collectionName: string) {
    this.db = db
    this.collection = this.db.collection(collectionName)
  }

  async create(data: Record<string, any>): Promise<IXDbCreateResult> {
    // noinspection UnnecessaryLocalVariableJS
    const result = await this.collection.insertOne(data)
    return {
      isSuccessful: !!result.acknowledged,
      errorMessage: "",
    }
  }

  async findPaging(query: IPagingQuery<FilterFieldNamesT>, projection?: Projection<any>, lookups?: LookupsConfig): Promise<OutputModelT[]> {
    const pageNumber = !query.pageNumber ? 1 : query.pageNumber
    const pageSize = pageNumber * (query.pageSize || DEFAULT_PAGE_SIZE)
    const skip = (pageNumber - 1) * pageSize
    let mongoQuery: any = {
      isDeleted: { $ne: true },
    }
    if (query.filterExpr) {
      mongoQuery = { ...mongoQuery, ...query.filterExpr.toMongoQuery() }
    }
    let projectionQuery = {}
    if (projection) {
      projectionQuery = projection
    }
    if (lookups) {
      const pipeline = createPipelineWithLookups(lookups, mongoQuery)
      pipeline.push({
        $project: { ...projection },
      })
      const documents = await this.collection.aggregate(pipeline).toArray()
      return documents as OutputModelT[]
    }
    // @ts-ignore
    const documents = await this.collection.find(mongoQuery, { projectionQuery }, { skip, limit: pageSize }).toArray()

    return documents as OutputModelT[]
  }

  async count(filter: FilterExpr<FilterFieldNamesT> | undefined): Promise<number> {
    let result = 0
    if (!filter) {
      result = await this.collection.count()
      return result
    }
    const mongoQuery = filter.toMongoQuery()
    result = await this.collection.count(mongoQuery)
    return result
  }

  async find(query: QueryModelT): Promise<OutputModelT[]> {
    // noinspection UnnecessaryLocalVariableJS
    // @ts-ignore
    const documents = await this.collection.find(query).toArray()
    const notDeletedDocs = documents.filter((x) => x.isDeleted !== true)
    return notDeletedDocs as OutputModelT[]
  }

  async findOne(query: QueryModelT): Promise<OutputModelT | null> {
    // noinspection UnnecessaryLocalVariableJS
    // @ts-ignore
    const doc = (await this.collection.findOne({ ...query })) as OutputModelT
    if (!doc) return null
    // @ts-ignore
    if (doc.isDeleted === true) return null
    return doc
  }

  async upsert(data: Record<string, any>): Promise<IXDbUpsertResult> {
    const query = {
      id: data.id,
    }
    const doc = await this.collection.findOne(query)
    if (!doc) {
      await this.collection.insertOne(data)
      return {
        isSuccessful: true,
        inserted: true,
        updated: false,
      }
    }
    await this.collection.replaceOne(query, data)
    return {
      isSuccessful: true,
      inserted: false,
      updated: true,
    }
  }

  async updateOne(query: QueryModelT, updateData: PatchModelT): Promise<IXDbUpdateResult> {
    // @ts-ignore
    // noinspection UnnecessaryLocalVariableJS
    const result = await this.collection.updateOne(query, {
      $set: updateData,
    })

    return {
      isSuccessful: !!result.acknowledged,
      modifiedCount: result.modifiedCount,
    }
  }

  async update(query: QueryModelT, updateData: PatchModelT): Promise<IXDbUpdateResult> {
    // @ts-ignore
    // noinspection UnnecessaryLocalVariableJS
    const result = await this.collection.updateMany(query, {
      $set: updateData,
    })

    return {
      isSuccessful: !!result.acknowledged,
      modifiedCount: result.modifiedCount,
    }
  }

  async updateByFilter(filter: IFilter, updateData: PatchModelT): Promise<IXDbUpdateResult> {
    const query = filter.toMongoQuery()
    return this.update(query, updateData)
  }

  async deleteMany(query: QueryModelT): Promise<IXDbDeleteResult> {
    // noinspection UnnecessaryLocalVariableJS
    // @ts-ignore
    const result = await this.collection.deleteMany(query)
    return {
      isSuccessful: !!result.acknowledged,
      deletedCount: result.deletedCount,
    }
  }
}
