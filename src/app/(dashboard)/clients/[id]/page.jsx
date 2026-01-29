'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardHeader, CardBody, StatCard, StatusBadge, Avatar } from '@/components/ui';
import Button from '@/components/ui/Button';
import DeleteConfirmModal from '@/components/ui/DeleteConfirmModal';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import {
  HiOutlineArrowLeft, HiOutlinePencil, HiOutlineTrash, HiOutlinePlus,
  HiOutlineBriefcase, HiOutlineCurrencyDollar, HiOutlineDocumentText, HiOutlineUserGroup,
  HiOutlineMail, HiOutlinePhone, HiOutlineGlobe, HiOutlineLocationMarker,
  HiOutlineOfficeBuilding, HiOutlineSpeakerphone, HiOutlineExternalLink,
  HiOutlineCheckCircle
} from 'react-icons/hi';

export default function ClientDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const toast = useToast();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [metaLeads, setMetaLeads] = useState([]);
  const [loadingLeads, setLoadingLeads] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);

  useEffect(() => {
    fetchClient();
    fetchMetaLeads();
  }, [id]);

  const fetchMetaLeads = async () => {
    setLoadingLeads(true);
    try {
      // Fetch leads specifically from Meta source
      const response = await api.get('/leads?source=Meta');
      setMetaLeads(response.items || response || []);
    } catch (error) {
      console.error('Error fetching meta leads:', error);
      // Mock data for demo if API fails or is empty
      setMetaLeads([
        { id: 101, name: 'Facebook Ad Lead #1', email: 'lead1@example.com', status: 'new', score: 45, date: '2026-01-28', campaign: 'Q1 Promo' },
        { id: 102, name: 'Instagram Story Lead', email: 'insta@example.com', status: 'qualified', score: 70, date: '2026-01-27', campaign: 'Brand Awareness' },
      ]);
    } finally {
      setLoadingLeads(false);
    }
  };

  const fetchClient = async () => {
    try {
      const data = await api.get(`/clients/${id}`);
      setClient(data);
    } catch (error) {
      // Mock data fallbacks if API fails for demo
      setClient({
        id: 1, name: 'ABC Corporation', email: 'contact@abc.com', phone: '+1 234 567 8900', website: 'https://abc.com',
        industry: 'Technology', status: 'active', address: '123 Tech Park, Silicon Valley, CA 94000',
        description: 'Leading technology company specializing in enterprise solutions.',
        contacts: [
          { id: 1, name: 'John CEO', email: 'john@abc.com', phone: '+1 234 567 8901', designation: 'CEO', is_primary: true },
          { id: 2, name: 'Sarah PM', email: 'sarah@abc.com', phone: '+1 234 567 8902', designation: 'Project Manager', is_primary: false },
        ],
        projects: [
          { id: 1, name: 'HRMS Platform', status: 'in_progress', value: 50000 },
          { id: 2, name: 'E-Commerce Website', status: 'completed', value: 25000 },
        ],
        invoices: [
          { id: 1, number: 'INV-001', amount: 15000, status: 'paid', date: '2026-01-15' },
          { id: 2, number: 'INV-002', amount: 8500, status: 'sent', date: '2026-01-10' },
        ],
        totalRevenue: 75000, totalProjects: 3,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/clients/${id}`);
      toast.success('Client deleted successfully');
      router.push('/clients');
    } catch (error) {
      toast.error(error.message || 'Failed to delete client');
    } finally {
      setDeleting(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: HiOutlineDocumentText },
    { id: 'contacts', label: 'Contacts', icon: HiOutlineUserGroup },
    { id: 'projects', label: 'Projects', icon: HiOutlineBriefcase },
    { id: 'invoices', label: 'Invoices', icon: HiOutlineCurrencyDollar },
    { id: 'campaigns', label: 'Campaigns', icon: HiOutlineSpeakerphone },
  ];

  if (loading) return (
    <div className="flex items-center justify-center py-12">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!client) return (
    <div className="empty-state">
      <div className="w-16 h-16 bg-muted/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <HiOutlineOfficeBuilding className="w-8 h-8 text-muted-foreground/40" />
      </div>
      <h3 className="empty-state-title">Client not found</h3>
      <Link href="/clients"><Button variant="primary"><HiOutlineArrowLeft className="w-4 h-4 mr-2" /> Back to Clients</Button></Link>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Page Header */}
      <div className="page-header sticky top-0 bg-background/95 backdrop-blur-sm z-20 py-4 border-b border-border/50 mb-0">
        <div>
          <button onClick={() => router.back()} className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors mb-2">
            <HiOutlineArrowLeft className="w-4 h-4" /> Back to Clients
          </button>
          <div className="flex items-center gap-4">
            <Avatar name={client.name} size="lg" className="ring-2 ring-background shadow-lg" />
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-foreground">{client.name}</h1>
                <StatusBadge status={client.status} />
              </div>
              <p className="text-muted-foreground text-sm flex items-center gap-2 mt-1">
                <HiOutlineOfficeBuilding className="w-4 h-4" />
                {client.industry}
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          {['admin', 'manager', 'super_admin'].includes(user?.role?.code?.toLowerCase()) && (
            <>
              <Link href={`/clients/${id}/edit`}>
                <Button variant="secondary" className="shadow-sm border-border/50">
                  <HiOutlinePencil className="w-4 h-4 mr-2" /> Edit
                </Button>
              </Link>
              <Button variant="primary" className="shadow-lg shadow-primary/20">
                <HiOutlinePlus className="w-4 h-4 mr-2" /> New Project
              </Button>
              <Button variant="ghost" className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20" onClick={() => setDeleteModal(true)}>
                <HiOutlineTrash className="w-5 h-5" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <StatCard icon={<HiOutlineBriefcase className="w-6 h-6" />} iconColor="blue" value={client.totalProjects || 0} label="Projects" />
        <StatCard icon={<HiOutlineCurrencyDollar className="w-6 h-6" />} iconColor="green" value={`$${((client.totalRevenue || 0) / 1000).toFixed(0)}K`} label="Total Revenue" />
        <StatCard icon={<HiOutlineDocumentText className="w-6 h-6" />} iconColor="purple" value={client.invoices?.length || 0} label="Invoices" />
        <StatCard icon={<HiOutlineUserGroup className="w-6 h-6" />} iconColor="orange" value={client.contacts?.length || 0} label="Contacts" />
      </div>

      {/* Tabs */}
      <div className="bg-muted/30 p-1 rounded-xl w-fit border border-border/40 flex gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === tab.id ? 'bg-background text-primary shadow-sm ring-1 ring-black/5 dark:ring-white/10' : 'text-muted-foreground hover:text-foreground hover:bg-background/50'}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon className="w-4 h-4" /> {tab.label}
            </button>
          );
        })}
      </div>

      {
        activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader title="About Company" />
                <CardBody>
                  <p className="text-muted-foreground leading-relaxed">{client.description || 'No description provided.'}</p>
                </CardBody>
              </Card>

              <Card>
                <CardHeader title="Contact Information" />
                <CardBody className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InfoItem icon={HiOutlineMail} label="Email" value={client.email} />
                  <InfoItem icon={HiOutlinePhone} label="Phone" value={client.phone} />
                  <InfoItem icon={HiOutlineGlobe} label="Website" value={client.website} link />
                  <InfoItem icon={HiOutlineLocationMarker} label="Address" value={client.address} />
                </CardBody>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader title="Quick Actions" />
                <CardBody className="space-y-3">
                  <Button variant="secondary" className="w-full justify-start">
                    <HiOutlineMail className="w-5 h-5 mr-3 text-muted-foreground" /> Send Email
                  </Button>
                  <Button variant="secondary" className="w-full justify-start">
                    <HiOutlineDocumentText className="w-5 h-5 mr-3 text-muted-foreground" /> Create Invoice
                  </Button>
                  <Button variant="secondary" className="w-full justify-start">
                    <HiOutlinePlus className="w-5 h-5 mr-3 text-muted-foreground" /> Add Contact
                  </Button>
                </CardBody>
              </Card>
            </div>
          </div>
        )
      }

      {
        activeTab === 'contacts' && (
          <Card>
            <CardHeader
              title="Contact Persons"
              action={['admin', 'manager', 'super_admin'].includes(user?.role?.code?.toLowerCase()) && <Button variant="secondary" size="sm"><HiOutlinePlus className="w-4 h-4 mr-2" /> Add Contact</Button>}
            />
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {client.contacts?.map((contact) => (
                  <div key={contact.id} className="p-4 bg-muted/20 border border-border/50 rounded-xl flex items-center gap-4 hover:border-primary/30 transition-colors">
                    <Avatar name={contact.name} size="md" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h4 className="font-bold text-foreground truncate">{contact.name}</h4>
                        {contact.is_primary && <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded border border-primary/20 font-bold uppercase">Primary</span>}
                      </div>
                      <p className="text-xs font-medium text-muted-foreground mb-2">{contact.designation}</p>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <HiOutlineMail className="w-3.5 h-3.5" />
                          <span className="truncate">{contact.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <HiOutlinePhone className="w-3.5 h-3.5" />
                          <span>{contact.phone}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        )
      }

      {
        activeTab === 'projects' && (
          <Card>
            <CardHeader title="Active Projects" />
            <div className="table-container border-0 bg-transparent">
              <table className="table">
                <thead><tr><th>Project Name</th><th>Value</th><th>Status</th><th className="text-right">Action</th></tr></thead>
                <tbody>
                  {client.projects?.map((project) => (
                    <tr key={project.id} className="group hover:bg-muted/30">
                      <td>
                        <Link href={`/projects/${project.id}`} className="font-bold text-foreground hover:text-primary transition-colors block">
                          {project.name}
                        </Link>
                      </td>
                      <td className="font-mono text-sm">${project.value?.toLocaleString()}</td>
                      <td><StatusBadge status={project.status} /></td>
                      <td className="text-right">
                        <Link href={`/projects/${project.id}`}>
                          <Button variant="ghost" size="sm">View</Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )
      }

      {
        activeTab === 'invoices' && (
          <Card>
            <CardHeader
              title="Invoice History"
              action={['admin', 'manager', 'super_admin'].includes(user?.role?.code?.toLowerCase()) && <Link href="/invoices/new"><Button variant="secondary" size="sm"><HiOutlinePlus className="w-4 h-4 mr-2" /> Create Invoice</Button></Link>}
            />
            <div className="table-container border-0 bg-transparent">
              <table className="table">
                <thead><tr><th>Invoice #</th><th>Date</th><th>Amount</th><th>Status</th><th className="text-right">Action</th></tr></thead>
                <tbody>
                  {client.invoices?.map((invoice) => (
                    <tr key={invoice.id} className="group hover:bg-muted/30">
                      <td className="font-mono font-medium text-foreground">{invoice.number}</td>
                      <td className="text-muted-foreground">{new Date(invoice.date).toLocaleDateString()}</td>
                      <td className="font-bold">${invoice.amount?.toLocaleString()}</td>
                      <td><StatusBadge status={invoice.status} /></td>
                      <td className="text-right">
                        <Button variant="ghost" size="sm">View</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )
      }

      {
        activeTab === 'campaigns' && (
          <Card>
            <CardHeader
              title={selectedCampaign ? `Campaign: ${selectedCampaign}` : "Meta Campaign Leads"}
              subtitle={selectedCampaign ? "Detailed list of leads for this campaign" : "Overview of leads grouped by campaign"}
              action={
                <div className="flex gap-2">
                  {selectedCampaign && (
                    <Button variant="secondary" size="sm" onClick={() => setSelectedCampaign(null)}>
                      <HiOutlineArrowLeft className="w-4 h-4 mr-2" /> Back to Campaigns
                    </Button>
                  )}
                  <Button variant="secondary" size="sm"><HiOutlineExternalLink className="w-4 h-4 mr-2" /> Open Meta</Button>
                </div>
              }
            />
            <div className="table-container border-0 bg-transparent">
              {loadingLeads ? (
                <div className="p-12 text-center">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                </div>
              ) : metaLeads.length > 0 ? (
                selectedCampaign ? (
                  // Drill-down: Lead List
                  <table className="table">
                    <thead><tr><th>Lead Name</th><th>Date</th><th>Score</th><th>Status</th><th className="text-right">Action</th></tr></thead>
                    <tbody>
                      {metaLeads.filter(l => (l.campaign || 'Uncategorized') === selectedCampaign).map((lead) => (
                        <tr key={lead.id} className="group hover:bg-muted/30">
                          <td className="font-medium text-foreground">
                            <div className="flex flex-col">
                              <span>{lead.name}</span>
                              <span className="text-xs text-muted-foreground">{lead.email}</span>
                            </div>
                          </td>
                          <td className="text-muted-foreground text-sm font-mono">{lead.date || new Date().toLocaleDateString()}</td>
                          <td>
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${lead.score > 60 ? 'bg-emerald-500' : lead.score > 30 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${lead.score}%` }}></div>
                              </div>
                              <span className="text-xs font-medium">{lead.score}</span>
                            </div>
                          </td>
                          <td><StatusBadge status={lead.status} /></td>
                          <td className="text-right">
                            <Button variant="ghost" size="sm">Details</Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  // Top-level: Campaign List
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                    {Object.entries(metaLeads.reduce((acc, lead) => {
                      const camp = lead.campaign || 'Uncategorized';
                      if (!acc[camp]) acc[camp] = { name: camp, count: 0, highScore: 0, recentDate: '' };
                      acc[camp].count++;
                      if (lead.score > acc[camp].highScore) acc[camp].highScore = lead.score;
                      return acc;
                    }, {})).map(([name, stats]) => (
                      <div
                        key={name}
                        onClick={() => setSelectedCampaign(name)}
                        className="group cursor-pointer bg-muted/20 border border-border/50 hover:border-primary/50 hover:bg-muted/40 rounded-xl p-5 transition-all duration-200"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            <HiOutlineSpeakerphone className="w-6 h-6" />
                          </div>
                          <span className="bg-background/50 text-xs px-2 py-1 rounded text-muted-foreground border border-border/50 group-hover:border-primary/20">
                            {stats.count} Leads
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-foreground mb-1 group-hover:text-primary transition-colors">{name}</h3>
                        <p className="text-sm text-muted-foreground mb-4">Meta Campaign</p>
                        <div className="flex items-center gap-2 text-xs font-medium text-emerald-600 bg-emerald-500/10 px-2 py-1 rounded w-fit">
                          <HiOutlineCheckCircle className="w-3.5 h-3.5" />
                          Top Score: {stats.highScore}
                        </div>
                      </div>
                    ))}
                  </div>
                )
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <HiOutlineSpeakerphone className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p>No Meta leads found matching this client context.</p>
                </div>
              )}
            </div>
          </Card>
        )
      }

      <DeleteConfirmModal isOpen={deleteModal} onClose={() => setDeleteModal(false)} onConfirm={handleDelete} title="Delete Client" message={`Are you sure you want to delete "${client.name}"? This action cannot be undone.`} loading={deleting} />
    </div >
  );
}

function InfoItem({ icon: Icon, label, value, link }) {
  return (
    <div className="flex items-start gap-3">
      {Icon && (
        <div className="w-9 h-9 rounded-lg bg-muted/40 flex items-center justify-center shrink-0 mt-0.5">
          <Icon className="w-4 h-4 text-muted-foreground" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-muted-foreground mb-0.5 uppercase tracking-wider">{label}</p>
        {link ? (
          <a href={value} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-primary hover:underline block truncate">{value}</a>
        ) : (
          <p className="text-sm font-semibold text-foreground block truncate">{value}</p>
        )}
      </div>
    </div>
  );
}
