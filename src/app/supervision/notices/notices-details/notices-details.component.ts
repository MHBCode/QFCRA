import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-notices-details',
  templateUrl: './notices-details.component.html',
  styleUrls: ['./notices-details.component.scss']
})
export class NoticesDetailsComponent {
  @Input() notice: any;
  @Input() firmDetails: any;
  @Input() firmId: any;
  @Output() closeNoticePopup = new EventEmitter<void>();
  selectedNotice: any = null;
  isEditable : boolean = false;




  constructor(

  ) {

  }

  ngOnInit(): void {
    // this.getReportPeriodTypes();
  }

  editNotice(notice: any) {
    this.selectedNotice = { ...notice }; // Clone the object to avoid modifying directly
  }

  deleteNotice(notice: any) {
  }

  saveReport() {
  
  }


  onClose(): void {
    this.closeNoticePopup.emit();
  }

}
