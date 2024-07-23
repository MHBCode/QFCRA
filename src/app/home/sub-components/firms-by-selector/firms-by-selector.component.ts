
// import { Component, ElementRef, OnInit, Renderer2 } from '@angular/core';
// @Component({
//   selector: 'app-firms-by-selector',
//   templateUrl: './firms-by-selector.component.html',
//   styleUrls: ['./firms-by-selector.component.scss']
// })
// export class FirmsBySelectorComponent implements OnInit {


//   constructor(private renderer: Renderer2, private el: ElementRef) { }


//   ngOnInit(): void {
//       this.setBars();
//   }

//   // setBars(): void {
//   //   const barElement = this.el.nativeElement.querySelector('#ActuarialFunction');
//   //   const barElement1 = this.el.nativeElement.querySelector('#ComplianceOversightFunction');
//   //   const barElement2 = this.el.nativeElement.querySelector('#ExecutiveGeovernceFunction');
//   //   const barElement3 = this.el.nativeElement.querySelector('#FinanceFunction'); 
//   //   const barElement4 = this.el.nativeElement.querySelector('#InternalAuditFunction');
//   //   const barElement5 = this.el.nativeElement.querySelector('#MIROFunction');
//   //   const barElement6 = this.el.nativeElement.querySelector('#Non-ExecutiveGovernanceFunction');
//   //   const barElement7 = this.el.nativeElement.querySelector('#RiskManager');
//   //   const barElement8 = this.el.nativeElement.querySelector('#SeniorExecutiveFunction');
//   //   const barElement9 = this.el.nativeElement.querySelector('#SeniorManagementFunction');

//   //   if (barElement) {
//   //     const barHeight = '10%';
//   //     this.renderer.setStyle(barElement, 'height', barHeight);
//   //   }
//   //   if (barElement1) {
//   //     const barHeight = '40%';
//   //     this.renderer.setStyle(barElement1, 'height', barHeight);
//   //   } 
//   //   if (barElement2) {
//   //     const barHeight = '70%';
//   //     this.renderer.setStyle(barElement2, 'height', barHeight);
//   //   } 
//   //   if (barElement3) {
//   //     const barHeight = '30%';
//   //     this.renderer.setStyle(barElement3, 'height', barHeight);
//   //   } 
//   //   if (barElement4) {
//   //     const barHeight = '50%';
//   //     this.renderer.setStyle(barElement4, 'height', barHeight);
//   //   } 
//   //   if (barElement5) {
//   //     const barHeight = '70%';
//   //     this.renderer.setStyle(barElement5, 'height', barHeight);
//   //   } 
//   //   if (barElement6) {
//   //     const barHeight = '70%';
//   //     this.renderer.setStyle(barElement6, 'height', barHeight);
//   //   } 
//   //   if (barElement7) {
//   //     const barHeight = '40%';
//   //     this.renderer.setStyle(barElement7, 'height', barHeight);
//   //   } 
//   //   if (barElement8) {
//   //     const barHeight = '20%';
//   //     this.renderer.setStyle(barElement8, 'height', barHeight);
//   //   } 
//   //   if (barElement9) {
//   //     const barHeight = '70%';
//   //     this.renderer.setStyle(barElement9, 'height', barHeight);
//   //   } 
//   // }
//   setBars(): void {
//     const barElement = this.el.nativeElement.querySelector('#bank');
//     const barElement1 = this.el.nativeElement.querySelector('#BankIslamic');
//     const barElement2 = this.el.nativeElement.querySelector('#InsuranceIntermediary');
//     const barElement3 = this.el.nativeElement.querySelector('#Insurer'); 
//     const barElement4 = this.el.nativeElement.querySelector('#InsurerIslamic');
//     const barElement5 = this.el.nativeElement.querySelector('#InvestmentManager');
//     const barElement6 = this.el.nativeElement.querySelector('#RepOffice');
//     const transitionStyle = 'height 0.7s ease-in-out';
  
//     const elements = [barElement, barElement1, barElement2, barElement3, barElement4, barElement5, barElement6];
//     const heights = ['10%', '40%', '70%', '30%', '50%', '90%', '60%'];
  
//     elements.forEach((element, index) => {
//       if (element) {
//         this.renderer.setStyle(element, 'transition', transitionStyle);
//         this.renderer.setStyle(element, 'height', '0%'); 
//         setTimeout(() => {
//           this.renderer.setStyle(element, 'height', heights[index]);
//         }, 100);
//       }
//     });
//   }
  

// }


import { Component, ElementRef, OnInit, Renderer2 } from '@angular/core';
import { DashboardService } from 'src/app/ngServices/dashboard.service';
@Component({
  selector: 'app-firms-by-selector',
  templateUrl: './firms-by-selector.component.html',
  styleUrls: ['./firms-by-selector.component.scss']
})
export class FirmsBySelectorComponent implements OnInit {
  sectorFunction: any[] = [];

  constructor(private renderer: Renderer2, private el: ElementRef, private dashboard: DashboardService) { }


  ngOnInit(): void {
    this.loadSectorByFunction();
  }

  // setBars(): void {
  //   const barElement = this.el.nativeElement.querySelector('#ActuarialFunction');
  //   const barElement1 = this.el.nativeElement.querySelector('#ComplianceOversightFunction');
  //   const barElement2 = this.el.nativeElement.querySelector('#ExecutiveGeovernceFunction');
  //   const barElement3 = this.el.nativeElement.querySelector('#FinanceFunction'); 
  //   const barElement4 = this.el.nativeElement.querySelector('#InternalAuditFunction');
  //   const barElement5 = this.el.nativeElement.querySelector('#MIROFunction');
  //   const barElement6 = this.el.nativeElement.querySelector('#Non-ExecutiveGovernanceFunction');
  //   const barElement7 = this.el.nativeElement.querySelector('#RiskManager');
  //   const barElement8 = this.el.nativeElement.querySelector('#SeniorExecutiveFunction');
  //   const barElement9 = this.el.nativeElement.querySelector('#SeniorManagementFunction');

  //   if (barElement) {
  //     const barHeight = '10%';
  //     this.renderer.setStyle(barElement, 'height', barHeight);
  //   }
  //   if (barElement1) {
  //     const barHeight = '40%';
  //     this.renderer.setStyle(barElement1, 'height', barHeight);
  //   } 
  //   if (barElement2) {
  //     const barHeight = '70%';
  //     this.renderer.setStyle(barElement2, 'height', barHeight);
  //   } 
  //   if (barElement3) {
  //     const barHeight = '30%';
  //     this.renderer.setStyle(barElement3, 'height', barHeight);
  //   } 
  //   if (barElement4) {
  //     const barHeight = '50%';
  //     this.renderer.setStyle(barElement4, 'height', barHeight);
  //   } 
  //   if (barElement5) {
  //     const barHeight = '70%';
  //     this.renderer.setStyle(barElement5, 'height', barHeight);
  //   } 
  //   if (barElement6) {
  //     const barHeight = '70%';
  //     this.renderer.setStyle(barElement6, 'height', barHeight);
  //   } 
  //   if (barElement7) {
  //     const barHeight = '40%';
  //     this.renderer.setStyle(barElement7, 'height', barHeight);
  //   } 
  //   if (barElement8) {
  //     const barHeight = '20%';
  //     this.renderer.setStyle(barElement8, 'height', barHeight);
  //   } 
  //   if (barElement9) {
  //     const barHeight = '70%';
  //     this.renderer.setStyle(barElement9, 'height', barHeight);
  //   } 
  // }
  setBars(): void {
    if (!this.sectorFunction || this.sectorFunction.length === 0) {
      return;
    }

    const transitionStyle = 'height 0.7s ease-in-out';

    this.sectorFunction.forEach((data) => {
      const elementId = this.formatId(data.SectorType);
      const barElement = this.el.nativeElement.querySelector(`#${elementId}`);
      if (barElement) {
        const barHeight = `${(data.TotalFirms / 150) * 100 + 10}%`;
        this.renderer.setStyle(barElement, 'transition', transitionStyle);
        this.renderer.setStyle(barElement, 'height', '0%');

        this.renderer.setStyle(barElement, 'height', barHeight);

      } else {
        console.error(`Element with ID ${elementId} not found`);
      }
    });
  }

  formatId(functionName: string): string { // this function removes spaces between words
    return functionName.replace(/\s+/g, '').replace(/-/g, '');
  }

  loadSectorByFunction() {
    this.dashboard.getDashboardFirms(30).subscribe(
      (data) => {
        const resultSet3 = data.response.find((set: any) => set.key === 'ResultSet3');
        if (resultSet3) {
          this.sectorFunction = resultSet3.value || [];
        }
        setTimeout(() => {
        this.setBars();
        },100)
      },
      (error) => {
        console.error('API Error:', error);
      }
    );
  }
}

