import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FirmService } from 'src/app/ngServices/firm.service';
import { ReportScheduleService } from 'src/app/ngServices/report-schedule.service';
import Swal from 'sweetalert2';
import * as constants from 'src/app/app-constants';
import { SupervisionService } from '../supervision.service';
import { FirmDetailsService } from 'src/app/firms/firmsDetails.service';

@Component({
  selector: 'app-reporting-schedule',
  templateUrl: './reporting-schedule.component.html',
  styleUrls: ['./reporting-schedule.component.scss','../supervision.scss']
})
export class ReportingScheduleComponent {

  rptSchedule: any;
  isLoading: boolean = false;
  firmId: number = 0;
  isAuthorise : boolean = true;
  firmDetails:any;
  selectedReport: any = null;
  showPopup: boolean = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private firmService: FirmService,
    private reportScheduleService : ReportScheduleService,
    private supervisionService : SupervisionService,
    private firmDetailsService: FirmDetailsService,
  ) {

  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.firmId = +params['id'];
      this.isFirmAuthorised();
    })
    this.loadFirmDetails(this.firmId);
  }

  isFirmAuthorised() {
    this.firmService.checkisFirmAuthorised(this.firmId).subscribe(
      data => {
        this.isAuthorise = data.response;
        this.loadReportingSchedule();
      },
      error => {
        console.error('Error fetching Firm Waivers ', error);
      }
    );
  }

  loadReportingSchedule() {
    this.isLoading = true;
    this.reportScheduleService.getFirmReportSchedule(this.firmId).subscribe(
      data => {
        this.rptSchedule = data.response;
        this.isLoading = false;
        if(!this.isAuthorise){
          this.supervisionService.showErrorAlert(constants.ReportingScheduleMessages.REPORTINGSCHEDULECANTBECREATED_FIRMSTATUS);
        }
      },
      error => {
        console.error('Error fetching rptSchedule', error);
      }
    );
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
  openReportSchedulePopup(rpt: any): void {
    this.selectedReport = rpt;
    this.showPopup = true;
  }

  closePopup(): void {
    this.showPopup = false;
  }
}

