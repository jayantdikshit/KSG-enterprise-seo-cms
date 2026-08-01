"use client";
import React, { useState } from "react";
import Link from "next/link";
import { FaChartBar, FaSolarPanel, FaLeaf, FaBullhorn, FaCheckCircle, FaArrowRight } from "react-icons/fa";

interface ServicesData {
  heading?: string;
  description?: string;
  selectedServices?: any[];
  showSection?: boolean;
}

const themes = [
  { color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)', glow: 'rgba(16, 185, 129, 0.5)', icon: <FaChartBar /> },
  { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)', glow: 'rgba(245, 158, 11, 0.5)', icon: <FaSolarPanel /> },
  { color: '#22c55e', bg: 'rgba(34, 197, 94, 0.15)', glow: 'rgba(34, 197, 94, 0.5)', icon: <FaLeaf /> },
  { color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.15)', glow: 'rgba(139, 92, 246, 0.5)', icon: <FaBullhorn /> }
];

export default function ServicesSection({ data }: { data?: ServicesData }) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (data?.showSection === false) {
    return null;
  }

  const servicesList = data?.selectedServices || [];

  if (servicesList.length === 0) {
    return null;
  }

  return (
    <section id="services" style={{ padding: "100px 0", backgroundColor: "#060b13" }}>
      <div className="container" style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 20px" }}>
        {data?.heading && (
          <h2 className="section-title text-center" style={{ fontSize: "2.8rem", fontWeight: "bold", marginBottom: "1rem", color: "#f8fafc" }}>
            {data.heading}
          </h2>
        )}
        {data?.description && (
          <p className="section-subtitle text-center" style={{ color: "#94a3b8", fontSize: "1.1rem", maxWidth: "700px", margin: "0 auto 4rem" }}>
            {data.description}
          </p>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "2rem" }}>
          {servicesList.map((service: any, index: number) => {
            const theme = themes[index % themes.length];
            const badgeText = service.name.split(' ').slice(0, 2).join(' ').toUpperCase();
            const image = service.featuredImage || service.bannerImage || "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=1200";
            const features = (service.keyFeatures || []).slice(0, 3);
            const isHovered = hoveredIndex === index;

            return (
              <Link 
                href={`/services/${service.slug}`} 
                key={service._id || index} 
                style={{ textDecoration: "none", color: "inherit", display: "block", outline: "none" }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <div style={{ 
                  backgroundColor: "#0f172a", 
                  borderRadius: "1.5rem", 
                  position: "relative",
                  overflow: "hidden", 
                  boxShadow: isHovered 
                    ? `0 20px 40px ${theme.glow}, 0 0 0 1px ${theme.color}` 
                    : `0 10px 30px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)`, 
                  transition: "all 0.4s ease", 
                  height: "100%", 
                  display: "flex", 
                  flexDirection: "column",
                  borderBottom: `2px solid ${theme.color}`
                }}>
                  
                  {/* Top Image Area */}
                  <div style={{ height: "220px", position: "relative" }}>
                    <img src={image} alt={service.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <div style={{ 
                      position: "absolute", inset: 0, 
                      background: "linear-gradient(to bottom, transparent 40%, #0f172a 100%)" 
                    }}></div>

                    {/* Badge */}
                    <div style={{ 
                      position: "absolute", top: "20px", left: "20px", 
                      backgroundColor: theme.bg, color: theme.color, 
                      padding: "4px 12px", borderRadius: "999px", 
                      fontSize: "0.75rem", fontWeight: "bold",
                      border: `1px solid ${theme.color}40`,
                      backdropFilter: "blur(4px)"
                    }}>
                      {badgeText}
                    </div>

                    {/* Big Number */}
                    <div style={{
                      position: "absolute", top: "15px", right: "20px",
                      color: "rgba(255,255,255,0.2)", fontSize: "2.5rem", fontWeight: "900",
                      lineHeight: "1"
                    }}>
                      {String(index + 1).padStart(2, '0')}
                    </div>
                  </div>

                  {/* Circular Icon */}
                  <div style={{ 
                    position: "absolute", top: "185px", left: "50%", transform: "translateX(-50%)",
                    width: "70px", height: "70px", borderRadius: "50%",
                    backgroundColor: "#0f172a", border: `2px solid ${theme.color}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: theme.color, fontSize: "1.75rem",
                    boxShadow: `0 0 20px ${theme.glow}, inset 0 0 15px ${theme.glow}`,
                    zIndex: 2
                  }}>
                    {theme.icon}
                  </div>

                  {/* Body */}
                  <div style={{ padding: "45px 24px 30px", flex: 1, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                    <h3 style={{ fontSize: "1.4rem", fontWeight: "bold", marginBottom: "1rem", color: "#f8fafc", wordBreak: "break-word" }}>
                      {service.name}
                    </h3>
                    
                    <p style={{ color: "#94a3b8", fontSize: "0.95rem", lineHeight: "1.6", marginBottom: "1.5rem" }}>
                      {service.shortDescription || (service.description ? service.description.substring(0, 100) + "..." : "")}
                    </p>

                    {/* Features List */}
                    <div style={{ width: "100%", marginBottom: "2rem", textAlign: "left", flex: 1 }}>
                      {features.map((feature: string, fIdx: number) => (
                        <div key={fIdx} style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "10px" }}>
                          <FaCheckCircle style={{ color: theme.color, marginTop: "3px", minWidth: "14px" }} />
                          <span style={{ color: "#cbd5e1", fontSize: "0.85rem", lineHeight: "1.5" }}>{feature}</span>
                        </div>
                      ))}
                    </div>

                    {/* Button */}
                    <div style={{ marginTop: "auto", width: "100%" }}>
                      <button style={{
                        width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
                        padding: "12px", borderRadius: "999px",
                        backgroundColor: isHovered ? theme.bg : "transparent",
                        border: `1px solid ${theme.color}60`,
                        color: "#f8fafc", fontSize: "0.9rem", fontWeight: "600",
                        cursor: "pointer", transition: "all 0.3s"
                      }}>
                        Explore Service <FaArrowRight style={{ color: theme.color }} />
                      </button>
                    </div>
                  </div>

                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
