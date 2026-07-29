import React from "react";
import { FaLinkedin, FaTwitter, FaEnvelope } from "react-icons/fa";

export default function AboutSection({ aboutData }: { aboutData?: any }) {
  // Graceful fallbacks in case the CMS data isn't loaded yet
  const pageTitle = aboutData?.pageTitle || "About";
  const pageTitleHighlight = aboutData?.pageTitleHighlight || "Our Company";
  const pageSubtitle = aboutData?.pageSubtitle || "Discover our mission, vision, and the core values that drive us to build a better future.";
  const overview = aboutData?.companyOverview || "<p>We are a leading provider of sustainable solutions.</p>";
  const mission = aboutData?.mission || "To accelerate the world's transition to sustainable energy.";
  const vision = aboutData?.vision || "A world where every home is powered by clean energy.";
  const images = aboutData?.images && aboutData.images.length > 0 
    ? aboutData.images 
    : ["https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=1400"];
  const dbStats = aboutData?.statistics || [];
  const teamMembers = aboutData?.teamMembers || [];

  return (
    <section id="about" className="about">
      <div className="container">
        <h2 className="section-title">
          {pageTitle} <span>{pageTitleHighlight}</span>
        </h2>
        <p className="section-subtitle">
          {pageSubtitle}
        </p>

        {/* TOP SECTION: IMAGES & OVERVIEW */}
        <div className="about-grid">
          {/* LEFT: IMAGES */}
          <div className="about-image">
            {images.length > 1 ? (
              <div className="about-image-gallery">
                {images.slice(0, 3).map((img: string, idx: number) => (
                  <img key={idx} src={img} alt={`Company Image ${idx + 1}`} className={`gallery-img-${idx}`} />
                ))}
              </div>
            ) : (
              <img src={images[0]} alt="Company" className="single-img" />
            )}
          </div>

          {/* RIGHT: OVERVIEW */}
          <div className="about-content">
            <div 
              className="rich-text-content"
              dangerouslySetInnerHTML={{ __html: overview }} 
            />
          </div>
        </div>

        {/* STATS SECTION */}
        {dbStats.length > 0 && (
          <div className="about-stats" style={{ marginTop: '50px' }}>
            {dbStats.map((stat: any, index: number) => (
              <div className="about-stat-card" key={index}>
                <h3 className="stat-value">{stat.value}<span>{stat.suffix}</span></h3>
                <p className="stat-title">{stat.title}</p>
              </div>
            ))}
          </div>
        )}

        {/* MISSION & VISION */}
        <div className="mission-grid" style={{ marginTop: '50px' }}>
          <div className="mission-card">
            <h3>Our Mission</h3>
            <p>{mission}</p>
          </div>
          <div className="mission-card">
            <h3>Our Vision</h3>
            <p>{vision}</p>
          </div>
        </div>

        {/* LEADERSHIP / TEAM MEMBERS SECTION */}
        {teamMembers.length > 0 && (
          <div className="team-section" style={{ marginTop: '80px' }}>
            <h2 className="section-title text-center" style={{ marginBottom: '40px' }}>
              Our <span>Leadership</span>
            </h2>
            <div className="team-grid">
              {teamMembers.map((member: any, index: number) => (
                <div className="team-card" key={index}>
                  <div className="team-img-wrapper">
                    {member.image ? (
                      <img src={member.image} alt={member.name} className="team-img" />
                    ) : (
                      <div className="team-placeholder">{member.name.charAt(0)}</div>
                    )}
                  </div>
                  <div className="team-info">
                    <h4>{member.name}</h4>
                    <span className="designation">{member.designation}</span>
                    <div className="team-social">
                      {member.email && (
                        <a href={`mailto:${member.email}`} target="_blank" rel="noreferrer">
                          <FaEnvelope />
                        </a>
                      )}
                      {member.linkedin && (
                        <a href={member.linkedin} target="_blank" rel="noreferrer">
                          <FaLinkedin />
                        </a>
                      )}
                      {member.twitter && (
                        <a href={member.twitter} target="_blank" rel="noreferrer">
                          <FaTwitter />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
