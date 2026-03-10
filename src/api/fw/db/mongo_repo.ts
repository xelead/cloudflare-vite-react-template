import type { Collection, Db, Filter, OptionalUnlessRequiredId } from "mongodb";
import type { IPagingQuery } from "@src/common/crud/api_crud.d.ts";
import type {
	LookupDefinition,
	LookupsConfig,
	Projection,
} from "@src/common/crud/entity_interfaces.ts";
import type { FilterExpr } from "@src/common/crud/filter_expr.ts";
import type { IFilter } from "@src/common/crud/filter.ts";

export interface IXDbCreateResult {
	isSuccessful: boolean;
	errorMessage: string;
}

export interface IXDbUpsertResult {
	isSuccessful: boolean;
	inserted: boolean;
	updated: boolean;
}

export interface IXDbUpdateResult {
	isSuccessful: boolean;
	modifiedCount: number;
}

export interface IXDbDeleteResult {
	isSuccessful: boolean;
	deletedCount: number;
}

export function createPipelineWithLookups(lookups: LookupsConfig, match?: Record<string, unknown>) {
	const pipeline: Record<string, unknown>[] = [];

	if (match) {
		pipeline.push({ $match: match });
	}

	Object.keys(lookups).forEach((key) => {
		const { from, localField, foreignField, as } = lookups[key] as LookupDefinition;
		pipeline.push({
			$lookup: {
				from,
				localField,
				foreignField,
				as,
			},
		});
	});

	return pipeline;
}

const DEFAULT_PAGE_SIZE = 10;

export default class MongoDbRepo<
	QueryModelT,
	OutputModelT,
	PatchModelT,
	FilterFieldNamesT,
> {
	private collection: Collection<any>;

	constructor(db: Db, collectionName: string) {
		this.collection = db.collection(collectionName);
	}

	async create(data: OptionalUnlessRequiredId<any>): Promise<IXDbCreateResult> {
		const result = await this.collection.insertOne(data);
		return {
			isSuccessful: !!result.acknowledged,
			errorMessage: "",
		};
	}

	async findPaging(
		query: IPagingQuery<FilterFieldNamesT>,
		projection?: Projection<OutputModelT>,
		lookups?: LookupsConfig,
	): Promise<OutputModelT[]> {
		const page_number = Math.max(1, Number(query.pageNumber) || 1);
		const page_size = Math.max(1, Number(query.pageSize) || DEFAULT_PAGE_SIZE);
		const skip = (page_number - 1) * page_size;

		const mongo_query: Record<string, unknown> = {
			deleted_at: null,
		};

		if (query.filterExpr) {
			Object.assign(mongo_query, query.filterExpr.toMongoQuery());
		}

		if (lookups) {
			const pipeline = createPipelineWithLookups(lookups, mongo_query);
			pipeline.push({ $skip: skip });
			pipeline.push({ $limit: page_size });
			if (projection) {
				pipeline.push({ $project: projection as Record<string, unknown> });
			}
			const documents = await this.collection.aggregate(pipeline).toArray();
			return documents as OutputModelT[];
		}

		const documents = await this.collection
			.find(mongo_query as Filter<any>, { projection: projection as never })
			.skip(skip)
			.limit(page_size)
			.toArray();
		return documents as OutputModelT[];
	}

	async count(filter: FilterExpr<FilterFieldNamesT> | undefined): Promise<number> {
		const base_query: Record<string, unknown> = {
			deleted_at: null,
		};
		if (!filter) {
			return this.collection.countDocuments(base_query as Filter<any>);
		}

		const mongo_query = {
			...base_query,
			...filter.toMongoQuery(),
		};

		return this.collection.countDocuments(mongo_query as Filter<any>);
	}

	async find(query: QueryModelT): Promise<OutputModelT[]> {
		const mongo_query = {
			...query,
			deleted_at: null,
		};
		const documents = await this.collection.find(mongo_query as Filter<any>).toArray();
		return documents as OutputModelT[];
	}

	async findOne(query: QueryModelT): Promise<OutputModelT | null> {
		const mongo_query = {
			...query,
			deleted_at: null,
		};
		const doc = await this.collection.findOne(mongo_query as Filter<any>);
		return doc as OutputModelT | null;
	}

	async upsert(data: { id: string } & Record<string, unknown>): Promise<IXDbUpsertResult> {
		const result = await this.collection.updateOne(
			{ id: data.id } as Filter<any>,
			{ $set: data },
			{ upsert: true },
		);

		return {
			isSuccessful: !!result.acknowledged,
			inserted: !!result.upsertedId,
			updated: !result.upsertedId && result.modifiedCount > 0,
		};
	}

	async updateOne(query: QueryModelT, updateData: PatchModelT): Promise<IXDbUpdateResult> {
		const result = await this.collection.updateOne(query as Filter<any>, {
			$set: updateData as Record<string, unknown>,
		});

		return {
			isSuccessful: !!result.acknowledged,
			modifiedCount: result.modifiedCount,
		};
	}

	async update(query: QueryModelT, updateData: PatchModelT): Promise<IXDbUpdateResult> {
		const result = await this.collection.updateMany(query as Filter<any>, {
			$set: updateData as Record<string, unknown>,
		});

		return {
			isSuccessful: !!result.acknowledged,
			modifiedCount: result.modifiedCount,
		};
	}

	async updateByFilter(filter: IFilter, updateData: PatchModelT): Promise<IXDbUpdateResult> {
		const query = filter.toMongoQuery() as QueryModelT;
		return this.update(query, updateData);
	}

	async deleteMany(query: QueryModelT): Promise<IXDbDeleteResult> {
		const result = await this.collection.deleteMany(query as Filter<any>);
		return {
			isSuccessful: !!result.acknowledged,
			deletedCount: result.deletedCount,
		};
	}
}
