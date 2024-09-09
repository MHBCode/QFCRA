// Constant variables
export const countries = "Countries";
export const qfcLicenseStatus = "v_LicenseStatus";
export const authorisationStatus = "v_AuthorizationStatus";
export const legalStatus = "v_FirmLegalStatusTypes";
export const FinYearEnd = "FirmFinYearEndTypes";
export const FinAccStd = "FinAccStdTypes";
export const firmAppTypes = "v_FirmApplicationType";
export const addressTypes = "v_EntityAddressTypes";
export const firmLevels = "UserRoleFirmTypes";
export const prudentialCategoryTypes = "PrudentialCategoryTypes";
export const authorisationCategoryTypes = "V_AuthorisationCategoryTypes";
export const PLACE_OF_INCORPORATION_QFC = "QFC"; 
export enum FirmLicenseApplStatusType
{
    Application = 4,
    Licensed = 5,
    ApplicationWithdrawn = 6,
    Rejected = 7,
    LicensedWithdrawn = 8,
    LicensedWithdrawnInvolunatary = 9
}
export enum FirmAuthorizationApplStatusType
{
    Application = 10,
    ApplicationWithdrawn = 11,
    Rejected = 12,
    Authorised = 13,
    AuthorisedWithdrawnVoluntary = 14,
    AuthorisedWithdrawnInvoluntary = 15
}