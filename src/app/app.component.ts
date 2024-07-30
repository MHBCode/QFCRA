import { Component, inject, OnInit, Renderer2 } from '@angular/core';
import { FontSizeService } from './ngServices/font-size.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'qfcra';

  constructor(private fontSizeService: FontSizeService, private renderer: Renderer2) {}

  ngOnInit(): void {
    this.fontSizeService.fontSize$.subscribe((fontSize: number) => {
      this.renderer.setStyle(document.body, 'font-size', `${fontSize}px`);
    });
  }
}
