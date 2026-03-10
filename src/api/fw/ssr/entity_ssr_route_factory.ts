import type { Db } from "mongodb";

import type { IAppContext } from "@src/api/fw/api_app_types.ts";
import { getCoreDbFromExecContext } from "@src/api/db/coredb_exec_context.ts";
import { render } from "@src/ui/ssr/render.tsx";
import type { AppInitialData } from "@src/ui/types/app_initial_data.ts";

type ListFetcherInput = {
	pageNumber: number;
	pageSize: number;
};

type EntityListFetcher<TEntity> = (
	db: Db,
	input: ListFetcherInput,
) => Promise<{ list: TEntity[]; total: number }>;

type EntityByIdFetcher<TEntity> = (db: Db, id: string) => Promise<TEntity | null>;

type InitialDataMapper<TEntity> = (entities: TEntity[]) => AppInitialData;

type EntitySsrFactoryConfig<TEntity> = {
	byIdParamName: string;
	getList: EntityListFetcher<TEntity>;
	getById: EntityByIdFetcher<TEntity>;
	toInitialData: InitialDataMapper<TEntity>;
	pageSize?: number;
};

type EntitySsrHandlers = {
	index: (c: IAppContext) => Promise<Response>;
	byId: (c: IAppContext) => Promise<Response>;
	edit: (c: IAppContext) => Promise<Response>;
};

const DEFAULT_PAGE_SIZE = 20;

function render_ssr_html<TEntity>(
	c: IAppContext,
	entities: TEntity[],
	to_initial_data: InitialDataMapper<TEntity>,
): Response {
	const { html } = render(new URL(c.req.url).pathname, to_initial_data(entities));
	return c.html(html);
}

export function create_entity_ssr_handlers<TEntity>(
	config: EntitySsrFactoryConfig<TEntity>,
): EntitySsrHandlers {
	return {
		index: async (c: IAppContext) => {
			const db = await getCoreDbFromExecContext(c);
			const { list } = await config.getList(db, {
				pageNumber: 1,
				pageSize: config.pageSize ?? DEFAULT_PAGE_SIZE,
			});
			return render_ssr_html(c, list, config.toInitialData);
		},
		byId: async (c: IAppContext) => {
			const db = await getCoreDbFromExecContext(c);
			const entity_id = c.req.param(config.byIdParamName);
			const entity = entity_id ? await config.getById(db, entity_id) : null;
			const entities = entity ? [entity] : [];
			return render_ssr_html(c, entities, config.toInitialData);
		},
		edit: async (c: IAppContext) => {
			const db = await getCoreDbFromExecContext(c);
			const entity_id = c.req.param(config.byIdParamName);
			const entity = entity_id ? await config.getById(db, entity_id) : null;
			const entities = entity ? [entity] : [];
			return render_ssr_html(c, entities, config.toInitialData);
		},
	};
}

export function define_ssr_route(path: string) {
	return {
		method: "get",
		path,
	} as const;
}
