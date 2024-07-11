import { Component, ElementRef, OnInit, Renderer2 } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';  // Import ActivatedRoute
import { FirmService } from 'src/app/ngServices/firm.service';  // Import FirmService

@Component({
  selector: 'app-view-firm-page',
  templateUrl: './view-firm-page.component.html',
  styleUrls: ['./view-firm-page.component.scss']
})
export class ViewFirmPageComponent implements OnInit {

  menuId: Number = 0;
  menuWidth: string = '2%';
  dataWidth: string = '98%';
  width1: string = '15%';
  width2: string = '2%';
  widthData1: string = '98%';
  widthData2: string = '85%';
  firmId: number = 0;  // Add firmId property
  firmDetails: any;  // Add firmDetails property

  constructor(
    private router: Router,
    private route: ActivatedRoute,  // Inject ActivatedRoute
    private firmService: FirmService,  // Inject FirmService
    private el: ElementRef, 
    private renderer: Renderer2
  ) { }

  ngOnInit(): void {
    console.log('ngOnInit called');
    this.scrollToTop();

    this.route.params.subscribe(params => {
      this.firmId = +params['id'];  // Retrieve the firm ID from the route parameters
      console.log(`Loaded firm with ID: ${this.firmId}`);
      this.loadFirmDetails(this.firmId);  // Fetch the firm details
    });
  }

  scrollToTop(): void {
    console.log('scrollToTop called');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  toggleMenu(inputNumber: Number) {
    if (this.menuId == 0) {
      this.menuId = inputNumber;
      this.menuWidth = this.width1;
      this.dataWidth = this.widthData2;
    } else {
      this.menuId = 0;
    }
  }

  toggleFulMenu() {
    if (this.menuWidth !== this.width2) {
      this.menuWidth = this.width2;
      this.dataWidth = this.widthData1;
    } else {
      this.menuWidth = this.width1;
      this.dataWidth = this.widthData2;
    }
  }

  editFirm() {
    this.router.navigate(['home/edit-firm']);
  }

  // Method to load firm details
  loadFirmDetails(firmId: number) {
    this.firmService.getFirmDetails(firmId).subscribe(
      data => {
        this.firmDetails = data.response;
        console.log('Firm details:', this.firmDetails);
      },
      error => {
        console.error('Error fetching firm details', error);
      }
    );
  }

  switchTab(tabId: string){
        // Get all section elements
        const sections = this.el.nativeElement.getElementsByTagName('section');
    
        // Loop through all section elements and set display to none
        for (let i = 0; i < sections.length; i++) {
          this.renderer.setStyle(sections[i], 'display', 'none');
        }
        console.log('yes its', tabId)
        const neededSection = document.getElementById(tabId);
        this.renderer.setStyle(neededSection, 'display', 'flex');
        // if(tabId == 'CD'){

        // }
        // if(tabId == 'CD'){
        //   console.log('yes its', tabId)
        //   const neededSection = document.getElementById(tabId);
        //   this.renderer.setStyle(neededSection, 'display', 'flex');
        // }
  }

}
