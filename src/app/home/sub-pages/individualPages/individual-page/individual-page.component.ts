import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-individual-page',
  templateUrl: './individual-page.component.html',
  styleUrls: ['./individual-page.component.scss']
})
export class IndividualPageComponent implements OnInit {
  showSearchSection: boolean = false;

  constructor(private router: Router) {}

  ngOnInit() {
   
  }

  toggleSearch() {
    this.showSearchSection = !this.showSearchSection;
  }

  createIndividual() {
    this.router.navigate(['home/create-individual']);
  }
 
}
