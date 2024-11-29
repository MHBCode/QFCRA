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

  ) {

  }
  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.firmId = +params['id'];
      //this.isFirmAuthorised();
    });
    console.log(this.fee)
    this.getAdminFeeDetials();
  }
  onClose(): void {
    this.closeRegPopup.emit();
  }
  getAdminFeeDetials(){
    const firmRptFeeID = this.fee.FirmrptAdminFeeID;
    this.firmRptAdminFeeService.getAdminFeeDetials(firmRptFeeID).subscribe({
      next: (res) => {
        this.AdminFeeDetials = res.response;
        console.log("AdminFeeDetials",this.AdminFeeDetials)
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fitching AdminFeeDetials', error);
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
  
}
