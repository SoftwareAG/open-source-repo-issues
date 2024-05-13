export interface issues{
    title?:string;
    labels?:labels[];
    created_at?:string;
    user_name?:string;
    user_type?:string;
    pull_request?:any;
    updated_at?:string;
    status?:string;
    repository?:string;
    body?:string;
    number?:string;
    issue_url?:string;
}

export interface labels{
    id?:number;
    node_id?:string;
    url?:string;
    name?:string;
    color?:string;
    default?:boolean;
    description?:string;
}
