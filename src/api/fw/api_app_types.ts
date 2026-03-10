import { Hono, type Context } from "hono";
import type { Db } from "mongodb";

export type IApiVariables = {
	coreDb: Db;
};

export type IApp = Hono<{ Bindings: Env; Variables: IApiVariables }>;
export type IAppContext = Context<{ Bindings: Env; Variables: IApiVariables }>;
