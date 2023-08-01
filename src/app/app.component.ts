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

import {Component, ViewChild, Inject, isDevMode} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ViewEncapsulation } from '@angular/core';
import {FormControl} from '@angular/forms';
import * as crypto from 'crypto-js';

export interface column{
  value:string;
  viewValue:string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  encapsulation:ViewEncapsulation.None
})

export class AppComponent{

  columns = new FormControl();
  allCols:column[]=[
    {value:'repository' , viewValue:'Repository'},
    {value:'issue_number' , viewValue:'Issue Number'},
    {value:'title' , viewValue:'Title'},
    {value:'body' , viewValue:'Body'},
    {value:'user_name' , viewValue:'User'},
    {value:'lable_name' , viewValue:'Labels'},
    {value:'created_at' , viewValue:'Created Date'},
    {value:'updated_at' , viewValue:'Updated Date'}
  ]
  selected=['repository','issue_number', 'title','body','user_name','lable_name','created_at','updated_at'];
  toggleVal:string ='Topic';
  submitClicked: boolean = false;
  clickedFilter:boolean=false;
  issues:any;
  issueList:any=[];
  pullList:any=[];
  dataSource:any;
  lable_names: string[] = [];
  isLoading:boolean | undefined;
  pullCheck:boolean=false;
  progressValue:number=5;
  dataNotFound:boolean=false;
  constructor(private http: HttpClient,public dialog: MatDialog){}
  displayedColumns = ['repository','issue_number', 'title','body','user_name','lable_name','created_at','updated_at'];
  accessKey="1617169566033";
  prodEncryptURL="U2FsdGVkX1+VbkhbUk7Fy8RpMsXifJ7L9WAe6A8+LL61lCdV2wfUhjnDbS6FLd6iqTZ7Ad37SudeWoQr2RdvqrMZpRmva8MvDXjN3NrI5fA7akZC0ulpYI1jQFowiaC+08PbD74JfBfRjQWuBHJGvA==";
  devEncryptURL="U2FsdGVkX1/xlJ2CJEZF8ziZEx18dp826fQSL3HFMVgbaZlw6wN9xsPWA7RY3Z2PYEyObKmvlpJqRAnNTue/QLSP90oSgXs6jE+QntjWtMuWi28HyjY4Xo+2/FEu5gf50M+S+BfRnJr10k62RV8GRg==";
  headers={'Contet-Type':'application/json'};
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!:MatSort;
  public onToggleChange(val: string) {
    this.toggleVal = val;
  }
  selectedColumns(selected:string[]){
    this.displayedColumns=selected;
  }
  getRepos(Repos: string){
    this.submitClicked=true;
    this.isLoading=true;
    this.dataNotFound=false;
    let ROOT_URL="";
    if(isDevMode())
      ROOT_URL=crypto.AES.decrypt(this.devEncryptURL.toString(),this.accessKey).toString(crypto.enc.Utf8)+'repository';
    else
      ROOT_URL=crypto.AES.decrypt(this.prodEncryptURL.toString(),this.accessKey).toString(crypto.enc.Utf8)+'repository';
    this.progressValue=75;
    this.http.get<JSON>(ROOT_URL,{headers:this.headers, params:{repos:Repos}}).subscribe((data)=>this.displayIssues(data));
  }
  getTopicIssues(Topic:string){
    this.submitClicked=true;
    this.isLoading=true;
    this.dataNotFound=false;
    let ROOT_URL="";
    if(isDevMode())
      ROOT_URL=crypto.AES.decrypt(this.devEncryptURL.toString(),this.accessKey).toString(crypto.enc.Utf8)+'TopicName';
    else
      ROOT_URL=crypto.AES.decrypt(this.prodEncryptURL.toString(),this.accessKey).toString(crypto.enc.Utf8)+'topicName';
    this.progressValue=35;
    setTimeout(() =>{this.progressValue=50},5000);
    setTimeout(() =>{this.progressValue=75},10000);
    setTimeout(() =>{this.progressValue=90},15000);
    this.http.get<JSON>(ROOT_URL,{headers:this.headers, params:{topic:Topic}}).subscribe((data)=>this.displayIssues(data));
  }

  displayIssues(data:any){
    this.pullList=[];
    this.issueList=[];
    this.progressValue=90;
    if(!(data.hasOwnProperty("finalOut"))){
      this.dataNotFound=true;
      this.progressValue=100;
      this.isLoading=false;
    }
    this.issues=data.finalOut;
    let len=this.issues.length;
    for(let i=0;i<len;i++){
      if(!(this.issues[i].hasOwnProperty("lables"))){
        this.issues[i]["lables"]=[{"name":" "}];
      }
      if(this.issues[i].user.type=='Bot'){
        this.pullList.push(this.issues[i]);
      }
      if(!(this.issues[i].user.type=='Bot')){
        this.issueList.push(this.issues[i]);
      }
    }
    this.progressValue=100;
    this.isLoading=false
    this.dataSource=new MatTableDataSource(this.issueList);
    setTimeout(() =>{this.dataSource.paginator=this.paginator;},0);
    this.dataSource.sort=this.sort;
  }

  bodyDialog(cell:string){
    const bodyDialogRef=this.dialog.open(bodyDialogView,{width:'fit-content',height:'fit-content',data:cell});
  }

  titleDialog(cell:string){
    const titleDialogRef=this.dialog.open(titleDialogView,{width:'fit-content',height:'fit-content',data:cell});
  }

  onClickedFilter(){
    if(this.clickedFilter==true){
      this.clickedFilter=false;
    }
    else{
      this.clickedFilter=true;
    }
  }

  applyFilter(event: any) {
    this.dataSource.filter = event.target.value.trim().toLowerCase();
  }
  changedRequest(){
    if(this.pullCheck==false){
      this.dataSource=new MatTableDataSource(this.pullList);
      this.dataSource.paginator=this.paginator;
      this.dataSource.sort=this.sort;
      this.pullCheck=true;
    }
    else{
      this.dataSource=new MatTableDataSource(this.issueList);
      this.dataSource.paginator=this.paginator;
      this.dataSource.sort=this.sort;
      this.pullCheck=false;
    }
  }
}

@Component({
  selector:'bodyDialogView',
  templateUrl:'../assets/issue-body-dialog.html',
  styleUrls: ['../assets/issue-body-dialog.css'],
})
export class bodyDialogView{
  constructor(
    public bodyDialogRef: MatDialogRef<bodyDialogView>,
    @Inject(MAT_DIALOG_DATA) public data: string) {}

  onOkClick(): void{
    this.bodyDialogRef.close();
  }
}

@Component({
  selector:'titleDialogView',
  templateUrl:'../assets/issue-title-dialog.html',
  styleUrls: ['../assets/issue-title-dialog.css'],
})
export class titleDialogView{
  constructor(
    public titleDialogRef: MatDialogRef<titleDialogView>,
    @Inject(MAT_DIALOG_DATA) public data: string) {}

  onOkClick(): void{
    this.titleDialogRef.close();
  }
}