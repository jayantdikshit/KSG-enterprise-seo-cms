"use client";
import React from "react";
import Link from "next/link";
import { FaFacebookF, FaLinkedinIn, FaInstagram, FaTwitter, FaYoutube } from "react-icons/fa";

export default function PublicFooter({ settings, homeFooterData, quickLinksMenu, servicesMenu }: { settings?: any, homeFooterData?: any, quickLinksMenu?: any, servicesMenu?: any }) {
  const currentYear = new Date().getFullYear();

  // Prefer homeFooterData from HomePage model, fallback to global settings
  const siteName = settings?.siteName || "KSG Energy";
  const copyright = homeFooterData?.copyright || `© ${currentYear} ${siteName}. All Rights Reserved.`;
  const phone = homeFooterData?.phone || settings?.phone;
  const email = homeFooterData?.email || settings?.email;
  const address = homeFooterData?.address || settings?.address;
  const socialLinks = homeFooterData?.socialLinks || settings?.socialLinks || {};

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
    <footer className="footer">
      <div className="container footer-grid">
        {/* Company Info */}
        <div>
          <h2>{siteName}</h2>
          {address && <p>{address}</p>}
          {phone && <p style={{ marginTop: '10px' }}>📞 {phone}</p>}
          {email && <p>✉️ {email}</p>}
        </div>

        {/* Quick Links */}
        <div>
          <h4>{quickLinksMenu?.name || "Quick Links"}</h4>
          <ul>
            {quickLinksMenu?.items?.length > 0 ? (
              quickLinksMenu.items
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

        {/* Services Links */}
        <div>
          <h4>{servicesMenu?.name || "Services"}</h4>
          <ul>
            {servicesMenu?.items?.length > 0 ? (
              servicesMenu.items
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
              <>
                <li><Link href="/services/energy-audit">Energy Audit</Link></li>
                <li><Link href="/services/solar-solutions">Solar Solutions</Link></li>
                <li><Link href="/services/power-optimization">Power Optimization</Link></li>
                <li><Link href="/services/consulting">Consulting</Link></li>
              </>
            )}
          </ul>
        </div>

        {/* Social Media */}
        <div>
          <h4>Follow Us</h4>
          <div className="social-icons">
            {socialLinks.facebook && (
              <a href={socialLinks.facebook} target="_blank" rel="noreferrer" aria-label="Facebook">
                <FaFacebookF />
              </a>
            )}
            {socialLinks.linkedin && (
              <a href={socialLinks.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn">
                <FaLinkedinIn />
              </a>
            )}
            {socialLinks.instagram && (
              <a href={socialLinks.instagram} target="_blank" rel="noreferrer" aria-label="Instagram">
                <FaInstagram />
              </a>
            )}
            {socialLinks.twitter && (
              <a href={socialLinks.twitter} target="_blank" rel="noreferrer" aria-label="Twitter">
                <FaTwitter />
              </a>
            )}
            {socialLinks.youtube && (
              <a href={socialLinks.youtube} target="_blank" rel="noreferrer" aria-label="YouTube">
                <FaYoutube />
              </a>
            )}
            
            {/* Fallback if no social links at all */}
            {!socialLinks.facebook && !socialLinks.linkedin && !socialLinks.twitter && !socialLinks.instagram && !socialLinks.youtube && (
              <p style={{ fontSize: "0.875rem", opacity: 0.7 }}>No social links configured.</p>
            )}
          </div>
        </div>
      </div>

      <div className="copyright">
        {copyright}
      </div>
    </footer>
  );
}
