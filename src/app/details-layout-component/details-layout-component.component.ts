import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { SecurityService } from '../ngServices/security.service';
import { filter } from 'rxjs/operators';
import { FrimsObject } from '../app-constants';

@Component({
  selector: 'app-details-layout-component',
  templateUrl: './details-layout-component.component.html',
  styleUrls: ['./details-layout-component.component.scss']
})
export class DetailsLayoutComponent implements OnInit {
  subsiteName: string = 'All Firms';
  pageTitle: string = '';
  isUserAllowed: boolean | null = null;
  isLoading: boolean = false;
  firmId: number = 0;
  userId = 124;
  menuWidth: string = '6%';
  dataWidth: string = '93%';
  width1: string = '14%';
  width2: string = '6%';
  widthData1: string = '98%';
  widthData2: string = '85%';
  closedMenu: boolean = true;
  activeMenu: string | null = null;
  securitySettings: any[] = [];
  Page = FrimsObject;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private securityService: SecurityService
  ) { }

  ngOnInit(): void {
    this.route.firstChild?.params.subscribe(params => {
      this.firmId = +params['id'];
      this.userAllowedToAccessFirm();
      this.fetchMenuSecuritySettings();
    });

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.setActiveMenuBasedOnRoute();
      });

    this.route.firstChild?.data.subscribe(data => {
      this.subsiteName = data['subsiteName'] || 'All Firms';
      this.pageTitle = data['pageTitle'] || 'Default Page Title';
    });
  }

  fetchMenuSecuritySettings() {
    this.isLoading = true;
    this.securityService.getAppRoleAccess(this.userId, this.Page.FrimsMenu).subscribe({
      next: response => {
        this.securitySettings = response.response || [];
        this.isLoading = false;
      },
      error: err => {
        console.error('Error fetching menu security settings:', err);
        this.isLoading = false;
      }
    });
  }

  setActiveMenuBasedOnRoute(): void {
    const currentUrl = this.router.url;

    if (currentUrl.includes('/firms')) {
      this.activeMenu = 'firmDetails';
    } else if (currentUrl.includes('/individuals')) {
      this.activeMenu = 'individuals';
    } else if (currentUrl.includes('/supervision')) {
      this.activeMenu = 'supervision';
    } else if (currentUrl.includes('/aml')) {
      this.activeMenu = 'aml';
    } else {
      this.activeMenu = null; // Default to no active menu
    }
  }

  isMenuItemAllowed(controlName: string): boolean {
    return this.securitySettings.some(control => control.ControlName === controlName && control.ShowProperty === 1);
  }

  userAllowedToAccessFirm() {
    this.isLoading = true;
    this.securityService.isUserAllowedToAccessFirm(this.userId, this.firmId).subscribe({
      next: data => {
        this.isUserAllowed = data.response;
        this.isLoading = false;
        if (!this.isUserAllowed) {
          this.router.navigate(['error/FirmAccessDenied']);
        }
      },
      error: err => {
        console.error('Error checking firm access permissions:', err);
        this.isLoading = false;
      }
    });
  }

  toggleFulMenu() {
    if (this.menuWidth !== this.width2) {
      this.menuWidth = this.width2;
      this.dataWidth = this.widthData1;
    } else {
      this.menuWidth = this.width1;
      this.dataWidth = this.widthData2;
    }
    this.closedMenu = !this.closedMenu;
  }

  toggleMenu(menu: string) {
    this.activeMenu = this.activeMenu === menu ? null : menu;
  }
}
