import Role from "../models/Role";

export const seedRoles = async () => {
  // Reset roles to make sure new permissions and roles are dynamically updated in DB
  await Role.deleteMany({});
  
  await Role.insertMany([
    {
      name: "SUPER_ADMIN",
      permissions: ["ALL"],
    },
    {
      name: "EDITOR",
      permissions: [
        "PAGES_READ",
        "PAGES_CREATE",
        "PAGES_UPDATE",
        "PAGES_DELETE",
        "BLOGS_READ",
        "BLOGS_CREATE",
        "BLOGS_UPDATE",
        "BLOGS_DELETE",
        "MEDIA_READ",
        "MEDIA_CREATE",
        "MEDIA_DELETE",
        "SERVICES_READ",
        "SERVICES_CREATE",
        "SERVICES_UPDATE",
        "SERVICES_DELETE",
      ],
    },
    {
      name: "MARKETING_MANAGER",
      permissions: [
        "SEO_READ",
        "SEO_CREATE",
        "SEO_UPDATE",
        "SEO_DELETE",
        "BLOGS_READ",
        "BLOGS_CREATE",
        "BLOGS_UPDATE",
        "BLOGS_DELETE",
        "LEADS_READ",
        "LEADS_CREATE",
        "LEADS_UPDATE",
        "LEADS_DELETE",
        "SERVICES_READ",
      ],
    },
    {
      name: "SEO_MANAGER",
      permissions: [
        "SEO_READ",
        "SEO_CREATE",
        "SEO_UPDATE",
        "SEO_DELETE",
      ],
    },
  ]);

  console.log("✅ Default roles created/updated");
};