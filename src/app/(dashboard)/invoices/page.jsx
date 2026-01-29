'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardBody, StatCard, StatusBadge } from '@/components/ui';
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
      <div className="page-header">
        <div>
          <h1 className="page-title">Invoices</h1>
          <p className="page-subtitle">Manage your invoices and payments</p>
        </div>
        <Link href="/invoices/new">
          <Button variant="primary">
            <HiOutlinePlus className="w-5 h-5" /> Create Invoice
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<HiOutlineDocumentText className="w-6 h-6" />} iconColor="blue" value={`$${(totalAmount / 1000).toFixed(1)}K`} label="Total Invoiced" />
        <StatCard icon={<HiOutlineCheckCircle className="w-6 h-6" />} iconColor="green" value={`$${(paidAmount / 1000).toFixed(1)}K`} label="Paid" />
        <StatCard icon={<HiOutlineClock className="w-6 h-6" />} iconColor="orange" value={`$${(pendingAmount / 1000).toFixed(1)}K`} label="Pending" />
        <StatCard icon={<HiOutlineExclamation className="w-6 h-6" />} iconColor="purple" value={`$${(overdueAmount / 1000).toFixed(1)}K`} label="Overdue" />
      </div>

      {/* Tabs */}
      <div className="tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab ${activeTab === tab.id ? 'tab-active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
            {tab.id !== 'all' && (
              <span className="ml-2 text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full">
                {invoices.filter(inv => inv.status === tab.id).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Invoice Table */}
      <Card>
        <div className="table-container border-0">
          {loading ? (
            <div className="p-8 text-center">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
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
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td>
                      <Link href={`/invoices/${invoice.id}`} className="font-medium text-blue-600 hover:underline">
                        {invoice.invoice_number}
                      </Link>
                    </td>
                    <td className="text-gray-600">{invoice.client}</td>
                    <td className="font-medium">${invoice.amount?.toLocaleString()}</td>
                    <td className="text-gray-600">{new Date(invoice.date).toLocaleDateString()}</td>
                    <td className="text-gray-600">{new Date(invoice.due_date).toLocaleDateString()}</td>
                    <td><StatusBadge status={invoice.status} /></td>
                    <td>
                      <div className="flex gap-1">
                        <Link href={`/invoices/${invoice.id}`}>
                          <Button variant="ghost" size="sm"><HiOutlineEye className="w-4 h-4" /></Button>
                        </Link>
                        {invoice.status === 'draft' && (
                          <Button variant="ghost" size="sm"><HiOutlinePaperAirplane className="w-4 h-4" /></Button>
                        )}
                        {['sent', 'overdue'].includes(invoice.status) && (
                          <Button variant="ghost" size="sm" className="text-green-600"><HiOutlineCash className="w-4 h-4" /></Button>
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
