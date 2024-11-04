import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-journal',
  templateUrl: './journal.component.html',
  styleUrls: ['./journal.component.scss','../supervision.scss']
})
export class JournalComponent {
  journal: any;
  isLoading: boolean = false;
  firmId: number = 0;
  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {

  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.firmId = +params['id'];
      this.loadJournal();
    })
  }

  loadJournal() {
    // this.waiverService.getFirmwaiver(this.firmId).subscribe(
    //   data => {
    //     this.journal = data.response;
    //     console.log('Firm FIRM regFunds details:', this.regFunds);
    //   },
    //   error => {
    //     console.error('Error fetching Firm regFunds ', error);
    //   }
    // );
  }
}
