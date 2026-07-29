"use client";
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

interface HomeAboutProps {
  data?: {
    heading?: string;
    description?: string;
    image?: string;
    buttonText?: string;
    buttonUrl?: string;
  };
}

export default function HomeAboutSection({ data }: HomeAboutProps) {
  if (!data || (!data.heading && !data.description && !data.image)) {
    return null; // Don't render if no data
  }

  return (
    <section className="about-section" style={{ padding: "80px 0", backgroundColor: "#0f172a" }}>
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem', alignItems: 'center' }}>
          {/* Left: Image */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="about-image-wrapper relative"
          >
            {data.image ? (
              <img
                src={data.image}
                alt={data.heading || "About Us"}
                style={{ width: "100%", height: "auto", maxHeight: "500px", objectFit: "cover", borderRadius: "1rem", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
              />
            ) : (
              <div
                style={{ backgroundColor: "#334155", display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "400px", borderRadius: "1rem" }}
              >
                <span style={{ color: "#9ca3af" }}>No Image Provided</span>
              </div>
            )}
          </motion.div>

          {/* Right: Content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {data.heading && (
              <h2 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "1.5rem", color: "#f8fafc", lineHeight: 1.2 }}>
                {data.heading}
              </h2>
            )}
            
            {data.description && (
              <div
                style={{ color: "#cbd5e1", marginBottom: "2rem", fontSize: "1.125rem", lineHeight: 1.75, whiteSpace: "pre-line" }}
              >
                {data.description}
              </div>
            )}

            {data.buttonText && data.buttonUrl && (
              <Link href={data.buttonUrl}>
                <span className="primary-btn" style={{ display: "inline-block", backgroundColor: "#16a34a", color: "white", fontWeight: 500, padding: "0.75rem 2rem", borderRadius: "9999px", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)", transition: "all 0.3s", cursor: "pointer" }}>
                  {data.buttonText}
                </span>
              </Link>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
