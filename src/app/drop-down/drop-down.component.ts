import { Component } from '@angular/core';

@Component({
  selector: 'app-drop-down',
  templateUrl: './drop-down.component.html',
  styleUrls: ['./drop-down.component.css']
})
export class DropDownComponent {

  displayedColumns = ['repository','issue_number', 'title','body','user_name','lable_name','created_at','updated_at'];
  dropOpen:boolean=false;
  updatedDate:boolean=true;
  clickedDrop(){
    if(this.dropOpen==false){
      this.dropOpen=true;
    }
    else{
      this.dropOpen=false;
    }
  }

  updated_date(event:any){
    if(this.updatedDate==true){
      this.displayedColumns.splice((this.displayedColumns.indexOf('updated_at')),1);
      this.updatedDate=false;
      console.log(this.displayedColumns);
    }
    else{
      this.displayedColumns.push('updated_at');
      this.updatedDate=true;
      console.log(this.displayedColumns);
    }
  }
}
