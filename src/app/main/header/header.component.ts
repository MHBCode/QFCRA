import { Component, OnInit} from '@angular/core';
import { Router } from '@angular/router';
import { FontSizeService } from 'src/app/ngServices/font-size.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  isIncreaseFontSizeEnabled: boolean = true;
  isMaxFontSizeEnabled: boolean = true;
  isDefaultEnabled: boolean = true;

  constructor(
    private router: Router,
    private fontSizeService: FontSizeService
  ){};

  ngOnInit(): void {
    this.isDefaultEnabled = false;
  }

  firms:boolean = false;
  individuals:Boolean = false;
  reports:Boolean = false;
  admin:Boolean = false;

  openMenu (value:Number) {
    if (value == 1){
      if(this.firms == true){
        this.firms = false;
      }
      else{
        this.firms = true;
        this.admin = false;
        this.reports = false;
        this.individuals = false;
      }
    }
    else if(value == 2){
      if(this.individuals == true){
        this.individuals = false;
      }
      else{
        this.individuals = true;
        this.admin = false;
        this.firms = false;
        this.reports = false;
      }
    }
    else if(value == 3){
      if(this.reports == true){
        this.reports = false;
      }
      else{
        this.reports = true;
        this.admin = false;
        this.firms = false;
        this.individuals = false;
      }
    }
    else if(value == 4){
      if(this.admin == true){
        this.admin = false;
      }
      else{
        this.admin = true;
        this.firms = false;
        this.reports = false;
        this.individuals = false;
      }
    }
    else if(value == 0){
        this.admin = false;
        this.firms = false;
        this.reports = false;
        this.individuals = false;
      }
  }

  goHome(){
    this.router.navigate(['home']);
  }
  goto(where:Number){
    if(where == 0){
      this.router.navigate(['home/new-firm'])
    }
    else if(where == 1){
      this.router.navigate(['home/firms-page'])
    }
    if (where == 6) {
      this.router.navigate(['home/individual-page'])
    }
    if (where == 7) {
      this.router.navigate(['home/individual-registration-status'])
    }
    if (where == 8) {
      this.router.navigate(['home/individual-pending-ai-apps'])
    }
    if (where == 9) {
      this.router.navigate(['home/firm-reports']);
    }
    if (where == 22) {
      this.router.navigate(['home/userAccess'])
    }
    if (where == 23) {
      this.router.navigate(['home/re-assign-tasks'])
    }
  }

  increaseFontSize() {
    if (this.isIncreaseFontSizeEnabled) {
      this.fontSizeService.increaseFontSize();
      this.isIncreaseFontSizeEnabled = false;
      this.isMaxFontSizeEnabled = true;
      this.isDefaultEnabled = true;
    }
  }

  
  setMaxFontSize() {
    this.fontSizeService.setMaxFontSize();
    this.isMaxFontSizeEnabled = false; 
    this.isIncreaseFontSizeEnabled = true; 
    this.isDefaultEnabled = true;
  }

  resetFontSize() {
    this.fontSizeService.resetFontSize();
    this.isMaxFontSizeEnabled = true; 
    this.isIncreaseFontSizeEnabled = true;
    this.isDefaultEnabled = false;
  }
}
