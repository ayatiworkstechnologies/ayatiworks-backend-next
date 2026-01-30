'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardBody, StatusBadge } from '@/components/ui';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import api from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import {
  HiOutlineViewGrid, HiOutlineViewList, HiOutlinePencilAlt,
  HiOutlineDocumentText, HiOutlineCheckCircle, HiOutlineEye, HiOutlinePencil,
  HiOutlineTrash, HiOutlinePlus, HiOutlineTag, HiOutlineUser, HiOutlineCollection
} from 'react-icons/hi';

// Tab definitions
const TABS = [
  { id: 'blogs', label: 'Blog Posts', icon: HiOutlineDocumentText },
  { id: 'categories', label: 'Categories', icon: HiOutlineTag },
  { id: 'authors', label: 'Authors', icon: HiOutlineUser },
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
    <div className="space-y-6 animate-fade-in-up">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Blog Management</h1>
          <p className="text-muted-foreground mt-1">Manage blog posts, categories, and authors</p>
        </div>
        <div className="flex items-center gap-3">
          {activeTab === 'blogs' && (
            <>
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
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-white dark:bg-slate-800 rounded-xl border border-border/50 shadow-sm w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id
              ? 'bg-primary text-white shadow-md'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Blogs Tab */}
          {activeTab === 'blogs' && (
            <>
              {/* Featured Blog Hero */}
              {blogs.filter(b => b.is_featured && b.status === 'published')[0] && (() => {
                const featured = blogs.filter(b => b.is_featured && b.status === 'published')[0];
                return (
                  <div className="relative rounded-2xl overflow-hidden h-64 md:h-80 group mb-6">
                    {featured.banner_image || featured.featured_image ? (
                      <img src={featured.banner_image || featured.featured_image} alt={featured.banner_image_alt || featured.featured_image_alt || featured.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/20 via-purple-500/20 to-pink-500/20" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold uppercase tracking-wider bg-amber-500 text-white rounded-full mb-3">
                        ⭐ Featured Post
                      </span>
                      <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2 drop-shadow-lg">
                        {featured.title}
                      </h2>
                      <p className="text-white/80 text-sm md:text-base line-clamp-2 max-w-2xl mb-4">
                        {featured.excerpt || 'Read this featured article...'}
                      </p>
                      <Link href={`/blogs/${featured.id}`}>
                        <Button variant="primary" className="shadow-lg">
                          Read Article <HiOutlineEye className="w-4 h-4 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })()}

              {/* Search & Filters */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="flex flex-wrap gap-2">
                  {['all', 'published', 'draft', 'archived'].map((status) => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${statusFilter === status
                        ? 'bg-primary text-white shadow-md'
                        : 'bg-white dark:bg-slate-800 text-muted-foreground hover:bg-muted border border-border/50'
                        }`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                      {status !== 'all' && (
                        <span className="ml-1.5 text-xs opacity-70">
                          ({blogs.filter(b => b.status === status).length})
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
                    className="w-full md:w-64 pl-10 pr-4 py-2.5 rounded-xl border border-border/50 bg-white dark:bg-slate-800 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <Card className="glass-card">
                  <CardBody className="flex items-center gap-4 p-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                      <HiOutlineDocumentText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xl font-bold text-foreground leading-none">{blogs.length}</p>
                      <p className="text-xs text-muted-foreground font-medium">Total</p>
                    </div>
                  </CardBody>
                </Card>
                <Card className="glass-card">
                  <CardBody className="flex items-center gap-4 p-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                      <HiOutlineCheckCircle className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-xl font-bold text-foreground leading-none">{blogs.filter(b => b.status === 'published').length}</p>
                      <p className="text-xs text-muted-foreground font-medium">Published</p>
                    </div>
                  </CardBody>
                </Card>
                <Card className="glass-card">
                  <CardBody className="flex items-center gap-4 p-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                      <HiOutlinePencilAlt className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-xl font-bold text-foreground leading-none">{blogs.filter(b => b.status === 'draft').length}</p>
                      <p className="text-xs text-muted-foreground font-medium">Drafts</p>
                    </div>
                  </CardBody>
                </Card>
                <Card className="glass-card">
                  <CardBody className="flex items-center gap-4 p-4">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                      <HiOutlineEye className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xl font-bold text-foreground leading-none">{blogs.reduce((sum, b) => sum + (b.views || 0), 0).toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground font-medium">Views</p>
                    </div>
                  </CardBody>
                </Card>
              </div>

              {/* Blog Grid/List */}
              {(() => {
                const filteredBlogs = blogs.filter(blog => {
                  const matchesStatus = statusFilter === 'all' || blog.status === statusFilter;
                  const matchesSearch = !search || blog.title?.toLowerCase().includes(search.toLowerCase()) || blog.excerpt?.toLowerCase().includes(search.toLowerCase());
                  return matchesStatus && matchesSearch;
                });
                return view === 'grid' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredBlogs.map((blog) => (
                      <Link key={blog.id} href={`/blogs/${blog.id}`} className="block h-full group">
                        <Card className="glass-card h-full overflow-hidden hover:ring-2 hover:ring-primary/20">
                          <div className="h-48 relative overflow-hidden bg-muted">
                            {blog.featured_image || blog.banner_image ? (
                              <img src={api.getMediaUrl(blog.banner_image || blog.featured_image)} alt={blog.banner_image_alt || blog.featured_image_alt || blog.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
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
                                {blog.category?.name || blog.category_name || 'General'}
                              </span>
                            </div>

                            <h3 className="font-bold text-lg mb-2 text-foreground line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                              {blog.title}
                            </h3>

                            <p className="text-sm text-muted-foreground line-clamp-3 mb-4 flex-1">
                              {blog.excerpt || 'No description available.'}
                            </p>

                            <div className="flex items-center justify-between pt-4 border-t border-border/30 text-xs text-muted-foreground mt-auto">
                              <span>{new Date(blog.blog_date || blog.created_at).toLocaleDateString()}</span>
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
                          {filteredBlogs.map((blog) => (
                            <tr key={blog.id} className="group hover:bg-muted/30 transition-colors">
                              <td>
                                <Link href={`/blogs/${blog.id}`} className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-lg bg-muted flex-shrink-0 overflow-hidden">
                                    {blog.featured_image || blog.banner_image ? (
                                      <img src={api.getMediaUrl(blog.banner_image || blog.featured_image)} alt={blog.banner_image_alt || blog.featured_image_alt || blog.title} className="w-full h-full object-cover" />
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
                                  {blog.category?.name || blog.category_name || 'Uncategorized'}
                                </span>
                              </td>
                              <td><StatusBadge status={blog.status} /></td>
                              <td className="text-sm text-muted-foreground font-medium">{blog.views?.toLocaleString() || 0}</td>
                              <td className="text-sm text-muted-foreground">{new Date(blog.blog_date || blog.created_at).toLocaleDateString()}</td>
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
                )
              })()}
            </>
          )}

          {/* Categories Tab */}
          {activeTab === 'categories' && (
            <Card className="glass-card">
              <CardBody>
                {categories.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <HiOutlineTag className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>No categories yet. Create your first category.</p>
                  </div>
                ) : (
                  <div className="table-container">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Slug</th>
                          <th>Description</th>
                          <th>Order</th>
                          <th className="text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {categories.map((cat) => (
                          <tr key={cat.id} className="hover:bg-muted/30">
                            <td className="font-medium text-foreground">{cat.name}</td>
                            <td className="text-muted-foreground font-mono text-sm">{cat.slug}</td>
                            <td className="text-muted-foreground text-sm max-w-xs truncate">{cat.description || '-'}</td>
                            <td className="text-muted-foreground">{cat.order}</td>
                            <td className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="sm" onClick={() => openCategoryModal(cat)}>
                                  <HiOutlinePencil className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600" onClick={() => deleteCategory(cat.id)}>
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
              </CardBody>
            </Card>
          )}

          {/* Authors Tab */}
          {activeTab === 'authors' && (
            <Card className="glass-card">
              <CardBody>
                {authors.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <HiOutlineUser className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>No authors yet. Create your first author profile.</p>
                  </div>
                ) : (
                  <div className="table-container">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Display Name</th>
                          <th>User ID</th>
                          <th>Bio</th>
                          <th className="text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {authors.map((author) => (
                          <tr key={author.id} className="hover:bg-muted/30">
                            <td className="font-medium text-foreground">{author.display_name || '-'}</td>
                            <td className="text-muted-foreground">{author.user_id}</td>
                            <td className="text-muted-foreground text-sm max-w-xs truncate">{author.bio || '-'}</td>
                            <td className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="sm" onClick={() => openAuthorModal(author)}>
                                  <HiOutlinePencil className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600" onClick={() => deleteAuthor(author.id)}>
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
              </CardBody>
            </Card>
          )}
        </>
      )}

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <Card className="glass-card w-full max-w-md mx-4">
            <CardHeader title={editingCategory ? 'Edit Category' : 'New Category'} />
            <CardBody className="space-y-4">
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
                  className="input min-h-[80px] resize-none"
                />
              </div>
              <Input
                label="Order"
                type="number"
                value={categoryForm.order}
                onChange={(e) => setCategoryForm(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
              />
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="secondary" onClick={() => setShowCategoryModal(false)}>Cancel</Button>
                <Button variant="primary" onClick={handleCategorySubmit} loading={saving}>
                  {editingCategory ? 'Update' : 'Create'}
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Author Modal */}
      {showAuthorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <Card className="glass-card w-full max-w-md mx-4">
            <CardHeader title={editingAuthor ? 'Edit Author' : 'New Author'} />
            <CardBody className="space-y-4">
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
                  className="input min-h-[100px] resize-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="secondary" onClick={() => setShowAuthorModal(false)}>Cancel</Button>
                <Button variant="primary" onClick={handleAuthorSubmit} loading={saving}>
                  {editingAuthor ? 'Update' : 'Create'}
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
}
