import { Component, ElementRef, OnInit, QueryList, SimpleChanges, ViewChild, ViewChildren } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FirmDetailsService } from 'src/app/firms/firmsDetails.service';
import { NoticeService } from 'src/app/ngServices/notice.service';
import { SecurityService } from 'src/app/ngServices/security.service';
import { DateUtilService } from 'src/app/shared/date-util/date-util.service';
import * as constants from 'src/app/app-constants';
import { PaginationComponent } from 'src/app/shared/pagination/pagination.component';
import { FlatpickrService } from 'src/app/shared/flatpickr/flatpickr.service';

@Component({
  selector: 'app-notices',
  templateUrl: './notices.component.html',
  styleUrls: ['./notices.component.scss', '../supervision.scss']
})
export class NoticesComponent implements OnInit {
  @ViewChild(PaginationComponent) paginationComponent!: PaginationComponent;
  @ViewChildren('dateInputs') dateInputs!: QueryList<ElementRef<HTMLInputElement>>;

  userId = 30;

  pageSize: number = 10; // Define pageSize here
  filteredNotices: any[] = []; // Full list of notices
  paginatedItems: any[] = []; 

  selectedNotice: any = null;
  showViewPopup: boolean = false;

  firmDetails: any;
  FIRMNotices: any;
  paginatedNotices: any = [];
  firmId: number = 0;
  showPopup: boolean = false;
  isLoading: boolean = false;
  notices: any;
  noticeTypes: any[] = [];
  noticeNames: any[] = [];
  noticeIssuedBy: any[] = [];
  // Form search fields with defaults
  TypeOfNotice: string = '';


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
    private securityService: SecurityService,
    private flatpickrService: FlatpickrService
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

  ngAfterViewInit() {
    this.dateInputs.changes.subscribe(() => {
      this.flatpickrService.initializeFlatpickr(this.dateInputs.toArray());
    });
    this.flatpickrService.initializeFlatpickr(this.dateInputs.toArray());
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

  loadNotices(): void {
    const params = {
      firmID: this.firmId
    }
    this.noticeService.getNoticesList(params).subscribe(data => {
      this.filteredNotices = data.response; // Full data
      this.applySearchAndPagination(); // Initialize pagination
    });
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

    this.noticeService.getNoticesList(params).subscribe(data => {
      this.filteredNotices = data.response; // Filtered data
      this.applySearchAndPagination();
      this.togglePopup();
    },
      error => {
        this.filteredNotices = [];
        this.togglePopup();
        console.error('Error fetching filtered notices ', error);
      }
    );
  }

  applySearchAndPagination(): void {
    this.paginatedItems = this.filteredNotices.slice(0, this.pageSize); // First page
  }

  updatePaginatedItems(paginatedItems: any[]): void {
    this.paginatedItems = paginatedItems; // Update current page items
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
    this.securityService.getObjectTypeTable(this.userId, constants.NoticeIssuers, constants.ObjectOpType.List)
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
    this.loadNotices();
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

  openNoticeViewPopup(notice: any, firmDetails: any): void {
    this.selectedNotice = notice;
    this.showViewPopup = true;
  }

  closeViewPopup(): void {
    this.showViewPopup = false;
  }


}
