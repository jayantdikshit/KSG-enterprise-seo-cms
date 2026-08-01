"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

export default function PublicNavbar({ settings, headerMenu }: { settings?: any, headerMenu?: any }) {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const resolveUrl = (item: any) => {
    switch (item.type) {
      case "PAGE": return `/${item.pageId?.slug || ""}`;
      case "SERVICE": return `/services/${item.serviceId?.slug || ""}`;
      case "BLOG_CATEGORY": return `/blog/category/${item.blogCategoryId?.slug || ""}`;
      case "EXTERNAL":
      case "CUSTOM":
      default: return item.url || "#";
    }
  };

  const fallbackItems = [
    { _id: "1", label: "Home", type: "CUSTOM", url: "/" },
    { _id: "2", label: "About Us", type: "CUSTOM", url: "/about" },
    { _id: "3", label: "Services", type: "CUSTOM", url: "/services" },
    { _id: "4", label: "Blogs", type: "CUSTOM", url: "/blog" },
    { _id: "5", label: "Contact", type: "CUSTOM", url: "/contact" },
  ];

  let navItems = headerMenu?.items?.length > 0 
    ? headerMenu.items.filter((item: any) => item.isActive).sort((a: any, b: any) => a.order - b.order)
    : fallbackItems;

  // 100% Accuracy Fix: Force insert "Blogs" if it's missing from DB menu
  const hasBlogs = navItems.some((item: any) => item.label?.toLowerCase().includes('blog'));
  if (!hasBlogs) {
    // Find index of Contact or Login to insert before them
    const insertIndex = navItems.findIndex((item: any) => 
      item.label?.toLowerCase().includes('contact') || item.label?.toLowerCase().includes('login')
    );
    
    const blogItem = { _id: "blog-link-auto", label: "Blogs", type: "CUSTOM", url: "/blog", target: "_self", isActive: true };
    
    if (insertIndex !== -1) {
      navItems.splice(insertIndex, 0, blogItem);
    } else {
      navItems.push(blogItem);
    }
  }

  return (
    <div style={{
      position: "fixed",
      top: scrolled ? "15px" : "25px",
      left: 0,
      width: "100%",
      zIndex: 50,
      display: "flex",
      justifyContent: "center",
      pointerEvents: "none",
      transition: "top 0.4s ease"
    }}>
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        style={{
          width: "95%",
          maxWidth: "1200px",
          pointerEvents: "auto"
        }}
      >
        <div 
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: scrolled ? "12px 24px" : "15px 30px",
            borderRadius: "999px",
            backgroundColor: scrolled ? "rgba(15, 23, 42, 0.75)" : "rgba(15, 23, 42, 0.2)",
            backdropFilter: scrolled ? "blur(20px)" : "blur(10px)",
            WebkitBackdropFilter: scrolled ? "blur(20px)" : "blur(10px)",
            border: scrolled ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid rgba(255, 255, 255, 0.05)",
            boxShadow: scrolled ? "0 20px 40px -10px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)" : "none",
            transition: "all 0.4s ease"
          }}
        >
          {/* Logo */}
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "12px", textDecoration: "none" }}>
            <div style={{
              position: "relative",
              width: "46px", height: "46px",
              borderRadius: "50%", overflow: "hidden",
              boxShadow: "0 0 15px rgba(34,197,94,0.3)"
            }}>
              <Image
                src={settings?.logoUrl || "/logo.png"}
                alt={`${settings?.siteName || "KSG Energy"} Logo`}
                fill
                style={{ objectFit: "contain" }}
              />
            </div>
            <span style={{ 
              color: "#fff", 
              fontWeight: "800", 
              fontSize: "1.45rem",
              letterSpacing: "-0.5px"
            }}>
              {settings?.siteName || "KSG Energy"}
            </span>
          </Link>

          {/* Navigation Links */}
          <ul style={{ 
            display: "flex", 
            gap: "36px", 
            listStyle: "none", 
            margin: 0, 
            padding: 0,
            flexWrap: "wrap",
            alignItems: "center"
          }}>
            {navItems.map((item: any) => {
              const url = resolveUrl(item);
              const isActive = pathname === url || (url !== "/" && pathname.startsWith(url));
              
              return (
                <li key={item._id} style={{ position: "relative" }}>
                  <Link 
                    href={url} 
                    target={item.target || "_self"}
                    style={{
                      color: isActive ? "#4ADE80" : "#cbd5e1",
                      textDecoration: "none",
                      fontSize: "1.1rem",
                      fontWeight: isActive ? "600" : "500",
                      transition: "color 0.3s ease",
                      position: "relative",
                      display: "inline-block",
                      padding: "8px 0"
                    }}
                    onMouseEnter={(e) => {
                      (e.target as HTMLElement).style.color = "#fff";
                      const span = (e.target as HTMLElement).querySelector('span');
                      if (span) { span.style.width = "100%"; span.style.opacity = "1"; }
                    }}
                    onMouseLeave={(e) => {
                      (e.target as HTMLElement).style.color = isActive ? "#4ADE80" : "#cbd5e1";
                      const span = (e.target as HTMLElement).querySelector('span');
                      if (span) { span.style.width = isActive ? "100%" : "0%"; span.style.opacity = isActive ? "1" : "0"; }
                    }}
                  >
                    {item.label}
                    {/* Hover / Active underline */}
                    <span style={{
                      position: "absolute",
                      bottom: 0, left: 0,
                      height: "2px",
                      width: isActive ? "100%" : "0%",
                      opacity: isActive ? "1" : "0",
                      backgroundColor: "#4ADE80",
                      boxShadow: "0 0 10px rgba(74,222,128,0.8)",
                      transition: "all 0.3s ease",
                      borderRadius: "2px"
                    }} />
                  </Link>
                </li>
              );
            })}
            
            {/* Contact CTA Button */}
            <li style={{ marginLeft: "10px" }}>
              <Link href="/contact" style={{
                padding: "8px 24px",
                backgroundColor: "rgba(34, 197, 94, 0.15)",
                color: "#4ADE80",
                borderRadius: "999px",
                textDecoration: "none",
                fontSize: "0.9rem",
                fontWeight: "600",
                border: "1px solid rgba(34, 197, 94, 0.3)",
                transition: "all 0.3s ease",
                display: "inline-block"
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.backgroundColor = "rgba(34, 197, 94, 0.25)";
                (e.target as HTMLElement).style.boxShadow = "0 0 15px rgba(34, 197, 94, 0.4)";
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.backgroundColor = "rgba(34, 197, 94, 0.15)";
                (e.target as HTMLElement).style.boxShadow = "none";
              }}>
                Get a Quote
              </Link>
            </li>
          </ul>

        </div>
      </motion.nav>
    </div>
  );
}
