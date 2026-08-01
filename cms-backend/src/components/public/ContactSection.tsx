"use client";
import React, { useState } from "react";
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaSpinner, FaCheckCircle } from "react-icons/fa";

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.name || !formData.email || !formData.message) {
      setError("Please fill all required fields");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/public/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      
      if (!res.ok) {
        throw new Error("Failed to submit");
      }

      setSuccess(true);

      setFormData({ name: "", email: "", phone: "", company: "", message: "" });
    } catch (err: any) {
      setError("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" style={{ paddingTop: '80px', paddingBottom: '80px', backgroundColor: '#0f172a', color: 'white' }}>
      <div className="container">
        <h2 className="section-title" style={{ color: 'white' }}>Contact KSG Energy</h2>
        <p className="section-subtitle" style={{ color: '#94a3b8' }}>
          Let's discuss how we can help reduce your energy costs.
        </p>

        <div className="contact-grid">
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
                <p>{settings?.address || "Noida Sector 63"}</p>
              </div>
            </div>
          </div>
          {success ? (
            <div className="success-state-container" style={{ gridColumn: '2' }}>
              <FaCheckCircle size={64} color="#10b981" />
              <h3>Thank You!</h3>
              <p>Consultation request submitted successfully!</p>
            </div>
          ) : (
            <form className="contact-form" onSubmit={handleSubmit} style={{ backgroundColor: '#1e293b', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)', border: '1px solid #334155' }}>
              <input
                id="name"
                type="text"
                name="name"
                placeholder="Your Name *"
                value={formData.name}
                onChange={handleChange}
                style={{ width: '100%', padding: '12px', marginBottom: '15px', border: '1px solid #334155', borderRadius: '6px', backgroundColor: '#0f172a', color: 'white' }}
              />
              <input
                type="email"
                name="email"
                placeholder="Email Address *"
                value={formData.email}
                onChange={handleChange}
                style={{ width: '100%', padding: '12px', marginBottom: '15px', border: '1px solid #334155', borderRadius: '6px', backgroundColor: '#0f172a', color: 'white' }}
              />
              <input
                type="text"
                name="phone"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleChange}
                style={{ width: '100%', padding: '12px', marginBottom: '15px', border: '1px solid #334155', borderRadius: '6px', backgroundColor: '#0f172a', color: 'white' }}
              />
              <input
                type="text"
                name="company"
                placeholder="Company Name"
                value={formData.company}
                onChange={handleChange}
                style={{ width: '100%', padding: '12px', marginBottom: '15px', border: '1px solid #334155', borderRadius: '6px', backgroundColor: '#0f172a', color: 'white' }}
              />
              <textarea
                rows={5}
                name="message"
                placeholder="How can we help? *"
                value={formData.message}
                onChange={handleChange}
                style={{ width: '100%', padding: '12px', marginBottom: '15px', border: '1px solid #334155', borderRadius: '6px', backgroundColor: '#0f172a', color: 'white', resize: 'vertical' }}
              />
              
              {error && <p style={{ color: "red", marginBottom: "15px" }}>{error}</p>}
  
              <button type="submit" className="primary-btn" disabled={loading} style={{ width: '100%', opacity: loading ? 0.7 : 1 }}>
                {loading ? "Submitting..." : "Request Consultation"}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
