const filterOp = {
  eq: { mongo: "$eq", sql: "=", txt: "Equals" },
  notEq: { mongo: "$ne", sql: "!=", txt: "Not Equals" },
  greater: { mongo: "$gt", sql: ">", txt: "Greater Than" },
  greaterEq: { mongo: "$gte", sql: ">=", txt: "Greater Equals" },
  less: { mongo: "$lt", sql: "=", txt: "Less Than" },
  lessEq: { mongo: "$lte", sql: "=", txt: "Less Equals" },
  in: { mongo: "$in", sql: "IN", txt: "Less Equals" },
  inArr: { mongo: "$in", sql: "@>", txt: "In Array" },
  notInArr: { mongo: "$nin", sql: null, txt: "Not in Array" },
  all: { mongo: "$all", sql: null, txt: "Array Has All Elements" },
  arrSize: { mongo: "$size", sql: null, txt: "Array Size" },
  arrElemMatch: { mongo: "$elemMatch", sql: null, txt: "Array Elements Match" }, // val: { $elemMatch: { $gt: 22, $lt: 30 } }
  geoWithin: { mongo: "$geoWithin", sql: null, txt: "Geo Within" },
  geoIntersects: { mongo: "$geoIntersects", sql: null, txt: "Geo Intersects" },
  geoNear: { mongo: "$near", sql: null, txt: "Geo Near" },
  geoNSphere: { mongo: "$nearSphere", sql: null, txt: "Geo Near Sphere" },
  contains: { mongo: "$text", sql: "Contains", txt: "Text Contains" },
  bitsAllSet: { mongo: "$bitsAllSet", sql: null, txt: "Bits All Set" },
  bitsAnySet: { mongo: "$bitsAnySet", sql: null, txt: "Bits Any Set" },
}

export type FilterOperator = keyof typeof filterOp

export interface IFilterSqlResult {
  cmd: string
  params: Record<string, object | number | string>
}

export interface IFilter {
  toMongoQuery(): unknown
  toSql(paramName: string, params: Record<string, object | number | string>): IFilterSqlResult
  toJson(): unknown
}

class Filter<ColNameT> implements IFilter {
  public columnName: ColNameT

  public op: FilterOperator

  public val1: object | number | string

  constructor(columnName: ColNameT, filterOperator: FilterOperator, val1: object | number | string) {
    if (columnName === "") {
      throw new Error("Column name cannot be empty.")
    }
    this.columnName = columnName
    this.op = filterOperator
    this.val1 = val1
  }

  toSql(paramName: string, params: Record<string, object | number | string>): IFilterSqlResult {
    if (!paramName) throw Error("Param name is required.")

    const fieldName = this.columnName as string
    const sqlOp = filterOp[this.op].sql
    if (!sqlOp) throw Error("This filter is not supported in SQL")
    const cmd = `${fieldName} ${sqlOp} ${paramName}`
    if (params[paramName]) throw Error(`Param Name ${paramName} is already assigned`)
    params[paramName] = this.val1
    return {
      cmd,
      params,
    }
  }

  public toMongoQuery(): object {
    const result = {}
    const fieldName = this.columnName as string
    const mongoOp = filterOp[this.op].mongo
    // @ts-ignore
    result[fieldName] = {}
    // @ts-ignore
    result[fieldName][mongoOp] = this.val1
    return result
  }

  public toJson(): object {
    return {
      field: this.columnName,
      value: this.val1,
      operator: this.op,
    }
  }
}

export default Filter
