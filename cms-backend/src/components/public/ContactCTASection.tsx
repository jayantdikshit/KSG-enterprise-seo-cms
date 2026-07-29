"use client";
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

interface ContactCTAProps {
  data?: {
    heading?: string;
    description?: string;
    buttonText?: string;
    buttonUrl?: string;
    backgroundImage?: string;
  };
}

export default function ContactCTASection({ data }: ContactCTAProps) {
  if (!data || (!data.heading && !data.description)) {
    return null;
  }

  const bgStyle = data.backgroundImage
    ? {
        backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.8), rgba(15, 23, 42, 0.9)), url(${data.backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    : {
        backgroundColor: "#0f172a", // Fallback dark blue
      };

  return (
    <section className="contact-cta-section" style={{ padding: "100px 0", ...bgStyle }}>
      <div className="container" style={{ textAlign: "center", maxWidth: "800px", margin: "0 auto" }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {data.heading && (
            <h2 style={{ fontSize: "3rem", fontWeight: "bold", color: "white", marginBottom: "1.5rem", lineHeight: 1.2 }}>
              {data.heading}
            </h2>
          )}
          {data.description && (
            <p style={{ fontSize: "1.25rem", color: "#cbd5e1", marginBottom: "2.5rem", lineHeight: 1.6 }}>
              {data.description}
            </p>
          )}
          {data.buttonText && data.buttonUrl && (
            <Link href={data.buttonUrl}>
              <span
                style={{
                  display: "inline-block",
                  backgroundColor: "#16a34a",
                  color: "white",
                  fontSize: "1.125rem",
                  fontWeight: 600,
                  padding: "1rem 2.5rem",
                  borderRadius: "9999px",
                  boxShadow: "0 10px 15px -3px rgba(22, 163, 74, 0.4)",
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                }}
                onMouseOver={(e) => {
                  (e.target as HTMLElement).style.backgroundColor = "#15803d";
                  (e.target as HTMLElement).style.transform = "translateY(-2px)";
                }}
                onMouseOut={(e) => {
                  (e.target as HTMLElement).style.backgroundColor = "#16a34a";
                  (e.target as HTMLElement).style.transform = "translateY(0)";
                }}
              >
                {data.buttonText}
              </span>
            </Link>
          )}
        </motion.div>
      </div>
    </section>
  );
}
