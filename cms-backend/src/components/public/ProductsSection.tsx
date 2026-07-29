"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";

export default function ProductsSection({ products }: { products?: any[] }) {
  const [activeCard, setActiveCard] = useState<number | null>(null);

  const defaultProducts = [
    {
      image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=1200",
      title: "Solar Water Heaters",
      desc: "Eco-friendly water heating systems that reduce electricity consumption and operating costs."
    },
    {
      image: "https://images.unsplash.com/photo-1617788138017-80ad40651399?w=1200&auto=format&fit=crop",
      title: "EV Charging Stations",
      desc: "Fast and reliable EV charging solutions for commercial and residential applications."
    }
  ];

  const displayProducts = products && products.length > 0 
    ? products.map(p => ({
        image: p.featuredImage || "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=1200",
        title: p.name,
        desc: p.shortDescription || p.description?.substring(0, 100)
      }))
    : defaultProducts;

  const containerVariants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.15 } }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 60 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8 } }
  };

  return (
    <section className="products-section">
      <div className="container">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8 }}
        >
          <span className="section-tag">Our Products</span>
          <h2 className="section-title">Smart Solar & Energy Products</h2>
          <p className="section-subtitle">
            Innovative solar energy products designed to reduce
            electricity costs, improve sustainability and
            maximize operational efficiency.
          </p>
        </motion.div>

        {activeCard !== null && (
          <div className="reset-wrapper" style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
            <button
              style={{ padding: '10px 20px', backgroundColor: '#e2e8f0', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              onClick={(e) => {
                e.stopPropagation();
                setActiveCard(null);
              }}
            >
              Show All Products
            </button>
          </div>
        )}

        <motion.div
          className="products-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          {displayProducts.map((item, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              className={`product-card ${
                activeCard === index
                  ? "active-card"
                  : activeCard !== null
                  ? "inactive-card"
                  : ""
              }`}
              onClick={() => setActiveCard(activeCard === index ? null : index)}
              whileHover={activeCard === null ? { y: -10, scale: 1.02 } : {}}
            >
              <div className="product-image">
                <motion.img
                  src={item.image}
                  alt={item.title}
                  whileHover={{ scale: 1.08 }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <div className="product-content">
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
                <button
                  className="product-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Could link to product details if they existed
                    console.log(item.title);
                  }}
                >
                  Learn More
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
