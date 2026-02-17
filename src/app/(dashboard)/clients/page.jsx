'use client';

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardBody, StatCard, StatusBadge, Avatar, PageHeader } from '@/components/ui';
import Button from '@/components/ui/Button';
import { useAPI } from '@/hooks/useAPI';
import { useAuth } from '@/context/AuthContext';
import { useDebounce } from '@/hooks';
import {
  HiOutlinePlus, HiOutlineSearch, HiOutlineUserGroup, HiOutlineCheckCircle,
  HiOutlineBriefcase, HiOutlineIdentification, HiOutlineOfficeBuilding,
  HiOutlineFilter, HiOutlineRefresh
} from 'react-icons/hi';

export default function ClientsPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  const { data: response, isLoading, isValidating, mutate } = useAPI('/clients', {
    revalidateOnFocus: false,
    dedupingInterval: 10000,
  });

  const clients = response?.items || [];

  // Memoized stats
  const stats = useMemo(() => ({
    total: clients.length,
    active: clients.filter(c => c.is_active).length,
    withCode: clients.filter(c => c.employee_code).length,
    inactive: clients.filter(c => !c.is_active).length,
  }), [clients]);

  // Memoized filtered list
  const filteredClients = useMemo(() => {
    let result = clients;

    // Status filter
    if (statusFilter === 'active') result = result.filter(c => c.is_active);
    else if (statusFilter === 'inactive') result = result.filter(c => !c.is_active);

    // Search filter
    if (debouncedSearch) {
      const term = debouncedSearch.toLowerCase();
      result = result.filter(client => {
        const name = `${client.first_name || ''} ${client.last_name || ''}`.toLowerCase();
        const email = (client.email || '').toLowerCase();
        const code = (client.employee_code || '').toLowerCase();
        const company = (client.company_name || '').toLowerCase();
        return name.includes(term) || email.includes(term) || code.includes(term) || company.includes(term);
      });
    }

    return result;
  }, [clients, debouncedSearch, statusFilter]);

  const isAdmin = ['admin', 'manager', 'super_admin'].includes(user?.role?.code?.toLowerCase());

  return (
    <div className="space-y-8 animate-fade-in-up">
      <PageHeader
        title="Clients"
        description={`Manage your client relationships${isValidating && !isLoading ? ' · Refreshing...' : ''}`}
      >
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => mutate()}
            className={`${isValidating ? 'animate-spin' : ''}`}
            title="Refresh"
          >
            <HiOutlineRefresh className="w-4 h-4" />
          </Button>
          {isAdmin && (
            <Link href="/clients/new">
              <Button variant="primary" className="shadow-lg shadow-primary/20">
                <HiOutlinePlus className="w-5 h-5" /> Add Client
              </Button>
            </Link>
          )}
        </div>
      </PageHeader>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          icon={<HiOutlineUserGroup className="w-6 h-6" />}
          iconColor="blue"
          value={isLoading ? '—' : stats.total}
          label="Total Clients"
        />
        <StatCard
          icon={<HiOutlineCheckCircle className="w-6 h-6" />}
          iconColor="green"
          value={isLoading ? '—' : stats.active}
          label="Active"
        />
        <StatCard
          icon={<HiOutlineIdentification className="w-6 h-6" />}
          iconColor="purple"
          value={isLoading ? '—' : stats.withCode}
          label="With Code"
        />
        <StatCard
          icon={<HiOutlineBriefcase className="w-6 h-6" />}
          iconColor="orange"
          value={isLoading ? '—' : stats.inactive}
          label="Inactive"
        />
      </div>

      {/* Search + Filter */}
      <Card>
        <CardBody className="p-4">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by name, email, code, or company..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input pl-10"
              />
            </div>
            <div className="relative">
              <HiOutlineFilter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input pl-9 w-auto pr-8 appearance-none cursor-pointer"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Client Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardBody className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 bg-muted/30 rounded-xl animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 bg-muted/20 rounded animate-pulse" />
                    <div className="h-3 w-1/2 bg-muted/20 rounded animate-pulse" />
                  </div>
                </div>
                <div className="space-y-2 pt-3 border-t border-border/20">
                  <div className="h-3 w-full bg-muted/15 rounded animate-pulse" />
                  <div className="h-3 w-2/3 bg-muted/15 rounded animate-pulse" />
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      ) : filteredClients.length === 0 ? (
        <div className="text-center p-12 glass-card border-2 border-dashed border-border/50">
          <div className="w-16 h-16 bg-muted/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <HiOutlineOfficeBuilding className="w-8 h-8 text-muted-foreground/40" />
          </div>
          <h3 className="text-lg font-bold text-foreground mb-2">
            {search || statusFilter ? 'No clients match your filters' : 'No clients found'}
          </h3>
          <p className="text-muted-foreground mb-6">
            {search || statusFilter
              ? 'Try adjusting your search or filter criteria.'
              : 'Add your first client to get started.'}
          </p>
          {!search && !statusFilter && isAdmin && (
            <Link href="/clients/new">
              <Button variant="primary"><HiOutlinePlus className="w-5 h-5" /> Add Client</Button>
            </Link>
          )}
          {(search || statusFilter) && (
            <Button variant="secondary" onClick={() => { setSearch(''); setStatusFilter(''); }}>
              Clear Filters
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map((client) => (
            <Link key={client.id} href={`/clients/${client.id}`} className="block group">
              <Card className="h-full hover:ring-2 hover:ring-primary/20 hover:-translate-y-0.5 transition-all duration-200">
                <CardBody>
                  <div className="flex items-start gap-4 mb-4">
                    <Avatar name={`${client.first_name} ${client.last_name || ''}`} size="lg" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-foreground truncate group-hover:text-primary transition-colors">
                        {client.first_name} {client.last_name || ''}
                      </h3>
                      <p className="text-sm text-muted-foreground truncate">{client.email}</p>
                    </div>
                    <StatusBadge status={client.status || (client.is_active ? 'active' : 'inactive')} />
                  </div>

                  <div className="space-y-2 text-sm pt-3 border-t border-border/30">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Code</span>
                      <span className="font-mono font-medium text-foreground">{client.employee_code || '—'}</span>
                    </div>
                    {client.company_name && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Company</span>
                        <span className="font-medium text-foreground truncate ml-2">{client.company_name}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Department</span>
                      <span className="font-medium text-foreground">{client.department_name || '—'}</span>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Result count */}
      {!isLoading && filteredClients.length > 0 && (
        <p className="text-center text-xs text-muted-foreground">
          Showing {filteredClients.length} of {clients.length} client{clients.length !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
}
