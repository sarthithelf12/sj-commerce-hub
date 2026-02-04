export interface CompanyInfo {
  name: string;
  address: string;
  gstin: string;
  pan: string;
  phone: string;
  email: string;
  state: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  ifsc: string;
  branch: string;
}

export const COMPANY_INFO: CompanyInfo = {
  name: "SJMART PRIVATE LIMITED",
  address: "Unit 1, Plot 63, Block L Darya Ganj Delhi-110002",
  gstin: "07ABPCS9776C1ZO",
  pan: "ABPCS9776C",
  phone: "9289622275",
  email: "SJMARTPL@GMAIL.COM",
  state: "Delhi",
  bankName: "ICICI BANK",
  accountName: "SJMART PRIVATE LIMITED",
  accountNumber: "706205500002",
  ifsc: "ICICI0007062",
  branch: "ICICI BANK/Noida"
};
