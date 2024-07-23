import { Component, OnInit } from '@angular/core';
import { DashboardService } from 'src/app/ngServices/dashboard.service';

@Component({
  selector: 'app-statistics-header',
  templateUrl: './statistics-header.component.html',
  styleUrls: ['./statistics-header.component.scss']
})
export class StatisticsHeaderComponent implements OnInit {
  statisticsDB: any = {}; // Change to an object for better data structure management

  constructor(private dashboard: DashboardService) {}

  ngOnInit() {
    this.loadDashboardStatistics();
  }

  loadDashboardStatistics() {
    this.dashboard.getDashboardFirms(30).subscribe(data => {
      if (data.isSuccess && data.response.length > 0) {
        const resultSet1 = data.response.find((item: { key: string; }) => item.key === 'ResultSet1');
        if (resultSet1 && resultSet1.value.length > 0) {
          this.statisticsDB = resultSet1.value[0]; // Extract the first item from ResultSet1
        }
      }
    },
    error => {
      console.error('Error fetching statisticsDB', error);
    });
  }
}
