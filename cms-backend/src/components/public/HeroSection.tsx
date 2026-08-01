"use client";
import React, { useEffect, useState } from "react";
import { motion, useAnimation } from "framer-motion";
import Link from "next/link";
import { FaArrowRight } from "react-icons/fa";

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

// Framer Motion Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, filter: "blur(10px)" },
  visible: { 
    opacity: 1, 
    y: 0, 
    filter: "blur(0px)",
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } 
  },
};

export default function HeroSection({ data }: HeroProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const controls = useAnimation();

  useEffect(() => {
    controls.start("visible");
    
    // Dynamic light tracking mouse
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX,
        y: e.clientY,
      });
    };
    
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [controls]);

  if (!data) return null;

  const bgImage = data.backgroundImage || "https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=2000";
  const headline = data.headline || "Powering the Future with Smart Energy Solutions";
  
  // Format headline to highlight "Energy"
  const formattedHeadline = headline.split(' ').map((word, i) => {
    if (word.toLowerCase().includes('energy')) {
      return (
        <span key={i} style={{
          background: "linear-gradient(90deg, #4ADE80 0%, #22C55E 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          display: "inline-block",
          textShadow: "0 0 40px rgba(34, 197, 94, 0.4)",
          fontWeight: "800"
        }}>
          {word}&nbsp;
        </span>
      );
    }
    return <span key={i}>{word}&nbsp;</span>;
  });

  return (
    <section id="home" style={{ 
      position: "relative",
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      overflow: "hidden",
      backgroundColor: "#050816"
    }}>
      {/* 1. Base Image with slow zoom */}
      <motion.div 
        initial={{ scale: 1 }}
        animate={{ scale: 1.05 }}
        transition={{ duration: 20, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
        style={{
          position: "absolute", inset: 0,
          backgroundImage: `url(${bgImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          zIndex: 0
        }}
      />

      {/* 2. Dark Overlay & Gradients */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(to right, rgba(5,8,22,0.9) 0%, rgba(5,8,22,0.7) 50%, rgba(5,8,22,0.85) 100%)",
        zIndex: 1
      }} />

      {/* 3. Radial Green Glow mapping to mouse */}
      <div style={{
        position: "absolute", inset: 0,
        background: `radial-gradient(circle 600px at ${mousePosition.x}px ${mousePosition.y}px, rgba(34,197,94,0.1), transparent 80%)`,
        zIndex: 2,
        pointerEvents: "none",
        transition: "background 0.3s ease"
      }} />

      {/* 4. Noise Texture overlay */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E")`,
        zIndex: 3,
        pointerEvents: "none"
      }} />

      {/* 5. Glowing Green Animated Ring (SVG) */}
      <div style={{ position: "absolute", right: "-10%", top: "10%", zIndex: 4, opacity: 0.8, pointerEvents: "none" }}>
        <motion.svg 
          width="800" height="800" viewBox="0 0 800 800" fill="none"
          animate={{ rotate: 360, scale: [1, 1.05, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        >
          <path d="M100 400C100 234.315 234.315 100 400 100C565.685 100 700 234.315 700 400C700 565.685 565.685 700 400 700C234.315 700 100 565.685 100 400Z" 
            stroke="url(#gradientRing)" strokeWidth="4" strokeLinecap="round" strokeDasharray="100 40"
            filter="drop-shadow(0 0 20px rgba(74,222,128,0.8))"
          />
          <defs>
            <linearGradient id="gradientRing" x1="100" y1="100" x2="700" y2="700" gradientUnits="userSpaceOnUse">
              <stop stopColor="#4ADE80" />
              <stop offset="1" stopColor="transparent" />
            </linearGradient>
          </defs>
        </motion.svg>
      </div>

      {/* Main Content */}
      <div className="container" style={{ zIndex: 10, position: "relative", maxWidth: "1280px", margin: "0 auto", padding: "0 24px" }}>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={controls}
          style={{ maxWidth: "800px" }}
        >
          {/* Badge */}
          <motion.div variants={itemVariants} style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "6px 16px", backgroundColor: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: "999px", marginBottom: "2rem", backdropFilter: "blur(10px)" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#4ADE80", boxShadow: "0 0 10px #4ADE80" }}></span>
            <span style={{ color: "#4ADE80", fontSize: "0.85rem", fontWeight: "600", letterSpacing: "1px" }}>POWERING A SUSTAINABLE TOMORROW</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={itemVariants}
            style={{ 
              color: "white", fontSize: "clamp(3rem, 5vw, 4.5rem)", fontWeight: "800", 
              lineHeight: 1.1, marginBottom: "1.5rem", letterSpacing: "-1px" 
            }}
          >
            {formattedHeadline}
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            variants={itemVariants}
            style={{ color: "#cbd5e1", fontSize: "1.2rem", marginBottom: "3rem", lineHeight: 1.6, maxWidth: "600px" }}
          >
            {data.subheadline || "We deliver scalable, highly efficient renewable energy infrastructure and power optimization for enterprises and industries worldwide."}
          </motion.p>

          {/* Buttons */}
          <motion.div variants={itemVariants} style={{ display: "flex", flexWrap: "wrap", gap: "1rem", alignItems: "center" }}>
            
            {/* Primary CTA */}
            {data.primaryCTA?.text && data.primaryCTA?.url && (
              <Link href={data.primaryCTA.url} style={{ textDecoration: "none" }}>
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(34,197,94,0.4)" }}
                  whileTap={{ scale: 0.95 }}
                  style={{ 
                    display: "flex", alignItems: "center", gap: "12px",
                    background: "linear-gradient(90deg, #16a34a 0%, #22c55e 100%)", 
                    color: "white", padding: "14px 28px", borderRadius: "999px", 
                    fontWeight: "600", fontSize: "1rem", border: "none", cursor: "pointer",
                    boxShadow: "0 10px 20px rgba(34,197,94,0.2)", transition: "box-shadow 0.3s"
                  }}
                >
                  {data.primaryCTA.text}
                  <motion.span initial={{ x: 0 }} whileHover={{ x: 5 }} transition={{ type: "spring", stiffness: 400 }}>
                    <FaArrowRight />
                  </motion.span>
                </motion.button>
              </Link>
            )}
            
            {/* Secondary CTA */}
            {data.secondaryCTA?.text && data.secondaryCTA?.url && (
              <Link href={data.secondaryCTA.url} style={{ textDecoration: "none" }}>
                <motion.button
                  whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.1)" }}
                  whileTap={{ scale: 0.95 }}
                  style={{ 
                    display: "flex", alignItems: "center", gap: "12px",
                    backgroundColor: "rgba(255,255,255,0.03)", backdropFilter: "blur(10px)",
                    color: "white", border: "1px solid rgba(255,255,255,0.1)", 
                    padding: "14px 28px", borderRadius: "999px", fontWeight: "600", fontSize: "1rem", cursor: "pointer",
                    transition: "all 0.3s ease"
                  }}
                >
                  {data.secondaryCTA.text}
                </motion.button>
              </Link>
            )}

          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
