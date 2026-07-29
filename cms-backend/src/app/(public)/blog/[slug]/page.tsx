import React from "react";
import { notFound } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import Blog from "@/models/Blog";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  await connectDB();
  const blog = await Blog.findOne({ slug: params.slug }).lean() as any;

  if (!blog) {
    return { title: "Blog Not Found" };
  }

  return {
    title: blog.seoTitle || `${blog.title} - KSG Energy`,
    description: blog.metaDescription,
    keywords: blog.metaKeywords?.split ? blog.metaKeywords.split(",") : blog.metaKeywords,
  };
}

export default async function SingleBlogPage({ params }: { params: { slug: string } }) {
  await connectDB();
  const blogDoc = await Blog.findOne({ slug: params.slug, status: 'PUBLISHED' }).populate('category').lean();

  if (!blogDoc) {
    notFound();
  }

  const blog = JSON.parse(JSON.stringify(blogDoc));

  return (
    <main style={{ paddingTop: '100px', paddingBottom: '80px', minHeight: '100vh', backgroundColor: '#ffffff' }}>
      <article className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <header style={{ marginBottom: '40px', textAlign: 'center' }}>
          <span style={{ display: 'inline-block', padding: '4px 12px', backgroundColor: '#e0f2fe', color: '#0284c7', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600, marginBottom: '15px' }}>
            {blog.category?.name || "Uncategorized"}
          </span>
          <h1 style={{ fontSize: '2.5rem', color: '#0f172a', lineHeight: 1.2, marginBottom: '20px' }}>
            {blog.title}
          </h1>
          <div style={{ color: '#64748b', fontSize: '0.95rem', display: 'flex', justifyContent: 'center', gap: '20px' }}>
            <span>By <strong>{blog.authorName || "KSG Energy"}</strong></span>
            <span>{new Date(blog.publishDate).toLocaleDateString()}</span>
          </div>
        </header>

        {blog.featuredImage && (
          <div style={{ marginBottom: '40px', borderRadius: '12px', overflow: 'hidden' }}>
            <img 
              src={blog.featuredImage} 
              alt={blog.title} 
              style={{ width: '100%', maxHeight: '500px', objectFit: 'cover' }}
            />
          </div>
        )}

        <div 
          style={{ fontSize: '1.1rem', color: '#334155', lineHeight: 1.8 }}
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />
        
        {blog.tags && blog.tags.length > 0 && (
          <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 600, color: '#0f172a', marginRight: '10px' }}>Tags:</span>
            {blog.tags.map((tag: string, index: number) => (
              <span key={index} style={{ backgroundColor: '#f1f5f9', color: '#475569', padding: '4px 12px', borderRadius: '4px', fontSize: '0.85rem' }}>
                {tag}
              </span>
            ))}
          </div>
        )}
      </article>
    </main>
  );
}
