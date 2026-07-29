import React from "react";
import Link from "next/link";
import { FaBolt } from "react-icons/fa";

interface ServicesData {
  heading?: string;
  description?: string;
  selectedServices?: any[];
  showSection?: boolean;
}

export default function ServicesSection({ data }: { data?: ServicesData }) {
  if (data?.showSection === false) {
    return null;
  }

  const servicesList = data?.selectedServices || [];

  if (servicesList.length === 0) {
    return null;
  }

  return (
    <section id="services" className="services-section" style={{ padding: "80px 0", backgroundColor: "#1e293b" }}>
      <div className="container" style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {data?.heading && (
          <h2 className="section-title text-center" style={{ fontSize: "2.5rem", fontWeight: "bold", marginBottom: "1rem", color: "#f8fafc" }}>
            {data.heading}
          </h2>
        )}
        {data?.description && (
          <p className="section-subtitle text-center" style={{ color: "#cbd5e1", fontSize: "1.125rem", maxWidth: "600px", margin: "0 auto 3rem" }}>
            {data.description}
          </p>
        )}

        <div className="grid-4" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "2rem" }}>
          {servicesList.map((service: any, index: number) => {
            const image = service.featuredImage || service.bannerImage || "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=1200";
            return (
              <Link href={`/services/${service.slug}`} className="service-link" key={service._id || index} style={{ textDecoration: "none", color: "inherit" }}>
                <div className="service-card" style={{ backgroundColor: "#334155", borderRadius: "1rem", overflow: "hidden", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.5)", transition: "transform 0.3s", height: "100%", display: "flex", flexDirection: "column" }}>
                  <div className="service-image" style={{ height: "200px", overflow: "hidden" }}>
                    <img src={image} alt={service.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                  <div style={{ padding: "1.5rem", flex: 1, display: "flex", flexDirection: "column" }}>
                    <div className="service-icon" style={{ color: "#16a34a", fontSize: "1.5rem", marginBottom: "1rem" }}>
                      <FaBolt />
                    </div>
                    <h3 style={{ fontSize: "1.25rem", fontWeight: "bold", marginBottom: "0.75rem", color: "#f8fafc", wordBreak: "break-word", overflowWrap: "anywhere" }}>{service.name}</h3>
                    <p style={{ color: "#cbd5e1", flex: 1, wordBreak: "break-word", overflowWrap: "anywhere" }}>{service.shortDescription || service.description?.substring(0, 100) + "..."}</p>
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
