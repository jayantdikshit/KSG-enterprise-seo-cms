"use client";
import React from "react";
import { motion } from "framer-motion";

interface Testimonial {
  _id?: string;
  customerName?: string;
  designation?: string;
  company?: string;
  image?: string;
  rating?: number;
  review?: string;
}

interface TestimonialsSectionProps {
  testimonials?: Testimonial[];
}

export default function TestimonialsSection({ testimonials }: TestimonialsSectionProps) {
  if (!testimonials || testimonials.length === 0) {
    return null;
  }

  return (
    <section className="testimonials-section" style={{ padding: "80px 0", backgroundColor: "#1e293b" }}>
      <div className="container" style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <h2 className="section-title text-center" style={{ fontSize: "2.5rem", fontWeight: "bold", marginBottom: "1rem", color: "#f8fafc" }}>
          What Our Clients Say
        </h2>
        <p className="section-subtitle text-center" style={{ color: "#cbd5e1", fontSize: "1.125rem", maxWidth: "600px", margin: "0 auto 3rem" }}>
          Trusted by businesses across commercial and industrial sectors.
        </p>

        <div className="testimonial-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2rem" }}>
          {testimonials.map((item, index) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="testimonial-card"
              key={item._id || index}
              style={{
                backgroundColor: "#334155",
                padding: "2rem",
                borderRadius: "1rem",
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.3)",
                position: "relative",
              }}
            >
              <div className="quote" style={{ fontSize: "4rem", color: "#16a34a", opacity: 0.2, position: "absolute", top: "1rem", left: "1rem", lineHeight: 1, fontFamily: "serif" }}>
                "
              </div>
              <p style={{ color: "#cbd5e1", fontSize: "1.125rem", lineHeight: 1.6, marginBottom: "1.5rem", position: "relative", zIndex: 1 }}>
                {item.review}
              </p>
              
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                {item.image ? (
                  <img src={item.image} alt={item.customerName} style={{ width: "50px", height: "50px", borderRadius: "50%", objectFit: "cover" }} />
                ) : (
                  <div style={{ width: "50px", height: "50px", borderRadius: "50%", backgroundColor: "#475569", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.25rem", fontWeight: "bold", color: "#cbd5e1" }}>
                    {item.customerName?.charAt(0) || "U"}
                  </div>
                )}
                <div>
                  <h4 style={{ fontSize: "1.125rem", fontWeight: "bold", color: "#f8fafc", margin: 0 }}>{item.customerName}</h4>
                  <span style={{ color: "#94a3b8", fontSize: "0.875rem" }}>
                    {item.designation} {item.designation && item.company && "-"} {item.company}
                  </span>
                </div>
              </div>
              
              {/* Optional Rating Stars */}
              {item.rating && (
                <div style={{ display: "flex", gap: "0.25rem", marginTop: "1rem", color: "#fbbf24" }}>
                  {[...Array(5)].map((_, i) => (
                    <span key={i} style={{ opacity: i < item.rating! ? 1 : 0.3 }}>★</span>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
