'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardHeader, CardBody } from '@/components/ui';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import api from '@/lib/api';
import { HiOutlineArrowLeft } from 'react-icons/hi';

export default function EditBlogPage({ params }) {
  const router = useRouter();
  const { id } = params;
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    category_id: '',
    excerpt: '',
    content: '',
    status: 'draft',
    featured_image: '',
    meta_title: '',
    meta_description: '',
  });

  useEffect(() => {
    if (id) fetchBlog();
  }, [id]);

  const fetchBlog = async () => {
    try {
      const blog = await api.get(`/blogs/${id}`);
      setFormData({
        title: blog.title || '',
        slug: blog.slug || '',
        category_id: blog.category_id || '',
        excerpt: blog.excerpt || '',
        content: blog.content || '',
        status: blog.status || 'draft',
        featured_image: blog.featured_image || '',
        meta_title: blog.meta_title || '',
        meta_description: blog.meta_description || '',
      });
    } catch (error) {
      console.error('Error fetching blog:', error);
      alert('Failed to load blog post');
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Auto-generate slug from title if slug is empty or user is typing title
    if (name === 'title' && !formData.slug) {
      const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put(`/blogs/${id}`, formData);
      router.push(`/blogs/${id}`);
    } catch (error) {
      console.error('Error updating blog:', error);
      alert(error.message || 'Failed to update blog post');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Page Header */}
      <div className="page-header flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link href={`/blogs/${id}`} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-2">
            <HiOutlineArrowLeft className="w-4 h-4" /> Back to View
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Edit Blog Post</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => router.push(`/blogs/${id}`)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} loading={loading} className="shadow-lg shadow-primary/20">
            Save Changes
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Editor */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="glass-card">
            <CardBody className="space-y-4">
              <Input
                label="Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter post title..."
                required
              />
              <Input
                label="Slug"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                placeholder="post-url-slug"
              />
              <div className="input-wrapper">
                <label className="input-label">Excerpt</label>
                <textarea
                  name="excerpt"
                  value={formData.excerpt}
                  onChange={handleChange}
                  placeholder="Brief summary of the post..."
                  className="input min-h-[80px] resize-none"
                />
              </div>
            </CardBody>
          </Card>

          {/* Content Editor */}
          <Card className="glass-card">
            <CardHeader title="Content" className="pb-4" />
            <CardBody>
              <div className="border border-input rounded-xl overflow-hidden bg-background/50">
                {/* Simple Toolbar */}
                 <div className="flex flex-wrap gap-1 p-2 bg-muted/30 border-b border-input">
                  <button type="button" className="p-1.5 rounded hover:bg-muted text-sm font-bold w-8">B</button>
                  <button type="button" className="p-1.5 rounded hover:bg-muted text-sm italic w-8">I</button>
                  <button type="button" className="p-1.5 rounded hover:bg-muted text-sm underline w-8">U</button>
                  <span className="w-px h-6 bg-border mx-1 self-center" />
                  <button type="button" className="px-2 py-1 rounded hover:bg-muted text-xs font-medium">H1</button>
                  <button type="button" className="px-2 py-1 rounded hover:bg-muted text-xs font-medium">H2</button>
                  <button type="button" className="px-2 py-1 rounded hover:bg-muted text-xs font-medium">H3</button>
                  <span className="w-px h-6 bg-border mx-1 self-center" />
                  <button type="button" className="p-1.5 rounded hover:bg-muted text-sm">📷</button>
                  <button type="button" className="p-1.5 rounded hover:bg-muted text-sm">🔗</button>
                </div> 
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  placeholder="Write your content here... (Markdown supported)"
                  className="w-full p-4 min-h-[400px] border-0 focus:outline-none resize-none bg-transparent"
                />
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Publishing */}
          <Card className="glass-card">
            <CardHeader title="Publishing" className="pb-4" />
            <CardBody className="space-y-4">
              <div className="input-wrapper">
                <label className="input-label">Status</label>
                <select name="status" value={formData.status} onChange={handleChange} className="input">
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="scheduled">Scheduled</option>
                </select>
              </div>
              <div className="input-wrapper">
                <label className="input-label">Category</label>
                <select name="category_id" value={formData.category_id} onChange={handleChange} className="input">
                  <option value="">Select category</option>
                  <option value="1">Tutorial</option>
                  <option value="2">Productivity</option>
                  <option value="3">HR</option>
                  <option value="4">Management</option>
                </select>
              </div>
            </CardBody>
          </Card>

          {/* Featured Image */}
          <Card className="glass-card">
            <CardHeader title="Featured Image" className="pb-4" />
            <CardBody>
              <div className="border-2 border-dashed border-input rounded-xl p-8 text-center hover:bg-muted/20 transition-colors cursor-pointer group">
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">📷</div>
                <p className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  PNG, JPG up to 2MB
                </p>
              </div>
            </CardBody>
          </Card>

          {/* SEO */}
          <Card className="glass-card">
            <CardHeader title="SEO" className="pb-4" />
            <CardBody className="space-y-4">
              <Input
                label="Meta Title"
                name="meta_title"
                value={formData.meta_title}
                onChange={handleChange}
                placeholder="SEO title"
              />
              <div className="input-wrapper">
                <label className="input-label">Meta Description</label>
                <textarea
                  name="meta_description"
                  value={formData.meta_description}
                  onChange={handleChange}
                  placeholder="SEO description..."
                  className="input min-h-[80px] resize-none"
                />
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
