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
  notes?: {
    content: string;
    author: string;
    createdAt?: string;
  }[];
}

export interface LeadDTO {
  _id: string;
  name: string;
  email: string;
  phone: string;
  companyName: string;
  message: string;
  status: "NEW" | "CONTACTED" | "QUALIFIED" | "CLOSED";
  notes?: {
    content: string;
    author: string;
    createdAt: string;
  }[];
  ipAddress: string;
  userAgent: string;
  createdAt: string;
  updatedAt: string;
}
