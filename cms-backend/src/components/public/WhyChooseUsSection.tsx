"use client";
import React from "react";
import { motion } from "framer-motion";

interface WhyChooseUsCard {
  _id?: string;
  icon?: string;
  title?: string;
  description?: string;
}

interface WhyChooseUsProps {
  data?: {
    heading?: string;
    subheading?: string;
    cards?: WhyChooseUsCard[];
  };
}

export default function WhyChooseUsSection({ data }: WhyChooseUsProps) {
  if (!data || (!data.heading && (!data.cards || data.cards.length === 0))) {
    return null;
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <section id="benefits" className="benefits-section" style={{ backgroundColor: "#0f172a", padding: "80px 0" }}>
      <div className="container">
        {data.heading && (
          <h2 className="section-title text-center" style={{ fontSize: "2.5rem", fontWeight: "bold", marginBottom: "1rem", color: "#f8fafc" }}>
            {data.heading}
          </h2>
        )}
        {data.subheading && (
          <p className="section-subtitle text-center" style={{ color: "#cbd5e1", fontSize: "1.125rem", maxWidth: "600px", margin: "0 auto 3rem" }}>
            {data.subheading}
          </p>
        )}

        {data.cards && data.cards.length > 0 && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="benefits-grid"
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "2rem" }}
          >
            {data.cards.map((card, index) => (
              <motion.div
                key={card._id || index}
                variants={itemVariants}
                className="benefit-card"
                style={{ backgroundColor: "#1e293b", padding: "2rem", borderRadius: "1rem", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.3)", textAlign: "center", transition: "transform 0.3s" }}
                whileHover={{ y: -10 }}
              >
                {card.icon && (
                  <div className="benefit-icon" style={{ display: "flex", justifyContent: "center", marginBottom: "1.5rem" }}>
                    <img src={card.icon} alt={card.title} style={{ width: "64px", height: "64px", objectFit: "contain" }} />
                  </div>
                )}
                {card.title && (
                  <h3 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "1rem", color: "#f8fafc", wordBreak: "break-word", overflowWrap: "anywhere" }}>
                    {card.title}
                  </h3>
                )}
                {card.description && (
                  <p style={{ color: "#cbd5e1", lineHeight: "1.6", wordBreak: "break-word", overflowWrap: "anywhere" }}>
                    {card.description}
                  </p>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}
