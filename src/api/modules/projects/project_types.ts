
export interface IProject {
    "id": string
    "name": string
    "summary": string
    "year": number
    "status": string
    "stack": Array<string>
    "link": string
}

export interface IProjectList { list: Array<IProject> }
