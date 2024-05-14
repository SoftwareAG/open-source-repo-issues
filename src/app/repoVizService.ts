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

import { HttpClient } from '@angular/common/http';
import { issues } from './models';
import { Injectable } from '@angular/core';
import { DatePipe } from '@angular/common';
import * as crypto from 'crypto-js';

@Injectable()
export class repoVizService{
    accessKey = "1617169566033";
    encodedAWSProdUrl='U2FsdGVkX18IjsAEYjiPjDk0V1yUov5ZtGgnQmDfvrcJQTMbsV9Xtysa1EjyJmRpzC4WYI1WGOwHJU3wLVm+xWM+bSiC1vOHO9oimtf1Og8=';
    constructor(private http:HttpClient, private datePipe:DatePipe){};
    //All functions are as per flowservice logic

    async main(repos:string[],topic:string):Promise<any>{
        let issues:issues[]=[];
        let result:any={};
        if(topic=='' || topic==null || !topic){
            issues=await this.getIssuesByRepos(repos);
        }else{
            repos=await this.getReposInTopic(topic);
            issues=await this.getIssuesByRepos(repos);
        }
        if(!issues || issues.length==0){
            result.error='DATA NOT FOUND';
        }else{
            result.issues=issues;
        }
        return result;
    }

    async getIssuesByRepos(repos:string[]):Promise<issues[]>{
        let issues:issues[]=[];
        for(let repo of repos){
            let issueForRepo:any[]=[];
            let pageNumber=0;
            let len:number=101;
            do {
                pageNumber++;
                let url= crypto.AES.decrypt(this.encodedAWSProdUrl.toString(), this.accessKey).toString(crypto.enc.Utf8)+`${repo}/issues`;
                let params={page:`${pageNumber}`};
                const data=await this.fetch(url,params);
                issueForRepo.push(...data);
                len = data.length;
            } while (len==100);
            for(let issue of issueForRepo){
                let desiredIssueDetails:issues={
                    title:issue.title,
                    labels:issue.labels,
                    user_name:issue.user.login,
                    user_type:issue.user.type,
                    status:issue.state,
                    repository:repo,
                    body:issue.body,
                    issue_url:issue.html_url,
                    number:issue.number.toString(),
                    created_at:this.formatDate(issue.created_at),
                    updated_at:this.formatDate(issue.updated_at)
                }
                //This is done - so that no changes are needed in existing code
                if(issue.pull_request){
                    desiredIssueDetails.pull_request=issue.pull_request;
                }
                issues.push(desiredIssueDetails);
            }
        }
        return issues;
    }

    async getReposInTopic(topic:string):Promise<string[]>{
        let result:string[]=[];
        let url= crypto.AES.decrypt(this.encodedAWSProdUrl.toString(), this.accessKey).toString(crypto.enc.Utf8)+`search/repositories?q=org:SoftwareAG+topic:${topic}&page=1&per_page=1&type=public&sort=created`;
        const data=await this.fetch(url);
        let totalCount=data.total_count;
        let i=1;
        while(totalCount>0){
            let topicUrl= crypto.AES.decrypt(this.encodedAWSProdUrl.toString(), this.accessKey).toString(crypto.enc.Utf8)+`search/repositories?q=org:SoftwareAG+topic:${topic}&page=${i}&per_page=100`;
            const topicData=await this.fetch(topicUrl);
            for(let item of topicData?.items){
                result.push(item?.name);
            }
            totalCount=totalCount-100;
            i++;
        }
        return result;
    }

    async fetch(url:string,params?:any):Promise<any>{
        try{
            if(params){
                const resp=await this.http.get<any>(url,{params:params}).toPromise();
                return resp;
            }else{
                const resp=await this.http.get<any>(url).toPromise();
                return resp;
            }
        } catch(error){
            console.log("Error occured while fetching data:",error);
            throw error;
        }
    }

    formatDate(originalDate:string):string{
        const parsedDate: Date = new Date(originalDate);
        let formattedDate= this.datePipe.transform(parsedDate, 'dd MMM yyyy, hh:mm:ss')?.toString();
        return formattedDate || '';
    }

}