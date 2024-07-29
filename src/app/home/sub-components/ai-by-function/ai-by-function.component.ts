import { Component, ElementRef, OnInit, Renderer2 } from '@angular/core';
import { DashboardService } from 'src/app/ngServices/dashboard.service';

@Component({
  selector: 'app-ai-by-function',
  templateUrl: './ai-by-function.component.html',
  styleUrls: ['./ai-by-function.component.scss']
})
export class AIByFunctionComponent implements OnInit {

  AIFunction: any[] = [];

  constructor(private renderer: Renderer2, private el: ElementRef, private dashboard: DashboardService) { }

  ngOnInit(): void {
    this.loadAIByFunction();
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
    if (!this.AIFunction || this.AIFunction.length === 0) {
      return;
    }

    const transitionStyle = 'height 0.7s ease-in-out';

    this.AIFunction.forEach((data) => {
      const elementId = this.formatId(data.Controlled_Function);
      const barElement = this.el.nativeElement.querySelector(`#${elementId}`);
      if (barElement) {
        const barHeight = `${(data.Total_AI / 150) * 100 + 10}%`;
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

  loadAIByFunction() {
    this.dashboard.getDashboardFirms(30).subscribe(
      (data) => {
        const resultSet2 = data.response.find((set: any) => set.key === 'ResultSet2');
        if (resultSet2) {
          this.AIFunction = resultSet2.value || [];
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