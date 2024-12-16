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
import { ObjectwfdefService } from 'src/app/ngServices/objectwfdef.service';
import { SafeHtml } from '@angular/platform-browser';
import { WaiverService } from 'src/app/ngServices/waiver.service';
import { FrimsObject, ObjectOpType } from 'src/app/app-constants';
import {UsersService} from 'src/app/ngServices/users.service'
import { constructFrom } from 'date-fns';
@Component({
  selector: 'app-workflow',
  templateUrl: './workflow.component.html',
  styleUrls: ['./workflow.component.scss', '../popup.scss', '../../supervision/supervision.scss']
})
export class WorkflowComponent {
  @Input() firmId: any;
  @Input() firmDetails: any;
  @Input() pageName;
  @Input() review: any;
  @Input() isReviseMode: boolean;
  @Input() reviewsArray: any;
  Page = FrimsObject;
  userId = 30;
  wfTaskList:any;
  ObjectWorkflow:any;
  showCancelWorkflow: boolean = false;
  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.firmId = +params['id'];
      //this.isFirmAuthorised();
    });
    this.initializeWorkflow();
  }
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
    private objectwfdefService : ObjectwfdefService
  ) {

  }

  //////////////////////////////////////////////// initialize Workflow
  async initializeWorkflow() {
    await this.getObjectWorkflow();
    this.loadWorkflowGrid();
  }
  getObjectWorkflow(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.pageName == this.Page.ReturnsReview) {
        const objectId = constants.FrimsObject.ReturnsReview;
        const objectInstanceId = this.review.RptReviewID;
        const objectInstanceRevNum = this.review.RptReviewRevNum;
        this.objectwfService.getObjectWorkflow(objectId, objectInstanceId, objectInstanceRevNum).subscribe({
          next: (res) => {
            this.ObjectWorkflow = res.response;
            console.log("ObjectWorkflow", this.ObjectWorkflow);
            resolve(); // Resolve the promise after the workflow is fetched
          },
          error: (error) => {
            console.error('Error fetching ObjectWorkflow', error);
            reject(error); // Reject the promise in case of an error
          },
        });
      } else if (this.pageName == this.Page.LateAdminFee) { 
        const objectId = constants.FrimsObject.LateAdminFee;
        // Handle LateAdminFee logic here if needed
        resolve(); // Ensure the promise resolves even if no async action happens
      } else {
        resolve(); // Resolve if no matching pageName
      }
    });
  }
  
  loadWorkflowGrid() {
    const Workflow = this.ObjectWorkflow;
    if (Workflow.ObjectWFStatusID == null && Workflow.ObjectInstanceID == 0) {
      this.getDefaultWorkflowDetails();
    } else if (Workflow.ObjectWFStatusID != null) {
      this.getUserWorkFlowDetails();
    }
    if (this.wfTaskList.length == 0 && this.ObjectWorkflow.ObjectInstanceID != 0) {
      this.getDefaultWorkflowDetails();
    }
  }
  
  getDefaultWorkflowDetails(){
    const ObjectID = this.ObjectWorkflow.objectID;
    const userID = this.userId;
    this.objectwfdefService.getDefaultWorkflowDetails(ObjectID,userID).subscribe({
      next: (res) => {
        this.wfTaskList = res.response;
        console.log("wfTaskList",this.wfTaskList)
        
      },
      error: (error) => {
        console.error('Error fitching wfTaskList', error);
      },
    });
  }
  getUserWorkFlowDetails(){
    const ObjectWFStatusID = this.ObjectWorkflow.ObjectWFStatusID;
    this.objectwfService.getUserWorkFlowDetails(ObjectWFStatusID).subscribe({
      next: (res) => {
        this.wfTaskList = res.response;
        console.log("wfTaskList",this.wfTaskList)
        
      },
      error: (error) => {
        console.error('Error fitching wfTaskList', error);
      },
    });
  }

  //////////////////////////////////////////////////////// Start WorkFlow

  ConfirmstartWorkflow() {
    Swal.fire({
      text: 'are you sure you want to start Review workflow tasks?',
      showCancelButton: true,
      confirmButtonText: 'OK',
      cancelButtonText: 'Cancel',
      confirmButtonColor: 'hsl(345.9deg 100% 35.88%)',
      cancelButtonColor: 'hsl(345.9deg 100% 35.88%)'
    }).then((result) => {
      if (result.isConfirmed) {
        this.showCancelWorkflow = true; // Show the Cancel Workflow button
        
        
        Swal.fire('Started!', 'The workflow has been started.', 'success');
      }
    });
  }
  getWorkflowTaskList(){
       
  }
}
