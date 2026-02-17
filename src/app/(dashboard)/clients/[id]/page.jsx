'use client';

import { useState, useMemo, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardHeader, CardBody, StatCard, StatusBadge, Avatar, PageHeader } from '@/components/ui';
import Button from '@/components/ui/Button';
import DeleteConfirmModal from '@/components/ui/DeleteConfirmModal';
import { useAPI } from '@/hooks/useAPI';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import ClientModulesTab from './components/ClientModulesTab';
import ClientMailTab from './components/ClientMailTab';

import {
  HiOutlineArrowLeft, HiOutlinePencil, HiOutlineTrash, HiOutlinePlus,
  HiOutlineBriefcase, HiOutlineCurrencyDollar, HiOutlineDocumentText, HiOutlineUserGroup,
  HiOutlineMail, HiOutlinePhone, HiOutlineLocationMarker,
  HiOutlineOfficeBuilding, HiOutlineIdentification, HiOutlineCalendar,
  HiOutlineCollection, HiOutlineGlobe, HiOutlineRefresh
} from 'react-icons/hi';

export default function ClientDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // SWR-cached client data — instant on back-nav
  const { data: client, isLoading, mutate } = useAPI(`/clients/${id}`, {
    revalidateOnFocus: false,
    dedupingInterval: 10000,
    onError: () => {
      toast.error('Failed to load client details');
      router.push('/clients');
    },
  });

  const handleDelete = useCallback(async () => {
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
  }, [id, router, toast]);

  const tabs = useMemo(() => [
    { id: 'overview', label: 'Overview', icon: HiOutlineDocumentText },
    { id: 'modules', label: 'Modules', icon: HiOutlineCollection },
    { id: 'mail', label: 'Mail', icon: HiOutlineMail },
    { id: 'projects', label: 'Projects', icon: HiOutlineBriefcase },
  ], []);

  const isAdmin = ['admin', 'manager', 'super_admin'].includes(user?.role?.code?.toLowerCase());

  if (isLoading) return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Skeleton header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-muted/30 rounded-xl animate-pulse" />
          <div className="space-y-2">
            <div className="h-6 w-48 bg-muted/20 rounded animate-pulse" />
            <div className="h-4 w-32 bg-muted/15 rounded animate-pulse" />
          </div>
        </div>
      </div>
      {/* Skeleton stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <Card key={i}><CardBody className="h-20 animate-pulse bg-muted/10" /></Card>
        ))}
      </div>
      {/* Skeleton tabs */}
      <div className="h-10 w-96 bg-muted/15 rounded-xl animate-pulse" />
      {/* Skeleton content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2"><CardBody className="h-48 animate-pulse bg-muted/10" /></Card>
        <Card><CardBody className="h-48 animate-pulse bg-muted/10" /></Card>
      </div>
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

  const clientName = `${client.first_name || ''} ${client.last_name || ''}`.trim();

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Page Header */}
      <PageHeader
        title={clientName}
        description={
          <span className="flex items-center gap-2 flex-wrap">
            <HiOutlineIdentification className="w-4 h-4" />
            {client.employee_code}
            {client.company_name && (
              <>
                <span className="text-border">•</span>
                <HiOutlineOfficeBuilding className="w-4 h-4" />
                {client.company_name}
              </>
            )}
            <StatusBadge status={client.status || (client.is_active ? 'active' : 'inactive')} />
          </span>
        }
        backLink="/clients"
        backText="Back to Clients"
      >
        <div className="flex gap-2">
          {isAdmin && (
            <>
              <Link href={`/clients/${id}/edit`}>
                <Button variant="secondary" className="shadow-sm border-border/50">
                  <HiOutlinePencil className="w-4 h-4 mr-2" /> Edit
                </Button>
              </Link>
              <Button variant="ghost" className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20" onClick={() => setDeleteModal(true)}>
                <HiOutlineTrash className="w-5 h-5" />
              </Button>
            </>
          )}
        </div>
      </PageHeader>

      {/* Info Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard icon={<HiOutlineIdentification className="w-6 h-6" />} iconColor="blue" value={client.employee_code || '—'} label="Employee Code" />
        <StatCard icon={<HiOutlineBriefcase className="w-6 h-6" />} iconColor="purple" value={client.department_name || '—'} label="Department" />
        <StatCard icon={<HiOutlineUserGroup className="w-6 h-6" />} iconColor="green" value={client.designation_name || '—'} label="Designation" />
        <StatCard icon={<HiOutlineCalendar className="w-6 h-6" />} iconColor="orange" value={client.joining_date ? new Date(client.joining_date).toLocaleDateString() : '—'} label="Joining Date" />
      </div>

      {/* Tabs */}
      <div className="bg-muted/30 p-1 rounded-xl w-fit border border-border/40 flex gap-1 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${activeTab === tab.id
                  ? 'bg-background text-primary shadow-sm ring-1 ring-black/5 dark:ring-white/10'
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon className="w-4 h-4" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader title="Contact Information" />
              <CardBody className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoItem icon={HiOutlineMail} label="Email" value={client.email} />
                <InfoItem icon={HiOutlinePhone} label="Phone" value={client.phone} />
                <InfoItem icon={HiOutlineOfficeBuilding} label="Company" value={client.company_name} />
                <InfoItem icon={HiOutlineGlobe} label="Industry" value={client.industry} />
                <InfoItem icon={HiOutlineLocationMarker} label="Address" value={client.address} />
                <InfoItem icon={HiOutlineIdentification} label="Status" value={client.status || (client.is_active ? 'Active' : 'Inactive')} />
              </CardBody>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader title="Quick Actions" />
              <CardBody className="space-y-3">
                <Button variant="secondary" className="w-full justify-start" onClick={() => setActiveTab('mail')}>
                  <HiOutlineMail className="w-5 h-5 mr-3 text-muted-foreground" /> Send Email
                </Button>
                <Button variant="secondary" className="w-full justify-start" onClick={() => setActiveTab('modules')}>
                  <HiOutlineCollection className="w-5 h-5 mr-3 text-muted-foreground" /> Manage Modules
                </Button>
                <Button variant="secondary" className="w-full justify-start" onClick={() => setActiveTab('projects')}>
                  <HiOutlineBriefcase className="w-5 h-5 mr-3 text-muted-foreground" /> View Projects
                </Button>
              </CardBody>
            </Card>

            {/* Activity Summary */}
            <Card>
              <CardHeader title="Client Summary" />
              <CardBody className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Created</span>
                  <span className="text-sm font-medium text-foreground">
                    {client.created_at ? new Date(client.created_at).toLocaleDateString() : '—'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">CRM Linked</span>
                  <span className={`text-sm font-semibold ${client.crm_client_id ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {client.crm_client_id ? 'Yes' : 'No'}
                  </span>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      )}

      {/* Modules Tab */}
      {activeTab === 'modules' && client.crm_client_id && (
        <ClientModulesTab clientId={client.crm_client_id} clientSlug={client.crm_client_slug} isClientView={user?.role?.code === 'CLIENT'} />
      )}
      {activeTab === 'modules' && !client.crm_client_id && (
        <Card>
          <CardBody className="text-center py-12 space-y-3">
            <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto">
              <HiOutlineCollection className="w-8 h-8 text-amber-500/60" />
            </div>
            <h3 className="text-lg font-bold text-foreground">No CRM Profile Linked</h3>
            <p className="text-muted-foreground max-w-sm mx-auto">Re-create this client or contact admin to link a CRM profile.</p>
          </CardBody>
        </Card>
      )}

      {/* Mail Tab */}
      {activeTab === 'mail' && client.crm_client_id && <ClientMailTab clientId={client.crm_client_id} />}
      {activeTab === 'mail' && !client.crm_client_id && (
        <Card>
          <CardBody className="text-center py-12 space-y-3">
            <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto">
              <HiOutlineMail className="w-8 h-8 text-amber-500/60" />
            </div>
            <h3 className="text-lg font-bold text-foreground">No CRM Profile Linked</h3>
            <p className="text-muted-foreground max-w-sm mx-auto">Mail features require a linked CRM profile.</p>
          </CardBody>
        </Card>
      )}

      {/* Projects Tab */}
      {activeTab === 'projects' && (
        <Card>
          <CardHeader title="Projects" />
          <CardBody>
            <div className="text-center py-12 text-muted-foreground">
              <HiOutlineBriefcase className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p className="font-medium mb-1">No projects linked to this client yet.</p>
              <p className="text-sm">Projects assigned to this client will appear here.</p>
            </div>
          </CardBody>
        </Card>
      )}

      <DeleteConfirmModal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Client"
        message={`Are you sure you want to delete "${clientName}"? This action cannot be undone.`}
        loading={deleting}
      />
    </div>
  );
}

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      {Icon && (
        <div className="w-9 h-9 rounded-lg bg-muted/40 flex items-center justify-center shrink-0 mt-0.5">
          <Icon className="w-4 h-4 text-muted-foreground" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-muted-foreground mb-0.5 uppercase tracking-wider">{label}</p>
        <p className="text-sm font-semibold text-foreground block truncate">{value || '—'}</p>
      </div>
    </div>
  );
}
