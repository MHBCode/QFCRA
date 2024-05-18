import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-view-firm-page',
  templateUrl: './view-firm-page.component.html',
  styleUrls: ['./view-firm-page.component.scss']
})
export class ViewFirmPageComponent implements OnInit {

  menuId:Number = 0;

  constructor(){};

  ngOnInit(): void {
      
  }

  toggleMenu(inputNumber:Number){
      this.menuId = inputNumber;
  }

}
