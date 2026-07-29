import mongoose from "mongoose";
import Menu from "../models/Menu";
import AuditLog from "../models/AuditLog";
import { connectDB } from "../lib/mongodb";
import { CreateMenuDTO, UpdateMenuDTO } from "../types/menu.types";
// Register schemas for population relationships
import "../models/Page";
import "../models/Service";
import "../models/BlogCategory";

export class MenuService {
  static async createMenu(
    data: CreateMenuDTO,
    userId: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    await connectDB();

    // Auto-unassign location from any existing menu to prevent 409 Conflict
    if (data.location) {
      const locLower = data.location.toLowerCase().trim();
      await Menu.updateMany({ location: locLower }, { $set: { location: null } });
    }

    const menu = await Menu.create({
      ...data,
      location: data.location ? data.location.toLowerCase().trim() : null,
      createdBy: new mongoose.Types.ObjectId(userId),
    });

    await AuditLog.create({
      userId: new mongoose.Types.ObjectId(userId),
      action: "CREATE",
      entity: "PAGE", // fallback entity group since MENU fits content architecture
      entityId: menu._id,
      newData: menu.toObject(),
      ipAddress,
      userAgent,
      status: "SUCCESS",
    });

    return menu;
  }

  static async updateMenu(
    menuId: string,
    data: UpdateMenuDTO,
    userId: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    await connectDB();

    const menu = await Menu.findById(menuId);
    if (!menu) {
      throw new Error("Menu not found");
    }

    // Auto-unassign location from any existing menu to prevent 409 Conflict
    if (data.location) {
      const locLower = data.location.toLowerCase().trim();
      await Menu.updateMany(
        { location: locLower, _id: { $ne: menuId } },
        { $set: { location: null } }
      );
    }

    const oldData = menu.toObject();

    // Normalize location to lowercase or null if omitted/empty
    const updatePayload: any = {
      ...data,
      updatedBy: new mongoose.Types.ObjectId(userId),
    };
    if (data.location !== undefined) {
      updatePayload.location = data.location ? data.location.toLowerCase().trim() : null;
    }

    const updatedMenu = await Menu.findByIdAndUpdate(
      menuId,
      updatePayload,
      { new: true }
    );

    await AuditLog.create({
      userId: new mongoose.Types.ObjectId(userId),
      action: "UPDATE",
      entity: "PAGE",
      entityId: menuId,
      oldData,
      newData: updatedMenu?.toObject(),
      ipAddress,
      userAgent,
      status: "SUCCESS",
    });

    return updatedMenu;
  }

  static async deleteMenu(
    menuId: string,
    userId: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    await connectDB();

    const menu = await Menu.findById(menuId);
    if (!menu) {
      throw new Error("Menu not found");
    }

    const deletedMenu = await Menu.findByIdAndDelete(menuId);

    await AuditLog.create({
      userId: new mongoose.Types.ObjectId(userId),
      action: "DELETE",
      entity: "PAGE",
      entityId: menuId,
      oldData: menu.toObject(),
      ipAddress,
      userAgent,
      status: "SUCCESS",
    });

    return deletedMenu;
  }

  static async getMenuById(menuId: string) {
    await connectDB();
    const menu = await Menu.findById(menuId)
      .populate("items.pageId", "title slug")
      .populate("items.serviceId", "name slug")
      .populate("items.blogCategoryId", "name slug")
      .populate("createdBy updatedBy", "name email");

    if (!menu) {
      throw new Error("Menu not found");
    }
    return menu;
  }

  static async getMenuByLocation(location: string) {
    await connectDB();
    const locLower = location.toLowerCase().trim();
    const menu = await Menu.findOne({ location: locLower })
      .populate("items.pageId", "title slug")
      .populate("items.serviceId", "name slug")
      .populate("items.blogCategoryId", "name slug")
      .populate("createdBy updatedBy", "name email");

    if (!menu) {
      throw new Error(`Menu not found for location '${location}'`);
    }
    return menu;
  }

  static async getAllMenus() {
    await connectDB();
    return await Menu.find({})
      .sort({ createdAt: -1 })
      .populate("createdBy updatedBy", "name email");
  }

  static async reorderMenuItems(
    menuId: string,
    itemsOrder: Array<{ itemId: string; order: number; parentId?: string | null }>,
    userId: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    await connectDB();

    const menu = await Menu.findById(menuId);
    if (!menu) {
      throw new Error("Menu not found");
    }

    const oldData = menu.toObject();

    // Iterate and update each sub-document
    for (const update of itemsOrder) {
      const item = (menu.items as any).id(update.itemId);
      if (item) {
        item.order = update.order;
        if (update.parentId !== undefined) {
          item.parentId = update.parentId ? new mongoose.Types.ObjectId(update.parentId) : null;
        }
      }
    }

    const updatedMenu = await menu.save();

    await AuditLog.create({
      userId: new mongoose.Types.ObjectId(userId),
      action: "UPDATE",
      entity: "PAGE",
      entityId: menuId,
      oldData,
      newData: updatedMenu.toObject(),
      ipAddress,
      userAgent,
      status: "SUCCESS",
      meta: { event: "MENU_ITEMS_REORDERED" },
    });

    return updatedMenu;
  }

  static async toggleMenuItem(
    menuId: string,
    itemId: string,
    isActive: boolean,
    userId: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    await connectDB();

    const menu = await Menu.findById(menuId);
    if (!menu) {
      throw new Error("Menu not found");
    }

    const item = (menu.items as any).id(itemId);
    if (!item) {
      throw new Error("Menu item not found");
    }

    const oldData = menu.toObject();
    item.isActive = isActive;
    const updatedMenu = await menu.save();

    await AuditLog.create({
      userId: new mongoose.Types.ObjectId(userId),
      action: "UPDATE",
      entity: "PAGE",
      entityId: menuId,
      oldData,
      newData: updatedMenu.toObject(),
      ipAddress,
      userAgent,
      status: "SUCCESS",
      meta: { event: "MENU_ITEM_TOGGLED", itemId, isActive },
    });

    return updatedMenu;
  }
}

export default MenuService;
