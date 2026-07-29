"use client";
import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";

interface HeroCTA {
  text?: string;
  url?: string;
}

interface HeroProps {
  data?: {
    headline?: string;
    subheadline?: string;
    backgroundImage?: string;
    backgroundMobileImage?: string;
    primaryCTA?: HeroCTA;
    secondaryCTA?: HeroCTA;
    videoUrl?: string;
  };
}

export default function HeroSection({ data }: HeroProps) {
  if (!data) return null;

  const bgImage = data.backgroundImage || "https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=1200";

  return (
    <section id="home" className="hero" style={{ 
      backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7)), url(${bgImage})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      position: "relative",
      minHeight: "100vh",
      display: "flex",
      alignItems: "center"
    }}>
      {/* Background Effects */}
      <div className="hero-bg-circle circle-1"></div>
      <div className="hero-bg-circle circle-2"></div>
      <div className="particle p1"></div>
      <div className="particle p2"></div>
      <div className="particle p3"></div>

      <div className="container hero-content" style={{ zIndex: 1, position: "relative" }}>
        {/* LEFT / CENTER */}
        <motion.div
          className="hero-left text-center md:text-left"
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
          style={{ maxWidth: "800px" }}
        >
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            style={{ color: "white", fontSize: "3.5rem", fontWeight: "bold", lineHeight: 1.2, marginBottom: "1.5rem" }}
          >
            {data.headline || "Welcome"}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            style={{ color: "#e2e8f0", fontSize: "1.25rem", marginBottom: "2.5rem", lineHeight: 1.6 }}
          >
            {data.subheadline}
          </motion.p>

          <div className="hero-buttons flex flex-wrap gap-4" style={{ display: "flex", gap: "1rem" }}>
            {data.primaryCTA?.text && data.primaryCTA?.url && (
              <Link href={data.primaryCTA.url}>
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(34,197,94,.6)" }}
                  className="primary-btn"
                  style={{ backgroundColor: "#16a34a", color: "white", padding: "1rem 2rem", borderRadius: "9999px", fontWeight: "bold", border: "none", cursor: "pointer" }}
                >
                  {data.primaryCTA.text}
                </motion.button>
              </Link>
            )}
            
            {data.secondaryCTA?.text && data.secondaryCTA?.url && (
              <Link href={data.secondaryCTA.url}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="secondary-btn"
                  style={{ backgroundColor: "transparent", color: "white", border: "2px solid white", padding: "1rem 2rem", borderRadius: "9999px", fontWeight: "bold", cursor: "pointer" }}
                >
                  {data.secondaryCTA.text}
                </motion.button>
              </Link>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
