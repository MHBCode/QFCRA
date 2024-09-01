export interface Address {
    AddressID: string;
    AddressLine1: string;
    AddressLine2: string;
    City: string;
    Province: string;
    PostalCode: string;
    PhoneNumber: string;
    FaxNumber: string;
    AddressTypeID: number;
    CountryID: number;
    LastModifiedBy: number;
    LastModifiedDate: Date;
    //addressState: AddressState;
    ShowEditEnabled: boolean;
    ShowEnabled: boolean;
    ShowReadOnly: boolean;
    FromDate: string;
    ToDate: string;
    Valid: boolean;
    isNew?: boolean;
  }