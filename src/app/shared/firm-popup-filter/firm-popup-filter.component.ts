import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import * as constants from 'src/app/app-constants';
import { SecurityService } from 'src/app/ngServices/security.service';
import { FirmService } from 'src/app/ngServices/firm.service';

@Component({
  selector: 'app-firm-popup-filter',
  templateUrl: './firm-popup-filter.component.html',
  styleUrls: ['./firm-popup-filter.component.scss', '../popup.scss']
})
export class FirmPopupFilterComponent implements OnInit {
  filteredFirms: any = [];
  allFirmTypes: any = [];
  allFirmStatus: any = [];
  allAuthStatus: any = [];
  allLicenseStatus: any = [];
  allLegalStatus: any = [];
  allprudentialCategoryTypes: any = [];
  sectorTypes: any = [];
  supervisionCategory: any = [];
  authorisationCategoryTypes: any = [];
  userId: number = 30;
  FirmID: number = 0;
  LicenseStatusId: number = 0;
  AuthorisationStatusId: number = 0;
  OperationalStatusId: number = 0;
  LegalStatusId: number = 0;
  AuthorisationCaseOfficerId: number = 0;
  SupervisionCaseOfficerId: number = 0;
  PrudentialCategotyId: number = 0;
  QFCNumber: string | null = '';
  UserID: number = 30;
  RelevantPerson: number = 0;
  CSVAuthorisationStatus: string | null = null;
  CSVLicenseStatus: string | null = null;
  CSVLegalStatus: string | null = null;
  CSVPrudentialCategory: string | null = null;
  CSVSectorTypes: string | null = '';
  CSVFirmTypes: string | null = null;
  PilotFirm: boolean = false;
  startChar: string | null = null;
  LoginUserID: number = 0;
  CSVFirmStatus: string | null = null;
  CSVSupCategories: string | null = null;
  CSVAuthorisationCategories: string | null = null;
  ObjectID: number = 0;

  selectedSupervisionCategoryIds: number[] = [];
  selectedAuthorisationCategoryIds: number[] = [];

  @Output() closeFirmFilterPopup = new EventEmitter<void>();
  @Output() selectionChange = new EventEmitter<any[]>();
  
  selectedFirms: any[] = [];

  constructor(
    private securityService: SecurityService,
    private firmService: FirmService
  ) {

  }


  ngOnInit(): void {
    this.getObjectList('allFirmTypes', constants.firmTypes);
    this.getObjectList('allFirmStatus', constants.firmStatus);
    this.getObjectList('allAuthStatus', constants.authorisationStatus);
    this.getObjectList('allLicenseStatus', constants.qfcLicenseStatus);
    this.getObjectList('allLegalStatus', constants.legalStatusfilter);
    this.getObjectList('allprudentialCategoryTypes', constants.prudentialCategoryTypes);
    this.getObjectList('sectorTypes', constants.sectorTypes);
    this.getObjectList('supervisionCategory', constants.supervisionCategory);
    this.getObjectList('authorisationCategoryTypes', constants.authorisationCategoryTypes);
  }

  private getObjectList(type: string, constantType: string): void {
    this.securityService.getObjectTypeTable(this.userId, constantType, constants.ObjectOpType.List).subscribe(
      items => {
        this[type] = items.response;
      },
      error => {
        console.error(`Error fetching ${type}: `, error);
      }
    );
  }


  isAllFirmTypesSelected(): boolean {
    return this.getSelectedIds().length === this.allFirmTypes.length;
  }

  toggleAllFirmTypes(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.CSVFirmTypes = this.allFirmTypes.map(type => type.FirmTypeID).join(',');
    } else {
      this.CSVFirmTypes = '';
    }
  }

  private getSelectedIds(): number[] {
    return this.CSVFirmTypes
      ? this.CSVFirmTypes.split(',').map(id => parseInt(id, 10))
      : [];
  }

  toggleFirmType(id: number, event: Event): void {
    const selectedIds = this.getSelectedIds();
    const checked = (event.target as HTMLInputElement).checked;

    if (checked) {
      selectedIds.push(id);
    } else {
      const index = selectedIds.indexOf(id);
      if (index !== -1) {
        selectedIds.splice(index, 1);
      }
    }

    this.CSVFirmTypes = selectedIds.join(',');
  }

  isFirmTypeSelected(id: number): boolean {
    return this.getSelectedIds().includes(id);
  }

  // Firm Status Methods
  isAllFirmStatusSelected(): boolean {
    return this.getSelectedFirmStatusIds().length === this.allFirmStatus.length;
  }

  toggleAllFirmStatus(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.CSVFirmStatus = checked ? this.allFirmStatus.map(type => type.FirmStatusTypeID).join(',') : '';
  }

  isFirmStatusSelected(id: number): boolean {
    return this.getSelectedFirmStatusIds().includes(id);
  }

  toggleFirmStatus(id: number, event: Event): void {
    const selectedIds = this.getSelectedFirmStatusIds();
    const checked = (event.target as HTMLInputElement).checked;

    if (checked) {
      selectedIds.push(id);
    } else {
      const index = selectedIds.indexOf(id);
      if (index !== -1) {
        selectedIds.splice(index, 1);
      }
    }
    this.CSVFirmStatus = selectedIds.join(',');
  }

  getSelectedFirmStatusIds(): number[] {
    return this.CSVFirmStatus ? this.CSVFirmStatus.split(',').map(id => parseInt(id, 10)) : [];
  }

  // Authorisation Status Methods
  isAllAuthStatusSelected(): boolean {
    return this.getSelectedAuthStatusIds().length === this.allAuthStatus.length;
  }

  toggleAllAuthStatus(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.CSVAuthorisationStatus = checked ? this.allAuthStatus.map(type => type.FirmApplStatusTypeID).join(',') : '';
  }

  isAuthStatusSelected(id: number): boolean {
    return this.getSelectedAuthStatusIds().includes(id);
  }

  toggleAuthStatus(id: number, event: Event): void {
    const selectedIds = this.getSelectedAuthStatusIds();
    const checked = (event.target as HTMLInputElement).checked;

    if (checked) {
      selectedIds.push(id);
    } else {
      const index = selectedIds.indexOf(id);
      if (index !== -1) {
        selectedIds.splice(index, 1);
      }
    }
    this.CSVAuthorisationStatus = selectedIds.join(',');
  }

  getSelectedAuthStatusIds(): number[] {
    return this.CSVAuthorisationStatus ? this.CSVAuthorisationStatus.split(',').map(id => parseInt(id, 10)) : [];
  }

  // License Status Methods
  isAllLicenseStatusSelected(): boolean {
    return this.getSelectedLicenseStatusIds().length === this.allLicenseStatus.length;
  }

  toggleAllLicenseStatus(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.CSVLicenseStatus = checked ? this.allLicenseStatus.map(type => type.FirmApplStatusTypeID).join(',') : '';
  }

  isLicenseStatusSelected(id: number): boolean {
    return this.getSelectedLicenseStatusIds().includes(id);
  }

  toggleLicenseStatus(id: number, event: Event): void {
    const selectedIds = this.getSelectedLicenseStatusIds();
    const checked = (event.target as HTMLInputElement).checked;

    if (checked) {
      selectedIds.push(id);
    } else {
      const index = selectedIds.indexOf(id);
      if (index !== -1) {
        selectedIds.splice(index, 1);
      }
    }
    this.CSVLicenseStatus = selectedIds.join(',');
  }

  getSelectedLicenseStatusIds(): number[] {
    return this.CSVLicenseStatus ? this.CSVLicenseStatus.split(',').map(id => parseInt(id, 10)) : [];
  }

  // Legal Status Methods
  isAllLegalStatusSelected(): boolean {
    return this.getSelectedLegalStatusIds().length === this.allLegalStatus.length;
  }

  toggleAllLegalStatus(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.CSVLegalStatus = checked ? this.allLegalStatus.map(type => type.LegalStatusTypeID).join(',') : '';
  }

  isLegalStatusSelected(id: number): boolean {
    return this.getSelectedLegalStatusIds().includes(id);
  }

  toggleLegalStatus(id: number, event: Event): void {
    const selectedIds = this.getSelectedLegalStatusIds();
    const checked = (event.target as HTMLInputElement).checked;

    if (checked) {
      selectedIds.push(id);
    } else {
      const index = selectedIds.indexOf(id);
      if (index !== -1) {
        selectedIds.splice(index, 1);
      }
    }
    this.CSVLegalStatus = selectedIds.join(',');
  }

  getSelectedLegalStatusIds(): number[] {
    return this.CSVLegalStatus ? this.CSVLegalStatus.split(',').map(id => parseInt(id, 10)) : [];
  }

  // Prudential Category Methods
  isAllPrudentialCategorySelected(): boolean {
    return this.getSelectedPrudentialCategoryIds().length === this.allprudentialCategoryTypes.length;
  }

  toggleAllPrudentialCategory(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.CSVPrudentialCategory = checked ? this.allprudentialCategoryTypes.map(type => type.PrudentialCategoryTypeID).join(',') : '';
  }

  isPrudentialCategorySelected(id: number): boolean {
    return this.getSelectedPrudentialCategoryIds().includes(id);
  }

  togglePrudentialCategory(id: number, event: Event): void {
    const selectedIds = this.getSelectedPrudentialCategoryIds();
    const checked = (event.target as HTMLInputElement).checked;

    if (checked) {
      selectedIds.push(id);
    } else {
      const index = selectedIds.indexOf(id);
      if (index !== -1) {
        selectedIds.splice(index, 1);
      }
    }
    this.CSVPrudentialCategory = selectedIds.join(',');
  }

  getSelectedPrudentialCategoryIds(): number[] {
    return this.CSVPrudentialCategory ? this.CSVPrudentialCategory.split(',').map(id => parseInt(id, 10)) : [];
  }

  // Sectors Methods
  isAllSectorsSelected(): boolean {
    return this.getSelectedSectorsIds().length === this.sectorTypes.length;
  }

  toggleAllSectors(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.CSVSectorTypes = checked ? this.sectorTypes.map(type => type.SectorTypeID).join(',') : '';
  }

  isSectorSelected(id: number): boolean {
    return this.getSelectedSectorsIds().includes(id);
  }

  toggleSector(id: number, event: Event): void {
    const selectedIds = this.getSelectedSectorsIds();
    const checked = (event.target as HTMLInputElement).checked;

    if (checked) {
      selectedIds.push(id);
    } else {
      const index = selectedIds.indexOf(id);
      if (index !== -1) {
        selectedIds.splice(index, 1);
      }
    }
    this.CSVSectorTypes = selectedIds.join(',');
  }

  getSelectedSectorsIds(): number[] {
    return this.CSVSectorTypes ? this.CSVSectorTypes.split(',').map(id => parseInt(id, 10)) : [];
  }

  // Supervision Category Methods
  isAllSupervisionCategorySelected(): boolean {
    return this.getSelectedSupervisionCategoryIds().length === this.supervisionCategory.length;
  }

  toggleAllSupervisionCategory(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.selectedSupervisionCategoryIds = checked ? this.supervisionCategory.map(type => type.FirmRptClassificationTypeID) : [];
  }

  isSupervisionCategorySelected(id: number): boolean {
    return this.getSelectedSupervisionCategoryIds().includes(id);
  }

  toggleSupervisionCategory(id: number, event: Event): void {
    const selectedIds = this.getSelectedSupervisionCategoryIds();
    const checked = (event.target as HTMLInputElement).checked;

    if (checked) {
      selectedIds.push(id);
    } else {
      const index = selectedIds.indexOf(id);
      if (index !== -1) {
        selectedIds.splice(index, 1);
      }
    }
    this.selectedSupervisionCategoryIds = selectedIds;
  }

  getSelectedSupervisionCategoryIds(): number[] {
    return this.selectedSupervisionCategoryIds || [];
  }

  isAllAuthorisationCategorySelected(): boolean {
    return this.getSelectedAuthorisationCategoryIds().length === this.authorisationCategoryTypes.length;
  }

  toggleAllAuthorisationCategory(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.selectedAuthorisationCategoryIds = checked
      ? this.authorisationCategoryTypes.map(type => type.AuthorisationCategoryTypeID)
      : [];
  }

  isAuthorisationCategorySelected(id: number): boolean {
    return this.getSelectedAuthorisationCategoryIds().includes(id);
  }

  toggleAuthorisationCategory(id: number, event: Event): void {
    const selectedIds = this.getSelectedAuthorisationCategoryIds();
    const checked = (event.target as HTMLInputElement).checked;

    if (checked) {
      selectedIds.push(id);
    } else {
      const index = selectedIds.indexOf(id);
      if (index !== -1) {
        selectedIds.splice(index, 1);
      }
    }
    this.selectedAuthorisationCategoryIds = selectedIds;
  }

  getSelectedAuthorisationCategoryIds(): number[] {
    return this.selectedAuthorisationCategoryIds || [];
  }
  resetFilters(): void {
    this.setDefaultFilters();
  }
  // Set default filter values
  setDefaultFilters(): void {
    this.FirmID = 0;
    this.LicenseStatusId = 0;
    this.AuthorisationStatusId = 0;
    this.OperationalStatusId = 0;
    this.LegalStatusId = 0;
    this.AuthorisationCaseOfficerId = 0;
    this.SupervisionCaseOfficerId = 0;
    this.PrudentialCategotyId = 0;
    this.QFCNumber = '';
    this.UserID = this.UserID;
    this.RelevantPerson = 0;
    this.CSVAuthorisationStatus = null;
    this.CSVLicenseStatus = null;
    this.CSVLegalStatus = null;
    this.CSVPrudentialCategory = null;
    this.CSVSectorTypes = '';
    this.CSVFirmTypes = null;
    this.PilotFirm = false;
    this.startChar = null;
    this.LoginUserID = 0;
    this.CSVFirmStatus = null;
    this.CSVSupCategories = null;
    this.CSVAuthorisationCategories = null;
    this.ObjectID = 0;
  }

  searchFirms(): void {
    const params = {
      FirmID: this.FirmID,
      LicenseStatusId: this.LicenseStatusId,
      AuthorisationStatusId: this.AuthorisationStatusId,
      OperationalStatusId: this.OperationalStatusId,
      LegalStatusId: this.LegalStatusId,
      AuthorisationCaseOfficerId: this.AuthorisationCaseOfficerId,
      SupervisionCaseOfficerId: this.SupervisionCaseOfficerId,
      PrudentialCategotyId: this.PrudentialCategotyId,
      QFCNumber: this.QFCNumber,
      UserID: this.UserID,
      RelevantPerson: this.RelevantPerson,
      CSVAuthorisationStatus: this.CSVAuthorisationStatus,
      CSVLicenseStatus: this.CSVLicenseStatus,
      CSVLegalStatus: this.CSVLegalStatus,
      CSVPrudentialCategory: this.CSVPrudentialCategory,
      CSVSectorTypes: this.CSVSectorTypes,
      CSVFirmTypes: this.CSVFirmTypes,
      PilotFirm: this.PilotFirm,
      startChar: this.startChar,
      LoginUserID: this.LoginUserID,
      CSVFirmStatus: this.CSVFirmStatus,
      CSVSupCategories: this.CSVSupCategories,
      CSVAuthorisationCategories: this.CSVAuthorisationCategories,
      ObjectID: this.ObjectID
    };


    this.firmService.getFirmsList(params).subscribe(data => {
      this.filteredFirms = data.response; // Filtered data\
    },
      error => {
        this.filteredFirms = [];
        console.error('Error fetching filtered notices ', error);
      });
  }

  isSelected(firmId: number): boolean {
    return this.selectedFirms.some((firm) => firm.FirmID === firmId);
  }

  onRowSelect(firm: any): void {
    if (this.isSelected(firm.FirmID)) {
      this.selectedFirms = this.selectedFirms.filter((f) => f.FirmID !== firm.FirmID);
    } else {
      this.selectedFirms.push(firm);
    }
  }
  addSelectedFirms(): void {
    this.selectionChange.emit(this.selectedFirms);
  }

  onClose(): void {
    this.closeFirmFilterPopup.emit();
  }

}
