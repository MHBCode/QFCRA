import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { NoticeService } from 'src/app/ngServices/notice.service';

@Component({
  selector: 'app-notices-details',
  templateUrl: './notices-details.component.html',
  styleUrls: ['./notices-details.component.scss', '../../../shared/popup.scss', '../../supervision.scss']
})
export class NoticesDetailsComponent implements OnInit, OnChanges {
  @Input() notice: any;
  @Input() firmDetails: any;
  @Input() firmId: any;
  @Output() closeNoticePopup = new EventEmitter<void>();
  selectedNotice: any = null;
  isEditable: boolean = false;
  noticeDetailsInfo: any;
  questionnaireDetails: any;
  noticeDetails: any;

  publishOnWebsite : boolean = false;

  constructor(
    private noticeService: NoticeService,
  ) {

  }

  ngOnInit(): void {
  }


  ngOnChanges(changes: SimpleChanges): void {
    if (changes['notice'] && changes['notice'].currentValue) {
      this.getFirmsNotices();
    }
  }

  editNotice(notice: any) {
    this.selectedNotice = { ...notice }; // Clone the object to avoid modifying directly
  }

  deleteNotice(notice: any) {
  }

  saveReport() {

  }


  getFirmsNotices() {
    if (this.firmId && this.notice.FirmNoticeID) {
      this.noticeService.getFirmNoticeDetails(this.firmId, this.notice.FirmNoticeID).subscribe(
        data => {
          this.noticeDetailsInfo = data.response;
          this.noticeDetails = (this.noticeDetailsInfo.find(item => item.key === "ResultSet1")?.value)[0];
          this.questionnaireDetails = (this.noticeDetailsInfo.find(item => item.key === "ResultSet2")?.value);
          console.log('noticeDetailsInfo', this.noticeDetailsInfo)
        },
        error => {
          console.error('Error fetching noticeTypes ', error);
        }
      );
    }
  }

  onClose(): void {
    this.closeNoticePopup.emit();
  }

}
