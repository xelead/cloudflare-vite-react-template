
export interface IProject {
    "id": string
    "name": string
    "summary": string
    "year": number
    "status": string
    "stack": Array<string>
    "link"?: string
    "created_at"?: string
    "updated_at"?: string
    "deleted_at"?: string | null
}

export interface IProjectList { list: Array<IProject> }
