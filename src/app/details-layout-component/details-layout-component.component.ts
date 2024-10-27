import { Component, Input } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { SecurityService } from '../ngServices/security.service';
import { filter, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-details-layout-component',
  templateUrl: './details-layout-component.component.html',
  styleUrls: ['./details-layout-component.component.scss']
})
export class DetailsLayoutComponent {
  subsiteName: string = 'All Firms';
  pageTitle: string;
  isUserAllowed: boolean | null = null;
  isLoading: boolean = false;
  firmId: number = 0;
  userId = 30;
  menuWidth: string = '6%';
  dataWidth: string = '93%';
  width1: string = '14%';
  width2: string = '6%';
  widthData1: string = '98%';
  widthData2: string = '85%';
  closedMenu: boolean = true;
  activeMenu: string | null = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private securityService: SecurityService
  ) {
  }

  ngOnInit(): void {
    this.route.firstChild?.params.subscribe(params => {
      this.firmId = +params['id'];
      this.userAllowedToAccessFirm();
    });

    this.route.url.subscribe(() => {
      this.activeMenu = this.router.url.includes('/firms') ? 'firmDetails' : null;
    });

    this.route.queryParams.subscribe(params => {
      this.pageTitle = params['pageTitle'];
      this.subsiteName = params['subsiteName'];
    });

  }


  userAllowedToAccessFirm() {
    this.isLoading = true;
    this.securityService.isUserAllowedToAccessFirm(this.userId, this.firmId).subscribe(data => {
      this.isUserAllowed = data.response;
      this.isLoading = false;
      if (!this.isUserAllowed) {
        this.router.navigate(['error/FirmAccessDenied'])
      }
    }, error => {
      console.error('Error loading is user allowed to access firm: ', error);
      this.isLoading = false;
    })
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
