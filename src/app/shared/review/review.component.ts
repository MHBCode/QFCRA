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
  @Input() Review: any[]=[];

  Page = FrimsObject;
  @Output() closeRegPopup = new EventEmitter<void>();
  @Output() fundDeleted = new EventEmitter<void>();
  now = new Date();
  currentDate = this.now.toISOString();
  currentDateOnly = new Date(this.currentDate).toISOString().split('T')[0];
  @ViewChildren('dateInputs') dateInputs!: QueryList<ElementRef<HTMLInputElement>>;
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
    if (!Array.isArray(this.Review)) {
      console.error('Review is not an array:', this.Review);
      this.Review = []; // Fallback to an empty array
    }
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
}
