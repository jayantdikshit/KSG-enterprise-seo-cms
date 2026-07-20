import mongoose from "mongoose";
import About from "../models/About";
import AuditLog from "../models/AuditLog";
import { connectDB } from "../lib/mongodb";
import { CreateAboutInput, UpdateAboutInput, teamMemberSchema, statisticSchema } from "../validators/about.validator";

export class AboutService {
  static async getAbout() {
    await connectDB();
    const about = await About.findOne();
    if (!about) {
      throw new Error("About page not found");
    }
    return about;
  }

  static async createAbout(
    data: CreateAboutInput,
    userId: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    await connectDB();

    const count = await About.countDocuments();
    if (count > 0) {
      throw new Error("About page configuration already exists. Use PUT to update.");
    }

    const about = await About.create(data);

    await AuditLog.create({
      userId: new mongoose.Types.ObjectId(userId),
      action: "CREATE",
      entity: "PAGE",
      entityId: about._id,
      newData: about.toObject(),
      ipAddress,
      userAgent,
      status: "SUCCESS",
      meta: { event: "ABOUT_CREATED" },
    });

    return about;
  }

  static async updateAbout(
    data: UpdateAboutInput,
    userId: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    await connectDB();

    const about = await About.findOne();
    if (!about) {
      throw new Error("About page not found");
    }

    const oldData = about.toObject();

    const updated = await About.findByIdAndUpdate(
      about._id,
      { $set: data },
      { new: true, runValidators: true }
    );

    await AuditLog.create({
      userId: new mongoose.Types.ObjectId(userId),
      action: "UPDATE",
      entity: "PAGE",
      entityId: about._id,
      oldData,
      newData: updated?.toObject(),
      ipAddress,
      userAgent,
      status: "SUCCESS",
      meta: { event: "ABOUT_UPDATED" },
    });

    return updated;
  }

  static async addTeamMember(
    memberData: unknown,
    userId: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    await connectDB();

    const about = await About.findOne();
    if (!about) {
      throw new Error("About page not found");
    }

    const oldData = about.toObject();
    about.teamMembers.push(memberData);
    const updated = await about.save();
    
    // Get the newly added team member (last item)
    const addedMember = updated.teamMembers[updated.teamMembers.length - 1];

    await AuditLog.create({
      userId: new mongoose.Types.ObjectId(userId),
      action: "UPDATE",
      entity: "PAGE",
      entityId: about._id,
      oldData,
      newData: updated.toObject(),
      ipAddress,
      userAgent,
      status: "SUCCESS",
      meta: { event: "TEAM_MEMBER_ADDED", memberId: addedMember._id },
    });

    return updated;
  }

  static async updateTeamMember(
    memberId: string,
    memberData: unknown,
    userId: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    await connectDB();

    const about = await About.findOne();
    if (!about) {
      throw new Error("About page not found");
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const member = (about.teamMembers as unknown as any).id(memberId);
    if (!member) {
      throw new Error("Team member not found");
    }

    const oldData = about.toObject();

    // Map properties
    Object.assign(member, memberData);

    const updated = await about.save();

    await AuditLog.create({
      userId: new mongoose.Types.ObjectId(userId),
      action: "UPDATE",
      entity: "PAGE",
      entityId: about._id,
      oldData,
      newData: updated.toObject(),
      ipAddress,
      userAgent,
      status: "SUCCESS",
      meta: { event: "TEAM_MEMBER_UPDATED", memberId },
    });

    return updated;
  }

  static async deleteTeamMember(
    memberId: string,
    userId: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    await connectDB();

    const about = await About.findOne();
    if (!about) {
      throw new Error("About page not found");
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const member = (about.teamMembers as unknown as any).id(memberId);
    if (!member) {
      throw new Error("Team member not found");
    }

    const oldData = about.toObject();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (about.teamMembers as unknown as any).pull(memberId);
    const updated = await about.save();

    await AuditLog.create({
      userId: new mongoose.Types.ObjectId(userId),
      action: "UPDATE",
      entity: "PAGE",
      entityId: about._id,
      oldData,
      newData: updated.toObject(),
      ipAddress,
      userAgent,
      status: "SUCCESS",
      meta: { event: "TEAM_MEMBER_DELETED", memberId },
    });

    return updated;
  }

  static async addStatistic(
    statData: unknown,
    userId: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    await connectDB();

    const about = await About.findOne();
    if (!about) {
      throw new Error("About page not found");
    }

    const oldData = about.toObject();
    about.statistics.push(statData);
    const updated = await about.save();

    // Get the newly added statistic
    const addedStat = updated.statistics[updated.statistics.length - 1];

    await AuditLog.create({
      userId: new mongoose.Types.ObjectId(userId),
      action: "UPDATE",
      entity: "PAGE",
      entityId: about._id,
      oldData,
      newData: updated.toObject(),
      ipAddress,
      userAgent,
      status: "SUCCESS",
      meta: { event: "STATISTIC_ADDED", statisticId: addedStat._id },
    });

    return updated;
  }

  static async updateStatistic(
    statId: string,
    statData: unknown,
    userId: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    await connectDB();

    const about = await About.findOne();
    if (!about) {
      throw new Error("About page not found");
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const stat = (about.statistics as unknown as any).id(statId);
    if (!stat) {
      throw new Error("Statistic not found");
    }

    const oldData = about.toObject();

    // Map properties
    Object.assign(stat, statData);

    const updated = await about.save();

    await AuditLog.create({
      userId: new mongoose.Types.ObjectId(userId),
      action: "UPDATE",
      entity: "PAGE",
      entityId: about._id,
      oldData,
      newData: updated.toObject(),
      ipAddress,
      userAgent,
      status: "SUCCESS",
      meta: { event: "STATISTIC_UPDATED", statisticId: statId },
    });

    return updated;
  }

  static async deleteStatistic(
    statId: string,
    userId: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    await connectDB();

    const about = await About.findOne();
    if (!about) {
      throw new Error("About page not found");
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const stat = (about.statistics as unknown as any).id(statId);
    if (!stat) {
      throw new Error("Statistic not found");
    }

    const oldData = about.toObject();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (about.statistics as unknown as any).pull(statId);
    const updated = await about.save();

    await AuditLog.create({
      userId: new mongoose.Types.ObjectId(userId),
      action: "UPDATE",
      entity: "PAGE",
      entityId: about._id,
      oldData,
      newData: updated.toObject(),
      ipAddress,
      userAgent,
      status: "SUCCESS",
      meta: { event: "STATISTIC_DELETED", statisticId: statId },
    });

    return updated;
  }

  static async uploadImages(
    urls: string[],
    userId: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    await connectDB();

    const about = await About.findOne();
    if (!about) {
      throw new Error("About page not found");
    }

    const oldData = about.toObject();
    about.images.push(...urls);
    const updated = await about.save();

    await AuditLog.create({
      userId: new mongoose.Types.ObjectId(userId),
      action: "UPDATE",
      entity: "PAGE",
      entityId: about._id,
      oldData,
      newData: updated.toObject(),
      ipAddress,
      userAgent,
      status: "SUCCESS",
      meta: { event: "ABOUT_IMAGE_ADDED", urls },
    });

    return updated;
  }

  static async deleteImage(
    index: number,
    userId: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    await connectDB();

    const about = await About.findOne();
    if (!about) {
      throw new Error("About page not found");
    }

    if (index < 0 || index >= about.images.length) {
      throw new Error("Invalid image index");
    }

    const oldData = about.toObject();
    const deletedUrl = about.images[index];
    about.images.splice(index, 1);
    const updated = await about.save();

    await AuditLog.create({
      userId: new mongoose.Types.ObjectId(userId),
      action: "UPDATE",
      entity: "PAGE",
      entityId: about._id,
      oldData,
      newData: updated.toObject(),
      ipAddress,
      userAgent,
      status: "SUCCESS",
      meta: { event: "ABOUT_IMAGE_DELETED", imageUrl: deletedUrl, index },
    });

    return updated;
  }
}

export default AboutService;
