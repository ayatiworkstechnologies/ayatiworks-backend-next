'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardBody, StatCard, StatusBadge, Avatar, PageHeader } from '@/components/ui';
import Button from '@/components/ui/Button';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import {
  HiOutlinePlus, HiOutlineSearch, HiOutlineUserGroup, HiOutlineCheckCircle,
  HiOutlineBriefcase, HiOutlineCurrencyDollar, HiOutlineOfficeBuilding
} from 'react-icons/hi';

export default function ClientsPage() {
  const { user } = useAuth();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await api.get('/clients');
      setClients(response.items || response || []);
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(search.toLowerCase()) ||
    client.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in-up">
      <PageHeader
        title="Clients"
        description="Manage your client relationships"
      >
        {['admin', 'manager', 'super_admin'].includes(user?.role?.code?.toLowerCase()) && (
          <Link href="/clients/new">
            <Button variant="primary" className="shadow-lg shadow-primary/20">
              <HiOutlinePlus className="w-5 h-5" /> Add Client
            </Button>
          </Link>
        )}
      </PageHeader>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<HiOutlineUserGroup className="w-6 h-6" />} iconColor="blue" value={clients.length} label="Total Clients" />
        <StatCard icon={<HiOutlineCheckCircle className="w-6 h-6" />} iconColor="green" value={clients.filter(c => c.status === 'active').length} label="Active" />
        <StatCard icon={<HiOutlineBriefcase className="w-6 h-6" />} iconColor="purple" value={clients.reduce((sum, c) => sum + (c.projects || 0), 0)} label="Total Projects" />
        <StatCard icon={<HiOutlineCurrencyDollar className="w-6 h-6" />} iconColor="orange" value={`$${(clients.reduce((sum, c) => sum + (c.revenue || 0), 0) / 1000).toFixed(0)}K`} label="Total Revenue" />
      </div>

      {/* Search */}
      <Card>
        <CardBody className="p-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search clients..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input pl-10"
              />
            </div>
            <select className="input w-auto">
              <option value="">All Industries</option>
              <option value="technology">Technology</option>
              <option value="finance">Finance</option>
              <option value="consulting">Consulting</option>
            </select>
            <select className="input w-auto">
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </CardBody>
      </Card>

      {/* Client Grid */}
      {
        loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardBody className="space-y-3">
                  <div className="h-12 w-12 bg-muted/30 rounded-xl animate-pulse" />
                  <div className="h-4 w-3/4 bg-muted/20 rounded animate-pulse" />
                  <div className="h-3 w-1/2 bg-muted/20 rounded animate-pulse" />
                </CardBody>
              </Card>
            ))}
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="text-center p-12 glass-card border-2 border-dashed border-border/50">
            <div className="w-16 h-16 bg-muted/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <HiOutlineOfficeBuilding className="w-8 h-8 text-muted-foreground/40" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">No clients found</h3>
            <p className="text-muted-foreground mb-6">Add your first client to get started.</p>
            {['admin', 'manager', 'super_admin'].includes(user?.role?.code?.toLowerCase()) && (
              <Link href="/clients/new">
                <Button variant="primary"><HiOutlinePlus className="w-5 h-5" /> Add Client</Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClients.map((client) => (
              <Link key={client.id} href={`/clients/${client.id}`} className="block group">
                <Card className="h-full hover:ring-2 hover:ring-primary/20">
                  <CardBody>
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                        <HiOutlineOfficeBuilding className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-foreground truncate group-hover:text-primary transition-colors">{client.name}</h3>
                        <p className="text-sm text-muted-foreground truncate">{client.email}</p>
                      </div>
                      <StatusBadge status={client.status} />
                    </div>

                    <div className="space-y-2 text-sm pt-3 border-t border-border/30">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Industry</span>
                        <span className="font-medium text-foreground">{client.industry}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Projects</span>
                        <span className="font-medium text-foreground">{client.projects}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Revenue</span>
                        <span className="font-semibold text-emerald-600">${client.revenue?.toLocaleString()}</span>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </Link>
            ))}
          </div>
        )
      }
    </div >
  );
}
