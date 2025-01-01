import { Component, Input, SimpleChanges } from '@angular/core';
import { RulesService } from 'src/app/ngServices/rules.service';

@Component({
  selector: 'app-provision-table',
  templateUrl: './provision-table.component.html',
  styleUrls: ['./provision-table.component.scss','../../shared/popup.scss','../supervision.scss']
})
export class ProvisionTableComponent {
  @Input() provisions;
  provsionDetails : any;
  selectedItem : any;
  showDetails : boolean = false;
  constructor(
    private rulesService: RulesService,
  ) {

  }


  getProvisionDescByProvisionRange(provision) {
    this.rulesService.getProvisionDescByProvisionRange(provision.RALegislationId,provision.RAProvisionPartTypeId,provision.RaProvisionPartFrom,provision.RaProvisionPartTo,provision.ProvisionFromId,provision.ProvisionToId).subscribe(
      data => {
        this.selectedItem = provision;
        this.provsionDetails = data.response;
        this.showDetails = true;
      },
      error => {
        console.error('Error fetching ProvisionDescByProvisionRange ', error);
        this.selectedItem = provision;
        this.showDetails = true;
      }
    );
  }
  onCloseDetails(){
    this.showDetails = false;
  }
}
