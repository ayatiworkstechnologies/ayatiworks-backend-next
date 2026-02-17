'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody, PageHeader, Avatar } from '@/components/ui';
import Button from '@/components/ui/Button';
import api from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';
import ClientLeadsTab from '../clients/[id]/components/ClientLeadsTab';
import { HiOutlineSearch, HiOutlineBriefcase, HiOutlineChevronLeft } from 'react-icons/hi';

export default function ClientLeadsPage() {
    const { user } = useAuth();
    const toast = useToast();
    const [loading, setLoading] = useState(true);

    // Client User State
    const [portal, setPortal] = useState(null);

    // Admin State
    const [clients, setClients] = useState([]);
    const [selectedClient, setSelectedClient] = useState(null);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);

    const isClient = user?.role?.code?.toLowerCase() === 'client';

    useEffect(() => {
        if (isClient) {
            fetchPortal();
        } else {
            fetchClients();
        }
    }, [isClient]);

    // Fetch portal data for client users
    const fetchPortal = async () => {
        try {
            const data = await api.get('/my-portal');
            setPortal(data);
        } catch (error) {
            console.error('Error fetching portal:', error);
            toast.error('Failed to load your profile');
        } finally {
            setLoading(false);
        }
    };

    // Fetch clients for admin users
    const fetchClients = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/clients?page=${page}&page_size=20&search=${search}`);
            setClients(res.items || []);
            setTotal(res.total || 0);
        } catch (error) {
            console.error('Error fetching clients:', error);
            toast.error('Failed to load clients');
        } finally {
            setLoading(false);
        }
    };

    // Handler for search input
    useEffect(() => {
        if (!isClient) {
            const timer = setTimeout(() => {
                setPage(1);
                fetchClients();
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [search]);

    // Loading State
    if (loading && !portal && clients.length === 0) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    // ===== CLIENT VIEW =====
    if (isClient) {
        if (!portal) return <div>No profile found.</div>;
        return (
            <div className="space-y-6 animate-fade-in-up">
                <PageHeader
                    title="My Leads"
                    description="Manage your leads pipeline"
                />
                <ClientLeadsTab crmClientId={portal.client_id} clientSlug={portal.slug} />
            </div>
        );
    }

    // ===== ADMIN VIEW =====

    // If a client is selected, show their leads
    if (selectedClient) {
        return (
            <div className="space-y-6 animate-fade-in-up">
                <div className="flex items-center gap-3 mb-2">
                    <Button variant="ghost" onClick={() => setSelectedClient(null)} className="p-2">
                        <HiOutlineChevronLeft className="w-5 h-5" /> Back to Clients
                    </Button>
                </div>
                <PageHeader
                    title={`Leads: ${selectedClient.name}`}
                    description={`Manage leads for ${selectedClient.name}`}
                />
                <ClientLeadsTab
                    crmClientId={selectedClient.crm_client_id}
                    clientSlug={selectedClient.crm_client_slug}
                />
            </div>
        );
    }

    // Client Selector List
    return (
        <div className="space-y-6 animate-fade-in-up">
            <PageHeader
                title="Client Leads"
                description="Select a client to manage their leads"
            />

            <div className="flex items-center gap-4 bg-card p-4 rounded-xl border border-border shadow-sm">
                <HiOutlineSearch className="text-muted-foreground w-5 h-5" />
                <input
                    type="text"
                    placeholder="Search clients..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="bg-transparent border-none focus:outline-none w-full text-foreground placeholder:text-muted-foreground"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {clients.map(client => (
                    <Card
                        key={client.id}
                        className="cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all hover:translate-y-[-2px]"
                        onClick={() => {
                            if (!client.crm_client_id) {
                                toast.error('This client does not have a CRM profile linking.');
                                return;
                            }
                            setSelectedClient(client);
                        }}
                    >
                        <CardBody className="flex items-center gap-4">
                            <Avatar name={client.first_name} src={client.avatar} size="md" />
                            <div>
                                <h4 className="font-bold text-foreground">{client.first_name} {client.last_name}</h4>
                                <p className="text-sm text-muted-foreground">{client.company_name || 'No Company'}</p>
                                {!client.crm_client_id && (
                                    <span className="text-xs text-red-500 mt-1 block">No CRM Profile</span>
                                )}
                            </div>
                            <HiOutlineBriefcase className="ml-auto w-5 h-5 text-muted-foreground/30" />
                        </CardBody>
                    </Card>
                ))}
            </div>

            {clients.length === 0 && !loading && (
                <div className="text-center py-12 text-muted-foreground">
                    No clients found matching "{search}"
                </div>
            )}
        </div>
    );
}
