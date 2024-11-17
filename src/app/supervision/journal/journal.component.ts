import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FirmDetailsService } from 'src/app/firms/firmsDetails.service';
import { JournalService } from 'src/app/ngServices/journal.service';

@Component({
  selector: 'app-journal',
  templateUrl: './journal.component.html',
  styleUrls: ['./journal.component.scss','../supervision.scss']
})
export class JournalComponent {
  journaldata: any;
  isLoading: boolean = false;
  firmId: number = 0;
  paginatedItems: any[] = []; 
  pageSize : number = 10; 
  userId : number = 30;
  firmDetails:any;
  showDeletedJournal:boolean = false;
  alljournaldata:any;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private journalService : JournalService,
    private firmDetailsService: FirmDetailsService
  ) {

  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.firmId = +params['id'];
      this.loadFirmDetails(this.firmId);
      this.loadJournal();
    })
  }

  onDeletedJournalToggle(event: Event) {
    this.showDeletedJournal = (event.target as HTMLInputElement).checked;
    this.loadJournal();
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

  loadJournal() {
    this.journalService.getJournalData(this.firmId).subscribe(
      data => {
        this.alljournaldata = data.response;
        if(this.showDeletedJournal){
          this.journaldata = this.alljournaldata;
        }
        else{
          this.journaldata = this.alljournaldata.filter(item => !item.IsDeleted);
        }
        this.applySearchAndPagination();
      },
      error => {
        console.error('Error fetching Firm regFunds ', error);
      }
    );
  }
  applySearchAndPagination(): void {
    this.paginatedItems = this.journaldata.slice(0, this.pageSize); // First page
  }

  updatePaginatedItems(paginatedItems: any[]): void {
    this.paginatedItems = paginatedItems; // Update current page items
  }
}
