"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaChevronDown } from "react-icons/fa";

interface FAQItem {
  _id?: string;
  question?: string;
  answer?: string;
}

interface FAQSectionProps {
  data?: FAQItem[];
}

export default function FAQSection({ data }: FAQSectionProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return null;
  }

  const toggleAccordion = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section className="faq-section" style={{ padding: "80px 0", backgroundColor: "#0f172a" }}>
      <div className="container" style={{ maxWidth: "800px", margin: "0 auto" }}>
        <h2 className="section-title text-center" style={{ fontSize: "2.5rem", fontWeight: "bold", marginBottom: "3rem", color: "#f8fafc" }}>
          Frequently Asked Questions
        </h2>

        <div className="faq-container" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {data.map((faq, index) => (
            <motion.div
              key={faq._id || index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              style={{
                border: "1px solid #334155",
                borderRadius: "0.75rem",
                overflow: "hidden",
                backgroundColor: activeIndex === index ? "#334155" : "#1e293b",
                transition: "background-color 0.3s",
              }}
            >
              <button
                onClick={() => toggleAccordion(index)}
                style={{
                  width: "100%",
                  padding: "1.5rem",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <span style={{ fontSize: "1.125rem", fontWeight: "600", color: "#f8fafc", paddingRight: "1rem" }}>
                  {faq.question}
                </span>
                <motion.div
                  animate={{ rotate: activeIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <FaChevronDown style={{ color: "#94a3b8" }} />
                </motion.div>
              </button>

              <AnimatePresence>
                {activeIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div style={{ padding: "0 1.5rem 1.5rem", color: "#cbd5e1", lineHeight: "1.7" }}>
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
