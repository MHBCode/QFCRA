// import { Component, inject, OnInit, Renderer2 } from '@angular/core';
// import { FontSizeService } from './ngServices/font-size.service';


// @Component({
//   selector: 'app-root',
//   templateUrl: './app.component.html',
//   styleUrls: ['./app.component.scss']
// })
// export class AppComponent implements OnInit {
//   title = 'qfcra';
//   isLoading: boolean = true;
  
//   constructor(private fontSizeService: FontSizeService, private renderer: Renderer2) {}

//   ngOnInit(): void {
//     this.fontSizeService.fontSize$.subscribe((fontSize: number) => {
//       this.renderer.setStyle(document.body, 'font-size', `${fontSize}px`);
//     });
//   }
// }
import { Component, OnInit, Renderer2 } from '@angular/core';
import { FontSizeService } from './ngServices/font-size.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'qfcra';
  isLoading: boolean = true;

  constructor(private fontSizeService: FontSizeService, private renderer: Renderer2) {}

  ngOnInit(): void {
    this.fontSizeService.fontSize$.subscribe((fontSize: number) => {
      this.renderer.setStyle(document.body, 'font-size', `${fontSize}px`);
    });

    // Simulate loading delay for demonstration
    setTimeout(() => {
      this.isLoading = false;
    }, 2000); // Adjust the delay as needed
  }
}
