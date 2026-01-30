'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardBody, StatCard, StatusBadge, PageHeader } from '@/components/ui';
import Button from '@/components/ui/Button';
import api from '@/lib/api';
import {
  HiOutlinePlus, HiOutlineDocumentText, HiOutlineCheckCircle,
  HiOutlineClock, HiOutlineExclamation, HiOutlineEye, HiOutlinePaperAirplane,
  HiOutlineCash
} from 'react-icons/hi';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const response = await api.get('/invoices');
      setInvoices(response.items || response || []);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'draft', label: 'Draft' },
    { id: 'sent', label: 'Sent' },
    { id: 'paid', label: 'Paid' },
    { id: 'overdue', label: 'Overdue' },
  ];

  const filteredInvoices = activeTab === 'all' ? invoices : invoices.filter(inv => inv.status === activeTab);

  const totalAmount = invoices.reduce((sum, inv) => sum + inv.amount, 0);
  const paidAmount = invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.amount, 0);
  const pendingAmount = invoices.filter(inv => ['sent', 'overdue'].includes(inv.status)).reduce((sum, inv) => sum + inv.amount, 0);
  const overdueAmount = invoices.filter(inv => inv.status === 'overdue').reduce((sum, inv) => sum + inv.amount, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invoices"
        description="Manage your invoices and payments"
      >
        <Link href="/invoices/new">
          <Button variant="primary" className="shadow-lg shadow-primary/20">
            <HiOutlinePlus className="w-5 h-5" /> Create Invoice
          </Button>
        </Link>
      </PageHeader>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<HiOutlineDocumentText className="w-6 h-6" />} iconColor="blue" value={`$${(totalAmount / 1000).toFixed(1)}K`} label="Total Invoiced" />
        <StatCard icon={<HiOutlineCheckCircle className="w-6 h-6" />} iconColor="green" value={`$${(paidAmount / 1000).toFixed(1)}K`} label="Paid" />
        <StatCard icon={<HiOutlineClock className="w-6 h-6" />} iconColor="orange" value={`$${(pendingAmount / 1000).toFixed(1)}K`} label="Pending" />
        <StatCard icon={<HiOutlineExclamation className="w-6 h-6" />} iconColor="purple" value={`$${(overdueAmount / 1000).toFixed(1)}K`} label="Overdue" />
      </div>

      {/* Tabs */}
      <div className="bg-muted/30 p-1 rounded-xl w-fit border border-border/40 flex gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === tab.id ? 'bg-background text-primary shadow-sm ring-1 ring-black/5 dark:ring-white/10' : 'text-muted-foreground hover:text-foreground hover:bg-background/50'}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
            {tab.id !== 'all' && (
              <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab.id ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                {invoices.filter(inv => inv.status === tab.id).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Invoice Table */}
      <Card>
        <div className="table-container border-0 bg-transparent">
          {loading ? (
            <div className="p-12 text-center">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <HiOutlineDocumentText className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>No invoices found</p>
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Client</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="group hover:bg-muted/30 transition-colors">
                    <td>
                      <Link href={`/invoices/${invoice.id}`} className="font-medium text-foreground hover:text-primary transition-colors">
                        {invoice.invoice_number}
                      </Link>
                    </td>
                    <td className="text-muted-foreground font-medium">{invoice.client}</td>
                    <td className="font-bold font-mono">${invoice.amount?.toLocaleString()}</td>
                    <td className="text-muted-foreground text-sm">{new Date(invoice.date).toLocaleDateString()}</td>
                    <td className="text-muted-foreground text-sm">{new Date(invoice.due_date).toLocaleDateString()}</td>
                    <td><StatusBadge status={invoice.status} /></td>
                    <td className="text-right">
                      <div className="flex justify-end gap-1">
                        <Link href={`/invoices/${invoice.id}`}>
                          <Button variant="ghost" size="sm"><HiOutlineEye className="w-4 h-4" /></Button>
                        </Link>
                        {invoice.status === 'draft' && (
                          <Button variant="ghost" size="sm"><HiOutlinePaperAirplane className="w-4 h-4" /></Button>
                        )}
                        {['sent', 'overdue'].includes(invoice.status) && (
                          <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"><HiOutlineCash className="w-4 h-4" /></Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>
    </div>
  );
}
