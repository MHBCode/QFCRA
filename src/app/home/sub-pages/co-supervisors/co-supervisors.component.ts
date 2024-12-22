import { Component, ElementRef, OnInit, QueryList, ViewChildren } from '@angular/core';
import { FirmService } from 'src/app/ngServices/firm.service';
import * as constants from 'src/app/app-constants';
import { FirmDetailsService } from 'src/app/firms/firmsDetails.service';
import { SupervisionService } from 'src/app/supervision/supervision.service';
import { DateUtilService } from 'src/app/shared/date-util/date-util.service';
import { FlatpickrService } from 'src/app/shared/flatpickr/flatpickr.service';
import { firstValueFrom, map, Observable } from 'rxjs';

@Component({
  selector: 'app-co-supervisors',
  templateUrl: './co-supervisors.component.html',
  styleUrls: ['./co-supervisors.component.scss']
})

export class CoSupervisorsComponent implements OnInit {

  @ViewChildren('dateInputs') dateInputs!: QueryList<ElementRef<HTMLInputElement>>;

  isLoading: boolean = false;
  userId: number = 10044;

  firmID: string = '0';
  roleID: string = '0';
  UserID: string = '0';
  history: boolean = false;
  firmIdFlag: string;
  reasonID: number = 0;
  replaceUserID: number = 0;
  newDateFrom: string = null;
  newUserID: string = '0';
  newRoleID: string = '0';
  newReasonID: string = '0';

  isSearchClicked: boolean = false;

  allfirms: any[] = [];
  allFunctionRoles: any = [];
  allCoSupervisors: any = [];
  allReasons: any = [];
  firmUserSearchResults: any = [];
  firmUserSearchResultsHistory: any = [];
  assignedLevelUsers: any = [];
  filteredAssignedLevelUsers: any = [];
  filteredRoleNames: any = [];

  errorMessages: { [key: string]: string } = {};

  showRAPersonalAssigned: boolean = false;
  isEditSectionVisible: boolean = false;
  callEndAssignment: boolean = false;
  addNewSectionVisibility: boolean = false;
  saveFlag: number;

  selectedRecord: any = {};

  now = new Date();
  currentDate = this.now.toISOString();

  constructor(
    private firmService: FirmService,
    private supervisionService: SupervisionService,
    private dateUtilService: DateUtilService,
    private flatpickrService: FlatpickrService,
    private firmDetailsService: FirmDetailsService
  ) { }

  ngOnInit(): void {
    this.getAllFirms();
    this.getFunctionRoles();
    this.getCOSupervisors();
    this.getReasons();
    this.getAssignLevelUsers();
  }

  ngAfterViewInit() {
    this.dateInputs.changes.subscribe(() => {
      this.flatpickrService.initializeFlatpickr(this.dateInputs.toArray());
    });
    this.flatpickrService.initializeFlatpickr(this.dateInputs.toArray());
  }

  getAllFirms(): void {
    this.firmService.getAllFirms().subscribe(
      (data) => {
        this.allfirms = data.response;
        this.allfirms.sort((a, b) => a.FirmName.localeCompare(b.FirmName));
      },
      (error) => {
        console.error('Error fetching firms:', error);
      }
    )
  }

  getFunctionRoles() {
    this.supervisionService.getFunctionRoles(this.userId, constants.ObjectOpType.Create).subscribe(
      functionRole => {
        this.allFunctionRoles = functionRole;
      },
      error => {
        console.error('Error fetching Function/Roles:', error);
      }
    );
  }

  getCOSupervisors() {
    this.supervisionService.getCoSupervisorsUsers(this.userId, constants.ObjectOpType.Create).subscribe(
      cosupervisor => {
        this.allCoSupervisors = cosupervisor;
        this.allCoSupervisors.sort((a, b) => a.UserName.localeCompare(b.UserName));
      },
      error => {
        console.error('Error fetching Co Supervisors:', error);
      }
    );
  }

  filterUsersByFunctionRole() {
    if (this.newRoleID && this.newRoleID !== '0') {
      this.filteredRoleNames = this.assignedLevelUsers.filter(u => u.FirmUserAssnTypeID === parseInt(this.newRoleID));
    } else {
      this.filteredRoleNames = [];
    }
  }


  getReasons() {
    this.supervisionService.getReasons(this.userId, constants.ObjectOpType.Create).subscribe(
      reason => {
        this.allReasons = reason;
      },
      error => {
        console.error('Error fetching Reasons:', error);
      }
    );
  }

  getAssignLevelUsers() {
    this.firmService.getAssignLevelUsers().subscribe(
      (data) => {
        this.assignedLevelUsers = data.response
        this.filteredAssignedLevelUsers = this.removeDuplicates(data.response);
      },
      (error) => {
        console.error(error);
      }
    );
  }

  removeDuplicates(users: any[]): any[] {
    return users.filter((user, index, self) =>
      index === self.findIndex((u) => u.UserID === user.UserID)
    );
  }

  prepareFilterData() {
    return {
      FirmID: this.firmID !== "0" ? this.allfirms.find(firm => firm.FirmID === parseInt(this.firmID))?.FirmID : 0,
      Role: this.roleID !== "0" ? this.allFunctionRoles.find(role => role.FirmUserAssnTypeID === parseInt(this.roleID))?.FirmUserAssnTypeID : 0,
      UserID: this.UserID !== "0" ? this.allCoSupervisors.find(user => user.UserID === parseInt(this.UserID))?.UserID : 0,
    };
  }

  searchFirmUsers() {
    this.isLoading = true;
    this.isEditSectionVisible = false;
    const filterData = this.prepareFilterData();
    const firmId = filterData.FirmID || 0;
    const assnLevelId = filterData.Role || 0;
    const userId = filterData.UserID || 0;
    const displayHistory = this.history;
    const loginUserId = this.userId;

    this.firmIdFlag = filterData.FirmID;

    if (parseInt(firmId) !== 0) {
      this.isSearchClicked = true;
    } else {
      this.isSearchClicked = false;
    }

    this.firmService.getFirmUserSearch(firmId, assnLevelId, userId, displayHistory, loginUserId).subscribe({
      next: (response) => {

        this.firmUserSearchResults = response?.response || [];

        this.firmUserSearchResultsHistory = this.firmUserSearchResults.filter(data => data.ActiveUser === 0);

        this.showRAPersonalAssigned = true;
        this.firmUserSearchResults.forEach(data => {
          if (data.FirmUserAssnDateFrom) {
            data.FirmUserAssnDateFrom = this.dateUtilService.formatDateToCustomFormat(data.FirmUserAssnDateFrom);
          }
          if (data.FirmUserAssnDateTo) {
            data.FirmUserAssnDateTo = this.dateUtilService.formatDateToCustomFormat(data.FirmUserAssnDateTo);
          }
        });
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.firmUserSearchResults = [];
        this.firmUserSearchResultsHistory = [];
        this.showRAPersonalAssigned = true;

        if (userId !== 0) {
          this.loadErrorMessages('NoActiveAssignments', constants.FirmUserMessages.User_NoActiveAssignment);
          delete this.errorMessages['NoSupervisors'];
        } else {
          this.loadErrorMessages('NoSupervisors', constants.FirmUserMessages.Firm_NoUser);
          delete this.errorMessages['NoActiveAssignments'];
        }

        console.error('Error fetching firm user data:', error);
      },
    });
  }

  addUserAssign() {
    this.addNewSectionVisibility = true;
    this.isEditSectionVisible = false;
  }

  insertNewUser() {
    let hasError = false;

    if (this.supervisionService.isNullOrEmpty(this.newDateFrom)) {
      this.loadErrorMessages('newDateFrom', constants.FirmUserMessages.Date_Exception);
      hasError = true;
    } else {
      delete this.errorMessages['newDateFrom'];
    }

    if (parseInt(this.newUserID) === 0) {
      this.loadErrorMessages('newUserID', constants.FirmUserMessages.UserName_Exception);
      hasError = true;
    } else {
      delete this.errorMessages['newUserID'];
    }

    if (parseInt(this.newRoleID) === 0) {
      this.loadErrorMessages('newRoleID', constants.FirmUserMessages.FunctionRole_Exception);
      hasError = true;
    } else {
      delete this.errorMessages['newRoleID'];

      // Handle the asynchronous role existence check
      this.isRoleExist().subscribe((roleExists: boolean) => {
        if (roleExists) {
          this.loadErrorMessages('roleExist', constants.FirmUserMessages.FunctionRole_Exist);
          hasError = true;
        } else {
          delete this.errorMessages['roleExist'];
        }

        // Proceed with the remaining logic only after checking for role existence
        if (hasError) {
          this.supervisionService.showErrorAlert(constants.FirmActivitiesEnum.ENTER_ALL_REQUIREDFIELDS, 'error');
          this.isLoading = false;
          return;
        }

        const insertNewUserObj = this.prepareNewUserObj(this.userId);

        this.firmService.saveUpdateFirmUser(insertNewUserObj).subscribe(response => {
          console.log(response);
          this.addNewSectionVisibility = false;
          this.firmDetailsService.showSaveSuccessAlert(constants.FirmUserMessages.FirmUser_Added);
          this.searchFirmUsers();
        }, error => {
          console.error(error);
        });
      });
      return; // Prevent further execution until `isRoleExist` completes
    }

    if (hasError) {
      this.supervisionService.showErrorAlert(constants.FirmActivitiesEnum.ENTER_ALL_REQUIREDFIELDS, 'error');
      this.isLoading = false;
      return;
    }
  }


  cancelNewRecord() {
    this.addNewSectionVisibility = false
    this.errorMessages = {};
    this.newDateFrom = null;
    this.newUserID = '0';
    this.newRoleID = '0';
    this.newReasonID = '0';
  }


  isRoleExist(): Observable<boolean> {
    return this.firmService.isRoleExist(this.firmID, this.newRoleID).pipe(
      map(response => response.response)
    );
  }

  prepareNewUserObj(userId: number) {
    return {
      firmUsersID: 0,
      firmId: this.firmID,
      userId: this.newUserID,
      firmUserassnLevelId: this.newRoleID,
      firmUserAssnDateFrom: this.dateUtilService.convertDateToYYYYMMDD(this.newDateFrom),
      firmUserAssnDateTo: null,
      firmUserAssnReasonTypeID: this.newReasonID,
      createdBy: userId
    }
  }



  onEditRecord(record: any): void {
    this.isEditSectionVisible = true;
    this.addNewSectionVisibility = false;

    this.selectedRecord = {};
    this.selectedRecord = { ...record }; // Deep copy
    this.reasonID = 0;
    this.replaceUserID = 0;
  }

  async validateIndividualEdit(): Promise<boolean> {

    let hasError: boolean = false;

    if (this.replaceUserID == 0) {
      this.loadErrorMessages('replaceUser', constants.FirmUserMessages.UserName_Exception);
      hasError = true;
    } else {
      delete this.errorMessages['replaceUser'];
    }

    if (this.supervisionService.isNullOrEmpty(this.selectedRecord.FirmUserAssnDateFrom)) {
      this.loadErrorMessages('DateFrom', constants.FirmUserMessages.Date_Exception);
      hasError = true;
    } else {
      delete this.errorMessages['DateFrom'];
    }

    return hasError;
  }

  async updateRecord() {
    this.isLoading = true;

    const isValid = await this.validateIndividualEdit();

    if (isValid) {
      this.supervisionService.showErrorAlert(constants.FirmActivitiesEnum.ENTER_ALL_REQUIREDFIELDS, 'error');
      this.isLoading = false;
      return;
    }

    const userUpdateObj_1 = this.prepareUpdateUserObj1(this.userId);
    const userUpdateObj_2 = this.prepareUpdateUserObj2(this.userId);

    try {
      const response1 = await this.firmService.saveUpdateFirmUser(userUpdateObj_1).toPromise();
      console.log('First update response:', response1);

      const response2 = await this.firmService.saveUpdateFirmUser(userUpdateObj_2).toPromise();
      console.log('Second update response:', response2);

      this.isEditSectionVisible = false;
      this.firmDetailsService.showSaveSuccessAlert(constants.FirmUserMessages.User_Updated);
      this.searchFirmUsers();
    } catch (error) {
      console.error('Error during updates:', error);
    }
  }


  prepareUpdateUserObj1(userId: number) {
    const originalDateString = this.dateUtilService.convertDateToYYYYMMDD(this.selectedRecord.FirmUserAssnDateFrom);
    const originalDate = new Date(originalDateString);
    originalDate.setDate(originalDate.getDate() - 1);
    const updatedDateString = this.dateUtilService.convertDateToYYYYMMDD(originalDate);
    return {
      firmUsersID: this.selectedRecord.FirmUsersID,
      firmId: this.selectedRecord.FirmID,
      userId: this.replaceUserID,
      firmUserassnLevelId: this.selectedRecord.FirmUserAssnLevelID,
      firmUserAssnDateFrom: null,
      firmUserAssnDateTo: updatedDateString,
      firmUserAssnReasonTypeID: 0,
      createdBy: userId
    }

  }

  prepareUpdateUserObj2(userId: number) {
    return {
      firmUsersID: 0,
      firmId: this.selectedRecord.FirmID,
      userId: this.replaceUserID,
      firmUserassnLevelId: this.selectedRecord.FirmUserAssnLevelID,
      firmUserAssnDateFrom: this.dateUtilService.convertDateToYYYYMMDD(this.selectedRecord.FirmUserAssnDateFrom),
      firmUserAssnDateTo: null,
      firmUserAssnReasonTypeID: this.reasonID,
      createdBy: userId
    }

  }

  getEndAssignment(record: any) {
    this.callEndAssignment = true;
    this.isEditSectionVisible = false;
    this.saveFlag = constants.TEXT_ONE;

    this.selectedRecord = {};
    this.selectedRecord = { ...record };

    this.selectedRecord.FirmUserAssnDateTo = this.dateUtilService.formatDateToCustomFormat(this.currentDate);

    setTimeout(() => {
      const popupWrapper = document.querySelector('.endAssignmentPopup') as HTMLElement;
      if (popupWrapper) {
        popupWrapper.style.display = 'flex';
      } else {
        console.error('Element with class .endAssignmentPopup not found');
      }
    }, 0)
  }

  closeEndAssignmentPopup() {
    this.callEndAssignment = false;
    const popupWrapper = document.querySelector('.endAssignmentPopup') as HTMLElement;
    if (popupWrapper) {
      popupWrapper.style.display = 'none';
    } else {
      console.error('Element with class .endAssignmentPopup not found');
    }
  }

  saveRecord() {

    let hasError = false;

    if (this.saveFlag === constants.TEXT_ONE) {
      if (this.dateUtilService.convertDateToYYYYMMDD(this.selectedRecord.FirmUserAssnDateFrom) > this.dateUtilService.convertDateToYYYYMMDD(this.selectedRecord.FirmUserAssnDateTo)) {
        this.loadErrorMessages('dateFromGreaterThanDateTo', 10042);
        hasError = true;
      } else {
        delete this.errorMessages['dateFromGreaterThanDateTo'];
      }
    }

    if (this.supervisionService.isNullOrEmpty(this.selectedRecord.FirmUserAssnDateTo)) {
      this.loadErrorMessages('dateTo', 3225);
      hasError = true;
    } else {
      delete this.errorMessages['dateTo']
    }

    if (hasError) {
      return;
    }

    let firmUsersID;

    if (this.saveFlag === constants.TEXT_ONE) {
      firmUsersID = this.selectedRecord.FirmUsersID
    } else if (this.saveFlag === constants.TEXT_TWO) {

    }

    const deletefirmUserObj = this.prepareDelFirmUserObj(firmUsersID, this.userId);

    if (!this.supervisionService.isNullOrEmpty(firmUsersID)) {
      this.firmService.deleteFirmUser(deletefirmUserObj).subscribe(response => {
        this.callEndAssignment = false;
        this.searchFirmUsers();
        this.firmDetailsService.showSaveSuccessAlert(constants.FirmUserMessages.FirmUser_Updated);
        console.log(response);
      }, error => {
        console.error(error);
      })
    }

  }

  prepareDelFirmUserObj(firmUsersID: string, userId: number) {
    return {
      firmUsersID: firmUsersID.toString(),
      dateTo: this.selectedRecord.FirmUserAssnDateTo,
      updatedBy: userId,
    }
  }


  loadErrorMessages(fieldName: string, msgKey: number, placeholderValue?: string) {
    this.supervisionService.getErrorMessages(fieldName, msgKey, null, null, placeholderValue).subscribe(
      () => {
        this.errorMessages[fieldName] = this.supervisionService.errorMessages[fieldName];
        console.log(`Error message for ${fieldName} loaded successfully`);
      },
      error => {
        console.error(`Error loading error message for ${fieldName}:`, error);
      }
    );
  }

}
