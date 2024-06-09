import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-view-firm-page',
  templateUrl: './view-firm-page.component.html',
  styleUrls: ['./view-firm-page.component.scss']
})
export class ViewFirmPageComponent implements OnInit {

  menuId:Number = 0;
  menuWidth: string = '2%';
  dataWidth: string = '98%';
  width1: string = '15%';
  width2: string = '2%';
  widthData1: string ='98%';
  widthData2: string = '85%';
  constructor(private router: Router){};

  ngOnInit(): void {
    console.log('ngOnInit called');
    this.scrollToTop();
  }
  scrollToTop(): void {
    console.log('scrollToTop called');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  toggleMenu(inputNumber:Number){
      if (this.menuId == 0){
        this.menuId = inputNumber;
        this.menuWidth = this.width1;
        this.dataWidth = this.widthData2;
      }
      else{
        this.menuId = 0;
      }

  }
  
  toggleFulMenu(){
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
}

