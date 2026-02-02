'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardBody, StatusBadge, PageHeader } from '@/components/ui';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import api from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import {
  HiOutlineViewGrid, HiOutlineViewList, HiOutlinePencilAlt,
  HiOutlineDocumentText, HiOutlineCheckCircle, HiOutlineEye, HiOutlinePencil,
  HiOutlineTrash, HiOutlinePlus, HiOutlineTag, HiOutlineUser, HiOutlineCollection,
  HiOutlineSparkles, HiOutlineTrendingUp, HiOutlineCalendar, HiOutlineClock
} from 'react-icons/hi';

// Tab definitions
const TABS = [
  { id: 'blogs', label: 'Blog Posts' },
  { id: 'categories', label: 'Categories' },
  { id: 'authors', label: 'Authors' },
];

export default function BlogsPage() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('blogs');
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('grid');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal states
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showAuthorModal, setShowAuthorModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingAuthor, setEditingAuthor] = useState(null);
  const [saving, setSaving] = useState(false);

  // Form states
  const [categoryForm, setCategoryForm] = useState({ name: '', slug: '', description: '', order: 0 });
  const [authorForm, setAuthorForm] = useState({ user_id: '', display_name: '', bio: '' });
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'blogs') {
        const response = await api.get('/blogs');
        setBlogs(response.items || response || []);
      } else if (activeTab === 'categories') {
        const response = await api.get('/blog-categories');
        setCategories(response || []);
      } else if (activeTab === 'authors') {
        const [authorsRes, usersRes] = await Promise.all([
          api.get('/blog-authors'),
          api.get('/users')
        ]);
        setAuthors(authorsRes || []);
        setUsers(usersRes.items || usersRes || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Category CRUD
  const openCategoryModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setCategoryForm({
        name: category.name || '',
        slug: category.slug || '',
        description: category.description || '',
        order: category.order || 0
      });
    } else {
      setEditingCategory(null);
      setCategoryForm({ name: '', slug: '', description: '', order: 0 });
    }
    setShowCategoryModal(true);
  };

  const handleCategorySubmit = async () => {
    if (!categoryForm.name || !categoryForm.slug) {
      toast.error('Name and slug are required');
      return;
    }
    setSaving(true);
    try {
      if (editingCategory) {
        await api.put(`/blog-categories/${editingCategory.id}`, categoryForm);
        toast.success('Category updated successfully');
      } else {
        await api.post('/blog-categories', categoryForm);
        toast.success('Category created successfully');
      }
      setShowCategoryModal(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  const deleteCategory = async (id) => {
    const confirmed = await toast.confirm('Delete Category', 'Are you sure you want to delete this category?', 'Delete');
    if (!confirmed) return;
    try {
      await api.delete(`/blog-categories/${id}`);
      toast.success('Category deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete category');
    }
  };

  // Author CRUD
  const openAuthorModal = (author = null) => {
    if (author) {
      setEditingAuthor(author);
      setAuthorForm({
        user_id: author.user_id || '',
        display_name: author.display_name || '',
        bio: author.bio || ''
      });
    } else {
      setEditingAuthor(null);
      setAuthorForm({ user_id: '', display_name: '', bio: '' });
    }
    setShowAuthorModal(true);
  };

  const handleAuthorSubmit = async () => {
    if (!authorForm.user_id) {
      toast.error('Please select a user');
      return;
    }
    setSaving(true);
    try {
      const data = {
        ...authorForm,
        user_id: parseInt(authorForm.user_id)
      };
      if (editingAuthor) {
        await api.put(`/blog-authors/${editingAuthor.id}`, data);
        toast.success('Author updated successfully');
      } else {
        await api.post('/blog-authors', data);
        toast.success('Author created successfully');
      }
      setShowAuthorModal(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to save author');
    } finally {
      setSaving(false);
    }
  };

  const deleteAuthor = async (id) => {
    const confirmed = await toast.confirm('Delete Author', 'Are you sure you want to delete this author?', 'Delete');
    if (!confirmed) return;
    try {
      await api.delete(`/blog-authors/${id}`);
      toast.success('Author deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete author');
    }
  };

  // Auto-generate slug
  const handleCategoryNameChange = (e) => {
    const name = e.target.value;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    setCategoryForm(prev => ({ ...prev, name, slug }));
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Page Header */}
      <PageHeader
        title="Blog Management"
        description="Create, manage, and publish your content"
      >
        <div className="flex flex-wrap items-center gap-3">
          {activeTab === 'blogs' && (
            <>
              {/* View Toggle */}
              <div className="flex bg-muted/30 p-1 rounded-xl border border-border/40">
                <button
                  className={`p-2.5 rounded-lg transition-all duration-200 ${view === 'grid' ? 'bg-background text-primary shadow-sm ring-1 ring-black/5 dark:ring-white/10' : 'text-muted-foreground hover:text-foreground hover:bg-background/50'}`}
                  onClick={() => setView('grid')}
                >
                  <HiOutlineViewGrid className="w-5 h-5" />
                </button>
                <button
                  className={`p-2.5 rounded-lg transition-all duration-200 ${view === 'list' ? 'bg-background text-primary shadow-sm ring-1 ring-black/5 dark:ring-white/10' : 'text-muted-foreground hover:text-foreground hover:bg-background/50'}`}
                  onClick={() => setView('list')}
                >
                  <HiOutlineViewList className="w-5 h-5" />
                </button>
              </div>
              <Link href="/blogs/new">
                <Button variant="primary" className="shadow-lg shadow-primary/20">
                  <HiOutlinePlus className="w-5 h-5" /> New Post
                </Button>
              </Link>
            </>
          )}
          {activeTab === 'categories' && (
            <Button variant="primary" onClick={() => openCategoryModal()} className="shadow-lg shadow-primary/20">
              <HiOutlinePlus className="w-5 h-5" /> New Category
            </Button>
          )}
          {activeTab === 'authors' && (
            <Button variant="primary" onClick={() => openAuthorModal()} className="shadow-lg shadow-primary/20">
              <HiOutlinePlus className="w-5 h-5" /> New Author
            </Button>
          )}
        </div>
      </PageHeader>

      {/* Tabs */}
      <div className="flex p-1 space-x-1 bg-muted/30 rounded-xl w-fit border border-border/40">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              px-6 py-2.5 text-sm font-medium rounded-lg transition-all duration-200
              ${activeTab === tab.id
                ? 'bg-background text-primary shadow-sm ring-1 ring-black/5 dark:ring-white/10'
                : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
              }
            `}
          >
            {tab.label}
            <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${activeTab === tab.id ? 'bg-primary/10 text-primary' : 'bg-muted-foreground/20'}`}>
              {tab.id === 'blogs' ? blogs.length : tab.id === 'categories' ? categories.length : authors.length}
            </span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="mt-4 text-muted-foreground">Loading content...</p>
        </div>
      ) : (
        <>
          {/* Blogs Tab */}
          {activeTab === 'blogs' && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="glass-card">
                  <CardBody className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <HiOutlineDocumentText className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{blogs.length}</p>
                        <p className="text-sm text-muted-foreground">Total Posts</p>
                      </div>
                    </div>
                  </CardBody>
                </Card>

                <Card className="glass-card">
                  <CardBody className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                        <HiOutlineCheckCircle className="w-5 h-5 text-emerald-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{blogs.filter(b => b.status === 'published').length}</p>
                        <p className="text-sm text-muted-foreground">Published</p>
                      </div>
                    </div>
                  </CardBody>
                </Card>

                <Card className="glass-card">
                  <CardBody className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                        <HiOutlinePencilAlt className="w-5 h-5 text-amber-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{blogs.filter(b => b.status === 'draft').length}</p>
                        <p className="text-sm text-muted-foreground">Drafts</p>
                      </div>
                    </div>
                  </CardBody>
                </Card>

                <Card className="glass-card">
                  <CardBody className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                        <HiOutlineTrendingUp className="w-5 h-5 text-purple-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{blogs.reduce((sum, b) => sum + (b.views || 0), 0).toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">Total Views</p>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </div>

              {/* Search & Filters */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-wrap gap-2">
                  {['all', 'published', 'draft', 'archived'].map((status) => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${statusFilter === status
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                      {status !== 'all' && (
                        <span className="ml-2 text-xs opacity-70">
                          {blogs.filter(b => b.status === status).length}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search posts..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="input w-full md:w-64 pl-10"
                  />
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              {/* Blog Grid/List */}
              {(() => {
                const filteredBlogs = blogs.filter(blog => {
                  const matchesStatus = statusFilter === 'all' || blog.status === statusFilter;
                  const matchesSearch = !search || blog.title?.toLowerCase().includes(search.toLowerCase()) || blog.excerpt?.toLowerCase().includes(search.toLowerCase());
                  return matchesStatus && matchesSearch;
                });

                if (filteredBlogs.length === 0) {
                  return (
                    <div className="text-center py-16">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-muted flex items-center justify-center">
                        <HiOutlineDocumentText className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">No posts found</h3>
                      <p className="text-muted-foreground">Try adjusting your search or filters</p>
                    </div>
                  );
                }

                return view === 'grid' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredBlogs.map((blog) => (
                      <Link key={blog.id} href={`/blogs/${blog.id}`} className="block h-full group">
                        <Card className="glass-card h-full hover:shadow-lg transition-all duration-300">
                          {/* Image Container */}
                          <div className="h-48 relative overflow-hidden rounded-t-xl">
                            {blog.featured_image || blog.banner_image ? (
                              <img
                                src={api.getMediaUrl(blog.banner_image || blog.featured_image)}
                                alt={blog.banner_image_alt || blog.featured_image_alt || blog.title}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                              />
                            ) : (
                              <div className="w-full h-full bg-muted flex items-center justify-center">
                                <HiOutlineDocumentText className="w-12 h-12 text-muted-foreground" />
                              </div>
                            )}

                            {/* Status Badge */}
                            <div className="absolute top-3 right-3">
                              <StatusBadge status={blog.status} />
                            </div>

                            {/* Category Pill */}
                            <div className="absolute top-3 left-3">
                              <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium bg-background/90 backdrop-blur-sm rounded-full">
                                {blog.category?.name || blog.category_name || 'General'}
                              </span>
                            </div>

                            {/* Quick Actions */}
                            <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Link href={`/blogs/${blog.id}/edit`} onClick={(e) => e.stopPropagation()}>
                                <button className="w-8 h-8 rounded-lg bg-background/90 backdrop-blur-sm flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground transition-colors">
                                  <HiOutlinePencil className="w-4 h-4" />
                                </button>
                              </Link>
                            </div>
                          </div>

                          {/* Content */}
                          <CardBody className="p-4">
                            <h3 className="font-semibold text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                              {blog.title}
                            </h3>
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                              {blog.excerpt || 'No description available.'}
                            </p>

                            {/* Footer Meta */}
                            <div className="flex items-center justify-between pt-3 border-t border-border">
                              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                <HiOutlineCalendar className="w-4 h-4" />
                                <span>{new Date(blog.blog_date || blog.created_at).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
                                <HiOutlineEye className="w-4 h-4" />
                                <span>{blog.views?.toLocaleString() || 0}</span>
                              </div>
                            </div>
                          </CardBody>
                        </Card>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <Card className="glass-card overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-muted/50 border-b border-border">
                            <th className="text-left px-4 py-3 text-sm font-semibold w-[40%]">Post Details</th>
                            <th className="text-left px-4 py-3 text-sm font-semibold">Category</th>
                            <th className="text-left px-4 py-3 text-sm font-semibold">Status</th>
                            <th className="text-left px-4 py-3 text-sm font-semibold">Views</th>
                            <th className="text-left px-4 py-3 text-sm font-semibold">Date</th>
                            <th className="text-right px-4 py-3 text-sm font-semibold">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {filteredBlogs.map((blog) => (
                            <tr key={blog.id} className="group hover:bg-muted/30 transition-colors">
                              <td className="px-4 py-3">
                                <Link href={`/blogs/${blog.id}`} className="flex items-center gap-3">
                                  <div className="w-12 h-12 rounded-lg bg-muted flex-shrink-0 overflow-hidden">
                                    {blog.featured_image || blog.banner_image ? (
                                      <img src={api.getMediaUrl(blog.banner_image || blog.featured_image)} alt={blog.banner_image_alt || blog.featured_image_alt || blog.title} className="w-full h-full object-cover" />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center">
                                        <HiOutlineDocumentText className="w-5 h-5 text-muted-foreground" />
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    <p className="font-medium group-hover:text-primary transition-colors">{blog.title}</p>
                                    <p className="text-sm text-muted-foreground line-clamp-1 max-w-xs">{blog.excerpt}</p>
                                  </div>
                                </Link>
                              </td>
                              <td className="px-4 py-3">
                                <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium bg-muted rounded-lg">
                                  {blog.category?.name || blog.category_name || 'Uncategorized'}
                                </span>
                              </td>
                              <td className="px-4 py-3"><StatusBadge status={blog.status} /></td>
                              <td className="px-4 py-3">
                                <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                                  <HiOutlineEye className="w-4 h-4" />
                                  {blog.views?.toLocaleString() || 0}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm text-muted-foreground">{new Date(blog.blog_date || blog.created_at).toLocaleDateString()}</td>
                              <td className="px-4 py-3">
                                <div className="flex justify-end gap-1">
                                  <Link href={`/blogs/${blog.id}/edit`}>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                      <HiOutlinePencil className="w-4 h-4" />
                                    </Button>
                                  </Link>
                                  <Link href={`/blogs/${blog.id}`}>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
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
                )
              })()}
            </div>
          )}

          {/* Categories Tab */}
          {activeTab === 'categories' && (
            <Card className="glass-card overflow-hidden">
              {categories.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-muted flex items-center justify-center">
                    <HiOutlineTag className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No categories yet</h3>
                  <p className="text-muted-foreground mb-6">Create your first category to organize your posts</p>
                  <Button variant="primary" onClick={() => openCategoryModal()}>
                    <HiOutlinePlus className="w-5 h-5" /> Create Category
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-muted/50 border-b border-border">
                        <th className="text-left px-4 py-3 text-sm font-semibold">Name</th>
                        <th className="text-left px-4 py-3 text-sm font-semibold">Slug</th>
                        <th className="text-left px-4 py-3 text-sm font-semibold">Description</th>
                        <th className="text-left px-4 py-3 text-sm font-semibold">Order</th>
                        <th className="text-right px-4 py-3 text-sm font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {categories.map((cat) => (
                        <tr key={cat.id} className="group hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                                {cat.name?.charAt(0).toUpperCase()}
                              </div>
                              <span className="font-medium">{cat.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <code className="px-2 py-1 bg-muted rounded text-sm font-mono text-muted-foreground">
                              {cat.slug}
                            </code>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground text-sm max-w-xs truncate">{cat.description || '—'}</td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-muted text-sm font-medium">
                              {cat.order}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="sm" onClick={() => openCategoryModal(cat)} className="h-8 w-8 p-0">
                                <HiOutlinePencil className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={() => deleteCategory(cat.id)}>
                                <HiOutlineTrash className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          )}

          {/* Authors Tab */}
          {activeTab === 'authors' && (
            <Card className="glass-card overflow-hidden">
              {authors.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-muted flex items-center justify-center">
                    <HiOutlineUser className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No authors yet</h3>
                  <p className="text-muted-foreground mb-6">Create your first author profile to assign posts</p>
                  <Button variant="primary" onClick={() => openAuthorModal()}>
                    <HiOutlinePlus className="w-5 h-5" /> Create Author
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                  {authors.map((author) => (
                    <div key={author.id} className="group relative bg-muted/30 rounded-xl p-4 border border-border hover:shadow-md transition-all">
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-lg font-bold">
                          {author.display_name?.charAt(0).toUpperCase() || 'A'}
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="sm" onClick={() => openAuthorModal(author)} className="h-7 w-7 p-0">
                            <HiOutlinePencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-500 hover:text-red-600" onClick={() => deleteAuthor(author.id)}>
                            <HiOutlineTrash className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                      <h3 className="font-semibold mb-1">{author.display_name || 'Unnamed Author'}</h3>
                      <p className="text-xs text-muted-foreground mb-2">User ID: {author.user_id}</p>
                      <p className="text-sm text-muted-foreground line-clamp-2">{author.bio || 'No bio available.'}</p>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}
        </>
      )
      }

      {/* Category Modal */}
      {
        showCategoryModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowCategoryModal(false)} />
            <div className="relative z-10 w-full max-w-md bg-background rounded-xl shadow-2xl border border-border overflow-hidden animate-in zoom-in-95 fade-in">
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-border">
                <h2 className="text-lg font-semibold">{editingCategory ? 'Edit Category' : 'New Category'}</h2>
                <p className="text-sm text-muted-foreground">Organize your blog content</p>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-4">
                <Input
                  label="Name *"
                  value={categoryForm.name}
                  onChange={handleCategoryNameChange}
                  placeholder="Category name"
                />
                <Input
                  label="Slug *"
                  value={categoryForm.slug}
                  onChange={(e) => setCategoryForm(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="category-slug"
                />
                <div className="input-wrapper">
                  <label className="input-label">Description</label>
                  <textarea
                    value={categoryForm.description}
                    onChange={(e) => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Category description..."
                    className="input resize-none"
                    rows={3}
                  />
                </div>
                <Input
                  label="Order"
                  type="number"
                  value={categoryForm.order}
                  onChange={(e) => setCategoryForm(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                />
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-3 px-6 py-4 bg-muted/30 border-t border-border">
                <Button variant="secondary" onClick={() => setShowCategoryModal(false)}>Cancel</Button>
                <Button variant="primary" onClick={handleCategorySubmit} loading={saving}>
                  {editingCategory ? 'Update' : 'Create'}
                </Button>
              </div>
            </div>
          </div>
        )
      }

      {/* Author Modal */}
      {
        showAuthorModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowAuthorModal(false)} />
            <div className="relative z-10 w-full max-w-md bg-background rounded-xl shadow-2xl border border-border overflow-hidden animate-in zoom-in-95 fade-in">
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-border">
                <h2 className="text-lg font-semibold">{editingAuthor ? 'Edit Author' : 'New Author'}</h2>
                <p className="text-sm text-muted-foreground">Create an author profile</p>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-4">
                <div className="input-wrapper">
                  <label className="input-label">User *</label>
                  <select
                    value={authorForm.user_id}
                    onChange={(e) => setAuthorForm(prev => ({ ...prev, user_id: e.target.value }))}
                    className="input"
                    disabled={!!editingAuthor}
                  >
                    <option value="">Select a user</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>{user.full_name || user.email}</option>
                    ))}
                  </select>
                </div>
                <Input
                  label="Display Name"
                  value={authorForm.display_name}
                  onChange={(e) => setAuthorForm(prev => ({ ...prev, display_name: e.target.value }))}
                  placeholder="Author display name"
                />
                <div className="input-wrapper">
                  <label className="input-label">Bio</label>
                  <textarea
                    value={authorForm.bio}
                    onChange={(e) => setAuthorForm(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="Author bio..."
                    className="input resize-none"
                    rows={4}
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-3 px-6 py-4 bg-muted/30 border-t border-border">
                <Button variant="secondary" onClick={() => setShowAuthorModal(false)}>Cancel</Button>
                <Button variant="primary" onClick={handleAuthorSubmit} loading={saving}>
                  {editingAuthor ? 'Update' : 'Create'}
                </Button>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
}
