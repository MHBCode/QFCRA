import { Component, OnInit,ElementRef} from '@angular/core';
import { Router } from '@angular/router';
import { FontSizeService } from 'src/app/ngServices/font-size.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  isIncreaseFontSizeEnabled: boolean = true;
  isDecreaseFontSizeEnabled: boolean = true;
  isDefaultEnabled: boolean = true;
  activeMenuIndex: Number = null;

  constructor(
    private router: Router,
    private fontSizeService: FontSizeService,
    private el: ElementRef
  ){};

  ngOnInit(): void {
    this.isDefaultEnabled = false;
  }

  firms:boolean = false;
  individuals:Boolean = false;
  reports:Boolean = false;
  admin:Boolean = false;

  openMenu (value: Number) {
    if (this.activeMenuIndex === value) {
      this.activeMenuIndex = null; // Collapse the menu if it's already active
    } else {
      this.activeMenuIndex = value; // Set the active menu
    }
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
    if(where == 2){
      this.router.navigate(['home/co-supervisors'])
    }
    if (where == 3) {
      this.router.navigate(['home/notices-and-responses'])
    }
    if(where == 4){
      this.router.navigate(['home/enforcement-and-disciplinary'])
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
    this.activeMenuIndex = null;
    this.firms = false;
    this.admin = false;
    this.individuals = false;
    this.reports = false;
  }

  increaseFontSize() {
    if (this.isIncreaseFontSizeEnabled) {
      this.fontSizeService.increaseFontSize();
    }
  }

  decreaseFontSize() {
    this.fontSizeService.decreaseFontSize();
  }

  resetFontSize() {
    this.fontSizeService.resetFontSize();
  }

  openCloseProfileMenu(){
    const menu = document.getElementById('profile-icon-submenu');
    if (menu.style.display === 'none' || menu.style.display === '') {
      menu.style.display = 'flex';
    } else {
      menu.style.display = 'none';
    }
  }
}
