import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import Blog from "@/models/Blog";
import { BlogService } from "@/services/BlogService";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  await connectDB();
  const blog = await Blog.findOne({ slug }).lean() as any;

  if (!blog) {
    return { title: "Blog Not Found" };
  }

  return {
    title: blog.seoTitle || `${blog.title} - KSG Energy`,
    description: blog.metaDescription,
    keywords: blog.metaKeywords?.split ? blog.metaKeywords.split(",") : blog.metaKeywords,
  };
}

export default async function SingleBlogPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  await connectDB();
  
  let blogData;
  try {
    // getBlogBySlug fetches the blog AND related blogs
    blogData = await BlogService.getBlogBySlug(slug, false);
  } catch (err) {
    return notFound();
  }

  const blog = JSON.parse(JSON.stringify(blogData.blog));
  const relatedBlogs = JSON.parse(JSON.stringify(blogData.relatedBlogs));

  // Also fetch 3 recent blogs
  const recentDocs = await Blog.find({ 
    status: 'PUBLISHED', 
    isActive: true, 
    _id: { $ne: blog._id } 
  })
    .sort('-publishDate')
    .limit(3)
    .populate('category')
    .lean();
  
  const recentBlogs = JSON.parse(JSON.stringify(recentDocs));

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#020617' }}>
      
      {/* HEADER SECTION (Dark Theme) */}
      <div style={{ backgroundColor: '#0f172a', paddingTop: '150px', paddingBottom: '60px', marginBottom: '40px', backgroundImage: 'linear-gradient(to right, #0f172a, #1e293b)' }}>
        <div className="container" style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <span style={{ display: 'inline-block', padding: '6px 16px', backgroundColor: 'rgba(34, 197, 94, 0.2)', color: '#4ADE80', borderRadius: '30px', fontSize: '0.9rem', fontWeight: 600, marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '1px' }}>
            {blog.category?.name || "Uncategorized"}
          </span>
          <h1 style={{ fontSize: '3rem', color: '#ffffff', lineHeight: 1.2, marginBottom: '25px', fontWeight: 800 }}>
            {blog.title}
          </h1>
          <div style={{ color: '#94a3b8', fontSize: '1rem', display: 'flex', justifyContent: 'center', gap: '30px', alignItems: 'center' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
                {(blog.authorName || "KSG").charAt(0).toUpperCase()}
              </div>
              <strong style={{ color: '#cbd5e1' }}>{blog.authorName || "KSG Energy"}</strong>
            </span>
            <span>{new Date(blog.publishDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
          </div>
        </div>
      </div>

      <div style={{ width: '100%', padding: '0 3%' }}>
        
        {/* ARTICLE CONTENT */}
        <article style={{ width: '100%', backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.05)', padding: '40px 5%', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          {blog.featuredImage && (
            <div style={{ marginBottom: '40px', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)' }}>
              <img 
                src={blog.featuredImage} 
                alt={blog.title} 
                style={{ width: '100%', maxHeight: '500px', objectFit: 'cover' }}
              />
            </div>
          )}

          <div 
            className="prose prose-lg prose-invert max-w-none"
            style={{ fontSize: '1.15rem', color: '#cbd5e1', lineHeight: 1.8 }}
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />
          
          {blog.tags && blog.tags.length > 0 && (
            <div style={{ marginTop: '50px', paddingTop: '30px', borderTop: '1px solid #334155', display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontWeight: 600, color: '#f8fafc', marginRight: '10px' }}>Tags:</span>
              {blog.tags.map((tag: string, index: number) => (
                <Link key={index} href={`/blog?tag=${tag}`} style={{ backgroundColor: '#1e293b', color: '#cbd5e1', padding: '6px 16px', borderRadius: '30px', fontSize: '0.9rem', textDecoration: 'none', transition: 'background-color 0.2s', border: '1px solid #334155' }}>
                  {tag}
                </Link>
              ))}
            </div>
          )}
        </article>
      </div>

      {/* RECENT BLOGS SECTION */}
      {recentBlogs.length > 0 && (
        <div className="container" style={{ marginTop: '80px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
            <div>
              <h2 style={{ fontSize: '2.5rem', color: '#f8fafc', fontWeight: 800, margin: 0 }}>Recent Articles</h2>
              <p style={{ color: '#94a3b8', marginTop: '10px', fontSize: '1.1rem' }}>Latest updates from KSG Energy</p>
            </div>
            <Link href={`/blog`} style={{ color: '#4ADE80', fontWeight: 600, textDecoration: 'none' }}>
              View all articles &rarr;
            </Link>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '30px' }}>
            {recentBlogs.map((rb: any) => (
              <div key={rb._id} style={{ backgroundColor: '#0f172a', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)', transition: 'transform 0.3s ease' }} className="blog-card">
                <img 
                  src={rb.featuredImage || "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=600"} 
                  alt={rb.title} 
                  style={{ width: '100%', height: '220px', objectFit: 'cover' }}
                />
                <div style={{ padding: '25px' }}>
                  <h3 style={{ fontSize: '1.3rem', color: '#f8fafc', marginBottom: '10px', lineHeight: 1.4, fontWeight: 700 }}>
                    <Link href={`/blog/${rb.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      {rb.title}
                    </Link>
                  </h3>
                  <p style={{ color: '#94a3b8', fontSize: '0.95rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {rb.metaDescription || (rb.content ? rb.content.replace(/<[^>]*>?/gm, '').substring(0, 100) + "..." : "")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RELATED BLOGS SECTION */}
      {relatedBlogs.length > 0 && (
        <div className="container" style={{ marginTop: '80px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
            <div>
              <h2 style={{ fontSize: '2.5rem', color: '#f8fafc', fontWeight: 800, margin: 0 }}>Related Articles</h2>
              <p style={{ color: '#94a3b8', marginTop: '10px', fontSize: '1.1rem' }}>More insights from the <strong style={{ color: '#cbd5e1' }}>{blog.category?.name}</strong> category</p>
            </div>
            <Link href={`/blog?category=${blog.category?.slug}`} style={{ color: '#4ADE80', fontWeight: 600, textDecoration: 'none' }}>
              View all in category &rarr;
            </Link>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '30px' }}>
            {relatedBlogs.slice(0, 3).map((rb: any, index: number) => (
              <div key={index} style={{ backgroundColor: '#0f172a', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)', transition: 'transform 0.3s ease' }} className="blog-card">
                <img 
                  src={rb.featuredImage || "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=600"} 
                  alt={rb.title} 
                  style={{ width: '100%', height: '220px', objectFit: 'cover' }}
                />
                <div style={{ padding: '25px' }}>
                  <h3 style={{ fontSize: '1.3rem', color: '#f8fafc', marginBottom: '10px', lineHeight: 1.4, fontWeight: 700 }}>
                    <Link href={`/blog/${rb.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      {rb.title}
                    </Link>
                  </h3>
                  <p style={{ color: '#94a3b8', fontSize: '0.95rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {rb.metaDescription || rb.content.replace(/<[^>]*>?/gm, '').substring(0, 100) + "..."}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
    </main>
  );
}
