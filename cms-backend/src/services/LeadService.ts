import mongoose from "mongoose";
import Lead from "../models/Lead";
import AuditLog from "../models/AuditLog";
import { connectDB } from "../lib/mongodb";
import { CreateLeadDTO, UpdateLeadDTO } from "../types/lead.types";
import nodemailer from "nodemailer";

function getMailTransporter() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    console.warn("⚠️ SMTP credentials not fully configured. Email notifications will be skipped.");
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function sendAdminNotification(lead: any) {
  const transporter = getMailTransporter();
  if (!transporter) return;

  const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER;
  const fromEmail = process.env.SMTP_FROM || process.env.SMTP_USER;

  const mailOptions = {
    from: `"CMS Lead System" <${fromEmail}>`,
    to: adminEmail,
    subject: `New Lead Received: ${lead.name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #ffffff;">
        <h2 style="color: #0056b3; border-bottom: 2px solid #0056b3; padding-bottom: 10px; margin-top: 0;">New Lead Submission</h2>
        <p style="color: #555; font-size: 15px; line-height: 1.5;">A new lead has been submitted through the contact form:</p>
        <table style="width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 14px; color: #333;">
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; width: 30%; background-color: #fcfcfc;">Name:</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${lead.name}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; background-color: #fcfcfc;">Email:</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;"><a href="mailto:${lead.email}" style="color: #0056b3; text-decoration: none;">${lead.email}</a></td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; background-color: #fcfcfc;">Phone:</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${lead.phone}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; background-color: #fcfcfc;">Company:</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${lead.companyName || "N/A"}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; background-color: #fcfcfc;">Submitted At:</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${new Date(lead.createdAt).toLocaleString()}</td>
          </tr>
        </table>
        <div style="margin-top: 20px; padding: 15px; background-color: #f9f9f9; border-left: 4px solid #0056b3; border-radius: 4px;">
          <h4 style="margin-top: 0; margin-bottom: 10px; color: #333; font-size: 14px;">Message:</h4>
          <p style="margin: 0; white-space: pre-wrap; line-height: 1.5; color: #555; font-size: 14px;">${lead.message}</p>
        </div>
        <p style="margin-top: 25px; font-size: 11px; color: #999; text-align: center; border-top: 1px solid #eee; padding-top: 15px;">
          This is an automated notification from the CMS Lead Management System.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending admin email notification:", error);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function sendUserNotification(lead: any) {
  const transporter = getMailTransporter();
  if (!transporter) return;

  const fromEmail = process.env.SMTP_FROM || process.env.SMTP_USER;

  const mailOptions = {
    from: `"CMS Contact Team" <${fromEmail}>`,
    to: lead.email,
    subject: `Thank you for contacting us, ${lead.name}!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #ffffff;">
        <h2 style="color: #28a745; text-align: center; margin-top: 0;">Thank You for Reaching Out!</h2>
        <p style="color: #333; font-size: 15px; line-height: 1.5;">Dear ${lead.name},</p>
        <p style="color: #555; font-size: 14px; line-height: 1.5;">We have successfully received your message and our team will get in touch with you shortly.</p>
        <div style="margin: 20px 0; padding: 15px; background-color: #f9f9f9; border-radius: 4px; border-top: 2px solid #28a745;">
          <h4 style="margin-top: 0; color: #333; font-size: 14px;">Summary of your message:</h4>
          <p style="margin: 0; color: #555; white-space: pre-wrap; font-size: 14px; line-height: 1.5;">${lead.message}</p>
        </div>
        <p style="color: #555; font-size: 14px;">Best regards,<br>The Contact Team</p>
        <p style="margin-top: 25px; font-size: 11px; color: #999; text-align: center; border-top: 1px solid #eee; padding-top: 15px;">
          You received this email because you submitted a contact request on our website.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending user email confirmation:", error);
  }
}

export class LeadService {
  static async createLead(
    data: CreateLeadDTO,
    ipAddress?: string,
    userAgent?: string
  ) {
    await connectDB();

    const lead = await Lead.create({
      name: data.name,
      email: data.email,
      phone: data.phone,
      companyName: data.companyName,
      message: data.message,
      ipAddress: ipAddress || "unknown",
      userAgent: userAgent || "unknown",
      status: "NEW",
    });

    // Create Audit Log without authenticated user ID (public form submission)
    await AuditLog.create({
      userId: null,
      action: "CREATE",
      entity: "LEAD",
      entityId: lead._id,
      newData: lead.toObject(),
      ipAddress,
      userAgent,
      status: "SUCCESS",
      meta: { event: "LEAD_CREATED" },
    });

    // Send email notifications asynchronously
    sendAdminNotification(lead).catch(console.error);
    sendUserNotification(lead).catch(console.error);

    return lead;
  }

  static async getLeads(
    page: number = 1,
    limit: number = 10,
    search?: string,
    status?: string
  ) {
    await connectDB();
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { companyName: { $regex: search, $options: "i" } },
        { message: { $regex: search, $options: "i" } },
      ];
    }

    if (status && ["NEW", "CONTACTED", "QUALIFIED", "CLOSED"].includes(status.toUpperCase())) {
      query.status = status.toUpperCase();
    }

    const leads = await Lead.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Lead.countDocuments(query);

    return {
      data: leads,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  static async getLeadById(id: string) {
    await connectDB();
    const lead = await Lead.findById(id);
    if (!lead) {
      throw new Error("Lead not found");
    }
    return lead;
  }

  static async updateLead(
    id: string,
    data: UpdateLeadDTO,
    userId: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    await connectDB();

    const lead = await Lead.findById(id);
    if (!lead) {
      throw new Error("Lead not found");
    }

    const oldData = lead.toObject();

    const updated = await Lead.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    );

    // Audit logs for update vs status change
    const isStatusOnly = Object.keys(data).length === 1 && data.status !== undefined;
    const event = isStatusOnly ? "LEAD_STATUS_CHANGED" : "LEAD_UPDATED";

    await AuditLog.create({
      userId: new mongoose.Types.ObjectId(userId),
      action: "UPDATE",
      entity: "LEAD",
      entityId: lead._id,
      oldData,
      newData: updated?.toObject(),
      ipAddress,
      userAgent,
      status: "SUCCESS",
      meta: { event },
    });

    return updated;
  }

  static async updateLeadStatus(
    id: string,
    status: "NEW" | "CONTACTED" | "QUALIFIED" | "CLOSED",
    userId: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    return this.updateLead(id, { status }, userId, ipAddress, userAgent);
  }

  static async deleteLead(
    id: string,
    userId: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    await connectDB();

    const lead = await Lead.findById(id);
    if (!lead) {
      throw new Error("Lead not found");
    }

    const deleted = await Lead.findByIdAndDelete(id);

    await AuditLog.create({
      userId: new mongoose.Types.ObjectId(userId),
      action: "DELETE",
      entity: "LEAD",
      entityId: lead._id,
      oldData: lead.toObject(),
      ipAddress,
      userAgent,
      status: "SUCCESS",
      meta: { event: "LEAD_DELETED" },
    });

    return deleted;
  }

  static async exportCSV(
    userId: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    await connectDB();
    const leads = await Lead.find().sort({ createdAt: -1 });

    const headers = ["ID", "Name", "Email", "Phone", "Company Name", "Message", "Status", "IP Address", "User Agent", "Created At"];
    const rows = [headers.join(",")];

    for (const lead of leads) {
      const row = [
        lead._id.toString(),
        `"${lead.name.replace(/"/g, '""')}"`,
        `"${lead.email.replace(/"/g, '""')}"`,
        `"${lead.phone.replace(/"/g, '""')}"`,
        `"${(lead.companyName || "").replace(/"/g, '""')}"`,
        `"${lead.message.replace(/"/g, '""').replace(/\r?\n/g, " ")}"`,
        lead.status,
        lead.ipAddress || "",
        `"${(lead.userAgent || "").replace(/"/g, '""')}"`,
        lead.createdAt.toISOString(),
      ];
      rows.push(row.join(","));
    }

    const csvContent = rows.join("\n");

    await AuditLog.create({
      userId: new mongoose.Types.ObjectId(userId),
      action: "UPDATE",
      entity: "LEAD",
      entityId: new mongoose.Types.ObjectId("000000000000000000000000"), // Dummy object ID for CSV export log
      newData: { event: "CSV_EXPORTED", count: leads.length },
      ipAddress,
      userAgent,
      status: "SUCCESS",
      meta: { event: "CSV_EXPORTED" },
    });

    return csvContent;
  }
}

export default LeadService;
