import type { Db } from "mongodb";

import { connectToCoreDbSession, type CoreDbSession } from "@src/api/db/coredb.ts";
import type { IAppContext } from "@src/api/fw/api_app_types.ts";

type CoreDbExecState = {
	pendingSession: Promise<CoreDbSession> | null;
	session: CoreDbSession | null;
};

const core_db_state_by_exec_ctx = new WeakMap<ExecutionContext, CoreDbExecState>();

function get_or_create_state(exec_ctx: ExecutionContext): CoreDbExecState {
	const existing_state = core_db_state_by_exec_ctx.get(exec_ctx);
	if (existing_state) return existing_state;

	const new_state: CoreDbExecState = {
		pendingSession: null,
		session: null,
	};
	core_db_state_by_exec_ctx.set(exec_ctx, new_state);
	return new_state;
}

export async function getCoreDbFromExecContext(c: IAppContext): Promise<Db> {
	const cached_db = c.get("coreDb");
	if (cached_db) return cached_db;

	const state = get_or_create_state(c.executionCtx);

	if (state.session) {
		c.set("coreDb", state.session.db);
		return state.session.db;
	}

	if (!state.pendingSession) {
		state.pendingSession = connectToCoreDbSession()
			.then((session) => {
				state.session = session;
				return session;
			})
			.finally(() => {
				state.pendingSession = null;
			});
	}

	const session = await state.pendingSession;
	c.set("coreDb", session.db);
	return session.db;
}

export async function closeCoreDbFromExecContext(c: IAppContext): Promise<void> {
	const state = core_db_state_by_exec_ctx.get(c.executionCtx);
	if (!state) return;

	core_db_state_by_exec_ctx.delete(c.executionCtx);

	const session =
		state.session ?? (state.pendingSession ? await state.pendingSession.catch(() => null) : null);
	if (!session) return;

	await session.close();
}