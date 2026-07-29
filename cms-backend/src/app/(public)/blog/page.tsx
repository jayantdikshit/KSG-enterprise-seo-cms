import React from "react";
import Link from "next/link";
import { connectDB } from "@/lib/mongodb";
import Blog from "@/models/Blog";

export const metadata = {
  title: "Blog - KSG Energy",
  description: "Read the latest news, articles, and insights about renewable energy, solar power, and energy efficiency.",
};

export default async function BlogListingPage() {
  let blogs = [];

  try {
    await connectDB();
    const docs = await Blog.find({ status: 'PUBLISHED' }).sort({ publishDate: -1 }).populate('category').lean();
    blogs = JSON.parse(JSON.stringify(docs));
  } catch (error) {
    console.error("Error fetching blogs:", error);
  }

  return (
    <main style={{ paddingTop: '100px', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <div className="container" style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '3rem', color: '#1e293b' }}>Energy Insights & News</h1>
        <p style={{ color: '#64748b', maxWidth: '600px', margin: '0 auto', fontSize: '1.1rem' }}>
          Stay updated with the latest trends, tips, and insights in the world of renewable energy and sustainability.
        </p>
      </div>

      <div className="container">
        {blogs.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#64748b', fontSize: '1.2rem', padding: '40px' }}>No blog posts available at the moment.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '30px', paddingBottom: '60px' }}>
            {blogs.map((blog: any, index: number) => (
              <div key={index} style={{ backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', transition: 'transform 0.3s ease' }} className="blog-card">
                <img 
                  src={blog.featuredImage || "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=600"} 
                  alt={blog.title} 
                  style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                />
                <div style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '0.85rem', color: '#2563eb', fontWeight: 600, textTransform: 'uppercase' }}>
                      {blog.category?.name || "Uncategorized"}
                    </span>
                    <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                      {new Date(blog.publishDate).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.25rem', color: '#0f172a', marginBottom: '10px', lineHeight: 1.4 }}>
                    <Link href={`/blog/${blog.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      {blog.title}
                    </Link>
                  </h3>
                  <p style={{ color: '#475569', fontSize: '0.95rem', marginBottom: '15px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {blog.metaDescription || blog.content.replace(/<[^>]*>?/gm, '').substring(0, 150) + "..."}
                  </p>
                  <Link href={`/blog/${blog.slug}`} style={{ display: 'inline-block', color: '#22c55e', fontWeight: 600, textDecoration: 'none' }}>
                    Read Article &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
