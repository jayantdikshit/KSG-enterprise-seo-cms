import React from "react";
import Link from "next/link";
import { connectDB } from "@/lib/mongodb";
import { BlogService } from "@/services/BlogService";
import BlogCategory from "@/models/BlogCategory";
import Blog from "@/models/Blog";

export const metadata = {
  title: "Blog - KSG Energy",
  description: "Read the latest news, articles, and insights about renewable energy, solar power, and energy efficiency.",
};

export default async function BlogListingPage({
  searchParams,
}: {
  searchParams: { search?: string; category?: string; tag?: string };
}) {
  await connectDB();

  // Fetch blogs using BlogService with searchParams
  const result = await BlogService.getAllBlogs({
    search: searchParams.search,
    category: searchParams.category,
    tag: searchParams.tag,
    previewMode: false,
    limit: 50 // Get enough for one page
  });

  const blogs = JSON.parse(JSON.stringify(result.data));

  // Fetch all active categories for the sidebar
  const categoriesDocs = await BlogCategory.find({ isActive: true }).sort("name").lean();
  const categories = JSON.parse(JSON.stringify(categoriesDocs));

  // Fetch all unique tags for the sidebar
  const allBlogs = await Blog.find({ status: "PUBLISHED", isActive: true }).select("tags").lean();
  const allTags = new Set<string>();
  allBlogs.forEach((b: any) => b.tags?.forEach((t: string) => allTags.add(t)));
  const tags = Array.from(allTags).sort();

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#020617' }}>
      {/* Dark Hero Section for Navbar Visibility */}
      <div style={{ backgroundColor: '#0f172a', paddingTop: '150px', paddingBottom: '80px', backgroundImage: 'linear-gradient(to right, #0f172a, #1e293b)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '3.5rem', color: '#f8fafc', fontWeight: 800 }}>Energy Insights & News</h1>
          <p style={{ color: '#94a3b8', maxWidth: '600px', margin: '15px auto 0', fontSize: '1.1rem' }}>
            Stay updated with the latest trends, tips, and insights in the world of renewable energy and sustainability.
          </p>
        </div>
      </div>

      <div className="container" style={{ display: 'flex', gap: '40px', paddingBottom: '60px', paddingTop: '40px', flexWrap: 'wrap' }}>
        
        {/* SIDEBAR */}
        <aside style={{ flex: '1 1 300px', maxWidth: '350px' }}>
          
          {/* Search Box */}
          <div style={{ backgroundColor: '#0f172a', padding: '25px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '30px' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#f8fafc', marginBottom: '15px', fontWeight: 600 }}>Search</h3>
            <form method="GET" action="/blog" style={{ display: 'flex' }}>
              <input 
                type="text" 
                name="search" 
                defaultValue={searchParams.search}
                placeholder="Search articles..." 
                style={{ flex: 1, padding: '10px 15px', backgroundColor: '#1e293b', border: '1px solid #334155', color: '#f8fafc', borderRadius: '6px 0 0 6px', outline: 'none' }}
              />
              <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#22c55e', color: 'white', border: 'none', borderRadius: '0 6px 6px 0', cursor: 'pointer', fontWeight: 600 }}>
                Go
              </button>
            </form>
          </div>

          {/* Categories Filter */}
          <div style={{ backgroundColor: '#0f172a', padding: '25px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '30px' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#f8fafc', marginBottom: '15px', fontWeight: 600 }}>Categories</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ marginBottom: '10px' }}>
                <Link href="/blog" style={{ color: !searchParams.category ? '#4ADE80' : '#94a3b8', textDecoration: 'none', fontWeight: !searchParams.category ? 600 : 400 }}>
                  All Categories
                </Link>
              </li>
              {categories.map((cat: any) => (
                <li key={cat._id} style={{ marginBottom: '10px' }}>
                  <Link href={`/blog?category=${cat.slug}`} style={{ color: searchParams.category === cat.slug ? '#4ADE80' : '#94a3b8', textDecoration: 'none', fontWeight: searchParams.category === cat.slug ? 600 : 400 }}>
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Tags Filter */}
          {tags.length > 0 && (
            <div style={{ backgroundColor: '#0f172a', padding: '25px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <h3 style={{ fontSize: '1.2rem', color: '#f8fafc', marginBottom: '15px', fontWeight: 600 }}>Tags</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {tags.map((tag: string) => (
                  <Link 
                    key={tag} 
                    href={`/blog?tag=${tag}`} 
                    style={{ 
                      padding: '6px 12px', 
                      backgroundColor: searchParams.tag === tag ? '#22c55e' : '#1e293b', 
                      color: searchParams.tag === tag ? 'white' : '#cbd5e1', 
                      border: searchParams.tag === tag ? 'none' : '1px solid #334155',
                      borderRadius: '20px', 
                      fontSize: '0.85rem', 
                      textDecoration: 'none',
                      transition: 'all 0.2s'
                    }}
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            </div>
          )}

        </aside>

        {/* MAIN BLOG GRID */}
        <div style={{ flex: '3 1 600px' }}>
          
          {(searchParams.search || searchParams.category || searchParams.tag) && (
            <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0f172a', padding: '15px 20px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <p style={{ color: '#94a3b8', margin: 0 }}>
                Showing results for 
                {searchParams.search && <strong style={{ color: '#f8fafc' }}> search "{searchParams.search}"</strong>}
                {searchParams.category && <strong style={{ color: '#f8fafc' }}> category "{searchParams.category}"</strong>}
                {searchParams.tag && <strong style={{ color: '#f8fafc' }}> tag "{searchParams.tag}"</strong>}
              </p>
              <Link href="/blog" style={{ color: '#ef4444', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}>
                Clear Filters &times;
              </Link>
            </div>
          )}

          {blogs.length === 0 ? (
            <div style={{ backgroundColor: '#0f172a', padding: '60px 40px', borderRadius: '12px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
              <h3 style={{ fontSize: '1.5rem', color: '#f8fafc', marginBottom: '10px' }}>No blogs found</h3>
              <p style={{ color: '#94a3b8' }}>Try adjusting your search or filters to find what you're looking for.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '30px' }}>
              {blogs.map((blog: any, index: number) => (
                <div key={index} style={{ backgroundColor: '#0f172a', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)', transition: 'transform 0.3s ease, box-shadow 0.3s' }} className="blog-card">
                  <img 
                    src={blog.featuredImage || "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=600"} 
                    alt={blog.title} 
                    style={{ width: '100%', height: '220px', objectFit: 'cover' }}
                  />
                  <div style={{ padding: '25px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                      <span style={{ fontSize: '0.75rem', padding: '4px 10px', backgroundColor: 'rgba(34, 197, 94, 0.15)', color: '#4ADE80', borderRadius: '20px', fontWeight: 600, textTransform: 'uppercase' }}>
                        {blog.category?.name || "Uncategorized"}
                      </span>
                      <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                        {new Date(blog.publishDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    <h3 style={{ fontSize: '1.3rem', color: '#f8fafc', marginBottom: '15px', lineHeight: 1.4, fontWeight: 700 }}>
                      <Link href={`/blog/${blog.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        {blog.title}
                      </Link>
                    </h3>
                    <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginBottom: '20px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.6 }}>
                      {blog.metaDescription || blog.content.replace(/<[^>]*>?/gm, '').substring(0, 150) + "..."}
                    </p>
                    <Link href={`/blog/${blog.slug}`} style={{ display: 'inline-flex', alignItems: 'center', color: '#4ADE80', fontWeight: 600, textDecoration: 'none', fontSize: '0.95rem' }}>
                      Read Article <span style={{ marginLeft: '5px' }}>&rarr;</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
