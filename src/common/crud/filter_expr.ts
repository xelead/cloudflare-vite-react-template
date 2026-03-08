import { isArray, upperCase } from "lodash"
import {FilterOperator, IFilter} from "src/common/crud/filter.ts";
import {Filter} from "mongodb";

const filterLogicalOp = {
  AND: { mongo: "$and", sql: "AND", txt: "And" },
  OR: { mongo: "$or", sql: "OR", txt: "Or" },
}

export type FilterLogicalOperator = keyof typeof filterLogicalOp // AND, OR

export class FilterExpr<ColNameT> implements IFilter {
  private _filterList: IFilter[]

  private _filterOperator: FilterLogicalOperator = "AND"

  public constructor(columnName: ColNameT, filterOperator: FilterOperator, val1: unknown)
  public constructor(filterList: IFilter[], logicalOp: FilterLogicalOperator)
  public constructor(filter1: Filter<ColNameT>)

  public constructor(...args: unknown[]) {
    // colName, op, colValue
    if (args.length === 3) {
      // @ts-ignore
      this._filterList = [new Filter(args[0], args[1], args[2])]
      return
    }

    // filterList, logicOp
    if (args.length === 2) {
      const [filters, logicalOp] = args
      this._filterList = isArray(filters) ? (filters as IFilter[]) : [filters as IFilter]
      this._filterOperator = upperCase(String(logicalOp)) as FilterLogicalOperator
      return
    }

    if (isArray(args[0])) {
      this._filterList = args[0] as IFilter[]
    } else {
      this._filterList = [args[0] as IFilter]
    }
  }

  and(columnName: ColNameT, filterOperator: FilterOperator, val1: object | number) {
    const filter = new Filter(columnName, filterOperator, val1)
    return this.andWith(filter)
  }

  or(columnName: ColNameT, filterOperator: FilterOperator, val1: object| number) {
    const filter = new Filter(columnName, filterOperator, val1)
    return this.orWith(filter)
  }

  andWith(filter: IFilter) {
    if (this._filterOperator === "AND") {
      return new FilterExpr([...this.filterList, filter], "AND")
    }
    return new FilterExpr([this, filter], "AND")
  }

  orWith(filter: IFilter) {
    if (this._filterOperator === "OR") {
      return new FilterExpr([...this.filterList, filter], "OR")
    }
    return new FilterExpr([this, filter], "OR")
  }

  get filterList(): IFilter[] {
    if (this._filterList === null) this._filterList = []
    return this._filterList
  }

  get filterOperator(): FilterLogicalOperator {
    return this._filterOperator
  }

  toMongoQuery() {
    if (this.filterList.length === 0) return {}
    if (this.filterList.length === 1) {
      if (!this.filterList[0]) return {}
      return this.filterList[0].toMongoQuery()
    }

    const result = {}
    const mongoOp = this._filterOperator === "AND" ? "$and" : "$or"
    // @ts-ignore
    result[mongoOp] = []
    for (let i = 0; i < this._filterList.length; i++) {
      const f = this.filterList[i]
      if (!f) continue
      // @ts-ignore
      result[mongoOp].push(f.toMongoQuery())
    }
    return result
  }

  // eslint-disable-next-line complexity
  toSql(paramName: string, paramsRef: Record<string, object>): IFilterSqlResult {
    const emptyResult = {
      cmd: "",
      params: {},
    }
    if (this.filterList.length === 0) return emptyResult
    if (this.filterList.length === 1) {
      if (!this.filterList[0]) return emptyResult
      return this.filterList[0].toSql(paramName, paramsRef)
    }

    const sqlLogicOp = this._filterOperator === "AND" ? "AND" : "OR"

    let sqlCmd = "("
    for (let i = 0; i < this._filterList.length; i++) {
      const f = this.filterList[i]
      if (!f) continue

      const paramIndex = Object.keys(paramsRef).length
      const pName = `@p${paramIndex}`
      const sqlResult = f.toSql(pName, paramsRef)

      if (!sqlResult.cmd) continue

      sqlCmd += `${sqlResult.cmd}`
      if (i !== this._filterList.length - 1) sqlCmd += ` ${sqlLogicOp} `
    }

    sqlCmd += ")"
    if (sqlCmd === "()") sqlCmd = ""
    return {
      cmd: sqlCmd,
      params: paramsRef,
    }
  }

  toJson() {
    const rules = this.filterList.map((x) => x.toJson())

    const combinator = this._filterOperator === "AND" ? "and" : "or"

    return {
      rules,
      combinator,
    }
  }

  static fromJson<FieldNamesT>(jsObj: unknown): FilterExpr<FieldNamesT> {
    if (!jsObj) return new FilterExpr([], "AND")
    if (typeof jsObj !== "object" || jsObj === null || !("rules" in jsObj)) {
      throw Error("The provided json filter must be an object with rules prop")
    }
    const r = FilterExpr.fromJsonRec(jsObj)
    return r as FilterExpr<FieldNamesT>
  }

  private static fromJsonRec(jsObj: unknown): unknown {
    if (typeof jsObj !== "object" || jsObj === null || !("rules" in jsObj)) {
      const leaf = jsObj as { field: unknown; operator: unknown; value: unknown }
      return new Filter(leaf.field as never, leaf.operator as never, leaf.value as object | number | string)
    }
    const group = jsObj as { rules: unknown[]; combinator: unknown }
    const filters = Array.isArray(group.rules)
      ? (group.rules.map((x) => FilterExpr.fromJsonRec(x)) as IFilter[])
      : []
    const combinator =
      typeof group.combinator === "string" && group.combinator.toLowerCase() === "or"
        ? "OR"
        : "AND"
    return new FilterExpr(filters, combinator)
  }
}
