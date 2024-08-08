import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FirmService } from 'src/app/ngServices/firm.service';

@Component({
  selector: 'app-edit-firm',
  templateUrl: './edit-firm.component.html',
  styleUrls: ['./edit-firm.component.scss']
})
export class EditFirmComponent implements OnInit {
  editFIRM: FormGroup;
  firmId: number = 0; 
  constructor(private fb: FormBuilder, private editRowService: FirmService,
    private router: Router,
    private route: ActivatedRoute,  // Inject ActivatedRoute
  ) {
    this.editFIRM = this.fb.group({
      firmID: [this.firmId], // not yet
      firmName: ['0'], //done
      qfcNum: ['0'], //done
      firmCode: ['0'], //done
      legalStatusTypeID: [0],
      qfcTradingName: ['0'], //done
      prevTradingName: ['0'],
      placeOfIncorporation: ['0'],
      countryOfIncorporation: [0],
      websiteAddress: ['0'],
      firmAppDate: ['0'], //done
      firmAppTypeID: [0],
      licenseStatusTypeID: [0],
      licenseDate: ['0'],
      authorisationStatusTypeID: [0],
      authorisationDate: ['0'],
      loginUserID: [0],
      finYearEndTypeID: [0]
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.firmId = +params['id'];  // Retrieve the firm ID from the route parameters
    });
  }

  onSubmitEditFirm(): void {
    const userId = 10044; // Replace with dynamic userId as needed
    this.editRowService.editFirm(userId, this.editFIRM.value).subscribe(response => {
      console.log('Row edited successfully:', response);
    }, error => {
      console.error('Error editing row:', error);
    });
  }
}
