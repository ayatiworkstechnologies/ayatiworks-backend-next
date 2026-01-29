'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardHeader, CardBody, StatusBadge } from '@/components/ui';
import Button from '@/components/ui/Button';
import api from '@/lib/api';

export default function InvoiceDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoice();
  }, [id]);

  const fetchInvoice = async () => {
    try {
      const data = await api.get(`/invoices/${id}`);
      setInvoice(data);
    } catch (error) {
      console.error('Error fetching invoice:', error);
      // Sample data
      setInvoice({
        id: 1,
        invoice_number: 'INV-001',
        status: 'sent',
        client: { name: 'ABC Corporation', email: 'contact@abc.com', address: '123 Tech Park, Silicon Valley' },
        project: { name: 'HRMS Platform' },
        date: '2026-01-15',
        due_date: '2026-02-15',
        items: [
          { description: 'Frontend Development', quantity: 40, rate: 150, amount: 6000 },
          { description: 'Backend Development', quantity: 30, rate: 150, amount: 4500 },
          { description: 'UI/UX Design', quantity: 20, rate: 100, amount: 2000 },
          { description: 'Project Management', quantity: 10, rate: 100, amount: 1000 },
        ],
        subtotal: 13500,
        tax: 2430,
        total: 15930,
        notes: 'Payment is due within 30 days. Thank you for your business!',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-[var(--primary-500)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="empty-state">
        <h3 className="empty-state-title">Invoice not found</h3>
        <Link href="/invoices"><Button variant="primary">Back to Invoices</Button></Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <button onClick={() => router.back()} className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)]">
            ← Back
          </button>
          <div className="flex items-center gap-3 mt-2">
            <h1 className="page-title">{invoice.invoice_number}</h1>
            <StatusBadge status={invoice.status} />
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary">📧 Send</Button>
          <Button variant="secondary">📥 Download PDF</Button>
          {['sent', 'overdue'].includes(invoice.status) && (
            <Button variant="primary">💳 Record Payment</Button>
          )}
        </div>
      </div>

      {/* Invoice Preview */}
      <Card>
        <CardBody className="p-8">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <div className="w-16 h-16 bg-gradient-to-br from-[var(--primary-500)] to-[var(--primary-600)] rounded-xl flex items-center justify-center text-white font-bold text-2xl mb-4">
                E
              </div>
              <h2 className="text-xl font-bold">Enterprise HRMS</h2>
              <p className="text-[var(--text-tertiary)]">contact@enterprise.com</p>
            </div>
            <div className="text-right">
              <h1 className="text-3xl font-bold text-[var(--primary-600)]">INVOICE</h1>
              <p className="text-lg font-medium mt-2">{invoice.invoice_number}</p>
              <p className="text-[var(--text-tertiary)]">Date: {new Date(invoice.date).toLocaleDateString()}</p>
              <p className="text-[var(--text-tertiary)]">Due: {new Date(invoice.due_date).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Client Info */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-sm font-semibold text-[var(--text-tertiary)] mb-2">BILL TO</h3>
              <p className="font-semibold">{invoice.client?.name}</p>
              <p className="text-[var(--text-secondary)]">{invoice.client?.email}</p>
              <p className="text-[var(--text-secondary)]">{invoice.client?.address}</p>
            </div>
            {invoice.project && (
              <div>
                <h3 className="text-sm font-semibold text-[var(--text-tertiary)] mb-2">PROJECT</h3>
                <p className="font-semibold">{invoice.project?.name}</p>
              </div>
            )}
          </div>

          {/* Line Items */}
          <div className="border border-[var(--border)] rounded-lg overflow-hidden mb-8">
            <table className="w-full">
              <thead className="bg-[var(--background-secondary)]">
                <tr>
                  <th className="text-left p-4 font-semibold">Description</th>
                  <th className="text-right p-4 font-semibold">Qty</th>
                  <th className="text-right p-4 font-semibold">Rate</th>
                  <th className="text-right p-4 font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items?.map((item, idx) => (
                  <tr key={idx} className="border-t border-[var(--border)]">
                    <td className="p-4">{item.description}</td>
                    <td className="p-4 text-right">{item.quantity}</td>
                    <td className="p-4 text-right">${item.rate?.toFixed(2)}</td>
                    <td className="p-4 text-right font-medium">${item.amount?.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-8">
            <div className="w-64">
              <div className="flex justify-between py-2">
                <span className="text-[var(--text-secondary)]">Subtotal</span>
                <span className="font-medium">${invoice.subtotal?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-[var(--text-secondary)]">Tax (18%)</span>
                <span className="font-medium">${invoice.tax?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-3 border-t border-[var(--border)] text-lg">
                <span className="font-bold">Total</span>
                <span className="font-bold text-[var(--primary-600)]">${invoice.total?.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="border-t border-[var(--border)] pt-6">
              <h3 className="text-sm font-semibold text-[var(--text-tertiary)] mb-2">NOTES</h3>
              <p className="text-[var(--text-secondary)]">{invoice.notes}</p>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
