"use client";
import React from "react";
import { FaWhatsapp } from "react-icons/fa";

export default function WhatsAppButton({ phone }: { phone?: string }) {
  // Use DB phone number, or fallback to the hardcoded one
  const whatsappNumber = phone || "919876543210";
  const defaultMessage = encodeURIComponent("Hi KSG Energy, I am interested in your Energy Saving and Solar Solutions. Please contact me.");

  return (
    <a
      href={`https://wa.me/${whatsappNumber}?text=${defaultMessage}`}
      className="whatsapp-btn"
      target="_blank"
      rel="noreferrer"
    >
      <FaWhatsapp />
    </a>
  );
}
