'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardBody, StatusBadge } from '@/components/ui';
import Button from '@/components/ui/Button';
import api from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import {
  HiOutlineArrowLeft, HiOutlinePencilAlt, HiOutlineTrash,
  HiOutlineEye, HiOutlineClock, HiOutlineCalendar,
  HiOutlineTag, HiOutlineUser, HiOutlineLink, HiOutlineChevronRight,
  HiOutlineBookOpen, HiOutlineFolder
} from 'react-icons/hi';

export default function BlogViewPage({ params }) {
  const router = useRouter();
  const toast = useToast();
  const { id } = params;
  const [blog, setBlog] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [activeSection, setActiveSection] = useState('');

  // Reading progress tracker
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setReadingProgress(Math.min(100, Math.max(0, progress)));
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Copy link handler
  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast?.success?.('Link copied to clipboard!');
  };

  useEffect(() => {
    if (id) {
      fetchBlog();
      fetchCategories();
    }
  }, [id]);

  const fetchBlog = async () => {
    try {
      const data = await api.get(`/blogs/${id}`);
      setBlog(data);
    } catch (error) {
      console.error('Error fetching blog:', error);
      toast?.error?.('Failed to load blog post');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await api.get('/blog-categories');
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/blogs/${id}`);
      toast?.success?.('Blog deleted successfully');
      router.push('/blogs');
    } catch (error) {
      toast?.error?.('Failed to delete blog');
    }
  };

  // Generate Table of Contents from sections
  const tableOfContents = useMemo(() => {
    if (!blog?.sections) return [];
    return blog.sections
      .filter(s => s.heading)
      .map((s, idx) => ({
        id: `section-${idx}`,
        title: s.heading,
        type: s.section_type || 'content'
      }));
  }, [blog?.sections]);

  // Scroll to section
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSection(sectionId);
    }
  };

  // Render section based on type
  const renderSection = (section, index) => {
    const sectionId = `section-${index}`;

    switch (section.section_type || section.type) {
      case 'image':
        return (
          <div key={sectionId} id={sectionId} className="my-8">
            {section.heading && <h3 className="text-xl font-bold mb-4">{section.heading}</h3>}
            {section.image && (
              <figure>
                <img src={api.getMediaUrl(section.image)} alt={section.image_alt || section.image_caption || ''} className="w-full rounded-xl shadow-lg" />
                {section.image_caption && (
                  <figcaption className="text-center text-sm text-muted-foreground mt-3 italic">
                    {section.image_caption}
                  </figcaption>
                )}
              </figure>
            )}
          </div>
        );

      case 'quote':
        return (
          <blockquote key={sectionId} id={sectionId} className="my-8 border-l-4 border-primary pl-6 py-4 bg-primary/5 rounded-r-xl">
            <p className="text-xl italic text-foreground leading-relaxed">"{section.quote}"</p>
            {section.quote_author && (
              <cite className="block mt-3 text-sm text-muted-foreground not-italic">— {section.quote_author}</cite>
            )}
          </blockquote>
        );

      case 'code':
        return (
          <div key={sectionId} id={sectionId} className="my-8">
            {section.heading && <h3 className="text-xl font-bold mb-4">{section.heading}</h3>}
            <pre className="bg-slate-900 text-slate-100 p-6 rounded-xl overflow-x-auto text-sm">
              <code className={`language-${section.code_language || 'javascript'}`}>
                {section.code}
              </code>
            </pre>
          </div>
        );

      case 'video':
        return (
          <div key={sectionId} id={sectionId} className="my-8">
            {section.heading && <h3 className="text-xl font-bold mb-4">{section.heading}</h3>}
            {section.video_url && (
              <div className="aspect-video rounded-xl overflow-hidden shadow-lg">
                <iframe
                  src={section.video_url.replace('watch?v=', 'embed/')}
                  className="w-full h-full"
                  allowFullScreen
                />
              </div>
            )}
          </div>
        );

      case 'cta':
        return (
          <div key={sectionId} id={sectionId} className="my-8 p-8 bg-gradient-to-r from-primary/10 via-purple-500/10 to-pink-500/10 rounded-2xl text-center">
            <h3 className="text-2xl font-bold mb-4">{section.heading || 'Take Action'}</h3>
            {section.cta_text && section.cta_url && (
              <a href={section.cta_url} target="_blank" rel="noopener noreferrer">
                <Button variant="primary" className="shadow-lg">{section.cta_text}</Button>
              </a>
            )}
          </div>
        );

      default: // content
        return (
          <div key={sectionId} id={sectionId} className="my-8">
            {section.heading && (
              <h3 className="text-xl font-bold text-foreground mb-4">{section.heading}</h3>
            )}
            {section.content && (
              <div
                className="prose prose-lg dark:prose-invert max-w-none prose-p:text-muted-foreground prose-p:leading-relaxed"
                dangerouslySetInnerHTML={{ __html: section.content }}
              />
            )}
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-foreground mb-2">Blog not found</h2>
        <p className="text-muted-foreground mb-4">The blog post you're looking for doesn't exist.</p>
        <Link href="/blogs">
          <Button variant="primary">Back to Blogs</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up">
      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-muted z-50">
        <div
          className="h-full bg-gradient-to-r from-primary via-purple-500 to-pink-500 transition-all duration-150"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      {/* Header Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <Link href="/blogs" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <HiOutlineArrowLeft className="w-4 h-4" /> Back to Blogs
        </Link>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={copyLink} className="text-muted-foreground hover:text-foreground">
            <HiOutlineLink className="w-4 h-4" /> Copy Link
          </Button>
          <Link href={`/blogs/${id}/edit`}>
            <Button variant="secondary">
              <HiOutlinePencilAlt className="w-4 h-4" /> Edit
            </Button>
          </Link>
          <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
            <HiOutlineTrash className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Main 3-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Left Sidebar - Table of Contents */}
        <aside className="hidden lg:block lg:col-span-3">
          <div className="sticky top-20">
            <Card className="glass-card">
              <CardBody className="p-4">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
                  <HiOutlineBookOpen className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-foreground">Table of Contents</h3>
                </div>

                {tableOfContents.length > 0 ? (
                  <nav className="space-y-1">
                    {tableOfContents.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => scrollToSection(item.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all hover:bg-muted ${activeSection === item.id
                          ? 'bg-primary/10 text-primary font-medium border-l-2 border-primary'
                          : 'text-muted-foreground hover:text-foreground'
                          }`}
                      >
                        <span className="line-clamp-2">{item.title}</span>
                      </button>
                    ))}
                  </nav>
                ) : (
                  <p className="text-sm text-muted-foreground italic">No sections available</p>
                )}
              </CardBody>
            </Card>
          </div>
        </aside>

        {/* Center - Main Content */}
        <main className="lg:col-span-6 space-y-6">

          {/* Hero Banner */}
          {(blog.banner_image || blog.featured_image) && (
            <div className="relative rounded-2xl overflow-hidden aspect-video shadow-xl">
              <img
                src={api.getMediaUrl(blog.banner_image || blog.featured_image)}
                alt={blog.banner_image_alt || blog.featured_image_alt || blog.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <StatusBadge status={blog.status} className="mb-3" />
                {blog.banner_title && (
                  <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">
                    {blog.banner_title}
                  </h1>
                )}
              </div>
            </div>
          )}

          {/* Title & Meta */}
          <Card className="glass-card">
            <CardBody className="p-6 md:p-8">
              {/* Category Badge */}
              {blog.category_name && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold uppercase tracking-wider bg-primary/10 text-primary rounded-full mb-4">
                  <HiOutlineTag className="w-3.5 h-3.5" />
                  {blog.category_name}
                </span>
              )}

              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4 leading-tight">
                {blog.title}
              </h1>

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
                {blog.author_name && (
                  <span className="flex items-center gap-1.5">
                    <HiOutlineUser className="w-4 h-4" /> {blog.author_name}
                  </span>
                )}
                {blog.blog_date && (
                  <span className="flex items-center gap-1.5">
                    <HiOutlineCalendar className="w-4 h-4" />
                    {new Date(blog.blog_date).toLocaleDateString('en-US', {
                      month: 'long', day: 'numeric', year: 'numeric'
                    })}
                  </span>
                )}
                {blog.read_time && (
                  <span className="flex items-center gap-1.5">
                    <HiOutlineClock className="w-4 h-4" /> {blog.read_time} min read
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <HiOutlineEye className="w-4 h-4" /> {blog.views || 0} views
                </span>
              </div>

              {/* Excerpt */}
              {blog.excerpt && (
                <p className="text-lg text-muted-foreground leading-relaxed border-l-4 border-primary/30 pl-4 italic">
                  {blog.excerpt}
                </p>
              )}
            </CardBody>
          </Card>

          {/* Main Content */}
          <Card className="glass-card">
            <CardBody className="p-6 md:p-8">
              {/* Primary Content */}
              {blog.content && (
                <div
                  className="prose prose-lg dark:prose-invert max-w-none
                             prose-headings:text-foreground prose-headings:font-bold
                             prose-p:text-muted-foreground prose-p:leading-relaxed
                             prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                             prose-img:rounded-xl prose-img:shadow-lg
                             prose-blockquote:border-primary prose-blockquote:bg-muted/50 prose-blockquote:rounded-r-lg
                             prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded"
                  dangerouslySetInnerHTML={{ __html: blog.content }}
                />
              )}

              {/* Dynamic Sections */}
              {blog.sections && blog.sections.length > 0 && (
                <div className="mt-8 pt-8 border-t border-border">
                  {blog.sections
                    .slice()
                    .sort((a, b) => (a.order || 0) - (b.order || 0))
                    .map((section, index) => renderSection(section, index))}
                </div>
              )}
            </CardBody>
          </Card>

          {/* Tags */}
          {blog.tags && blog.tags.length > 0 && (
            <Card className="glass-card">
              <CardBody className="p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground mr-2">Tags:</span>
                  {(Array.isArray(blog.tags) ? blog.tags : []).map((tag, idx) => (
                    <span key={idx} className="px-3 py-1 bg-muted text-muted-foreground text-sm rounded-full hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer">
                      #{tag}
                    </span>
                  ))}
                </div>
              </CardBody>
            </Card>
          )}
        </main>

        {/* Right Sidebar - Categories & Actions */}
        <aside className="lg:col-span-3">
          <div className="sticky top-20 space-y-6">

            {/* Categories */}
            <Card className="glass-card">
              <CardBody className="p-4">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
                  <HiOutlineFolder className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-foreground">Categories</h3>
                </div>

                {categories.length > 0 ? (
                  <nav className="space-y-1">
                    {categories.map((cat) => (
                      <Link
                        key={cat.id}
                        href={`/blogs?category=${cat.id}`}
                        className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all hover:bg-muted ${blog.category_id === cat.id
                          ? 'bg-primary/10 text-primary font-medium'
                          : 'text-muted-foreground hover:text-foreground'
                          }`}
                      >
                        <span>{cat.name}</span>
                        <HiOutlineChevronRight className="w-4 h-4 opacity-50" />
                      </Link>
                    ))}
                  </nav>
                ) : (
                  <p className="text-sm text-muted-foreground italic">No categories</p>
                )}
              </CardBody>
            </Card>

            {/* Blog Info */}
            <Card className="glass-card">
              <CardBody className="p-4 space-y-3">
                <h3 className="font-semibold text-foreground pb-2 border-b border-border">Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <StatusBadge status={blog.status} />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created:</span>
                    <span>{new Date(blog.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Updated:</span>
                    <span>{new Date(blog.updated_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Featured:</span>
                    <span>{blog.is_featured ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Quick Actions */}
            <Card className="glass-card bg-gradient-to-br from-primary/5 to-purple-500/5">
              <CardBody className="p-4 space-y-2">
                <Link href={`/blogs/${id}/edit`} className="block">
                  <Button variant="primary" className="w-full justify-center">
                    <HiOutlinePencilAlt className="w-4 h-4" /> Edit Post
                  </Button>
                </Link>
                <Link href="/blogs/new" className="block">
                  <Button variant="secondary" className="w-full justify-center">
                    Create New Post
                  </Button>
                </Link>
              </CardBody>
            </Card>
          </div>
        </aside>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <Card className="glass-card w-full max-w-md mx-4">
            <CardBody className="p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
                <HiOutlineTrash className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Delete Blog Post?</h3>
              <p className="text-muted-foreground mb-6">
                Are you sure you want to delete "{blog.title}"? This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-center">
                <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                  Cancel
                </Button>
                <Button variant="danger" onClick={() => { setShowDeleteModal(false); handleDelete(); }}>
                  Delete
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
}
