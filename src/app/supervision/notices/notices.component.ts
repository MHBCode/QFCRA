import { Component, OnInit, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FirmDetailsService } from 'src/app/firms/firmsDetails.service';
import { NoticeService } from 'src/app/ngServices/notice.service';
import { SecurityService } from 'src/app/ngServices/security.service';
import { DateUtilService } from 'src/app/shared/date-util/date-util.service';
import * as constants from 'src/app/app-constants';

@Component({
  selector: 'app-notices',
  templateUrl: './notices.component.html',
  styleUrls: ['./notices.component.scss', '../supervision.scss']
})
export class NoticesComponent implements OnInit {
  userId = 30;
  pageSize: number = 10;
  currentPage: number = 1;
  totalPages: number = 0;
  totalRows: number = 0;
  startRow: number = 0;
  endRow: number = 0;

  firmDetails: any;
  FIRMNotices: any;
  paginatedNotices: any = [];
  firmId: number = 0;
  showPopup: boolean = false;
  isLoading: boolean = false;
  filteredNotices: any;
  notices: any;
  noticeTypes: any[] = [];
  noticeNames: any[] = [];
  noticeIssuedBy: any[] = [];
  // Form search fields with defaults
  TypeOfNotice: string = '';

  objectOpType = constants.ObjectOpType.List;


  NoticeID: number | null = null;
  CSVFirmIDs: string | null = null;
  CSVFirmTypeIDs: string | null = null;
  CSVFirmStatusTypeIDs: string | null = null;
  NoticeTypeID: number | null = null;
  NoticeTemplateID: number | null = null;
  NoticeIssuerID: number | null = null;
  InternalReferenceNumber: string | null = null;
  CMSReferenceNumber: string | null = null;
  IssuersReferenceNumber: string | null = null;
  NoticeIssuedDateFrom: string | null = null;
  NoticeIssuedDateTo: string | null = null;
  NoticeSentDateFrom: string | null = null;
  NoticeSentDateTo: string | null = null;
  ResponseDueDateFrom: string | null = null;
  ResponseDueDateTo: string | null = null;
  AppRptExecID: number | null = null;
  AppRptID: number | null = null;
  AppRptItemGrpID: number | null = null;
  AppRptExecName: string | null = null;
  AppReportHeaderName: string | null = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private noticeService: NoticeService,
    private firmDetailsService: FirmDetailsService,
    public dateUtilService: DateUtilService,
    private securityService: SecurityService
  ) {

  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.firmId = +params['id'];
      this.loadNotices();
      this.getNoticeTypes();
      this.loadFirmDetails(this.firmId);
      this.getNoticeIssuedBy();
    })
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['firms'] && changes['firms'].currentValue) {
      this.updatePagination(); // Update pagination whenever firms input changes
    }
  }


  loadFirmDetails(firmId: number) {
    this.firmDetailsService.loadFirmDetails(firmId).subscribe(
      data => {
        this.firmDetails = data.firmDetails;
      },
      error => {
        console.error(error);
      }
    );

  }

  togglePopup(): void {
    this.showPopup = !this.showPopup;
  }

  loadNotices() {
    this.noticeService.getNoticesList(this.firmId).subscribe(
      data => {
        this.FIRMNotices = data.response;
        this.filteredNotices = data.response;
        this.totalRows = this.filteredNotices.length;
        this.totalPages = Math.ceil(this.totalRows / this.pageSize);
        this.updatePagination();
        this.isLoading = false;
      },
      error => {
        console.error('Error fetching FIRMNotices ', error);
      }
    );
  }


  getNoticeTypes() {
    this.noticeService.getNoticeTypes().subscribe(
      data => {
        this.noticeTypes = data.response;
        console.log('getNoticeTypes', this.noticeTypes);
      },
      error => {
        console.error('Error fetching noticeTypes ', error);
      }
    );
  }

  getNoticeNames(TypeOfNotice) {
    this.noticeService.getNoticeNames(TypeOfNotice).subscribe(
      data => {
        this.noticeNames = data.response;
        console.log('noticeNames', this.noticeNames);
      },
      error => {
        console.error('Error fetching noticeNames ', error);
      }
    );
  }


  getNoticeIssuedBy() {
    this.securityService.getobjecttypetableEdit(this.userId, constants.NoticeIssuers, this.objectOpType)
      .subscribe(data => {
        this.noticeIssuedBy = data.response;
        console.log("General Regulators fetched:", this.noticeIssuedBy);
      }, error => {
        console.error("Error fetching Regulators:", error);
      });
  }

  onNoticeTypeChange() {
    if (this.NoticeTypeID) {
      this.getNoticeNames(this.NoticeTypeID);
    }
  }

  resetFilters(): void {
    this.setDefaultFilters();
    // this.filteredNotices = [...this.FIRMNotices];
    this.updatePagination();
  }
  // Set default filter values
  setDefaultFilters(): void {
      this.firmId = this.firmId,
      this.NoticeID = null,
      this.CSVFirmIDs = null,
      this.CSVFirmTypeIDs = null,
      this.CSVFirmStatusTypeIDs = null,
      this.NoticeTypeID = null,
      this.NoticeTemplateID = null,
      this.NoticeIssuerID = null,
      this.InternalReferenceNumber = null,
      this.CMSReferenceNumber = null,
      this.IssuersReferenceNumber = null,
      this.NoticeIssuedDateFrom = null,
      this.NoticeIssuedDateTo = null,
      this.NoticeSentDateFrom = null,
      this.NoticeSentDateTo = null,
      this.ResponseDueDateFrom = null,
      this.ResponseDueDateTo = null,
      this.AppRptExecID = null,
      this.AppRptID = null,
      this.AppRptItemGrpID = null,
      this.AppRptExecName = null,
      this.AppReportHeaderName = null
  }

  searchNotices(): void {
    const params = {
      firmID: this.firmId,
      NoticeID: this.NoticeID,
      CSVFirmIDs: this.CSVFirmIDs,
      CSVFirmTypeIDs: this.CSVFirmTypeIDs,
      CSVFirmStatusTypeIDs: this.CSVFirmStatusTypeIDs,
      NoticeTypeID: this.NoticeTypeID,
      NoticeTemplateID: this.NoticeTemplateID,
      NoticeIssuerID: this.NoticeIssuerID,
      InternalReferenceNumber: this.InternalReferenceNumber,
      CMSReferenceNumber: this.CMSReferenceNumber,
      IssuersReferenceNumber: this.IssuersReferenceNumber,
      NoticeIssuedDateFrom: this.NoticeIssuedDateFrom ? this.dateUtilService.formatDateToCustomFormat(this.NoticeIssuedDateFrom) : null,
      NoticeIssuedDateTo: this.NoticeIssuedDateTo ? this.dateUtilService.formatDateToCustomFormat(this.NoticeIssuedDateTo) : null,
      NoticeSentDateFrom: this.NoticeSentDateFrom ? this.dateUtilService.formatDateToCustomFormat(this.NoticeSentDateFrom) : null,
      NoticeSentDateTo: this.NoticeSentDateTo ? this.dateUtilService.formatDateToCustomFormat(this.NoticeSentDateTo) : null,
      ResponseDueDateFrom: this.ResponseDueDateFrom ? this.dateUtilService.formatDateToCustomFormat(this.ResponseDueDateFrom) : null,
      ResponseDueDateTo: this.ResponseDueDateTo ? this.dateUtilService.formatDateToCustomFormat(this.ResponseDueDateTo) : null,
      AppRptExecID: this.AppRptExecID,
      AppRptID: this.AppRptID,
      AppRptItemGrpID: this.AppRptItemGrpID,
      AppRptExecName: this.AppRptExecName,
      AppReportHeaderName: this.AppReportHeaderName
    };

    this.noticeService.getNoticesList(params).subscribe(
      data => {
        this.filteredNotices = data.response;
        this.togglePopup();
      },
      error => {
        this.filteredNotices = [];
        this.togglePopup();
        console.error('Error fetching filtered notices ', error);
      }
    );
  }


  // Update pagination based on current page and page size
  updatePagination(): void {
    if (this.FIRMNotices && this.FIRMNotices.length > 0) {
      this.totalRows = this.FIRMNotices.length;
      this.totalPages = Math.ceil(this.totalRows / this.pageSize);
      const startIndex = (this.currentPage - 1) * this.pageSize;
      const endIndex = Math.min(startIndex + this.pageSize, this.totalRows);
      this.filteredNotices = this.FIRMNotices.slice(startIndex, endIndex); // Paginated data
      this.startRow = startIndex + 1;
      this.endRow = endIndex;
    } else {
      this.filteredNotices = []; // Reset paginated firms if no data
    }
  }

  // Navigate to the previous page
  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  // Navigate to the next page
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }
}
