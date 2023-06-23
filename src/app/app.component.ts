import {Component, ViewChild, Inject} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { catchError, isEmpty, throwError } from 'rxjs';
import { FormControl } from '@angular/forms';

export interface issueDetails{
  repository:string;
  title:string;
  body:string;
  user_name:string;
  user_type:string;
  created_at:string;
  updated_at:string;
  lables:any;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})

export class AppComponent {
  searchString:string|undefined;
  toggleVal:string ='Topic';
  submitClicked: boolean = false;
  clickedFilter:boolean=false;
  issues:any;
  //lables:any;
  dataSource:any;
  lable_names: string[] = [];
  index:number=0;
  isLoading:boolean | undefined;
  constructor(private http: HttpClient,public dialog: MatDialog){}
  displayedColumns = ['serial','repository','issue_number', 'title','body','user_name','user_type','lable_name','created_at','updated_at'];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!:MatSort;
  
  public onToggleChange(val: string) {
    this.toggleVal = val;
  }

  getRepos(Repos: string){
    this.submitClicked=true;
    this.isLoading=true;
    let ROOT_URL='https://env903052.apigw-aw-eu.webmethods.io/gateway/GithubIssuesList/1.0/github/issues';
    console.log("root_url:",ROOT_URL);
    console.log("repos: ",Repos);
    const headers={'Contet-Type':'application/json'}
    this.http.get<JSON>(ROOT_URL,{headers:headers, params:{repos:Repos}}).subscribe((data)=>this.displayIssues(data));
  }
  getTopicIssues(Topic:string){
    this.submitClicked=true;
    this.isLoading=true;
    let ROOT_URL='https://env903052.apigw-aw-eu.webmethods.io/gateway/GithubIssuesList/1.0/github/topicIssues';
    console.log("root_url:",ROOT_URL);
    console.log("repos: ",Topic);
    const headers={'Contet-Type':'application/json'}
    this.http.get<JSON>(ROOT_URL,{headers:headers, params:{topic:Topic}}).subscribe((data)=>this.displayIssues(data));
  }
  displayIssues(data:any){
    console.log("data:",data);
    this.issues=data.finalOut;
    let len=this.issues.length;
    console.log(len);
    for(let i=0;i<len;i++){
      if(!(this.issues[i].hasOwnProperty("lables"))){
        this.issues[i]["lables"]=[{"name":" "}];
        console.log("adding empty lable names:",this.issues[i].lables[0].name);
      }
      this.issues[i]["SNo"]=i+1;
      console.log("S.No added to doc: ",this.issues[i].SNo);
    }
    this.isLoading=false
    this.dataSource=new MatTableDataSource(this.issues);
    this.dataSource.paginator=this.paginator;
    this.dataSource.sort=this.sort;
  }

  bodyDialog(cell:string){
    const bodyDialogRef=this.dialog.open(bodyDialogView,{width:'fit-content',height:'fit-content',data:cell});
    console.log("body cell clicked: ",cell);
  }

  titleDialog(cell:string){
    const titleDialogRef=this.dialog.open(titleDialogView,{width:'fit-content',height:'fit-content',data:cell});
    console.log("body cell clicked: ",cell);
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
    console.log("Filter was hit with string",event.target.value);
    this.dataSource.filter = event.target.value.trim().toLowerCase();
  }
}

/*@Component({
  selector:'DialogOverviewDialog',
  templateUrl:'../assets/issue-row-dialog.html',
  styleUrls: ['../assets/issue-row-dialog.css'],
})
export class DialogOverviewDialog {

  constructor(
    public dialogRef: MatDialogRef<DialogOverviewDialog>,
    @Inject(MAT_DIALOG_DATA) public data: issueDetails) {}

  onOkClick(): void {
    this.dialogRef.close();
  }  
}*/

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