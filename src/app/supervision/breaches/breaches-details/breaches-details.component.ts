import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { BreachesService } from 'src/app/ngServices/breaches.service';
import { SanitizerService } from 'src/app/shared/sanitizer-string/sanitizer.service';
import { FrimsObject, ObjectOpType, ResponseTypes, BreachStatus } from 'src/app/app-constants';
import { SafeHtml } from '@angular/platform-browser';
import { Bold, ClassicEditor, Essentials, Font, FontColor, FontSize, Heading, Indent, IndentBlock, Italic, Link, List, MediaEmbed, Paragraph, Table, Undo } from 'ckeditor5';
import * as constants from 'src/app/app-constants';
import { ActionItemsService } from 'src/app/ngServices/action-items.service';


@Component({
  selector: 'app-breaches-details',
  templateUrl: './breaches-details.component.html',
  styleUrls: ['./breaches-details.component.scss', '../../../shared/popup.scss', '../../supervision.scss']
})
export class BreachesDetailsComponent {
  @Input() breach: any;
  @Input() firmDetails: any;
  @Input() firmId: any;
  @Output() closeBreachPopup = new EventEmitter<void>();
  selectedBreach: any = null;
  isEditable: boolean = false;
  userId: number = 30;
  isLoading: boolean = false;
  isEditMode:boolean = false;
  Page = FrimsObject;
  breachDetails: any;
  provisionBreachGroup: any;
  isBreachClosed: boolean = false;
  ActionItems: any = [];
  newActionItems: { createdDate: string; updatedByUserName: string; notes: string }[] = [];
  userObjTasks: any[] = [];

  constructor(
    private breachService: BreachesService,
    private sanitizerService: SanitizerService,
    private actionItemsService: ActionItemsService
  ) {

  }


  ngOnInit(): void {

  }


  ngOnChanges(changes: SimpleChanges): void {
    if (changes['breach'] && changes['breach'].currentValue) {
      this.getBreachDetails();
      this.getBreachProvisionGroup();
    }
  }

  getBreachDetails() {
    if (this.breach.BreachId) {
      this.breachService.getBreachDetails(this.breach.BreachId, this.breach.BreachRevNum).subscribe(
        data => {
          this.breachDetails = data.response[0];
          this.isBreachClosed = this.breachDetails.BreachStatusID == BreachStatus.Closed ? true : false;
          console.log('breachDetails', this.breachDetails)
          this.getObjectActionItems();
        },
        error => {
          console.error('Error fetching noticeTypes ', error);
        }
      );
    }
  }


  getBreachProvisionGroup() {
    if (this.breach.BreachId) {
      this.breachService.getBreachProvisionGroup(this.breach.BreachId, this.breach.BreachRevNum).subscribe(
        data => {
          this.provisionBreachGroup = data.response;
          console.log('provisionBreachGroup', this.provisionBreachGroup)
        },
        error => {
          console.error('Error fetching noticeTypes ', error);
        }
      );
    }
  }

  getObjectActionItems() {
    const objectId = constants.FrimsObject.Breach;
    const objectInstanceId = this.breachDetails.BreachId;
    const objectInstanceRevNum = this.breachDetails.BreachRevNum;
    const objectOpTypeId = constants.ObjectOpType.View;

    this.actionItemsService.getObjectActionItems(objectId, objectInstanceId, objectInstanceRevNum, objectOpTypeId)
      .subscribe({
        next: (res) => {
          this.ActionItems = res.response;
        },
        error: (error) => {
          console.error(`Error fetching ActionItem :`, error);

        },
      });
  }

  addNewRow() {
    this.newActionItems.push({ createdDate: '', updatedByUserName: '', notes: '' });
  }

  removeNewRow(index: number) {
    this.newActionItems.splice(index, 1);
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
    return this.sanitizerService.sanitizeHtml(html || '');
  }

  onBreachDataReceived(tasks: any) {
    this.userObjTasks = tasks;
    console.log('Received review data:', this.userObjTasks);
  }

  onClose(): void {
    this.closeBreachPopup.emit();
  }

}
