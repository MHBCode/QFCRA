import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FrimsObject, ObjectOpType, ResponseTypes } from 'src/app/app-constants';
import { FirmDetailsService } from 'src/app/firms/firmsDetails.service';
import { NoticeService } from 'src/app/ngServices/notice.service';
import { SupervisionService } from '../../supervision.service';
import * as constants from 'src/app/app-constants';
import { ObjectwfService } from 'src/app/ngServices/objectwf.service';
import { LogformService } from 'src/app/ngServices/logform.service';
import { SanitizerService } from 'src/app/shared/sanitizer-string/sanitizer.service';
import { SafeHtml } from '@angular/platform-browser';
import { FirmService } from 'src/app/ngServices/firm.service';
import { SecurityService } from 'src/app/ngServices/security.service';
import { ContactService } from 'src/app/ngServices/contact.service';

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
  isNoticesAndResponsePage: boolean = false;
  selectedNotice: any = null;
  isEditable: boolean = false;
  noticeDetailsInfo: any;
  questionnaireDetails: any;
  conditionDetails: any;
  noticeDetails: any;
  filteredConditions: any;
  escalationConditions: any;
  explanationConditions: any;
  userId: number = 30;
  isLoading: boolean = false;
  Page = FrimsObject;
  responseTypes = ResponseTypes;

  selectedFirmTypeIDs: number[] = [];
  selectedControlledFunctionIDs: number[] = [];
  selectedContactFunctionTypeIDs: number[] = [];
  relatedFirmsIDs: number[] = [];
  selectContactTypeIDs: number[] = [];
  allfirms: any = [];
  allControlled: any = [];
  allContactType: any = [];
  ContactFunctionTypeList: any = [];

  // document
  attachmentbyFirm: any = [];
  attachmentNotice: any = [];
  fileLocation: any;

  publishOnWebsite: boolean = false;
  allFirmTypes: any = [];

  // popups
  showCondtionsPopup: boolean = false;
  showEmailPopup: boolean = false;

  // Security
  hideEditBtn: boolean = false;
  hideSaveBtn: boolean = false;
  hideCancelBtn: boolean = false;
  hideCreateBtn: boolean = false;
  hideReviseBtn: boolean = false;
  hideDeleteBtn: boolean = false;
  hideExportBtn: boolean = false;

  constructor(
    private noticeService: NoticeService,
    private firmDetailsService: FirmDetailsService,
    private firmService: FirmService,
    private supervisionService: SupervisionService,
    private objectWF: ObjectwfService,
    private logForm: LogformService,
    private contactService: ContactService,
    private securityService: SecurityService,
    private sanitizerService: SanitizerService,
  ) {

  }

  ngOnInit(): void {
    this.loadAdditionalDocument();
    this.loadAdditionalDocumentByFirm();
    this.applySecurityOnPage(this.Page.Notices);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['notice'] && changes['notice'].currentValue && this.firmId) {
      this.getFirmsNoticesDetails();
      this.isNoticesAndResponsePage = false;
    }
    if (changes['notice'] && changes['notice'].currentValue && !this.firmId) {
      this.loadAllFirms();
      this.getAllControlled();
      this.getContactFunctionType();
      this.getAllContactTypes();
      this.getNoticeDetails();
      this.getFirmTypes();
      this.isNoticesAndResponsePage = true;
    }
  }

  applySecurityOnPage(objectId: FrimsObject) {
    this.isLoading = true;
    const currentOpType = ObjectOpType.List;

    this.firmDetailsService.applyAppSecurity(this.userId, objectId, currentOpType).then(() => {
      this.registerMasterPageControlEvents();
    });
  }

  registerMasterPageControlEvents() {
    if (!this.supervisionService.isNullOrEmpty(this.notice.NoticeTypeID) && this.notice.NoticeTypeID === constants.TEXT_ONE) {
      this.hideExportBtn = false;
    }
    this.isLoading = false;
  }

  hideActionButton() {
    this.hideEditBtn = true;
    this.hideSaveBtn = true;
    this.hideCancelBtn = true;
    this.hideCreateBtn = true;
    this.hideDeleteBtn = true;
    this.hideReviseBtn = true;
  }

  editNotice(notice: any) {
    this.selectedNotice = { ...notice }; // Clone the object to avoid modifying directly
  }

  deleteNotice(notice: any) {
  }

  saveReport() {

  }


  getFirmsNoticesDetails() {
    if (this.firmId && this.notice.FirmNoticeID) {
      this.noticeService.getFirmNoticeDetails(this.firmId, this.notice.FirmNoticeID).subscribe(
        data => {
          this.noticeDetails = data.response;
          this.questionnaireDetails = this.noticeDetails.lstFirmNoticeResponseItems;
          console.log('questionnaireDetails', this.questionnaireDetails);
          // this.conditionDetails = (this.noticeDetailsInfo.find(item => item.key === "ResultSet3")?.value);
        },
        error => {
          console.error('Error fetching noticeTypes ', error);
        }
      );
    }
  }

  loadAllFirms(): void {
    this.firmService.getAllFirms().subscribe(
      (data) => {
        this.allfirms = data.response;
        console.log('this.allfirms', this.allfirms);
      },
      (error) => {
        console.error('Error fetching firms:', error);
      }
    )
  }


  getNoticeDetails() {
    if (this.notice.NoticeID) {
      this.noticeService.getNoticeDetails(this.notice.NoticeID).subscribe(
        data => {
          this.noticeDetailsInfo = data.response;
          this.noticeDetails = this.noticeDetailsInfo;

          this.selectedFirmTypeIDs = this.noticeDetails.recipientCriteriaCSVFirmTypeIDs
            .split(',')
            .map((id) => parseInt(id, 10));

          this.relatedFirmsIDs = this.noticeDetails.recipientCriteriaCSVFirmIDs.split(',')
            .map((id) => parseInt(id, 10));

          this.selectedControlledFunctionIDs = this.noticeDetails.recipientCriteriaCSVControlledFunctionTypeIDs
            .split(',')
            .map((id) => parseInt(id, 10));

          this.selectedContactFunctionTypeIDs = this.noticeDetails.recipientCriteriaCSVDNFBPFunctionTypeIDs
            .split(',')
            .map((id) => parseInt(id, 10));


          this.selectContactTypeIDs = this.noticeDetails.recipientCriteriaCSVContactTypeIDs
            .split(',')
            .map((id) => parseInt(id, 10));

          console.log('relatedFirmsIDs', this.relatedFirmsIDs);

          this.questionnaireDetails = this.noticeDetailsInfo.objNoticeQuestionnaire;
          console.log('noticeDetailsInfo', this.noticeDetailsInfo)
        },
        error => {
          console.error('Error fetching noticeTypes ', error);
        }
      );
    }
  }

  isFirmTypeSelected(firmTypeID: number): boolean {
    return this.selectedFirmTypeIDs.includes(firmTypeID);
  }

  isControlledFunctionSelected(controlledFonctionID: number): boolean {
    return this.selectedControlledFunctionIDs.includes(controlledFonctionID);
  }

  isContactTypeSelected(contactTypeID: number): boolean {
    return this.selectContactTypeIDs.includes(contactTypeID);
  }

  isContactFunctionTypeSelected(contactFunctionTypeID: number): boolean {
    return this.selectedContactFunctionTypeIDs.includes(contactFunctionTypeID);
  }
  getRelatedFirms(firms: any[], ids: number[]): any[] {
    return firms.filter(firm => ids.includes(firm.FirmID));
  }

  getFirmTypes() {
    this.supervisionService.populateFirmTypes(this.userId, constants.ObjectOpType.Create).subscribe(
      firmTypes => {
        this.allFirmTypes = firmTypes;
        console.log('this.allFirmTypes', this.allFirmTypes);
      },
      error => {
        console.error('Error fetching Firm Types: ', error);
      }
    );
  }


  getAllControlled(): void {
    this.securityService.getObjectTypeTable(this.userId, constants.controlledFunctionTypes, constants.ObjectOpType.Create)
      .subscribe(data => {
        this.allControlled = data.response;
        console.log("allControlled", this.allControlled)
      }, error => {
        console.error("Error fetching Controllers", error);
      });
  }


  getAllContactTypes(): void {
    this.securityService.getObjectTypeTable(this.userId, constants.contactTypes, constants.ObjectOpType.Create)
      .subscribe(data => {
        this.allContactType = data.response.filter(
          (contact) => contact.ContactTypeID !== 3 && contact.ContactTypeID !== 4
        );
      }, error => {
        console.error("Error fetching Controllers", error);
      });
  }

  getContactFunctionType() {
    this.contactService.getContactFunctionType().subscribe(data => {
      if (data.isSuccess) {
        this.ContactFunctionTypeList = data.response;
      }
    },
      error => {
        console.error('Error Fetching Contact Function Types', error);
      });
  }

  loadAdditionalDocumentByFirm() {
    this.objectWF.getDocument(this.Page.NoticesResponse, this.notice.FirmNoticeID, 1).pipe(
    ).subscribe(
      data => {
        this.attachmentbyFirm = data.response;
        this.logForm.constructDocUrl(this.attachmentbyFirm).subscribe(
          response => {
            if (response) {
              this.attachmentbyFirm = this.attachmentbyFirm.map((doc, index) => ({
                ...doc,
                fileLoc: response.response[index]?.fileLoc || ''
              }));
            }
          },
          error => {
            console.error('Error constructing document URL:', error);
          }
        );
      },
      error => {
        console.error('Error loading document:', error);
        this.attachmentbyFirm = [];

      }
    );
  }

  loadAdditionalDocument() {
    this.objectWF.getDocument(this.Page.Notices, this.notice.NoticeID, 1).pipe(
    ).subscribe(
      data => {
        this.attachmentNotice = data.response;
        this.logForm.constructDocUrl(this.attachmentNotice).subscribe(
          response => {
            if (response) {
              this.attachmentNotice = this.attachmentNotice.map((doc, index) => ({
                ...doc,
                fileLoc: response.response[index]?.fileLoc || ''
              }));
            }
          },
          error => {
            console.error('Error constructing document URL:', error);
          }
        );
      },
      error => {
        console.error('Error loading document:', error);
        this.attachmentNotice = [];

      }
    );
  }

  openEmailNotifPopup() {
    this.showEmailPopup = true;


    setTimeout(() => {
      const popupWrapper = document.querySelector('.emailPopup') as HTMLElement;
      if (popupWrapper) {
        popupWrapper.style.display = 'flex';
      } else {
        console.error('Element with class .emailPopup not found');
      }
    }, 0);
  }

  closeEmailNotifPopup() {
    this.showEmailPopup = false;
  }

  openConditionsPopup(noticeQuestionnaireItemID: number) {
    this.showCondtionsPopup = true;
    debugger;
    this.explanationConditions = this.questionnaireDetails
      .flatMap(detail => detail.lstResponseCriteria)
      .filter(condition => condition.evaluationReasonTypeID === 1);

    this.escalationConditions = this.questionnaireDetails
      .flatMap(detail => detail.lstEsclationCriteria)
      .filter(condition => condition.evaluationReasonTypeID === 2);

    setTimeout(() => {
      const popupWrapper = document.querySelector('.conditionsPopup') as HTMLElement;
      if (popupWrapper) {
        popupWrapper.style.display = 'flex';
      } else {
        console.error('Element with class .conditionsPopup not found');
      }
    }, 0);
  }

  closeCondtionsPopup() {
    this.showCondtionsPopup = false;
  }

  onClose(): void {
    this.closeNoticePopup.emit();
  }

  hasEscalationOrExplanationCriteria(noticeQuestionnaireItemID: number): boolean {
    return this.questionnaireDetails.some(
      condition => condition.noticeQuestionnaireItemID === noticeQuestionnaireItemID
    );
  }


  getSanitizedHtml(response: string | null | undefined): SafeHtml {
    return this.sanitizerService.sanitizeHtml(response || '');
  }


  shouldShowHr(response: string | null, responseTypeID: any, explanationRequired: any): boolean {
    if (!responseTypeID || explanationRequired === 0) {
      return false;
    }

    if (response?.trim() && !response.includes("No Response provided")) {
      return true;
    }

    return false;
  }


}
