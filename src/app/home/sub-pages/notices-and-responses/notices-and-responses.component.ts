import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-notices-and-responses',
  templateUrl: './notices-and-responses.component.html',
  styleUrls: ['./notices-and-responses.component.scss']
})
export class NoticesAndResponsesComponent {
  
  constructor( private router: Router) {
   
    
  }
  createNotice() {
    this.router.navigate(['home/create-notices']);
  }
}

