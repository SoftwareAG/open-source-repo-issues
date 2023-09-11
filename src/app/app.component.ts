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
  constructor(private http: HttpClient, public dialog: MatDialog) { }
  repositories:string[]=[];
  topics:string[]=[];
  displayedColumns = ['repository', 'issue_number', 'title', 'body', 'user_name', 'lable_name', 'created_at', 'updated_at'];
  accessKey = "1617169566033";
  devMainURL = "U2FsdGVkX1/SY9wnkxUkrlQvGD7b9mxOqY9OatFNQLKMn/02eNQ2OrQu4yHgpqQMEeaPqHlRXjtc8iaaNSbN8MJA6BFhNqLuhde2Jg/gh6lv1495pohf9vEWb0Vkc2yt2hh2pMJIAYX4a+vm0Zl8vg=="
  prodMainURL = "U2FsdGVkX18utO43TS/VRwUZaz/p9Wl4OWmBP28z6p4O2SdCtZEH/+Zb7EGy05/zQmgmQu2MWkzxi/+dU0KYlaZrGlMh0ci6riHQhb5Wuk6Y+EEDLd1Fn6Ok3f4WfIB4"
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
      let gitURL="U2FsdGVkX1+MD/brytDZVcNVN0x8oxlEutTKcIhdthunrrY/aeuEsXXFyIhvjeyHV+jiPXJ+Y7onMboCH8NRQoVXJPCBL+b28prJ9DZQUzjyZ1JvIPMq4UG3a+2GDehtN9F4oJEsBzcN4cNJKGIIzg==";
      let gitBaseURL = crypto.AES.decrypt(gitURL.toString(), this.accessKey).toString(crypto.enc.Utf8);
      if(this.toggleVal=='Topic'){
        let url=gitBaseURL+"topics?q="+search;
        this.http.get<JSON>(url, { headers: this.headers, params: {per_page:10 } }).subscribe((data) => this.gettingOptions(data));
      }
      else{
        let url=gitBaseURL+"repositories?q=org:softwareag+"+search+"+in:name";
        this.http.get<JSON>(url, { headers: this.headers, params: { sort:'name', order:'asc',per_page:10} }).subscribe((data) => this.gettingOptions(data));
      }
    }   
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
  callAPI(Repos: string, Topic: string) {
    if (!(Repos == '' && Topic == '')) {
      let prodURL = crypto.AES.decrypt(this.prodMainURL.toString(), this.accessKey).toString(crypto.enc.Utf8);
      let devURL = crypto.AES.decrypt(this.devMainURL.toString(), this.accessKey).toString(crypto.enc.Utf8);
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
      if (isDevMode()) {
        this.http.get<JSON>(devURL, { headers: this.headers, params: { repos: Repos, topic: Topic } }).subscribe((data) => this.displayIssues(data), (error) => this.errorOccured(error));
      }
      else {
        this.http.get<JSON>(prodURL, { headers: this.headers, params: { repos: Repos, topic: Topic } }).subscribe((data) => this.displayIssues(data), (error) => this.errorOccured(error));
      }
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
