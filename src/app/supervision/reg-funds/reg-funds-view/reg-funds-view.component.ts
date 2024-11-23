import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ReturnReviewService } from 'src/app/ngServices/return-review.service';
import { SupervisionService } from '../../supervision.service';
import { SecurityService } from 'src/app/ngServices/security.service';
import { LogformService } from 'src/app/ngServices/logform.service';
import * as constants from 'src/app/app-constants';
import { FirmDetailsService } from 'src/app/firms/firmsDetails.service';
import { ActivatedRoute } from '@angular/router';
import { RegisteredfundService } from 'src/app/ngServices/registeredfund.service';
import { Bold, ClassicEditor, Essentials, Font, FontColor, FontSize, Heading, Indent, IndentBlock, Italic, Link, List, MediaEmbed, Paragraph, Table, Undo } from 'ckeditor5';

@Component({
  selector: 'app-reg-funds-view',
  templateUrl: './reg-funds-view.component.html',
  styleUrls: ['./reg-funds-view.component.scss' ,'../../../shared/popup.scss', '../../supervision.scss']
})
export class RegFundsViewComponent {
  @Input() reg: any;
  @Input() firmId: any;
  @Input() firmDetails: any;
  @Output() closeRegPopup = new EventEmitter<void>();
  isEditable: boolean = false;
  isLoading: boolean = false;
  userId = 30;
  RegisteredFundDetials:any =[];
  RegisteredFundStatusDetials:any = [];
 
  constructor(
    private returnReviewService: ReturnReviewService,
    private supervisionService: SupervisionService,
    private securityService: SecurityService,
    private route: ActivatedRoute,
    private logForm : LogformService,
    private registeredFundService: RegisteredfundService,

  ) {

  }
  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.firmId = +params['id'];
      //this.isFirmAuthorised();
    });
    console.log(this.reg)
    //this.loadAssignedUserRoles();
 
    this.getRegisteredFundDetail();
  
  }
  onClose(): void {
    this.closeRegPopup.emit();
  }
  getRegisteredFundDetail(){
    this.isLoading=true;
     
    const  RegisteredFundID= this.reg.RegisteredFundID;
    const  firmId= this.firmId;
    const  userId= this.userId;
  
    this.registeredFundService.getFIRMRegisteredFundDetials(userId,firmId,RegisteredFundID).subscribe({
      next: (res) => {
        // Assign full response to firmRevDetails
        this.RegisteredFundDetials = res.response;
        console.log("RegisteredFundDetials",this.RegisteredFundDetials)
        this.getRegisteredFundStatus();
        this.getSubFundData();
        this.isLoading=false;
      },
      error: (error) => {
        console.error('Error fetching return review details:', error);
        this.isLoading=false;
      },
    });
  }
  getRegisteredFundStatus(){
    const  RegisteredFundID= this.reg.RegisteredFundID;
    this.registeredFundService.getRegisteredFundStatus(RegisteredFundID).subscribe({
      next: (res) => {
        // Assign full response to firmRevDetails
        this.RegisteredFundStatusDetials = res.response;
        console.log("RegisteredFundStatusDetials",this.RegisteredFundStatusDetials)
        this.isLoading=false;
      },
      error: (error) => {
        console.error('Error fetching return review details:', error);
        this.isLoading=false;
      },
    });
  }
  SubFundData : any;
  getSubFundData(){
    const  RegisteredFundID= this.reg.RegisteredFundID;
    this.registeredFundService.getSubFundData(RegisteredFundID).subscribe({
      next: (res) => {
        // Assign full response to firmRevDetails
        this.SubFundData = res.response;
        console.log("SubFundData",this.SubFundData)
        this.isLoading=false;
      },
      error: (error) => {
        console.error('Error fetching return review details:', error);
        this.isLoading=false;
      },
    });
  }
  
  deleteRegisteredFund(){
    const  RegisteredFundID= this.reg.RegisteredFundID;
    this.registeredFundService.deleteRegisteredFund(RegisteredFundID).subscribe({
      next: (res) => {
          console.log("RegisteredFund deleted Sucessfuly")
        this.isLoading=false;
      },
      error: (error) => {
        console.error('Error deleting RegisteredFund', error);
        this.isLoading=false;
      },
    });
  }


  public Editor = ClassicEditor;

  public config = {
    toolbar: [
      'undo', 'redo', '|',
      'heading', '|', 'bold', 'italic', '|',
      'fontSize', 'fontColor', '|',
      'link', 'insertTable', 'mediaEmbed', '|',
      'bulletedList', 'numberedList', 'indent', 'outdent'
    ],
    plugins: [
      Bold,
      Essentials,
      Heading,
      Indent,
      IndentBlock,
      Italic,
      Link,
      List,
      MediaEmbed,
      Paragraph,
      Table,
      Undo,
      Font,
      FontSize,
      FontColor
    ],
    licenseKey: ''
  };

}
