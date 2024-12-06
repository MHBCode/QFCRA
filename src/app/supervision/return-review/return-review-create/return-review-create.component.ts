import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ReturnReviewService } from 'src/app/ngServices/return-review.service';
import { SupervisionService } from '../../supervision.service';
import { SecurityService } from 'src/app/ngServices/security.service';
import { LogformService } from 'src/app/ngServices/logform.service';
import * as constants from 'src/app/app-constants';
import { FirmDetailsService } from 'src/app/firms/firmsDetails.service';
import { ActivatedRoute } from '@angular/router';
import { Bold, ClassicEditor, Essentials, Font, FontColor, FontSize, Heading, Indent, IndentBlock, Italic, Link, List, MediaEmbed, Paragraph, Table, Undo } from 'ckeditor5';
import { ReviewComponent } from 'src/app/shared/review/review.component';
import {ObjectwfService} from 'src/app/ngServices/objectwf.service';
import { FrimsObject, ObjectOpType } from 'src/app/app-constants';
@Component({
  selector: 'app-return-review-create',
  templateUrl: './return-review-create.component.html',
  styleUrls: ['./return-review-create.component.scss', '../../../shared/popup.scss', '../../supervision.scss']
})
export class ReturnReviewCreateComponent {
  @Input() firmId: any;
  @Input() firmDetails: any;
  userId = 30;
  isLoading: boolean = false;
  @Output() closeCreatePopup = new EventEmitter<void>();
  errorMessages: { [key: string]: string } = {};
  constructor(
    private returnReviewService: ReturnReviewService,
    private supervisionService: SupervisionService,
    private securityService: SecurityService,
    private route: ActivatedRoute,
    private logForm : LogformService,
    private objectwfService: ObjectwfService,

  ) {

  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.firmId = +params['id'];
      //this.isFirmAuthorised();
    });

  }
  onClose(): void {
    this.closeCreatePopup.emit();
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
  loadErrorMessages(fieldName: string, msgKey: number, placeholderValue?: string) {
    this.supervisionService.getErrorMessages(fieldName, msgKey, null, placeholderValue).subscribe(
      () => {
        this.errorMessages[fieldName] = this.supervisionService.errorMessages[fieldName];
      },
      error => {
        console.error(`Error loading error message for ${fieldName}:`, error);
      }
    );
  }
}
