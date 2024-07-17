import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-individual-page',
  templateUrl: './individual-page.component.html',
  styleUrls: ['./individual-page.component.scss']
})
export class IndividualPageComponent implements OnInit {
  showSearchSection: boolean = false;
  ngOnInit() {
   
  }

  toggleSearch() {
    this.showSearchSection = !this.showSearchSection;
  }
 
}
