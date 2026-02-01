'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardBody, RichTextEditor, ImageUpload } from '@/components/ui';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import api from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import {
  HiOutlineArrowLeft, HiOutlinePlus, HiOutlineTrash,
  HiOutlineChevronDown, HiOutlineChevronUp, HiOutlineSave,
  HiOutlineDocumentText, HiOutlineUser, HiOutlineTag, HiOutlineClock,
  HiOutlineGlobe, HiOutlineMenuAlt2, HiOutlinePhotograph,
  HiOutlineCode, HiOutlineAnnotation, HiOutlineVideoCamera, HiOutlineLink,
  HiOutlineFolder, HiOutlineEye, HiOutlinePencilAlt,
  HiOutlineQuestionMarkCircle
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

export default function CreateBlogPage() {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

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
    blog_date: new Date().toISOString().split('T')[0],
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

  // FAQs
  const [faqs, setFaqs] = useState([]);
  const [expandedFaqs, setExpandedFaqs] = useState({});

  useEffect(() => {
    fetchDropdownData();
  }, []);

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
    // Auto-generate slug from title
    if (field === 'title') {
      const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
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

  // FAQ Handlers
  const addFaq = () => {
    const newFaq = { id: Date.now(), question: '', answer: '' };
    setFaqs([...faqs, newFaq]);
    setExpandedFaqs(prev => ({ ...prev, [newFaq.id]: true }));
  };

  const updateFaq = (id, field, value) => {
    setFaqs(faqs.map(f => f.id === id ? { ...f, [field]: value } : f));
  };

  const removeFaq = (id) => {
    setFaqs(faqs.filter(f => f.id !== id));
  };

  const toggleFaq = (id) => {
    setExpandedFaqs(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Parse tags properly - ensure only valid non-empty strings
      let parsedTags = null;
      if (formData.tags && typeof formData.tags === 'string') {
        const tagArray = formData.tags.split(',').map(t => t.trim()).filter(t => t && t.length > 0);
        parsedTags = tagArray.length > 0 ? tagArray : null;
      }

      // Build payload - exclude author_id as backend determines it from authenticated user
      const { author_id, ...restFormData } = formData;
      const payload = {
        ...restFormData,
        category_id: formData.category_id ? parseInt(formData.category_id) : null,
        read_time: formData.read_time ? parseInt(formData.read_time) : null,
        tags: parsedTags,
        sections: sections.map((s, i) => ({ ...s, order: i, id: undefined })),
        faqs: faqs.map(f => ({ question: f.question, answer: f.answer })),
      };

      await api.post('/blogs', payload);
      toast?.success?.('Blog created successfully!');
      router.push('/blogs');
    } catch (error) {
      console.error('Error creating blog:', error);
      toast?.error?.(error.message || 'Failed to create blog');
    } finally {
      setLoading(false);
    }
  };

  // Render section editor
  const renderSectionEditor = (section) => {
    const isExpanded = expandedSections[section.id];
    const typeInfo = SECTION_TYPES.find(t => t.id === section.section_type) || SECTION_TYPES[0];

    return (
      <div key={section.id} className="border border-border rounded-xl overflow-hidden bg-card shadow-sm">
        {/* Section Header */}
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

        {/* Section Body */}
        {isExpanded && (
          <div className="p-4 space-y-4 border-t border-border">
            {/* Common heading field */}
            <Input
              label="Section Heading"
              value={section.heading}
              onChange={(e) => updateSection(section.id, 'heading', e.target.value)}
              placeholder="Enter heading..."
            />

            {/* Type-specific fields */}
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
                <Input
                  label="Caption"
                  value={section.image_caption}
                  onChange={(e) => updateSection(section.id, 'image_caption', e.target.value)}
                  placeholder="Image caption..."
                />
              </div>
            )}

            {section.section_type === 'quote' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Quote</label>
                  <textarea
                    value={section.quote}
                    onChange={(e) => updateSection(section.id, 'quote', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground resize-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    rows={3}
                    placeholder="Enter quote text..."
                  />
                </div>
                <Input
                  label="Author"
                  value={section.quote_author}
                  onChange={(e) => updateSection(section.id, 'quote_author', e.target.value)}
                  placeholder="Quote author..."
                />
              </div>
            )}

            {section.section_type === 'code' && (
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-2">Language</label>
                    <select
                      value={section.code_language}
                      onChange={(e) => updateSection(section.id, 'code_language', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-input bg-background"
                    >
                      <option value="javascript">JavaScript</option>
                      <option value="python">Python</option>
                      <option value="html">HTML</option>
                      <option value="css">CSS</option>
                      <option value="typescript">TypeScript</option>
                      <option value="bash">Bash</option>
                      <option value="json">JSON</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Code</label>
                  <textarea
                    value={section.code}
                    onChange={(e) => updateSection(section.id, 'code', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-input bg-slate-900 text-slate-100 font-mono text-sm resize-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    rows={8}
                    placeholder="Paste your code here..."
                  />
                </div>
              </div>
            )}

            {section.section_type === 'video' && (
              <Input
                label="Video URL"
                value={section.video_url}
                onChange={(e) => updateSection(section.id, 'video_url', e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
              />
            )}

            {section.section_type === 'cta' && (
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Button Text"
                  value={section.cta_text}
                  onChange={(e) => updateSection(section.id, 'cta_text', e.target.value)}
                  placeholder="Learn More"
                />
                <Input
                  label="Button URL"
                  value={section.cta_url}
                  onChange={(e) => updateSection(section.id, 'cta_url', e.target.value)}
                  placeholder="https://..."
                />
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Link href="/blogs" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <HiOutlineArrowLeft className="w-4 h-4" /> Back
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Create New Blog</h1>
            <p className="text-sm text-muted-foreground">Add a new blog post to your website</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setPreviewMode(!previewMode)}
          >
            <HiOutlineEye className="w-4 h-4" /> {previewMode ? 'Edit' : 'Preview'}
          </Button>
          <Button
            type="button"
            variant="primary"
            loading={loading}
            onClick={handleSubmit}
          >
            <HiOutlineSave className="w-4 h-4" /> Save Blog
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* 3-Column Layout */}
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
                      {sections.map((s, idx) => {
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
                    <p className="text-sm text-muted-foreground italic">No sections added yet</p>
                  )}
                </CardBody>
              </Card>

              {/* Quick Add */}
              <Card className="glass-card bg-gradient-to-br from-primary/5 to-purple-500/5">
                <CardBody className="p-4">
                  <h4 className="font-medium mb-3 text-sm">Quick Add Section</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {SECTION_TYPES.slice(0, 4).map(type => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => addSection(type.id)}
                        className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-muted/50 transition-colors text-center"
                      >
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
            {/* Banner & Title */}
            <Card className="glass-card">
              <CardBody className="p-6 space-y-4">
                <h2 className="font-semibold flex items-center gap-2 text-lg">
                  <HiOutlinePhotograph className="w-5 h-5 text-primary" /> Banner & Title
                </h2>

                <Input
                  label="Blog Title *"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="Enter blog title..."
                  required
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="URL Slug"
                    value={formData.slug}
                    onChange={(e) => handleChange('slug', e.target.value)}
                    placeholder="auto-generated-slug"
                  />
                  <Input
                    label="Banner Title"
                    value={formData.banner_title}
                    onChange={(e) => handleChange('banner_title', e.target.value)}
                    placeholder="Banner overlay text..."
                  />
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
                    {formData.banner_title && (
                      <div className="absolute bottom-4 left-4 text-white text-xl font-bold">{formData.banner_title}</div>
                    )}
                  </div>
                )}
              </CardBody>
            </Card>

            {/* Excerpt & Main Content */}
            <Card className="glass-card">
              <CardBody className="p-6 space-y-4">
                <h2 className="font-semibold flex items-center gap-2 text-lg">
                  <HiOutlinePencilAlt className="w-5 h-5 text-primary" /> Content
                </h2>

                <div>
                  <label className="block text-sm font-medium mb-2">Excerpt / Summary</label>
                  <textarea
                    value={formData.excerpt}
                    onChange={(e) => handleChange('excerpt', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground resize-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    rows={3}
                    placeholder="Brief summary of the blog post..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Main Content</label>
                  <RichTextEditor
                    value={formData.content}
                    onChange={(val) => handleChange('content', val)}
                    placeholder="Start writing your blog content..."
                    minHeight="300px"
                  />
                </div>
              </CardBody>
            </Card>

            {/* Dynamic Sections */}
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

          {/* FAQ Section - Full Width or separate? Let's put it in main col */}
          <main className="lg:col-span-full space-y-6">
            <Card className="glass-card">
              <CardBody className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold flex items-center gap-2 text-lg">
                    <HiOutlineQuestionMarkCircle className="w-5 h-5 text-primary" /> Frequently Asked Questions
                  </h2>
                  <Button type="button" size="sm" variant="outline" onClick={addFaq}>
                    <HiOutlinePlus className="w-4 h-4 mr-2" /> Add FAQ
                  </Button>
                </div>

                <div className="space-y-4">
                  {faqs.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground bg-muted/20 rounded-xl border border-dashed border-border">
                      No FAQs added yet.
                    </div>
                  ) : (
                    faqs.map((faq, index) => (
                      <div key={faq.id} className="border border-border rounded-xl overflow-hidden bg-card shadow-sm">
                        <div
                          className="flex items-center justify-between p-3 bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => toggleFaq(faq.id)}
                        >
                          <span className="font-medium truncate flex-1 mr-4">
                            {faq.question || `FAQ #${index + 1}`}
                          </span>
                          <div className="flex items-center gap-1">
                            <button type="button" onClick={(e) => { e.stopPropagation(); removeFaq(faq.id); }} className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 rounded transition-colors">
                              <HiOutlineTrash className="w-4 h-4" />
                            </button>
                            {expandedFaqs[faq.id] ? <HiOutlineChevronUp className="w-4 h-4" /> : <HiOutlineChevronDown className="w-4 h-4" />}
                          </div>
                        </div>

                        {expandedFaqs[faq.id] && (
                          <div className="p-4 space-y-4 border-t border-border">
                            <Input
                              label="Question"
                              value={faq.question}
                              onChange={(e) => updateFaq(faq.id, 'question', e.target.value)}
                              placeholder="e.g. What is your return policy?"
                            />
                            <div>
                              <label className="block text-sm font-medium mb-2">Answer</label>
                              <textarea
                                value={faq.answer}
                                onChange={(e) => updateFaq(faq.id, 'answer', e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground resize-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                rows={3}
                                placeholder="Enter the answer..."
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </CardBody>
            </Card>
          </main>


          {/* Right Sidebar - Settings */}
          <aside className="lg:col-span-3">
            <div className="sticky top-20 space-y-4">
              {/* Publish Settings */}
              <Card className="glass-card">
                <CardBody className="p-4 space-y-4">
                  <h3 className="font-semibold flex items-center gap-2 pb-2 border-b border-border">
                    <HiOutlineGlobe className="w-5 h-5 text-primary" /> Publish
                  </h3>

                  <div>
                    <label className="block text-sm font-medium mb-2">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => handleChange('status', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-input bg-background"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="scheduled">Scheduled</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Publish Date</label>
                    <input
                      type="date"
                      value={formData.blog_date}
                      onChange={(e) => handleChange('blog_date', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-input bg-background"
                    />
                  </div>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_featured}
                      onChange={(e) => handleChange('is_featured', e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="text-sm">Featured Post</span>
                  </label>
                </CardBody>
              </Card>

              {/* Category & Author */}
              <Card className="glass-card">
                <CardBody className="p-4 space-y-4">
                  <h3 className="font-semibold flex items-center gap-2 pb-2 border-b border-border">
                    <HiOutlineFolder className="w-5 h-5 text-primary" /> Organization
                  </h3>

                  <div>
                    <label className="block text-sm font-medium mb-2">Category</label>
                    <select
                      value={formData.category_id}
                      onChange={(e) => handleChange('category_id', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-input bg-background"
                    >
                      <option value="">Select category...</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Author</label>
                    <select
                      value={formData.author_id}
                      onChange={(e) => handleChange('author_id', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-input bg-background"
                    >
                      <option value="">Select author...</option>
                      {authors.map(author => (
                        <option key={author.id} value={author.id}>
                          {author.display_name || `Author ${author.id}`}
                        </option>
                      ))}
                    </select>
                  </div>

                  <Input
                    label="Tags"
                    value={formData.tags}
                    onChange={(e) => handleChange('tags', e.target.value)}
                    placeholder="react, nextjs, web (comma-separated)"
                  />

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

              {/* SEO Settings */}
              <Card className="glass-card">
                <CardBody className="p-4 space-y-4">
                  <h3 className="font-semibold flex items-center gap-2 pb-2 border-b border-border">
                    <HiOutlineGlobe className="w-5 h-5 text-primary" /> SEO
                  </h3>

                  <Input
                    label="Meta Title"
                    value={formData.meta_title}
                    onChange={(e) => handleChange('meta_title', e.target.value)}
                    placeholder="SEO title..."
                  />

                  <div>
                    <label className="block text-sm font-medium mb-2">Meta Description</label>
                    <textarea
                      value={formData.meta_description}
                      onChange={(e) => handleChange('meta_description', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-foreground resize-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      rows={3}
                      placeholder="SEO description..."
                    />
                  </div>

                  <Input
                    label="Meta Keywords"
                    value={formData.meta_keywords}
                    onChange={(e) => handleChange('meta_keywords', e.target.value)}
                    placeholder="keyword1, keyword2..."
                  />
                </CardBody>
              </Card>
            </div>
          </aside>
        </div>
      </form>
    </div>
  );
}
