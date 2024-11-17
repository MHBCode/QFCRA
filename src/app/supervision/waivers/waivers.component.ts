import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FirmDetailsService } from 'src/app/firms/firmsDetails.service';
import { WaiverService } from 'src/app/ngServices/waiver.service';
import { FrimsObject } from 'src/app/app-constants';
import * as constants from 'src/app/app-constants';
import { FirmService } from 'src/app/ngServices/firm.service';
import { SupervisionService } from '../supervision.service';
import { ObjectwfService } from 'src/app/ngServices/objectwf.service';

@Component({
  selector: 'app-waivers',
  templateUrl: './waivers.component.html',
  styleUrls: ['./waivers.component.scss','../supervision.scss']
})
export class WaiversComponent {
  FirmWaivers: any;
  isLoading: boolean = false;
  firmId: number = 0;
  roleId: number = 5001;
  ObjectOpType = constants.ObjectOpType.List;
  pageSize: number = 10; // Define pageSize here
  paginatedItems: any[] = []; 
  firmDetails:any;
  hideEditBtn: boolean = false;
  hideSaveBtn: boolean = false;
  hideCancelBtn: boolean = false;
  hideCreateBtn: boolean = false;
  hideDeleteBtn: boolean = false;
  isAuthorisedForWaivers : boolean = false;
  waiversRevisions : any;
  callPrev:boolean = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private waiverService: WaiverService,
    private firmDetailsService: FirmDetailsService,
    private firmService : FirmService,
    private supervisionService :SupervisionService,
    private objectWF: ObjectwfService
  ) {

  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.firmId = +params['id'];
      this.loadWaivers();
      this.loadFirmDetails(this.firmId);
    })
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

  loadWaivers() {
    this.waiverService.getFirmwaiver(this.firmId,this.roleId,this.ObjectOpType).subscribe(
      data => {
        this.FirmWaivers = data.response;
        this.isFirmAuthorisedForWaivers();
        this.applySearchAndPagination();
      },
      error => {
        console.error('Error fetching Firm Waivers ', error);
      }
    );
  }

  applySearchAndPagination(): void {
    this.paginatedItems = this.FirmWaivers.slice(0, this.pageSize); // First page
  }

  updatePaginatedItems(paginatedItems: any[]): void {
    this.paginatedItems = paginatedItems; // Update current page items
  }

  isFirmAuthorisedForWaivers(){
    this.firmService.isFirmAuthorisedForWaivers(this.firmId).subscribe(
      data => {
        this.isAuthorisedForWaivers = data.response;
        this.isLoading = false;
        if(!this.isAuthorisedForWaivers){
          this.supervisionService.showErrorAlert(constants.MessagesWaiverList.FIRMEXIST);
        }
      },
      error => {
        console.error(error);
      }
    );
  }

  loadRevisions(WaiverRevNum: number) {
    this.isLoading = true;
    this.objectWF.getRevisions(FrimsObject.Waiver,WaiverRevNum).subscribe(revisions => {
      console.log('Fetched revisions:', revisions);
      this.waiversRevisions = revisions.response;
      this.isLoading = false;
      this.callPrev = true;
    });

    debugger 
    
    const popupWrapper = document.querySelector('.PreviousVersionsPopup') as HTMLElement;
    if (popupWrapper) {
      popupWrapper.style.display = 'flex';
    } else {
      console.error('Element with class .PreviousVersionsPopup not found');
    }

  }

  closePreviousVersions() {
    this.callPrev = false;
    const popupWrapper = document.querySelector('.PreviousVersionsPopup') as HTMLElement;
    if (popupWrapper) {
      popupWrapper.style.display = 'none';
    } else {
      console.error('Element with class .PreviousVersionsPopup not found');
    }
  }

  hideActionButton() {
    this.hideEditBtn = true;
    this.hideSaveBtn = true;
    this.hideCancelBtn = true;
    this.hideCreateBtn = true;
    this.hideDeleteBtn = true;
  }
  createWaiver(){

  }
}
