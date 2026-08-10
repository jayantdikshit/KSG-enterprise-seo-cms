"use client";
import React, { useState, useRef } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaCheckCircle } from "react-icons/fa";

export default function ContactSection({ settings }: { settings?: any }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    message: ""
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  const address = settings?.address || "Noida Sector 63, Uttar Pradesh, India";
  const mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(address)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.name || !formData.email || !formData.message) {
      setError("Please fill all required fields (Name, Email, Message).");
      return;
    }

    if (siteKey && !captchaToken) {
      setError("Please complete the reCAPTCHA verification.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, captchaToken })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.error || "Failed to submit");
      }

      setSuccess(true);
      setFormData({ name: "", email: "", phone: "", company: "", message: "" });
      setCaptchaToken(null);
      recaptchaRef.current?.reset();
    } catch (err: any) {
      setError(err.message || "Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Contact Form + Info Section */}
      <section id="contact" style={{ paddingTop: '80px', paddingBottom: '60px', backgroundColor: '#0f172a', color: 'white' }}>
        <div className="container">
          <h2 className="section-title" style={{ color: 'white' }}>Contact KSG Energy</h2>
          <p className="section-subtitle" style={{ color: '#94a3b8' }}>
            Let's discuss how we can help reduce your energy costs.
          </p>

          <div className="contact-grid">
            {/* Info Cards */}
            <div className="contact-info">
              <div className="info-card">
                <FaPhoneAlt />
                <div>
                  <h4>Call Us</h4>
                  <p>{settings?.phone || "+91 98765 43210"}</p>
                </div>
              </div>
              <div className="info-card">
                <FaEnvelope />
                <div>
                  <h4>Email</h4>
                  <p>{settings?.email || "info@ksgenergy.com"}</p>
                </div>
              </div>
              <div className="info-card">
                <FaMapMarkerAlt />
                <div>
                  <h4>Location</h4>
                  <p>{address}</p>
                </div>
              </div>
            </div>

            {/* Form */}
            {success ? (
              <div className="success-state-container" style={{ gridColumn: '2', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#1e293b', borderRadius: '12px', padding: '40px', border: '1px solid #334155' }}>
                <FaCheckCircle size={64} color="#10b981" />
                <h3 style={{ color: '#f8fafc', marginTop: '16px', fontSize: '1.5rem' }}>Thank You!</h3>
                <p style={{ color: '#94a3b8', marginTop: '8px' }}>Consultation request submitted successfully! We'll get back to you soon.</p>
              </div>
            ) : (
              <form className="contact-form" onSubmit={handleSubmit} style={{ backgroundColor: '#1e293b', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.3)', border: '1px solid #334155' }}>
                <input
                  id="contact-name"
                  type="text"
                  name="name"
                  placeholder="Your Name *"
                  value={formData.name}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '12px', marginBottom: '15px', border: '1px solid #334155', borderRadius: '6px', backgroundColor: '#0f172a', color: 'white', outline: 'none' }}
                />
                <input
                  id="contact-email"
                  type="email"
                  name="email"
                  placeholder="Email Address *"
                  value={formData.email}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '12px', marginBottom: '15px', border: '1px solid #334155', borderRadius: '6px', backgroundColor: '#0f172a', color: 'white', outline: 'none' }}
                />
                <input
                  id="contact-phone"
                  type="text"
                  name="phone"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '12px', marginBottom: '15px', border: '1px solid #334155', borderRadius: '6px', backgroundColor: '#0f172a', color: 'white', outline: 'none' }}
                />
                <input
                  id="contact-company"
                  type="text"
                  name="company"
                  placeholder="Company Name"
                  value={formData.company}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '12px', marginBottom: '15px', border: '1px solid #334155', borderRadius: '6px', backgroundColor: '#0f172a', color: 'white', outline: 'none' }}
                />
                <textarea
                  id="contact-message"
                  rows={5}
                  name="message"
                  placeholder="How can we help? *"
                  value={formData.message}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '12px', marginBottom: '15px', border: '1px solid #334155', borderRadius: '6px', backgroundColor: '#0f172a', color: 'white', resize: 'vertical', outline: 'none' }}
                />

                {/* reCAPTCHA Widget */}
                {siteKey ? (
                  <div style={{ marginBottom: '15px' }}>
                    <ReCAPTCHA
                      ref={recaptchaRef}
                      sitekey={siteKey}
                      theme="dark"
                      onChange={(token) => setCaptchaToken(token)}
                      onExpired={() => setCaptchaToken(null)}
                    />
                  </div>
                ) : (
                  <div style={{ marginBottom: '15px', padding: '10px', border: '1px dashed #475569', borderRadius: '6px', color: '#64748b', fontSize: '0.8rem' }}>
                    ⚠️ reCAPTCHA not configured. Add <code>NEXT_PUBLIC_RECAPTCHA_SITE_KEY</code> to <code>.env.local</code>
                  </div>
                )}

                {error && <p style={{ color: "#f87171", marginBottom: "15px", fontSize: '0.9rem' }}>{error}</p>}

                <button
                  type="submit"
                  className="primary-btn"
                  disabled={loading}
                  style={{ width: '100%', opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
                >
                  {loading ? "Submitting..." : "Request Consultation"}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Google Map Section */}
      <section style={{ backgroundColor: '#0f172a', paddingBottom: '80px' }}>
        <div className="container">
          <div style={{
            borderRadius: '16px',
            overflow: 'hidden',
            border: '1px solid #1e293b',
            boxShadow: '0 20px 40px -10px rgba(0,0,0,0.5)',
          }}>
            {/* Map Header */}
            <div style={{ backgroundColor: '#1e293b', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid #334155' }}>
              <FaMapMarkerAlt color="#4ADE80" size={18} />
              <span style={{ color: '#f8fafc', fontWeight: 600, fontSize: '1rem' }}>Our Location</span>
              <span style={{ color: '#64748b', fontSize: '0.875rem', marginLeft: '4px' }}>— {address}</span>
            </div>
            {/* Map Iframe */}
            <div style={{ position: 'relative', height: '420px', width: '100%' }}>
              <iframe
                src={mapSrc}
                width="100%"
                height="420"
                style={{ border: 0, display: 'block' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="KSG Energy Office Location"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
