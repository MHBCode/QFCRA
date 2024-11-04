import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NoticeService } from 'src/app/ngServices/notice.service';

@Component({
  selector: 'app-notices',
  templateUrl: './notices.component.html',
  styleUrls: ['./notices.component.scss','../supervision.scss']
})
export class NoticesComponent implements OnInit{
  FIRMNotices: any;
  firmId: number = 0;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private noticeService: NoticeService
  ) {

  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.firmId = +params['id'];
      this.loadNotices();
    })
  }

  loadNotices() {
    this.noticeService.getNotices(this.firmId).subscribe(
      data => {
        this.FIRMNotices = data.response;
      },
      error => {
        console.error('Error fetching FIRMNotices ', error);
      }
    );
  }

}
