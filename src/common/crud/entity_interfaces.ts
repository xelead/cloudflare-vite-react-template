import type { FilterExpr } from "@src/common/crud/filter_expr.ts";
import type { IPagingQuery } from "@src/common/crud/api_crud.d.ts";

export type EntityFieldStorageDataType = "string" | "float" | "int" | "int64" | "boolean" | "timestamp" | "double" | "double[]"
export type EntityFieldJsonDataTypes = "string" | "boolean" | "number" | "array"
export type EditorComponentNames =
  | ""
  | "XTextFieldEditor"
  | "XCheckboxEditor"
  | "XCheckboxFieldEditor"
  | "XPasswordFieldEditor"
  | "XSpan"
  | "XAddressFieldEditor"
  | "XTagCheapFieldEditor"
  | "XComboBoxEditor"

export type Option = {
  id: number | string
  label: string
}
export interface IEntityFieldInfo {
  /* name of the field in the json object */
  name: string
  label: string
  storageDataType: EntityFieldStorageDataType
  jsonDataType: EntityFieldJsonDataTypes
  defaultValue: string | boolean | number
  readonlyComponent?: string
  editorComponent: EditorComponentNames
  isRequired: boolean
  editorProps: Record<string, any>
  isReadOnly: boolean
  formFieldProps: IEntityFormFieldInfo
  listFieldProps: IEntityListFieldInfo
  /* if the field is linked to another entity, then it should be specified. For example, createdBy is has foreignResCode=User */
  foreignEntityResCode?: string
  customValidate(value: any): string
}

export interface IEntityFormFieldInfo {
  visible: boolean
  isFullWidth: boolean
}

export interface IEntityListFieldInfo {
  visible: boolean
  canInlineEdit: boolean
  canSortInListView: boolean
  canFilterInListView: boolean
}

export interface IFormActionButton {
  /* Title of the button */
  buttonTitle: string
  /* Name of the action to be executed on the API */
  actionName: string
  /* Button Type */
  buttonVariant: "primary" | "secondary" | "link"
  /* Icon component to be displayed on the button */
  buttonIcon: string
  /* Entity Action related to this button */
  associatedAction: IEntityAction
}

export interface IEntityFormInfo {
  /* custom Component used for rendering */
  formComponent?: () => any
  formTitle?: string
  formSubtitle?: string
  formFields: IEntityFieldInfo[]
  actionButton: IFormActionButton
  customValidateAsync(values: Record<string, any>): Promise<Record<string, string>> /* {fieldName: "Error Message"} */
  entityInfo: IEntityInfo
}

export interface IEntityEditFormInfo extends IEntityFormInfo {}
export interface IEntityNewFormInfo extends IEntityFormInfo {}
export interface IEntityViewFormInfo extends IEntityFormInfo {}

export interface IEntityListViewPageInfo {
  /* custom Component used for displaying the grid */
  customComponentName?: string
  listFields: IEntityFieldInfo[]
}

// export interface IEntityViewFormInfo {
//   viewformComponent:?: string
//   formTitle?: string
//   formFields: IEntityFieldInfo[]
//   actionButtons: IFormActionButton[]
// }

// export interface IEntityListViewInfo {
//   listViewComponentName?: string
//   entityResCode: string
//   viewTitle: string
//   showActionBar: boolean
//   /** Field names for list views to be fetched from the API */
//   defaultListFields: IEntityFieldInfo[]
// }

export interface IEntitySortColumn<T> {
  columnName: T
  dir: "asc" | "desc"
}
//
// export interface IEntityDetailTab {
//   /* Entity Resource Code */
//   entityResCode: string
//   tabTitle: string
//   tabIcon: string
//   visible: boolean
//   isReadOnly: boolean
//   editType: string
//   iconComponent: string
// }

export interface IEntityAction {
  /* Entity Resource Code */
  entityResCode: string
  /* Name of the action, also the code used in the API - must be in lower case kebab case */
  actionName: ActionNames
  /* Title of the action used as button title or tooltip */
  actionTitle: string
  /** Icon component for the action */
  actionIcon: string
  /* Names of the fields used for this action */
  fieldNames: string[]
  /* Javascript function to run before calling the API
   * the first argument is IEntityActionFormContext */
  clientSideBeforeAsyncFn?: Function
  /* JavaScript function to call after calling the API
   * the first argument is IEntityActionFormContext and second IApiResult */
  clientSideAfterAsyncFn?: Function
}

export interface IEntityStorageInfo {
  /* Storage database */
  dbName: "core"
  /* Collection name or database table name or UI storage name */
  tableName: string
  /* Database view name */
  viewName: string
  /* Default filter used for retrieving the records from the database */
  defaultFilter: FilterExpr<any> | null
  /* Default sort used to sort data while retrieving from the database */
  defaultSort: IEntitySortColumn<any>[]
  /** Number of records to be fetched from the API by default */
  defaultPageSize: number
}

export interface IEntityInfoFunctions {
  getIdField(): IEntityFieldInfo
  getCodeField(): IEntityFieldInfo
  getTitleField(): IEntityFieldInfo
  getFieldByName(name: string): IEntityFieldInfo
}

export interface IEntityInfo {
  /* Module code or name space of entity is 2-3 letter character before entity */
  entityNs: string
  /* Code of Entity */
  entityName: string
  /* Entity Additional Data Key */
  entityAdk: string
  /* Entity Title is a user-friendly name for the entity */
  entityTitle: string
  /* Entity Resource Code - Used for permissions and API endpoint, must be unique for entire app */
  resourceCode: string

  storage: IEntityStorageInfo

  idFieldName: "id" | string
  codeFieldName: "code" | string
  displayNameFieldName: "displayName" | "title" | string

  // API
  apiActions: IEntityAction[]

  fields: IEntityFieldInfo[]

  // /** Field names for list views to be fetched from the API */
  // defaultView: "list" | "tree" | "treegrid"

  // detailedEntities?: IEntityDetailTab[]
  // dropDownInfo?: IEntityDropDownInfo
  // editFormInfo?: IEntityEditFormInfo
  // viewFormInfo: IEntityViewFormInfo
  // listViewInfo?: IEntityListViewInfo
  // treeViewInfo?: IEntityTreeViewInfo
  // auditSettings?: IEntityAuditSettings

  /** Image to be shown in the empty list page */
  emptyListImage?: string
  projection?: Projection<any>
  lookups?: LookupsConfig
}
export type Projection<T> = {
  [P in keyof T]?: 0 | 1 | { $arrayElemAt: any[] }
}
export interface LookupDefinition {
  from: string
  localField: string
  foreignField: string
  as: string
}
export type LookupsConfig = Record<string, LookupDefinition>
export interface IEntityGetListPagingReq extends IPagingQuery<any> {}

export interface IEntityGetListPagingRes {
  total: number
  items: any[]
}

export interface IEntityEn {
  entityInfo: IEntityInfo
  fields: any
  editFormInfo?: IEntityEditFormInfo
  listPage?: IEntityListViewPageInfo
  newFormInfo?: IEntityNewFormInfo
  storage?: IEntityStorageInfo
}
// export interface IEntityAuditSettings {
//   hasAudit: boolean
//   auditExcludeFieldNames?: string[]
// }

// export interface IEntityTreeViewInfo {
//   treeRules?: ITreeRules[]
//   parentIdFieldName?: string
// }

// export interface IEntityDropDownInfo {
//   /** Field names for drop down list to be fetched from the API */
//   dropDownFields: IEntityFieldInfo[]
//   /** If entity has few records, all data can be loaded in the client. Otherwise, it will do remote paging */
//   dropDownLoadDataMode: "local" | "remote"
// }

export type ActionNames = "create" | "update" | "delete" | "export" | "getList" | "edit" | "view"

export type MessageType = "success" | "info" | "warning" | "error"

export interface IEntityTreeRules {
  action: "I" | "U" | "D" | "S" // insert, update, delete, select
  fromLevel: number
  toLevel: number
}
