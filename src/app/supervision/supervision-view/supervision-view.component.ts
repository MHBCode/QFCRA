import { Component } from '@angular/core';

@Component({
  selector: 'app-supervision-view',
  templateUrl: './supervision-view.component.html',
  styleUrls: ['./supervision-view.component.scss', '../supervision.scss']
})
export class SupervisionViewComponent {
  callSupervisionCategory: boolean = false;
  callOperationalData: boolean = false;
  callCreditRatingsSovereign: boolean = false;
  callCreditRatings: boolean = false;
  constructor() {

  }

  getSupervisionCategory() {
    this.callSupervisionCategory = true;
    setTimeout(() => {
      const popupWrapper = document.querySelector('.popup-wrapper') as HTMLElement;
      if (popupWrapper) {
        popupWrapper.style.display = 'flex';
      } else {
        console.error('Element with class .popup-wrapper not found');
      }
    }, 0);
  }

  closeCategoryPopup() {
    this.callSupervisionCategory = false;
    const popupWrapper = document.querySelector('.popup-wrapper') as HTMLElement;
    if (popupWrapper) {
      popupWrapper.style.display = 'none';
    } else {
      console.error('Element with class .popup-wrapper not found');
    }
  }


  getOperationalData() {
    this.callOperationalData = true;
    setTimeout(() => {
      const popupWrapper = document.querySelector('.OperationalData') as HTMLElement;
      if (popupWrapper) {
        popupWrapper.style.display = 'flex';
      } else {
        console.error('Element with class .OperationalData not found');
      }
    }, 0);
  }

  closeOperationalDataPopup() {
    this.callOperationalData = false;
    const popupWrapper = document.querySelector('.OperationalData') as HTMLElement;
    if (popupWrapper) {
      popupWrapper.style.display = 'none';
    } else {
      console.error('Element with class .OperationalData not found');
    }
  }




  getCreditRatingsSovereignData() {
    this.callCreditRatingsSovereign = true;
    setTimeout(() => {
      const popupWrapper = document.querySelector('.CreditRatingsSovereign') as HTMLElement;
      if (popupWrapper) {
        popupWrapper.style.display = 'flex';
      } else {
        console.error('Element with class .CreditRatingsSovereign not found');
      }
    }, 0);
  }

  closeCreditRatingsSovereignPopup() {
    this.callCreditRatingsSovereign = false;
    const popupWrapper = document.querySelector('.CreditRatingsSovereign') as HTMLElement;
    if (popupWrapper) {
      popupWrapper.style.display = 'none';
    } else {
      console.error('Element with class .CreditRatingsSovereign not found');
    }
  }


  getCreditRatingsData() {
    this.callCreditRatings = true;
    setTimeout(() => {
      const popupWrapper = document.querySelector('.CreditRatings') as HTMLElement;
      if (popupWrapper) {
        popupWrapper.style.display = 'flex';
      } else {
        console.error('Element with class .CreditRatings not found');
      }
    }, 0);
  }

  closeCreditRatingsPopup() {
    this.callCreditRatings= false;
    const popupWrapper = document.querySelector('.CreditRatings') as HTMLElement;
    if (popupWrapper) {
      popupWrapper.style.display = 'none';
    } else {
      console.error('Element with class .CreditRatings not found');
    }
  }
}
