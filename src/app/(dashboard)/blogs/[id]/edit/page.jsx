'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardBody, RichTextEditor, StatusBadge, ImageUpload } from '@/components/ui';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import api from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import {
  HiOutlineArrowLeft, HiOutlinePlus, HiOutlineTrash,
  HiOutlineChevronDown, HiOutlineChevronUp, HiOutlineSave,
  HiOutlineDocumentText, HiOutlineGlobe, HiOutlineMenuAlt2, HiOutlinePhotograph,
  HiOutlineCode, HiOutlineAnnotation, HiOutlineVideoCamera, HiOutlineLink,
  HiOutlineFolder, HiOutlineEye, HiOutlinePencilAlt
} from 'react-icons/hi';

// Section type definitions
const SECTION_TYPES = [
  { id: 'content', label: 'Content', icon: HiOutlineMenuAlt2, description: 'Rich text with heading' },
  { id: 'image', label: 'Image', icon: HiOutlinePhotograph, description: 'Image with caption' },
  { id: 'quote', label: 'Quote', icon: HiOutlineAnnotation, description: 'Blockquote with author' },
  { id: 'code', label: 'Code', icon: HiOutlineCode, description: 'Code snippet' },
  { id: 'video', label: 'Video', icon: HiOutlineVideoCamera, description: 'YouTube/Vimeo' },
  { id: 'cta', label: 'CTA', icon: HiOutlineLink, description: 'Call to action' },
];

// Block Inserter Component
const BlockInserter = ({ onInsert }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative flex justify-center my-4">
      <div className="absolute inset-x-0 h-px bg-border top-1/2 -z-10" />
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all ${isOpen ? 'bg-primary border-primary text-white rotate-45' : 'bg-background border-border text-muted-foreground hover:border-primary hover:text-primary'
          }`}
      >
        <HiOutlinePlus className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 p-2 bg-popover border border-border rounded-xl shadow-xl z-50 grid grid-cols-3 gap-1 w-72 animate-in fade-in zoom-in-95">
          {SECTION_TYPES.map((type) => (
            <button
              key={type.id}
              type="button"
              onClick={() => { onInsert(type.id); setIsOpen(false); }}
              className="flex flex-col items-center gap-1.5 p-3 rounded-lg hover:bg-muted/50 transition-colors text-center"
            >
              <type.icon className="w-5 h-5 text-primary" />
              <span className="text-xs font-medium">{type.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default function EditBlogPage({ params }) {
  const router = useRouter();
  const toast = useToast();
  const { id } = params;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Data from API
  const [categories, setCategories] = useState([]);
  const [authors, setAuthors] = useState([]);

  // Form data
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    banner_image: '',
    banner_image_alt: '',
    banner_title: '',
    featured_image: '',
    featured_image_alt: '',
    category_id: '',
    excerpt: '',
    content: '',
    blog_date: '',
    read_time: '',
    status: 'draft',
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
    is_featured: false,
    tags: '',
    author_id: '',
  });

  // Dynamic sections
  const [sections, setSections] = useState([]);
  const [expandedSections, setExpandedSections] = useState({});

  useEffect(() => {
    if (id) {
      fetchBlog();
      fetchDropdownData();
    }
  }, [id]);

  const fetchBlog = async () => {
    try {
      const data = await api.get(`/blogs/${id}`);

      setFormData({
        title: data.title || '',
        slug: data.slug || '',
        banner_image: data.banner_image || '',
        banner_image_alt: data.banner_image_alt || '',
        banner_title: data.banner_title || '',
        featured_image: data.featured_image || '',
        featured_image_alt: data.featured_image_alt || '',
        category_id: data.category_id?.toString() || '',
        excerpt: data.excerpt || '',
        content: data.content || '',
        blog_date: data.blog_date?.split('T')[0] || '',
        read_time: data.read_time?.toString() || '',
        status: data.status || 'draft',
        meta_title: data.meta_title || '',
        meta_description: data.meta_description || '',
        meta_keywords: data.meta_keywords || '',
        is_featured: data.is_featured || false,
        tags: Array.isArray(data.tags) ? data.tags.join(', ') : (data.tags || ''),
        author_id: data.author_id?.toString() || '',
      });

      // Load sections
      if (data.sections && Array.isArray(data.sections)) {
        const mappedSections = data.sections.map((s, idx) => ({
          id: s.id || Date.now() + idx,
          section_type: s.section_type || 'content',
          order: s.order ?? idx,
          heading: s.heading || '',
          content: s.content || '',
          image: s.image || '',
          image_alt: s.image_alt || '',
          image_caption: s.image_caption || '',
          quote: s.quote || '',
          quote_author: s.quote_author || '',
          code: s.code || '',
          code_language: s.code_language || 'javascript',
          video_url: s.video_url || '',
          cta_text: s.cta_text || '',
          cta_url: s.cta_url || '',
        }));
        setSections(mappedSections.sort((a, b) => a.order - b.order));
      }
    } catch (error) {
      console.error('Error fetching blog:', error);
      toast?.error?.('Failed to load blog');
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdownData = async () => {
    try {
      const [catData, authorData] = await Promise.all([
        api.get('/blog-categories').catch(() => []),
        api.get('/blog-authors').catch(() => []),
      ]);
      setCategories(catData || []);
      setAuthors(authorData || []);
    } catch (error) {
      console.error('Error fetching dropdown data:', error);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addSection = (type) => {
    const newSection = {
      id: Date.now(),
      section_type: type,
      order: sections.length,
      heading: '',
      content: '',
      image: '',
      image_alt: '',
      image_caption: '',
      quote: '',
      quote_author: '',
      code: '',
      code_language: 'javascript',
      video_url: '',
      cta_text: '',
      cta_url: '',
    };
    setSections([...sections, newSection]);
    setExpandedSections(prev => ({ ...prev, [newSection.id]: true }));
  };

  const updateSection = (id, field, value) => {
    setSections(sections.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const removeSection = (id) => {
    setSections(sections.filter(s => s.id !== id));
  };

  const moveSection = (id, direction) => {
    const idx = sections.findIndex(s => s.id === id);
    if ((direction === 'up' && idx === 0) || (direction === 'down' && idx === sections.length - 1)) return;

    const newSections = [...sections];
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    [newSections[idx], newSections[swapIdx]] = [newSections[swapIdx], newSections[idx]];
    setSections(newSections.map((s, i) => ({ ...s, order: i })));
  };

  const toggleSection = (id) => {
    setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Parse tags properly - ensure only valid non-empty strings
      let parsedTags = null;
      if (formData.tags && typeof formData.tags === 'string') {
        const tagArray = formData.tags.split(',').map(t => t.trim()).filter(t => t && t.length > 0);
        parsedTags = tagArray.length > 0 ? tagArray : null;
      } else if (Array.isArray(formData.tags)) {
        const tagArray = formData.tags.filter(t => t && typeof t === 'string' && t.trim().length > 0);
        parsedTags = tagArray.length > 0 ? tagArray : null;
      }

      const payload = {
        ...formData,
        category_id: formData.category_id ? parseInt(formData.category_id) : null,
        author_id: formData.author_id ? parseInt(formData.author_id) : null,
        read_time: formData.read_time ? parseInt(formData.read_time) : null,
        tags: parsedTags,
        sections: sections.map((s, i) => ({
          ...s,
          order: i,
          id: typeof s.id === 'number' && s.id > 1000000000 ? undefined : s.id
        })),
      };

      await api.put(`/blogs/${id}`, payload);
      toast?.success?.('Blog updated successfully!');
      router.push(`/blogs/${id}`);
    } catch (error) {
      console.error('Error updating blog:', error);
      toast?.error?.(error.message || 'Failed to update blog');
    } finally {
      setSaving(false);
    }
  };

  // Render section editor
  const renderSectionEditor = (section) => {
    const isExpanded = expandedSections[section.id];
    const typeInfo = SECTION_TYPES.find(t => t.id === section.section_type) || SECTION_TYPES[0];

    return (
      <div key={section.id} className="border border-border rounded-xl overflow-hidden bg-card shadow-sm">
        <div
          className="flex items-center justify-between p-3 bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => toggleSection(section.id)}
        >
          <div className="flex items-center gap-3">
            <typeInfo.icon className="w-5 h-5 text-primary" />
            <span className="font-medium">{typeInfo.label}</span>
            {section.heading && <span className="text-sm text-muted-foreground">— {section.heading}</span>}
          </div>
          <div className="flex items-center gap-1">
            <button type="button" onClick={(e) => { e.stopPropagation(); moveSection(section.id, 'up'); }} className="p-1.5 hover:bg-muted rounded transition-colors">
              <HiOutlineChevronUp className="w-4 h-4" />
            </button>
            <button type="button" onClick={(e) => { e.stopPropagation(); moveSection(section.id, 'down'); }} className="p-1.5 hover:bg-muted rounded transition-colors">
              <HiOutlineChevronDown className="w-4 h-4" />
            </button>
            <button type="button" onClick={(e) => { e.stopPropagation(); removeSection(section.id); }} className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 rounded transition-colors">
              <HiOutlineTrash className="w-4 h-4" />
            </button>
            {isExpanded ? <HiOutlineChevronUp className="w-4 h-4" /> : <HiOutlineChevronDown className="w-4 h-4" />}
          </div>
        </div>

        {isExpanded && (
          <div className="p-4 space-y-4 border-t border-border">
            <Input
              label="Section Heading"
              value={section.heading}
              onChange={(e) => updateSection(section.id, 'heading', e.target.value)}
              placeholder="Enter heading..."
            />

            {section.section_type === 'content' && (
              <div>
                <label className="block text-sm font-medium mb-2">Content</label>
                <RichTextEditor
                  value={section.content}
                  onChange={(val) => updateSection(section.id, 'content', val)}
                  placeholder="Write your content..."
                  minHeight="200px"
                />
              </div>
            )}

            {section.section_type === 'image' && (
              <div className="space-y-4">
                <ImageUpload
                  label="Section Image"
                  value={section.image}
                  onChange={(val) => updateSection(section.id, 'image', val)}
                  altValue={section.image_alt}
                  onAltChange={(val) => updateSection(section.id, 'image_alt', val)}
                  placeholder="https://example.com/image.jpg"
                />
                <Input label="Caption" value={section.image_caption} onChange={(e) => updateSection(section.id, 'image_caption', e.target.value)} placeholder="Image caption..." />
              </div>
            )}

            {section.section_type === 'quote' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Quote</label>
                  <textarea value={section.quote} onChange={(e) => updateSection(section.id, 'quote', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-input bg-background resize-none" rows={3} placeholder="Enter quote text..." />
                </div>
                <Input label="Author" value={section.quote_author} onChange={(e) => updateSection(section.id, 'quote_author', e.target.value)} placeholder="Quote author..." />
              </div>
            )}

            {section.section_type === 'code' && (
              <div className="space-y-4">
                <select value={section.code_language} onChange={(e) => updateSection(section.id, 'code_language', e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-input bg-background">
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                  <option value="html">HTML</option>
                  <option value="css">CSS</option>
                  <option value="typescript">TypeScript</option>
                  <option value="bash">Bash</option>
                </select>
                <textarea value={section.code} onChange={(e) => updateSection(section.id, 'code', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-input bg-slate-900 text-slate-100 font-mono text-sm resize-none" rows={8} placeholder="Paste your code here..." />
              </div>
            )}

            {section.section_type === 'video' && (
              <Input label="Video URL" value={section.video_url} onChange={(e) => updateSection(section.id, 'video_url', e.target.value)} placeholder="https://youtube.com/watch?v=..." />
            )}

            {section.section_type === 'cta' && (
              <div className="grid grid-cols-2 gap-4">
                <Input label="Button Text" value={section.cta_text} onChange={(e) => updateSection(section.id, 'cta_text', e.target.value)} placeholder="Learn More" />
                <Input label="Button URL" value={section.cta_url} onChange={(e) => updateSection(section.id, 'cta_url', e.target.value)} placeholder="https://..." />
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Link href={`/blogs/${id}`} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <HiOutlineArrowLeft className="w-4 h-4" /> Back
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Edit Blog</h1>
            <p className="text-sm text-muted-foreground truncate max-w-xs">{formData.title || 'Untitled'}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/blogs/${id}`}>
            <Button variant="ghost">
              <HiOutlineEye className="w-4 h-4" /> View
            </Button>
          </Link>
          <Button type="button" variant="primary" loading={saving} onClick={handleSubmit}>
            <HiOutlineSave className="w-4 h-4" /> Save Changes
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Left Sidebar - Sections Overview */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-20 space-y-4">
              <Card className="glass-card">
                <CardBody className="p-4">
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
                    <HiOutlineDocumentText className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold">Sections</h3>
                    <span className="ml-auto text-xs bg-muted px-2 py-0.5 rounded-full">{sections.length}</span>
                  </div>

                  {sections.length > 0 ? (
                    <nav className="space-y-1 max-h-[400px] overflow-y-auto">
                      {sections.map((s) => {
                        const typeInfo = SECTION_TYPES.find(t => t.id === s.section_type) || SECTION_TYPES[0];
                        return (
                          <div
                            key={s.id}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-muted transition-colors cursor-pointer"
                            onClick={() => {
                              setExpandedSections(prev => ({ ...prev, [s.id]: true }));
                              document.getElementById(`section-${s.id}`)?.scrollIntoView({ behavior: 'smooth' });
                            }}
                          >
                            <typeInfo.icon className="w-4 h-4 text-primary" />
                            <span className="truncate">{s.heading || typeInfo.label}</span>
                          </div>
                        );
                      })}
                    </nav>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">No sections added</p>
                  )}
                </CardBody>
              </Card>

              <Card className="glass-card bg-gradient-to-br from-primary/5 to-purple-500/5">
                <CardBody className="p-4">
                  <h4 className="font-medium mb-3 text-sm">Quick Add</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {SECTION_TYPES.slice(0, 4).map(type => (
                      <button key={type.id} type="button" onClick={() => addSection(type.id)} className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                        <type.icon className="w-4 h-4 text-primary" />
                        <span className="text-xs">{type.label}</span>
                      </button>
                    ))}
                  </div>
                </CardBody>
              </Card>
            </div>
          </aside>

          {/* Center - Main Form */}
          <main className="lg:col-span-6 space-y-6">
            <Card className="glass-card">
              <CardBody className="p-6 space-y-4">
                <h2 className="font-semibold flex items-center gap-2 text-lg">
                  <HiOutlinePhotograph className="w-5 h-5 text-primary" /> Banner & Title
                </h2>

                <Input label="Blog Title *" value={formData.title} onChange={(e) => handleChange('title', e.target.value)} placeholder="Enter blog title..." required />

                <div className="grid grid-cols-2 gap-4">
                  <Input label="URL Slug" value={formData.slug} onChange={(e) => handleChange('slug', e.target.value)} placeholder="auto-generated-slug" />
                  <Input label="Banner Title" value={formData.banner_title} onChange={(e) => handleChange('banner_title', e.target.value)} placeholder="Banner overlay text..." />
                </div>

                <ImageUpload
                  label="Banner Image"
                  value={formData.banner_image}
                  onChange={(val) => handleChange('banner_image', val)}
                  altValue={formData.banner_image_alt}
                  onAltChange={(val) => handleChange('banner_image_alt', val)}
                  placeholder="https://example.com/banner.jpg"
                  showPreview={false}
                />

                {formData.banner_image && (
                  <div className="relative rounded-xl overflow-hidden aspect-video bg-muted">
                    <img src={formData.banner_image} alt="Banner Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    {formData.banner_title && <div className="absolute bottom-4 left-4 text-white text-xl font-bold">{formData.banner_title}</div>}
                  </div>
                )}
              </CardBody>
            </Card>

            <Card className="glass-card">
              <CardBody className="p-6 space-y-4">
                <h2 className="font-semibold flex items-center gap-2 text-lg">
                  <HiOutlinePencilAlt className="w-5 h-5 text-primary" /> Content
                </h2>

                <div>
                  <label className="block text-sm font-medium mb-2">Excerpt / Summary</label>
                  <textarea value={formData.excerpt} onChange={(e) => handleChange('excerpt', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-input bg-background resize-none" rows={3} placeholder="Brief summary..." />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Main Content</label>
                  <RichTextEditor value={formData.content} onChange={(val) => handleChange('content', val)} placeholder="Start writing..." minHeight="300px" />
                </div>
              </CardBody>
            </Card>

            <Card className="glass-card">
              <CardBody className="p-6">
                <h2 className="font-semibold flex items-center gap-2 text-lg mb-4">
                  <HiOutlineMenuAlt2 className="w-5 h-5 text-primary" /> Content Sections
                </h2>

                <div className="space-y-4">
                  {sections.map((section) => (
                    <div key={section.id} id={`section-${section.id}`}>
                      {renderSectionEditor(section)}
                    </div>
                  ))}

                  <BlockInserter onInsert={addSection} />
                </div>
              </CardBody>
            </Card>
          </main>

          {/* Right Sidebar - Settings */}
          <aside className="lg:col-span-3">
            <div className="sticky top-20 space-y-4">
              <Card className="glass-card">
                <CardBody className="p-4 space-y-4">
                  <h3 className="font-semibold flex items-center gap-2 pb-2 border-b border-border">
                    <HiOutlineGlobe className="w-5 h-5 text-primary" /> Publish
                  </h3>

                  <div>
                    <label className="block text-sm font-medium mb-2">Status</label>
                    <select value={formData.status} onChange={(e) => handleChange('status', e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-input bg-background">
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="scheduled">Scheduled</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Publish Date</label>
                    <input type="date" value={formData.blog_date} onChange={(e) => handleChange('blog_date', e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-input bg-background" />
                  </div>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={formData.is_featured} onChange={(e) => handleChange('is_featured', e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-primary" />
                    <span className="text-sm">Featured Post</span>
                  </label>
                </CardBody>
              </Card>

              <Card className="glass-card">
                <CardBody className="p-4 space-y-4">
                  <h3 className="font-semibold flex items-center gap-2 pb-2 border-b border-border">
                    <HiOutlineFolder className="w-5 h-5 text-primary" /> Organization
                  </h3>

                  <div>
                    <label className="block text-sm font-medium mb-2">Category</label>
                    <select value={formData.category_id} onChange={(e) => handleChange('category_id', e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-input bg-background">
                      <option value="">Select category...</option>
                      {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Author</label>
                    <select value={formData.author_id} onChange={(e) => handleChange('author_id', e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-input bg-background">
                      <option value="">Select author...</option>
                      {authors.map(author => <option key={author.id} value={author.id}>{author.display_name || `Author ${author.id}`}</option>)}
                    </select>
                  </div>

                  <Input label="Tags" value={formData.tags} onChange={(e) => handleChange('tags', e.target.value)} placeholder="react, nextjs (comma-separated)" />
                  <Input
                    label="Read Time (minutes)"
                    type="number"
                    value={formData.read_time}
                    onChange={(e) => handleChange('read_time', e.target.value)}
                    placeholder="5"
                  />
                </CardBody>
              </Card>

              {/* Featured Image */}
              <Card className="glass-card">
                <CardBody className="p-4 space-y-4">
                  <h3 className="font-semibold flex items-center gap-2 pb-2 border-b border-border">
                    <HiOutlinePhotograph className="w-5 h-5 text-primary" /> Thumbnail
                  </h3>

                  <ImageUpload
                    label="Featured Image"
                    value={formData.featured_image}
                    onChange={(val) => handleChange('featured_image', val)}
                    altValue={formData.featured_image_alt}
                    onAltChange={(val) => handleChange('featured_image_alt', val)}
                    placeholder="Thumbnail image..."
                  />
                </CardBody>
              </Card>

              <Card className="glass-card">
                <CardBody className="p-4 space-y-4">
                  <h3 className="font-semibold flex items-center gap-2 pb-2 border-b border-border">
                    <HiOutlineGlobe className="w-5 h-5 text-primary" /> SEO
                  </h3>

                  <Input label="Meta Title" value={formData.meta_title} onChange={(e) => handleChange('meta_title', e.target.value)} placeholder="SEO title..." />
                  <textarea value={formData.meta_description} onChange={(e) => handleChange('meta_description', e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-input bg-background resize-none" rows={3} placeholder="SEO description..." />
                  <Input label="Meta Keywords" value={formData.meta_keywords} onChange={(e) => handleChange('meta_keywords', e.target.value)} placeholder="keyword1, keyword2..." />
                </CardBody>
              </Card>
            </div>
          </aside>
        </div>
      </form>
    </div>
  );
}
