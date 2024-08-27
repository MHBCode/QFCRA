import { Component, OnInit, Input } from '@angular/core';
import { DashboardService } from 'src/app/ngServices/dashboard.service';

@Component({
  selector: 'app-reports-submissions',
  templateUrl: './reports-submissions.component.html',
  styleUrls: ['./reports-submissions.component.scss']
})

export class ReportsSubmissionsComponent {
  @Input() listCount: number = 50;
  ReportSubmissions: any[] = [];
  constructor(private dashboard: DashboardService) {}

  ngOnInit() {
    this.loadReportSubmissions()
   }

   loadReportSubmissions() {
      this.dashboard.getDashboardFirms(10044).subscribe((data) => {
        const resultSet4 = data.response.find((set: any) => set.key === 'ResultSet4');
        if (resultSet4) {
          this.ReportSubmissions = resultSet4.value || [];
        }
        console.log("resultset4: ",resultSet4);
      },
      (error) => {
        console.error('API Error:', error);
      } 
    );
   }
   
}
