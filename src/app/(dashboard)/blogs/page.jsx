'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardBody, StatusBadge } from '@/components/ui';
import Button from '@/components/ui/Button';
import api from '@/lib/api';
import {
  HiOutlineViewGrid, HiOutlineViewList, HiOutlinePencilAlt,
  HiOutlineDocumentText, HiOutlineCheckCircle, HiOutlineEye, HiOutlinePencil
} from 'react-icons/hi';

export default function BlogsPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('grid');

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const response = await api.get('/blogs');
      setBlogs(response.items || response || []);
    } catch (error) {
      console.error('Error fetching blogs:', error);
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Blog</h1>
          <p className="text-muted-foreground mt-1">Manage your blog posts and content</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-white dark:bg-slate-800 p-1 rounded-xl border border-border/50 shadow-sm">
            <button
              className={`p-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-all ${view === 'grid' ? 'bg-primary/10 text-primary shadow-sm' : 'text-muted-foreground hover:bg-muted'}`}
              onClick={() => setView('grid')}
            >
              <HiOutlineViewGrid className="w-5 h-5" />
            </button>
            <button
              className={`p-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-all ${view === 'list' ? 'bg-primary/10 text-primary shadow-sm' : 'text-muted-foreground hover:bg-muted'}`}
              onClick={() => setView('list')}
            >
              <HiOutlineViewList className="w-5 h-5" />
            </button>
          </div>
          <Link href="/blogs/new">
            <Button variant="primary" className="shadow-lg shadow-primary/20">
              <HiOutlinePencilAlt className="w-5 h-5" /> New Post
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardBody className="flex items-center gap-4 p-5">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <HiOutlineDocumentText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground leading-none mb-1">{blogs.length}</p>
              <p className="text-sm text-muted-foreground font-medium">Total Posts</p>
            </div>
          </CardBody>
        </Card>
        <Card className="glass-card">
          <CardBody className="flex items-center gap-4 p-5">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <HiOutlineCheckCircle className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground leading-none mb-1">{blogs.filter(b => b.status === 'published').length}</p>
              <p className="text-sm text-muted-foreground font-medium">Published</p>
            </div>
          </CardBody>
        </Card>
        <Card className="glass-card">
          <CardBody className="flex items-center gap-4 p-5">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <HiOutlinePencilAlt className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground leading-none mb-1">{blogs.filter(b => b.status === 'draft').length}</p>
              <p className="text-sm text-muted-foreground font-medium">Drafts</p>
            </div>
          </CardBody>
        </Card>
        <Card className="glass-card">
          <CardBody className="flex items-center gap-4 p-5">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <HiOutlineEye className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground leading-none mb-1">{blogs.reduce((sum, b) => sum + (b.views || 0), 0).toLocaleString()}</p>
              <p className="text-sm text-muted-foreground font-medium">Total Views</p>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Blog Grid/List */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="glass-card">
              <div className="h-48 bg-muted/20 animate-pulse" />
              <CardBody className="p-5 space-y-3">
                <div className="h-4 w-3/4 bg-muted/20 animate-pulse rounded" />
                <div className="h-4 w-1/2 bg-muted/20 animate-pulse rounded" />
              </CardBody>
            </Card>
          ))}
        </div>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map((blog) => (
            <Link key={blog.id} href={`/blogs/${blog.id}`} className="block h-full group">
              <Card className="glass-card h-full overflow-hidden hover:ring-2 hover:ring-primary/20">
                <div className="h-48 relative overflow-hidden bg-muted">
                   {blog.featured_image ? (
                     <img src={blog.featured_image} alt={blog.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                   ) : (
                     <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
                       <HiOutlineDocumentText className="w-12 h-12 text-muted-foreground/30" />
                     </div>
                   )}
                   <div className="absolute top-3 right-3">
                     <StatusBadge status={blog.status} />
                   </div>
                </div>
                
                <CardBody className="p-5 flex flex-col h-[calc(100%-12rem)]">
                  <div className="mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-1 rounded-full">
                      {blog.category || 'General'}
                    </span>
                  </div>
                  
                  <h3 className="font-bold text-lg mb-2 text-foreground line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                    {blog.title}
                  </h3>
                  
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-4 flex-1">
                    {blog.excerpt || 'No description available.'}
                  </p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-border/30 text-xs text-muted-foreground mt-auto">
                    <span>{new Date(blog.date || blog.created_at).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1.5 px-2 py-1 bg-muted/30 rounded-md">
                      <HiOutlineEye className="w-3.5 h-3.5" /> {blog.views?.toLocaleString() || 0}
                    </span>
                  </div>
                </CardBody>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card className="glass-card overflow-hidden border-0 shadow-xl">
          <div className="table-container border-0 bg-transparent">
            <table className="table">
              <thead>
                <tr>
                  <th className="w-[40%]">Post Details</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Views</th>
                  <th>Date</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {blogs.map((blog) => (
                  <tr key={blog.id} className="group hover:bg-muted/30 transition-colors">
                    <td>
                      <Link href={`/blogs/${blog.id}`} className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-muted flex-shrink-0 overflow-hidden">
                          {blog.featured_image ? (
                            <img src={blog.featured_image} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-800">
                              <HiOutlineDocumentText className="w-5 h-5 text-muted-foreground/40" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground group-hover:text-primary transition-colors">{blog.title}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1">{blog.excerpt}</p>
                        </div>
                      </Link>
                    </td>
                    <td>
                      <span className="text-xs font-medium px-2 py-1 bg-primary/10 text-primary rounded-md">
                        {blog.category || 'Uncategorized'}
                      </span>
                    </td>
                    <td><StatusBadge status={blog.status} /></td>
                    <td className="text-sm text-muted-foreground font-medium">{blog.views?.toLocaleString() || 0}</td>
                    <td className="text-sm text-muted-foreground">{new Date(blog.date || blog.created_at).toLocaleDateString()}</td>
                    <td className="text-right">
                      <div className="flex justify-end gap-2">
                         <Link href={`/blogs/${blog.id}/edit`}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-primary">
                            <HiOutlinePencil className="w-4 h-4" />
                          </Button>
                        </Link>
                         <Link href={`/blogs/${blog.id}`}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-blue-500">
                            <HiOutlineEye className="w-4 h-4" />
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
