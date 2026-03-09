import type {
	IEntityFieldInfo,
	IEntityFormFieldInfo,
	IEntityListFieldInfo,
} from "@src/common/crud/entity_interfaces.ts";

export class EntityFieldMaker {
  static getId(): IEntityFieldInfo {
    return {
      name: "id",
      label: "ID",
      jsonDataType: "string",
      storageDataType: "string",
      isReadOnly: true,
      isRequired: false,
      readonlyComponent: "XSpan",
      editorComponent: "",
      editorProps: [],
      defaultValue: "",
      formFieldProps: {
        visible: true,
        isFullWidth: false,
      },
      listFieldProps: {
        visible: true,
        canInlineEdit: false,
        canSortInListView: false,
        canFilterInListView: false,
      },
      customValidate(): string {
        return ""
      },
    }
  }

  static getCode(): IEntityFieldInfo {
    return {
      name: "code",
      label: "Code",
      jsonDataType: "string",
      storageDataType: "string",
      isReadOnly: false,
      isRequired: false,
      readonlyComponent: "XSpan",
      editorComponent: "XTextFieldEditor",
      editorProps: [],
      defaultValue: "",
      formFieldProps: {
        visible: true,
        isFullWidth: false,
      },
      listFieldProps: {
        visible: true,
        canInlineEdit: false,
        canSortInListView: false,
        canFilterInListView: false,
      },
      customValidate(): string {
        return ""
      },
    }
  }

  static getTitle(): IEntityFieldInfo {
    return {
      name: "title",
      label: "Title",
      jsonDataType: "string",
      storageDataType: "string",
      isReadOnly: false,
      isRequired: false,
      readonlyComponent: "XSpan",
      editorComponent: "XTextFieldEditor",
      editorProps: [],
      defaultValue: "",
      formFieldProps: {
        visible: true,
        isFullWidth: false,
      },
      listFieldProps: {
        visible: true,
        canInlineEdit: false,
        canSortInListView: false,
        canFilterInListView: false,
      },
      customValidate(): string {
        return ""
      },
    }
  }

  static getString(name: string, label: string, extraProps?: Partial<IEntityFieldInfo>): IEntityFieldInfo {
    return {
      name,
      label,
      jsonDataType: "string",
      storageDataType: "string",
      isReadOnly: false,
      isRequired: false,
      readonlyComponent: "XSpan",
      editorComponent: "XTextFieldEditor",
      editorProps: [],
      defaultValue: "",
      formFieldProps: {
        visible: true,
        isFullWidth: false,
      },
      listFieldProps: {
        visible: true,
        canInlineEdit: false,
        canSortInListView: false,
        canFilterInListView: false,
      },
      customValidate(): string {
        return ""
      },
      ...extraProps,
    }
  }

  static getBoolean(name: string, label: string, extraProps?: Partial<IEntityFieldInfo>): IEntityFieldInfo {
    return {
      name,
      label,
      jsonDataType: "boolean",
      storageDataType: "boolean",
      isReadOnly: false,
      isRequired: false,
      readonlyComponent: "XCheckboxEditor",
      editorComponent: "XCheckboxEditor",
      editorProps: [],
      defaultValue: "",
      formFieldProps: {
        visible: true,
        isFullWidth: false,
      },
      listFieldProps: {
        visible: true,
        canInlineEdit: false,
        canSortInListView: false,
        canFilterInListView: false,
      },
      customValidate(): string {
        return ""
      },
      ...extraProps,
    }
  }

  static getStringArray(name: string, label: string): IEntityFieldInfo {
    return {
      name,
      label,
      jsonDataType: "array",
      storageDataType: "string",
      isReadOnly: false,
      isRequired: false,
      readonlyComponent: "XSpan",
      editorComponent: "XTagCheapFieldEditor",
      editorProps: [],
      defaultValue: "",
      formFieldProps: {
        visible: true,
        isFullWidth: false,
      },
      listFieldProps: {
        visible: true,
        canInlineEdit: false,
        canSortInListView: false,
        canFilterInListView: false,
      },
      customValidate(): string {
        return ""
      },
    }
  }

  static getSchemaVersion(): IEntityFieldInfo {
    return this.getInt32("schemaVersion", "Schema Version")
  }

  static getInt32(name: string, label: string): IEntityFieldInfo {
    return {
      name,
      label,
      jsonDataType: "number",
      storageDataType: "int",
      isReadOnly: false,
      isRequired: false,
      readonlyComponent: "XSpan",
      editorComponent: "XTextFieldEditor",
      editorProps: [],
      defaultValue: 0,
      formFieldProps: {
        visible: true,
        isFullWidth: false,
      },
      listFieldProps: {
        visible: true,
        canInlineEdit: false,
        canSortInListView: false,
        canFilterInListView: false,
      },
      customValidate(): string {
        return ""
      },
    }
  }

  static getLatLng(name: string, label: string): IEntityFieldInfo {
    return {
      name,
      label,
      jsonDataType: "array",
      storageDataType: "double[]",
      isReadOnly: false,
      isRequired: false,
      readonlyComponent: "XSpan",
      editorComponent: "XAddressFieldEditor",
      editorProps: [],
      defaultValue: 0,
      formFieldProps: {
        visible: true,
        isFullWidth: false,
      },
      listFieldProps: {
        visible: true,
        canInlineEdit: false,
        canSortInListView: false,
        canFilterInListView: false,
      },
      customValidate(): string {
        return ""
      },
    }
  }

  static getInt64Field(name: string, label: string): IEntityFieldInfo {
    return {
      name,
      label,
      jsonDataType: "string",
      storageDataType: "int64",
      isReadOnly: false,
      isRequired: false,
      editorComponent: "XTextFieldEditor",
      editorProps: [],
      defaultValue: "0",
      formFieldProps: {
        visible: true,
        isFullWidth: false,
      },
      listFieldProps: {
        visible: true,
        canInlineEdit: false,
        canSortInListView: false,
        canFilterInListView: false,
      },
      customValidate(): string {
        return ""
      },
    }
  }

  static getFloatField(name: string, label: string): IEntityFieldInfo {
    return {
      name,
      label,
      jsonDataType: "string",
      storageDataType: "int64",
      isReadOnly: false,
      isRequired: false,
      editorComponent: "XTextFieldEditor",
      editorProps: [],
      defaultValue: "0",
      formFieldProps: {
        visible: true,
        isFullWidth: false,
      },
      listFieldProps: {
        visible: true,
        canInlineEdit: false,
        canSortInListView: false,
        canFilterInListView: false,
      },
      customValidate(): string {
        return ""
      },
    }
  }

  static getDate(name: string, label: string): IEntityFieldInfo {
    return {
      name,
      label,
      jsonDataType: "string",
      storageDataType: "string",
      isReadOnly: false,
      isRequired: false,
      editorComponent: "XTextFieldEditor",
      editorProps: [],
      defaultValue: "",
      formFieldProps: {
        visible: true,
        isFullWidth: false,
      },
      listFieldProps: {
        visible: true,
        canInlineEdit: false,
        canSortInListView: false,
        canFilterInListView: false,
      },
      customValidate(): string {
        return ""
      },
    }
  }

  static getCreatedAt(): IEntityFieldInfo {
    return {
      name: "createdAt",
      label: "Created At",
      jsonDataType: "string",
      storageDataType: "timestamp",
      isRequired: true,
      isReadOnly: true,
      editorComponent: "XSpan",
      editorProps: [],
      defaultValue: "",
      formFieldProps: {
        visible: false,
        isFullWidth: false,
      },
      listFieldProps: {
        visible: false,
        canInlineEdit: false,
        canSortInListView: false,
        canFilterInListView: false,
      },
      customValidate(): string {
        return ""
      },
    }
  }

  static getUpdatedAt(): IEntityFieldInfo {
    return {
      name: "updatedAt",
      label: "Updated At",
      jsonDataType: "string",
      storageDataType: "timestamp",
      isRequired: false,
      isReadOnly: true,
      editorComponent: "XSpan",
      editorProps: [],
      defaultValue: "",
      formFieldProps: {
        visible: false,
        isFullWidth: false,
      },
      listFieldProps: {
        visible: true,
        canInlineEdit: false,
        canSortInListView: false,
        canFilterInListView: false,
      },
      customValidate(): string {
        return ""
      },
    }
  }

  static getCreatedBy(): IEntityFieldInfo {
    return {
      name: "createdBy",
      label: "Created By",
      jsonDataType: "string",
      storageDataType: "string",
      isRequired: false,
      isReadOnly: true,
      editorComponent: "XSpan",
      editorProps: [],
      defaultValue: "",
      formFieldProps: {
        visible: false,
        isFullWidth: false,
      },
      listFieldProps: {
        visible: true,
        canInlineEdit: false,
        canSortInListView: false,
        canFilterInListView: false,
      },
      foreignEntityResCode: "UserAccount",
      customValidate(): string {
        return ""
      },
    }
  }

  static getUpdatedBy(): IEntityFieldInfo {
    return {
      name: "updatedBy",
      label: "Updated By",
      jsonDataType: "string",
      storageDataType: "string",
      isRequired: false,
      isReadOnly: true,
      editorComponent: "XSpan",
      editorProps: [],
      defaultValue: "",
      formFieldProps: {
        visible: false,
        isFullWidth: false,
      },
      listFieldProps: {
        visible: true,
        canInlineEdit: false,
        canSortInListView: false,
        canFilterInListView: false,
      },
      foreignEntityResCode: "UserAccount",
      customValidate(): string {
        return ""
      },
    }
  }

  static getNotes(): IEntityFieldInfo {
    return {
      name: "notes",
      label: "Notes",
      jsonDataType: "string",
      storageDataType: "string",
      isRequired: false,
      isReadOnly: false,
      editorComponent: "XSpan",
      editorProps: [],
      defaultValue: "",
      formFieldProps: {
        visible: true,
        isFullWidth: false,
      },
      listFieldProps: {
        visible: false,
        canInlineEdit: false,
        canSortInListView: false,
        canFilterInListView: false,
      },
      foreignEntityResCode: "",
      customValidate(value: any): string {
        if (!value) return ""
        if (value.length > 2048) return "Note field can not have more than 2048 characters."
        return ""
      },
    }
  }

  static getNotedBy(): IEntityFieldInfo {
    return {
      name: "notedBy",
      label: "Noted By",
      jsonDataType: "string",
      storageDataType: "string",
      isRequired: false,
      isReadOnly: false,
      editorComponent: "XSpan",
      editorProps: [],
      defaultValue: "",
      formFieldProps: {
        visible: true,
        isFullWidth: false,
      },
      listFieldProps: {
        visible: false,
        canInlineEdit: false,
        canSortInListView: false,
        canFilterInListView: false,
      },
      foreignEntityResCode: "UserAccount",
      customValidate(): string {
        return ""
      },
    }
  }

  static getNotedAt(): IEntityFieldInfo {
    return {
      name: "notedAt",
      label: "Noted At",
      jsonDataType: "string",
      storageDataType: "timestamp",
      isRequired: false,
      isReadOnly: false,
      editorComponent: "XSpan",
      editorProps: [],
      defaultValue: "",
      formFieldProps: {
        visible: false,
        isFullWidth: false,
      },
      listFieldProps: {
        visible: false,
        canInlineEdit: false,
        canSortInListView: false,
        canFilterInListView: false,
      },
      foreignEntityResCode: "",
      customValidate(): string {
        return ""
      },
    }
  }

  static asForm(fieldInfo: IEntityFieldInfo, extraProps?: Partial<IEntityFormFieldInfo>) {
    fieldInfo.formFieldProps = {
      ...fieldInfo.formFieldProps,
      ...extraProps,
    }
  }

  static asList(fieldInfo: IEntityFieldInfo, extraProps?: Partial<IEntityListFieldInfo>) {
    fieldInfo.listFieldProps = {
      ...fieldInfo.listFieldProps,
      ...extraProps,
    }
  }
}
