"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function PublicNavbar({ settings, headerMenu }: { settings?: any, headerMenu?: any }) {
  const router = useRouter();

  const resolveUrl = (item: any) => {
    switch (item.type) {
      case "PAGE":
        return `/${item.pageId?.slug || ""}`;
      case "SERVICE":
        return `/services/${item.serviceId?.slug || ""}`;
      case "BLOG_CATEGORY":
        return `/blog/category/${item.blogCategoryId?.slug || ""}`;
      case "EXTERNAL":
      case "CUSTOM":
      default:
        return item.url || "#";
    }
  };

  return (
    <nav className="navbar">
      <div className="container nav-wrapper">
        {/* Logo */}
        <Link href="/" className="logo">
          <Image
            src={settings?.logoUrl || "/logo.png"}
            alt={`${settings?.siteName || "KSG Energy"} Logo`}
            width={40}
            height={40}
            className="logo-img"
          />
          <div className="logo-text">
            <span>{settings?.siteName || "KSG Energy"}</span>
          </div>
        </Link>

        {/* Navigation */}
        <ul className="nav-links">
          {headerMenu?.items?.length > 0 ? (
            headerMenu.items
              .filter((item: any) => item.isActive)
              .sort((a: any, b: any) => a.order - b.order)
              .map((item: any) => (
                <li key={item._id}>
                  <Link href={resolveUrl(item)} target={item.target || "_self"}>
                    {item.label}
                  </Link>
                </li>
              ))
          ) : (
            // Fallback if no header menu is configured
            <>
              <li><Link href="/">Home</Link></li>
              <li><Link href="/about">About</Link></li>
              <li><Link href="/services">Services</Link></li>
              <li><Link href="/products">Products</Link></li>
              <li><Link href="/contact">Contact</Link></li>
            </>
          )}
        </ul>

      </div>
    </nav>
  );
}
