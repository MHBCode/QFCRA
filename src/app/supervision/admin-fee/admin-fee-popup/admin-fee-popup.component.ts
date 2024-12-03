import { Component, EventEmitter, Input, Output,ChangeDetectorRef, ElementRef, QueryList, ViewChildren } from '@angular/core';
import { SupervisionService } from '../../supervision.service';
import { SecurityService } from 'src/app/ngServices/security.service';
import { LogformService } from 'src/app/ngServices/logform.service';
import * as constants from 'src/app/app-constants';
import { FirmDetailsService } from 'src/app/firms/firmsDetails.service';
import { ActivatedRoute } from '@angular/router';
import { RegisteredfundService } from 'src/app/ngServices/registeredfund.service';
import { Bold, ClassicEditor, Essentials, Font, FontColor, FontSize, Heading, Indent, IndentBlock, Italic, Link, List, MediaEmbed, Paragraph, Table, Undo } from 'ckeditor5';
import Swal from 'sweetalert2';
import {ObjectwfService} from 'src/app/ngServices/objectwf.service';
import { FlatpickrService } from 'src/app/shared/flatpickr/flatpickr.service';
import { SanitizerService } from 'src/app/shared/sanitizer-string/sanitizer.service';
import { FirmRptAdminFeeService } from 'src/app/ngServices/firm-rpt-admin-fee.service';
import { SafeHtml } from '@angular/platform-browser';
import { WaiverService } from 'src/app/ngServices/waiver.service';
@Component({
  selector: 'app-admin-fee-popup',
  templateUrl: './admin-fee-popup.component.html',
  styleUrls: ['./admin-fee-popup.component.scss','../../../shared/popup.scss', '../../supervision.scss']
})
export class AdminFeePopupComponent {
  @Input() fee: any;
  @Input() firmId: any;
  @Input() firmDetails: any;
  @Output() closeRegPopup = new EventEmitter<void>();
  @Output() fundDeleted = new EventEmitter<void>();
  isEditable: boolean = false;
  isLoading: boolean = true;
  now = new Date();
  currentDate = this.now.toISOString();
  currentDateOnly = new Date(this.currentDate).toISOString().split('T')[0];
  @ViewChildren('dateInputs') dateInputs!: QueryList<ElementRef<HTMLInputElement>>;
  AdminFeeDetials: any;
  showCalculatedFeePopup :boolean = false;
  showPreviousCommentsModal: boolean = false;
  constructor(
    private supervisionService: SupervisionService,
    private securityService: SecurityService,
    private route: ActivatedRoute,
    private logForm : LogformService,
    private registeredFundService: RegisteredfundService,
    private firmDetailsService: FirmDetailsService,
    private objectwfService: ObjectwfService,
    private flatpickrService: FlatpickrService,
    private sanitizerService: SanitizerService,
    private firmRptAdminFeeService: FirmRptAdminFeeService,
    private waiverService : WaiverService,
  ) {

  }
  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.firmId = +params['id'];
      //this.isFirmAuthorised();
    });
    console.log(this.fee)
    this.getAdminFeeDetials();
    this.getMessageProperty()
  }
  onClose(): void {
    this.closeRegPopup.emit();
  }
  constructLink(): string {
    if (this.AdminFeeDetials[0]) {
      return this.AdminFeeDetials[0].LinkToReview +
        this.firmId +
        constants.AMPERSAND +
        constants.QUERYSTRING_SCHEDULEITEMID +
        constants.CHAR_EQUAL +
        this.AdminFeeDetials[0].FirmRptSchItemID;
    }
    return '';
  }
  getAdminFeeDetials(){
    this.isLoading = true
    const firmRptFeeID = this.fee.FirmrptAdminFeeID;
    this.firmRptAdminFeeService.getAdminFeeDetials(firmRptFeeID).subscribe({
      next: (res) => {
        this.AdminFeeDetials = res.response;
        console.log("AdminFeeDetials",this.AdminFeeDetials)
        this.getResubmissionHistoryList();
        this.getUserObjectWfTasks();
        
      },
      error: (error) => {
        console.error('Error fitching AdminFeeDetials', error);
      },
    });
    
  }
  ResubmissionHistoryList : any
  getResubmissionHistoryList(){
    const firmRptSchItemId = this.fee.FirmRptSchItemID
    const firmRptReviewId = this.fee.FirmRptReviewID
    const firmRptReviewRevId = this.fee.FirmRptReviewRevNum
    const firmRptAdminFeeID = this.fee.FirmrptAdminFeeID
    this.firmRptAdminFeeService.getResubmissionHistoryList(firmRptSchItemId,firmRptReviewId,firmRptReviewRevId,firmRptAdminFeeID).subscribe({
      next: (res) => {
        this.ResubmissionHistoryList = res.response;
        console.log("ResubmissionHistoryList",this.ResubmissionHistoryList)
        
      },
      error: (error) => {
        console.error('Error fitching ResubmissionHistoryList', error);
      },
    });
  }
  RevisionCommentsList : any;
  getRevisionCommentsByWaiver(){
    this.showPreviousCommentsModal = true;
    const objectWFStatusID = this.fee.ObjectWfStatusID;
    this.waiverService.getRevisionCommentsByWaiver(objectWFStatusID).subscribe({
      next: (res) => {
        this.RevisionCommentsList = res.response;
        console.log("RevisionCommentsList",this.RevisionCommentsList)
      },
      error: (error) => {
        console.error('Error fitching RevisionCommentsList', error);
      },
    });
  }
  UserObjectWfTasks : any;
  getUserObjectWfTasks(){
    const ObjectWFStatusID = this.fee.ObjectWfStatusID;
    this.objectwfService.getUserObjectWfTasks(ObjectWFStatusID).subscribe({
      next: (res) => {
        this.UserObjectWfTasks = res.response;
        console.log("UserObjectWfTasks",this.UserObjectWfTasks)
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fitching UserObjectWfTasks', error);
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
  sanitizeHtml(html: string): SafeHtml {
    return this.sanitizerService.sanitizeHtml(html);
  }
  CalculatedFee :any;
  getCalculatedFee(){
    this.showCalculatedFeePopup = true
    const adminFeeRateID = this.fee.AdminFeeRateID;
   
    const day = parseInt(this.dayCount, 10);
    this.firmRptAdminFeeService.getCalculatedFee(adminFeeRateID,day).subscribe({
      next: (res) => {
        this.CalculatedFee = res.response;
        console.log("CalculatedFee",this.CalculatedFee)
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fitching UserObjectWfTasks', error);
      },
    });
  }
  closeCalculatedFeePopup(){
    this.showCalculatedFeePopup = false;
  }
  dayCount :any;
  getMessageProperty(){
    const messageKey = "LateAdminFee_day";
    this.logForm.getMessageProperty(messageKey).subscribe({
      next: (res) => {
        this.dayCount = res.response;
        console.log("dayCount",this.dayCount)
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fitching UserObjectWfTasks', error);
      },
    });
  }
  closePreviousCommentsModal(){
    this.showPreviousCommentsModal = false;
  }
}
