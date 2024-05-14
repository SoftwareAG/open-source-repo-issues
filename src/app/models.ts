/*
* Copyright (c) 2024 Software AG, Darmstadt, Germany and/or its licensors
*
* SPDX-License-Identifier: Apache-2.0
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
 */

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
