import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-data-place',
  templateUrl: './data-place.component.html',
  styleUrls: ['./data-place.component.scss']
})
export class DataPlaceComponent{

  @Input() labelTitle: string ='';
  @Input() value: string ='';

}
