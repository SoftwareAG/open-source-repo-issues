import {Component, ViewChild, Inject} from '@angular/core';
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
  secretKey="1617169566033";
  encryptURL='U2FsdGVkX1++MV0TQYwIVCUSyCjtOV5AoCcCZEkreAIKqffcRqVdlkL8988IqpDhbI8mS+SJd7Bf3LRj4bf2rRArNIAnt/2m2letE2q7Wog72lNK9uGYPfJ687GrJjoV7ZuadB85ELcBDK0jZnCVww=='
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
    let ROOT_URL=crypto.AES.decrypt(this.encryptURL.toString(),this.secretKey).toString(crypto.enc.Utf8)+'issues';
    this.progressValue=75;
    this.http.get<JSON>(ROOT_URL,{headers:this.headers, params:{repos:Repos}}).subscribe((data)=>this.displayIssues(data));
  }
  getTopicIssues(Topic:string){
    this.submitClicked=true;
    this.isLoading=true;
    this.dataNotFound=false;
    let ROOT_URL=crypto.AES.decrypt(this.encryptURL.toString(),this.secretKey).toString(crypto.enc.Utf8)+'topicIssues';
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