'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardBody } from '@/components/ui';
import Button from '@/components/ui/Button';
import api from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import {
  HiOutlinePencil, HiOutlineTrash, HiOutlineArrowLeft,
  HiOutlineCalendar, HiOutlineUser, HiOutlineTag, HiOutlineEye
} from 'react-icons/hi';

export default function BlogViewPage({ params }) {
  const router = useRouter();
  const toast = useToast();
  const { id } = params;
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchBlog();
  }, [id]);

  const fetchBlog = async () => {
    try {
      const response = await api.get(`/blogs/${id}`);
      setBlog(response);
    } catch (error) {
      console.error('Error fetching blog:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const isConfirmed = await toast.confirm(
      'Delete Blog Post',
      'Are you sure you want to delete this blog post?',
      'Yes, delete'
    );

    if (!isConfirmed) return;

    try {
      await api.delete(`/blogs/${id}`);
      toast.success('Blog post deleted successfully');
      router.push('/blogs');
    } catch (error) {
      console.error('Error deleting blog:', error);
      toast.error('Failed to delete blog post');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center space-y-4">
        <h2 className="text-2xl font-bold text-foreground">Blog Post Not Found</h2>
        <p className="text-muted-foreground">The blog post you're looking for doesn't exist or has been removed.</p>
        <Link href="/blogs">
          <Button variant="primary">Back to Blogs</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/blogs"
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group"
        >
          <div className="p-2 rounded-full bg-white/50 dark:bg-white/5 group-hover:bg-primary/10 transition-colors">
            <HiOutlineArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          </div>
          <span>Back to Blogs</span>
        </Link>
        <div className="flex gap-2">
          <Link href={`/blogs/${id}/edit`}>
            <Button variant="secondary" className="shadow-sm">
              <HiOutlinePencil className="w-4 h-4" /> Edit
            </Button>
          </Link>
          <Button variant="danger" onClick={handleDelete} className="shadow-sm">
            <HiOutlineTrash className="w-4 h-4" /> Delete
          </Button>
        </div>
      </div>

      {/* Hero Image */}
      {blog.featured_image && (
        <div className="w-full h-64 md:h-96 rounded-3xl overflow-hidden shadow-2xl relative group">
          <img
            src={blog.featured_image}
            alt={blog.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

          <div className="absolute bottom-0 left-0 p-8 text-white">
            <span className="bg-primary/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3 inline-block">
              {blog.category || 'General'}
            </span>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight shadow-sm">{blog.title}</h1>
          </div>
        </div>
      )}

      {/* Blog Content Card */}
      <Card className="glass-card overflow-hidden">
        <CardBody className="p-8 md:p-10 space-y-8">

          {/* Post Metadata */}
          {!blog.featured_image && (
            <div className="space-y-4 pb-6 border-b border-border/50">
              <div className="flex items-center gap-2">
                <span className="badge badge-primary">{blog.category || 'General'}</span>
                <span className={`badge ${blog.status === 'published' ? 'badge-success' : 'badge-warning'}`}>
                  {blog.status}
                </span>
              </div>
              <h1 className="text-4xl font-bold text-foreground leading-tight">{blog.title}</h1>
            </div>
          )}

          <div className="flex flex-wrap gap-6 text-sm text-muted-foreground bg-muted/30 p-4 rounded-xl backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <HiOutlineUser className="w-5 h-5 text-primary" />
              <span className="font-medium text-foreground">{blog.author_name || 'Admin'}</span>
            </div>
            <div className="flex items-center gap-2">
              <HiOutlineCalendar className="w-5 h-5 text-primary" />
              <span>{new Date(blog.date || blog.created_at).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</span>
            </div>
            <div className="flex items-center gap-2">
              <HiOutlineEye className="w-5 h-5 text-primary" />
              <span>{blog.views || 0} views</span>
            </div>
          </div>

          <div
            className="prose prose-lg dark:prose-invert max-w-none 
              prose-headings:font-heading prose-headings:font-bold prose-headings:text-foreground
              prose-p:text-muted-foreground prose-p:leading-relaxed
              prose-a:text-primary prose-a:no-underline hover:prose-a:underline
              prose-strong:text-foreground prose-strong:font-bold
              prose-img:rounded-2xl prose-img:shadow-lg
              prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:bg-muted/30 prose-blockquote:p-4 prose-blockquote:rounded-r-xl"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />

        </CardBody>
      </Card>
    </div>
  );
}
