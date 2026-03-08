import { isArray, upperCase } from "lodash";
import Filter, { type FilterOperator, type IFilter, type IFilterSqlResult } from "@src/common/crud/filter.ts";

export type FilterLogicalOperator = "AND" | "OR";

export class FilterExpr<ColNameT> implements IFilter {
	private _filterList: IFilter[];
	private _filterOperator: FilterLogicalOperator = "AND";

	public constructor(columnName: ColNameT, filterOperator: FilterOperator, val1: unknown);
	public constructor(filterList: IFilter[], logicalOp: FilterLogicalOperator);
	public constructor(filter1: IFilter);

	public constructor(...args: unknown[]) {
		if (args.length === 3) {
			this._filterList = [new Filter(args[0] as ColNameT, args[1] as FilterOperator, args[2] as never)];
			return;
		}

		if (args.length === 2) {
			const [filters, logicalOp] = args;
			this._filterList = isArray(filters) ? (filters as IFilter[]) : [filters as IFilter];
			this._filterOperator = upperCase(String(logicalOp)) as FilterLogicalOperator;
			return;
		}

		this._filterList = isArray(args[0]) ? (args[0] as IFilter[]) : [args[0] as IFilter];
	}

	and(columnName: ColNameT, filterOperator: FilterOperator, val1: object | number | string) {
		const filter = new Filter(columnName, filterOperator, val1);
		return this.andWith(filter);
	}

	or(columnName: ColNameT, filterOperator: FilterOperator, val1: object | number | string) {
		const filter = new Filter(columnName, filterOperator, val1);
		return this.orWith(filter);
	}

	andWith(filter: IFilter) {
		if (this._filterOperator === "AND") {
			return new FilterExpr([...this.filterList, filter], "AND");
		}
		return new FilterExpr([this, filter], "AND");
	}

	orWith(filter: IFilter) {
		if (this._filterOperator === "OR") {
			return new FilterExpr([...this.filterList, filter], "OR");
		}
		return new FilterExpr([this, filter], "OR");
	}

	get filterList(): IFilter[] {
		return this._filterList ?? [];
	}

	get filterOperator(): FilterLogicalOperator {
		return this._filterOperator;
	}

	toMongoQuery() {
		if (this.filterList.length === 0) return {};
		if (this.filterList.length === 1) return this.filterList[0]?.toMongoQuery() ?? {};

		const mongo_op = this._filterOperator === "AND" ? "$and" : "$or";
		return {
			[mongo_op]: this.filterList.map((item) => item.toMongoQuery()),
		};
	}

	toSql(paramName: string, paramsRef: Record<string, object | number | string>): IFilterSqlResult {
		const emptyResult: IFilterSqlResult = {
			cmd: "",
			params: {},
		};

		if (this.filterList.length === 0) return emptyResult;
		if (this.filterList.length === 1) return this.filterList[0]?.toSql(paramName, paramsRef) ?? emptyResult;

		const sql_logic_op = this._filterOperator === "AND" ? "AND" : "OR";
		let sql_cmd = "(";

		for (let i = 0; i < this._filterList.length; i++) {
			const f = this._filterList[i];
			if (!f) continue;

			const param_index = Object.keys(paramsRef).length;
			const p_name = `@p${param_index}`;
			const sql_result = f.toSql(p_name, paramsRef);
			if (!sql_result.cmd) continue;

			sql_cmd += sql_result.cmd;
			if (i !== this._filterList.length - 1) sql_cmd += ` ${sql_logic_op} `;
		}

		sql_cmd += ")";
		if (sql_cmd === "()") sql_cmd = "";

		return {
			cmd: sql_cmd,
			params: paramsRef,
		};
	}

	toJson() {
		const rules = this.filterList.map((x) => x.toJson());
		const combinator = this._filterOperator === "AND" ? "and" : "or";
		return {
			rules,
			combinator,
		};
	}

	static fromJson<FieldNamesT>(jsObj: unknown): FilterExpr<FieldNamesT> {
		if (!jsObj) return new FilterExpr([], "AND");
		if (typeof jsObj !== "object" || jsObj === null || !("rules" in jsObj)) {
			throw new Error("The provided json filter must be an object with rules prop");
		}

		return FilterExpr.fromJsonRec(jsObj) as FilterExpr<FieldNamesT>;
	}

	private static fromJsonRec(jsObj: unknown): unknown {
		if (typeof jsObj !== "object" || jsObj === null || !("rules" in jsObj)) {
			const leaf = jsObj as { field: unknown; operator: unknown; value: unknown };
			return new Filter(leaf.field as never, leaf.operator as never, leaf.value as never);
		}

		const group = jsObj as { rules: unknown[]; combinator: unknown };
		const filters = Array.isArray(group.rules)
			? (group.rules.map((x) => FilterExpr.fromJsonRec(x)) as IFilter[])
			: [];
		const combinator =
			typeof group.combinator === "string" && group.combinator.toLowerCase() === "or"
				? "OR"
				: "AND";

		return new FilterExpr(filters, combinator);
	}
}
