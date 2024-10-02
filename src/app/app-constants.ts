// Constant variables
export const CorporateController = "V_ControllerType" ;
export const ControllerControlTypes = "ControllerControlTypes";
export const legalStatusController = "v_FirmLegalStatusTypesController" ;
export const AddressTypesController = "AddressTypes";
export const Title = "TitleTypes";
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
export const firmScopeTypes = "FirmScopeTypes";

export const firmAuditorName = "V_Firm_AuditorName";
export const firmAuditorType = "V_Firm_AuditorType";

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

export enum Firm_CoreDetails_Messages
{
    Authorisation = 8500,
    ENTER_LEGAL_STATUS = 8501,
    FIRMDETAILS_SAVED_SUCCESSFULLY = 8502,
    FIRMSAVEERROR = 8503,
    ENTER_FIRMNAME = 8504,
    FIRMEXIST = 8505,
    ENTER_QFCNUMBER = 8506,
    ENTER_NONBLANK_FIRMNAME_AS_IN_FACTSHEET = 8708,
    QFCNUMBEREXISTS = 8507,
    ENTER_VALID_WEBURL = 8508,

    CANNOT_LICENSE_UNTIL_SCOPE_IS_FINALIZED = 8509,
    CANNOT_AUTHORISE_UNTIL_SCOPE_IS_FINALIZED = 8510,
    ENSURE_SCOPE_FINALIZATION_FOR_LICENSE = 8511,
    ENSURE_SCOPE_FINALIZATION_FOR_AUTHORISATION = 8512,
    INVALID_QFCNUMBER = 8513,
    HTTP_APPENDING = 8514,
    ENTER_DATE_OF_APPLICATION = 8515,
    INVALID_DATE_OF_APPLICATION = 8516,
    CANCEL_FIRMDETAILS = 8517,
    ENTER_SUMMARY=9097,
    SELECT_FIRM=9098,
    PERSONAL_REMINDER_CREATED=90100,
    PERSONAL_REMINDER_UPDATED=90101,
    SELECT_SUPERVISIORS=9099,
    INCORPORATION_DATE_MSG =90102,
    INCORPORATION_DATE_MSG_ERROR = 90103,
    TWO_AUTHORISATION_STATUS_ON_SAME_DATE = 90104,
    SAME_AUTHORISATION_STATUS_ON_TWO_DATES = 90105,
    TWO_LICENSED_STATUS_ON_SAME_DATE = 90106,
    SAME_LICENSED_STATUS_ON_TWO_DATES = 90107
}

export enum AddressControlMessages
{
    SELECT_ADDRESSTYPE = 2290,
    DUPLICATE_ADDRESSTYPES = 2291,
    ENTER_VALIDPHONENUMBER = 2292,
    ENTER_VALIDFAXNUMBER = 2293,
    ENTERDATE_LESSTHAN_TODAY = 2294
}
export enum ControllerMessages
{
   ENTER_ALL_REQUIREDFIELDS = 4000,
   ENTER_VALID_EFFECTIVEDATE = 4001,
   ENTER_OTHER_ENTITY_NAME = 4003,
   ENTER_GREATER_CESSATION_DATE = 4004,
   SELECT_RECORD = 4005,
   RECORD_MODIFIED = 4006,
   RECORD_DELETED = 4007,
   RECORD_INSERTED = 4008,
   NO_RECORD = 4009,
   ENTER_VALID_BIRTHDATE = 4010,
   ENTER_VALID_PERCENTAGE = 4011,
   ENTER_PERCENTAGE_NOTEXCEED = 4012,
   ENTER_FIRSTNAME = 4013,
   ENTER_REGISTEREDNUMBERCORPORATE = 4014,
   SELECT_TYPEOFCONTROL = 4015,

}
export enum FirmActivitiesEnum
{
    ENTER_ALL_REQUIREDFIELDS = 3000,
    ENTER_VALID_SCOPEEFFECTIVEDATE = 3001,
    CORRECT_PERMITTEDACTIVITIES = 3002,
    ADD_PERMITTEDACTIVITIES = 3003,
    CORRECT_REGULATEDACTIVITIES = 3004,
    ADD_REGULATEDACTIVITIES = 3005,
    SELECT_ACTIVITIES = 3006,
    SELECT_SCOPETYPES = 3007,
    ENTER_VALID_EFFECTIVEDATE = 3008,
    SELECT_ATLEASTONE_PRODUCTS = 3009,
    SELECT_CATEGORY = 3010,
    AREUSURE_CANCELCHANGES = 3011,
    ACTIVITIES_SAVED_SUCCESSFULLY = 3012,
    LICENSED_SCOPE_DELETEDSUCCESSFULLY = 3013,
    AUTHORISED_SCOPE_DELETEDSUCCESSFULLY = 3014,
    DELETEAUTHORISEDSCOPE_BEFORE_LICENSEDSCOPE = 3015,
    DELETE_AIREFERNCEACTIVITY_BEFORE_DELETINGSCOPE = 3016,
    CREATE_LICENSEDSCOPE_BEFORE_AUTORISATIONSCOPE = 3017,
    ACTIVITY_ALREADY_SELECTED = 3018,
    SAVE_LICENSEDSCOPE_BEFORE_AUTORISATIONSCOPE = 3019,
    EXCEPTION_INSERTING_FORMREFERENCE = 3020,
    REVISION_LICENSEDSCOPE = 3021,
    REVISION_AUTHORISEDSCOPE = 3022,
    ENTER_PRUDENTIAL_EFFECTIVEDATE = 3023,
    ENTER_EFFECTIVEDATE_LATER_EARLIEREFFECTIVEDATE = 3024,
    TOCHANGEACTIVITY_DELETEAIREFERENCE = 3025,
    ENTER_VALID_DATE = 3026,
    ENTER_VALID_DATE_FORPRODUCTS = 3027,
    HIT_GETPRODUCTS = 3028,
    ENTER_SECTOR_EFFECTIVEDATE = 3029,
    ENTER_SECTOREFFECTIVEDATE_LATER_EARLIEREFFECTIVEDATE = 3030,
    AUTHORISEDDATEPASSED_CANNOTDESELECTPRODUCT = 3031,
    AISREFERENCE_WITHDRAWNFIRSTBEFORESCOPEWITHDRAWN = 3032,
    ONEORMOREPRODUCTAUTHORISED_CANNOTREMOVE = 3033,
    LICENSEDDATEPASSED_CANNOTREMOVE = 3034,
    WITHDRAWNDATEPASSED_CANNOTREMOVE = 3035,
    ENTER_VALID_APPLICATIONDATE = 3036,
    ENTER_EFFECTIVEDATE_LATER_APPLICATIONDATE = 3037,
    APPLICATIONDATECHANGED_REVISEDSCOPE = 3038,
    SELECT_ISLAMICFINANCE_TYPE = 3039,
    CHANGINGPRUDCAT_RESET_PRUDRETTYPE = 3040,
    SCOPECHANGED_SAVEORREVISE = 3041,
    PRODUCTREFINAIS_CANNOTDESELECT = 3042,
    DELETE_AIREFERNCE_BEFORE_DELETINGSCOPE = 3043,
    APPLICATIONDATE_LATER_COREDETAIL = 3044,
    UNSAVECHANGES_MSG=3045,
    DATEOFINCORPORATION_ERROR=3046,
    TREEVEIWMSG=3047,
    AUTHORISATIONCATEGORYSELECT = 3048,
}

export enum DocumentAttechment
{
    SelectDocumentType = 8000,
    saveDocument = 8001,
    selectDocument = 8002,

}

export enum InvoicesMessages
{
    INVOICE_AMOUNT = 10500,
    INVOICE_LIST = 10501,
    INVOICE_SELECT = 10502,
    INVOICE_SAVE = 10503,
    INVALID_DATA = 10504,
    INVOICES_SELECT_FRIMS = 10505,
    INVOICES_SELECT_INVOICESFOR = 10506,
    INVOICES_SELECT_NAME = 10507,
    INVOICES_INDIVIDULADATA = 10508,
    INOVICES_EDIT = 10509,
    INVOCIE_OFDATE = 10510,
    INVOICES_PAYMENT = 10511,
    INVOICES_EDITPAGE = 10512,
    INVOICE_DATA_SAVE = 10513,
    INVOICE_DATA_UPDATE = 10514,
    INVOICE_APPLICANTNAME_EXIST = 10515,
    INVOICES_UPDATED = 10516,
    INVOICES_FIRMCHECK = 10517,
    INVOICES_CONTACT = 10518,
    INVOICES_CONTACT_COUNTRY = 10519,
    INVOICES_EMAIL_HEADER = 10520,
    INVOICES_EMAIL_MESSAGES = 10521,
    INVOICES_WORKFLOWMESSAGE = 10522,
    INVOICES_EMAILCONFIRMATION = 10523,
    INVOICES_MESSGE=10524,
    INVOICE_CONFIRM=10525,
}

export enum EntityType
{
    Firm = 1,
    ParentEntity = 2,
    AuditingFirm = 3,
    HomeStateRegulator = 5,
    CorporateController = 6,
    SigShareholder = 7,
    UBO_Corporate=8,
    UBO_Individual=9,
   	Head_Office=10,
    IndividualController =11
}

export enum FrimsObject
{
    MainMenu = 0,
    OperationMenu = 40,
    FrimsMenu = 80,
    Breach = 400,
    BreachHistory = 401,
    BreachStatus = 402,
    Waiver = 440,
    WaiverHistory = 441,
    WaiverStatus = 442,
    FirmsReportLog = 480,
    Firm = 520,
    Scope = 524,
    Tasks = 560,
    LogForms = 600,
    Ais = 700,
    Invoices = 750,
    CoreDetail = 521,
    ParentEntity = 522,
    Contatcs = 523,
    Controller = 525,
    RegisteredFunds = 526,
    Auditor=527,
    CRO = 900,
    Supervision = 1000,
    Planning = 1001,
    RiskAssememnt = 1002,
    ReportingSchedule = 1004,
    ReturnsReview = 1005,
    PrudAnanlysis = 1006,
    AssignRoles = 1007,
    RMP = 1015,
    IndividualMenu = 90,
    AIDocs = 701,
    AIAssessment = 702,
    AIRecommendation = 703,
    AIMeetingNotes = 704,
    IndApplications = 705,
    IndPersonalInfo = 706,
    IndCredential = 707,
    IndFunctions = 708,
    IndFP = 709,
    IndOpenItems = 710,
    IndForumAgenda = 711,
    IndSLC = 712,
    Individual = 713,
    AppExtReferences = 1110,
    AIReview = 714,
    FSReporting = 1016,
    ALL = 9999,

    //Added By Suhail on 18-Mar-2011
    ReportingScheduleItem = 1026,
    LateAdminFee = 1027,
    PriorPostition=715,
    AINOC=717,
    AINOCRecommendation=718,
    AIStatusChange=719,
    GenralSubmission =100,
    AINOCInternalDocs=720,


    RptSchItemXBRL = 601, // By IRIS Report Schedule
    RptSchItemNonXBRL = 602, // By IRIS Report Schedule
    SupervisionJournal=529,
    Regulators =528,
    Notices =800,
    NoticesResponse=801,
    FIRMS_LN_Integration = 2004,
    Enforcement=530,
    ReportValidation =1060


}

export enum ObjectOpType
{
    Create = 40,
    Edit = 41,
    Delete = 42,
    List = 43,
    View = 44,
    Search = 45,
    Save = 46,
    Cancel = 47,
    StartWF = 48,
    Review = 49,
    CancelWF = 50,
    Revise = 51,
    Print = 52,
    ListView = 100
}
