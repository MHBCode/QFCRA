import { Component, EventEmitter, Input, Output,ChangeDetectorRef, ElementRef, QueryList, ViewChildren } from '@angular/core';
import { SupervisionService } from 'src/app/supervision/supervision.service';
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
import { FrimsObject, ObjectOpType } from 'src/app/app-constants';
import {UsersService} from 'src/app/ngServices/users.service'
@Component({
  selector: 'app-review',
  templateUrl: './review.component.html',
  styleUrls: ['./review.component.scss','../popup.scss', '../../supervision/supervision.scss']
})
export class ReviewComponent {

  isLoading : boolean = false
  @Input() fee: any;
  @Input() firmId: any;
  @Input() firmDetails: any;
  @Input() isEditable : any;
  @Input() addtlReviewRequired : any;
  @Input() addtlReviewRequiredDecisionMadeByName : any;
  @Input() addtlReviewRequiredDecisionMadeOn : any;
  @Input() pageName;
  @Input() index: number;
  @Input() Review: any;
  @Input() isReviseMode : any;
  @Input() UserObjectWfTasks: any;
  Page = FrimsObject;
  @Output() closeRegPopup = new EventEmitter<void>();
  @Output() fundDeleted = new EventEmitter<void>();
  
  now = new Date();
  currentDate = this.now.toISOString();
  currentDateOnly = new Date(this.currentDate).toISOString().split('T')[0];
  @ViewChildren('dateInputs') dateInputs!: QueryList<ElementRef<HTMLInputElement>>;
  taskRolesList: any
  selectedAppRoleID: number = 0;
  UsersInRoleList : any;
  isShowEmailCCPopup:boolean = false;
  UsersList :any;
 @Output() reviewsArray: any[] = [];
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
    private usersService : UsersService,
    
  ) {

  }
  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.firmId = +params['id'];
      //this.isFirmAuthorised();
    });
    console.log(this.fee)
    if (!Array.isArray(this.Review)) {
      console.error('Review is not an array:', this.Review);
      this.Review = null; // Fallback to an empty array
    }
  }
  ngAfterViewInit() {
    this.dateInputs.changes.subscribe(() => {
      this.flatpickrService.initializeFlatpickr(this.dateInputs.toArray());
    });
    this.flatpickrService.initializeFlatpickr(this.dateInputs.toArray());
  }
  onClose(): void {
    this.closeRegPopup.emit();
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
  showFirstReview: boolean = false
  // AddFirstReview(){
  //   this.showFirstReview = true;
  // } 
  ReviewObj = {
    review:'',
    task: 'Review',
    roleassignedToId:0,
    userAssignedToId:0,
    dueDate: '',
  }
  AddFirstReview() {
    this.reviewsArray.push({ ...this.ReviewObj });
  }
  getWorkflowTaskRoles(){
    const objectTaskTypeID = this.UserObjectWfTasks.ObjectTaskTypeID;
    const objectID = constants.FrimsObject.ReturnsReview;
    const notificationFlag = 0;
    const objectWFTaskDefID = this.UserObjectWfTasks.ObjectWFTaskDefID;
    this.objectwfService.getWorkflowTaskRoles(objectTaskTypeID,objectID,notificationFlag,objectWFTaskDefID).subscribe({
      next: (res) => {
        this.taskRolesList = res.response;
        console.log("taskRolesList",this.taskRolesList)
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fitching taskRolesList', error);
        this.isLoading = false;
      },
    });
  }
  onRoleChange(event: Event,index: number) {
    console.log('Selected AppRoleID:', this.selectedAppRoleID);
    const target = event.target as HTMLSelectElement;
    this.reviewsArray[index].roleassignedToId = parseInt(target.value, 10);
    this.getUsersInRole(this.selectedAppRoleID);
  }
  
  getUsersInRole(selectedAppRoleID){
    const objectID = constants.FrimsObject.ReturnsReview;
    const roleId = selectedAppRoleID;
    this.securityService.getUsersInRole(objectID,roleId).subscribe({
      next: (res) => {
        this.UsersInRoleList = res.response;
        console.log("UsersInRoleList",this.UsersInRoleList)
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fitching UsersInRoleList', error);
        this.isLoading = false;
      },
    });
  }
  

  // CancleFirstReview(){
  //   Swal.fire({
  //     text: "Your selection of 'No' for the 'Additional Review Required' field indicates that your review of this submission is complete and that you intend to close-out this review without any additional reviews. Any further changes to this review will have to be made by creating a new revision of this review by clicking on the 'Revise' button. If your review of this report has not been completed, please select 'Not Yet' and save your changes.",
  //     icon: 'warning',
  //     showCancelButton: true,
  //     confirmButtonColor: '#982B1C',
  //     cancelButtonColor: '#982B1C',
  //     confirmButtonText: 'Ok',
  //     cancelButtonText: 'Cancel'
  //   }).then((result) => {
  //     if (result.isConfirmed) {
  //       this.showFirstReview = false;
  //     }
  //   });
  // }
  CancelFirstReview(index: number) {
    Swal.fire({
      text: "Your selection of 'No' for the 'Additional Review Required' field indicates that your review of this submission is complete and that you intend to close-out this review without any additional reviews. Any further changes to this review will have to be made by creating a new revision of this review by clicking on the 'Revise' button. If your review of this report has not been completed, please select 'Not Yet' and save your changes.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#982B1C',
      cancelButtonColor: '#982B1C',
      confirmButtonText: 'Yes, Remove',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.reviewsArray.splice(index, 1);
      }
    });
  }
 // selected user
 openEmailCCPopup(){
  this.isShowEmailCCPopup = true;
  this.getUsers();
 }

 getUsers(){
  this.usersService.getUsers().subscribe({
    next: (res) => {
      this.UsersList = res.response;
      console.log("UsersList",this.UsersList)
      this.isLoading = false;
    },
    error: (error) => {
      console.error('Error fitching UsersList', error);
      this.isLoading = false;
    },
  });
 }
}
