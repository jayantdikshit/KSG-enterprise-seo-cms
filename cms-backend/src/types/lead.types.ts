export interface CreateLeadDTO {
  name: string;
  email: string;
  phone: string;
  companyName?: string;
  message: string;
  captchaToken?: string;
}

export interface UpdateLeadDTO {
  name?: string;
  email?: string;
  phone?: string;
  companyName?: string;
  message?: string;
  status?: "NEW" | "CONTACTED" | "QUALIFIED" | "CLOSED";
}

export interface LeadDTO {
  _id: string;
  name: string;
  email: string;
  phone: string;
  companyName: string;
  message: string;
  status: "NEW" | "CONTACTED" | "QUALIFIED" | "CLOSED";
  ipAddress: string;
  userAgent: string;
  createdAt: string;
  updatedAt: string;
}
