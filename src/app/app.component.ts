/*
* Copyright (c) 2023 Software AG, Darmstadt, Germany and/or its licensors
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

import { Component, ViewChild, Inject, isDevMode } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ViewEncapsulation } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable, OperatorFunction } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import * as crypto from 'crypto-js';
import { repoVizService } from './repoVizService';

export interface column {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  encapsulation: ViewEncapsulation.None
})

export class AppComponent {
  model: any;
  repoOptions: OperatorFunction<string, readonly string[]> = (text$: Observable<string>) =>
		text$.pipe(
			debounceTime(1000),
			distinctUntilChanged(),
			map((term) =>
				term.length < 4 ? [] : this.repositories.filter((v) => v.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10),
			),
		);
    topicOptions: OperatorFunction<string, readonly string[]> = (text$: Observable<string>) =>
		text$.pipe(
			debounceTime(1000),
			distinctUntilChanged(),
			map((term) =>
				term.length < 4 ? [] : this.topics.filter((v) => v.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10),
			),
		);
  columns = new FormControl();
  allCols: column[] = [
    { value: 'repository', viewValue: 'Repository' },
    { value: 'issue_number', viewValue: 'Issue Number' },
    { value: 'title', viewValue: 'Title' },
    { value: 'body', viewValue: 'Body' },
    { value: 'user_name', viewValue: 'User' },
    { value: 'lable_name', viewValue: 'Labels' },
    { value: 'created_at', viewValue: 'Created Date' },
    { value: 'updated_at', viewValue: 'Updated Date' }
  ]
  selected = ['repository', 'issue_number', 'title', 'body', 'user_name', 'lable_name', 'created_at', 'updated_at'];
  toggleVal: string = 'Topic';
  submitClicked: boolean = false;
  clickedFilter: boolean = false;
  issues: any;
  issueList: any = [];
  pullList: any = [];
  closedPullList: any = [];
  closedList: any = [];
  allIssueList: any = [];
  selectedView: string = "Open";
  dataSource: any;
  lable_names: string[] = [];
  isLoading: boolean | undefined;
  isOptionsLoading:boolean=false;
  pullCheck: boolean = false;
  progressValue: number = 5;
  dataNotFound: boolean = false;
  isErrorOccured: boolean = false;
  isInputNull:boolean=false;
  errorMessage: string | undefined;
  constructor(private http: HttpClient, public dialog: MatDialog, public repoVizSerive:repoVizService) { }
  repositories:string[]=[];
  topics:string[]=[];
  displayedColumns = ['repository', 'issue_number', 'title', 'body', 'user_name', 'lable_name', 'created_at', 'updated_at'];
  accessKey = "1617169566033";
  encodedAWSBaseUrl='U2FsdGVkX1/Nj+14MglrWvOj/cUtCFZqcqJA/BSGGh6aN4GZNIg/4FUWodBxGhdfGKtGbg2/dzTJR8OkpEG6LOd4U2nYVrC8iHV4FOWeZ0Y=';
  headers = { 'Content-Type': 'application/json' };
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  public onToggleChange(val: string) {
    this.toggleVal = val;
  }
  selectedColumns(selected: string[]) {
    this.displayedColumns = selected;
  }

  getOption(search:string){
    if(search.length>4){
      this.isOptionsLoading=true;
      if(this.toggleVal=='Topic'){
        let TopicOptionsUrl= crypto.AES.decrypt(this.encodedAWSBaseUrl.toString(), this.accessKey).toString(crypto.enc.Utf8)+`search/topics?q=${search}`;
        this.http.get<JSON>(TopicOptionsUrl, { headers: this.headers , params: {per_page:10 } }).subscribe((data) => this.gettingOptions(data), (error) => this.gettingOptionsError());
      }
      else{
        let RepoOptionsUrl= crypto.AES.decrypt(this.encodedAWSBaseUrl.toString(), this.accessKey).toString(crypto.enc.Utf8)+`search/repositories?q=org:SoftwareAG+${search}+in:name`;
        this.http.get<JSON>(RepoOptionsUrl, { headers: this.headers, params: { sort:'name', order:'asc',per_page:10} }).subscribe((data) => this.gettingOptions(data),(error) => this.gettingOptionsError());
      }
    }   
  }
  gettingOptionsError(){
    this.isOptionsLoading=false;
  }
  gettingOptions(data:any){
    if(this.toggleVal=='Topic'){
      this.topics=[];
    if(data.items){
      for(let i=0;i<data.items.length;i++){
        this.topics.push(data.items[i].name);
      }
    }
    }
    else{
      this.repositories=[];
    if(data.items){
      for(let i=0;i<data.items.length;i++){
        this.repositories.push(data.items[i].name);
      }
    }
    }
    this.isOptionsLoading=false;
  }
  async callAPI(Repos: string, Topic: string) {
    if (!(Repos == '' && Topic == '')) {
      this.submitClicked = true;
      this.isLoading = true;
      this.dataNotFound = false;
      this.isErrorOccured = false;
      this.selectedView = "Open";
      if (Topic == '' || Topic == null) {
        this.progressValue = 75;
      }
      else {
        this.progressValue = 35;
        setTimeout(() => { this.progressValue = 50 }, 5000);
        setTimeout(() => { this.progressValue = 75 }, 15000);
        setTimeout(() => { this.progressValue = 90 }, 20000);
      }
      let data=await this.repoVizSerive.main(Repos.split(','),Topic);
      this.displayIssues(data);
    }
  }

  displayIssues(data: any) {
    this.pullList = [];
    this.closedPullList = [];
    this.issueList = [];
    this.closedList = [];
    this.allIssueList = [];
    this.progressValue = 90;
    this.issues = data.issues;
    if(!data.issues){
      this.progressValue=100;
      this.isLoading = false;
      this.dataNotFound=true;
    }
    let len = this.issues.length;
    for (let i = 0; i < len; i++) {
      if (!(this.issues[i].hasOwnProperty("lables"))) {
        this.issues[i]["lables"] = [{ "name": " " }];
      }
      if (this.issues[i].hasOwnProperty("pull_request") && this.issues[i].status == 'open') {
        this.pullList.push(this.issues[i]);
      }
      else if (this.issues[i].hasOwnProperty("pull_request") && this.issues[i].status == 'closed') {
        this.closedPullList.push(this.issues[i]);
      }
      else if (this.issues[i].status == 'open' && !(this.issues[i].hasOwnProperty("pull_request"))) {
        this.issueList.push(this.issues[i]);
      }
      else if (this.issues[i].status == 'closed' && !(this.issues[i].hasOwnProperty("pull_request"))) {
        this.closedList.push(this.issues[i]);
      }
    }
    this.progressValue = 100;
    this.isLoading = false;
    this.dataSource = new MatTableDataSource(this.issueList);
    setTimeout(() => { this.dataSource.paginator = this.paginator; this.dataSource.sort = this.sort; }, 0);
  }

  errorOccured(error: any) {
    if (error.status == 404)
      this.dataNotFound = true;
    else
      this.isErrorOccured = true;
    this.errorMessage = error.error.error;
    console.log("Error:", this.errorMessage);
    this.progressValue = 100;
    this.isLoading = false;
  }

  changedView() {
    if (this.selectedView == 'Open') {
      this.dataSource = new MatTableDataSource(this.issueList);
      setTimeout(() => { this.dataSource.paginator = this.paginator; }, 0);
      this.dataSource.sort = this.sort;
    }
    else if (this.selectedView == 'Closed') {
      this.dataSource = new MatTableDataSource(this.closedList);
      setTimeout(() => { this.dataSource.paginator = this.paginator; }, 0);
      this.dataSource.sort = this.sort;
    }
    else if (this.selectedView == 'All') {
      this.dataSource = new MatTableDataSource(this.issues);
      setTimeout(() => { this.dataSource.paginator = this.paginator; }, 0);
      this.dataSource.sort = this.sort;
    }
    else if (this.selectedView == 'Pull') {
      this.dataSource = new MatTableDataSource(this.pullList);
      setTimeout(() => { this.dataSource.paginator = this.paginator; }, 0);
      this.dataSource.sort = this.sort;
    }
    else if (this.selectedView == 'ClosedPull') {
      this.dataSource = new MatTableDataSource(this.closedPullList);
      setTimeout(() => { this.dataSource.paginator = this.paginator; }, 0);
      this.dataSource.sort = this.sort;
    }
  }
  bodyDialog(cell: any) {
    const bodyDialogRef = this.dialog.open(bodyDialogView, { width: '700px', height: '300px', data: cell });
  }

  applyFilter(event: any) {
    this.dataSource.filter = event.target.value.trim().toLowerCase();
  }

}

@Component({
  selector: 'bodyDialogView',
  templateUrl: '../assets/issue-body-dialog.html',
  styleUrls: ['../assets/issue-body-dialog.css'],
})
export class bodyDialogView {
  constructor(
    public bodyDialogRef: MatDialogRef<bodyDialogView>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  onOkClick(): void {
    this.bodyDialogRef.close();
  }
}
