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
import { constructFrom } from 'date-fns';
@Component({
  selector: 'app-workflow',
  templateUrl: './workflow.component.html',
  styleUrls: ['./workflow.component.scss']
})
export class WorkflowComponent {
  @Input() firmId: any;
  @Input() firmDetails: any;
  @Input() pageName;
  @Input() review: any;
  Page = FrimsObject;
  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.firmId = +params['id'];
      //this.isFirmAuthorised();
    });
  
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
    
  ) {

  }
  getObjectWorkflow(){
    if(this.pageName == this.Page.ReturnsReview){
      const objectId = constants.FrimsObject.ReturnsReview;
    }
    
    // const objectInstanceId =
    // const objectInstanceRevNum =
  }
}
