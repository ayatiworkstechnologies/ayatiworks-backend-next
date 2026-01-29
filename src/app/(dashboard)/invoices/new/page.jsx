'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardHeader, CardBody } from '@/components/ui';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import api from '@/lib/api';
import { HiOutlineArrowLeft, HiOutlinePlus, HiOutlineTrash, HiOutlinePaperAirplane, HiOutlineSave } from 'react-icons/hi';

import { useToast } from '@/context/ToastContext';

export default function CreateInvoicePage() {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    client_id: '',
    project_id: '',
    due_date: new Date().toISOString().split('T')[0],
    notes: '',
    items: [
      { description: '', quantity: 1, rate: 0 }
    ]
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = field === 'quantity' || field === 'rate' ? parseFloat(value) || 0 : value;
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { description: '', quantity: 1, rate: 0 }]
    }));
  };

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      const newItems = formData.items.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, items: newItems }));
    }
  };

  const calculateSubtotal = () => {
    return formData.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.18; // 18% tax
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/invoices', {
        ...formData,
        subtotal: calculateSubtotal(),
        tax: calculateTax(),
        total: calculateTotal(),
      });
      router.push('/invoices');
      toast.success('Invoice created successfully');
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast.error(error.message || 'Failed to create invoice');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in-up">
      {/* Page Header */}
      <div className="page-header sticky top-0 bg-background/95 backdrop-blur-sm z-20 py-4 border-b border-border/50 mb-0">
        <div>
          <Link href="/invoices" className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
            <HiOutlineArrowLeft className="w-4 h-4" /> Back to Invoices
          </Link>
          <h1 className="page-title mt-2">Create Invoice</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" className="shadow-sm border-border/50">
            <HiOutlineSave className="w-4 h-4 mr-2" /> Save Draft
          </Button>
          <Button variant="primary" onClick={handleSubmit} loading={loading} className="shadow-lg shadow-primary/20">
            <HiOutlinePaperAirplane className="w-4 h-4 mr-2 rotate-90" /> Create & Send
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-20">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Client & Project */}
          <Card>
            <CardHeader title="Invoice Details" />
            <CardBody className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="input-wrapper">
                  <label className="input-label">Client <span className="input-required">*</span></label>
                  <select
                    name="client_id"
                    value={formData.client_id}
                    onChange={handleChange}
                    className="input"
                    required
                  >
                    <option value="">Select client</option>
                    <option value="1">ABC Corporation</option>
                    <option value="2">XYZ Limited</option>
                    <option value="3">Tech Innovators</option>
                  </select>
                </div>
                <div className="input-wrapper">
                  <label className="input-label">Project</label>
                  <select
                    name="project_id"
                    value={formData.project_id}
                    onChange={handleChange}
                    className="input"
                  >
                    <option value="">Select project (optional)</option>
                    <option value="1">HRMS Platform</option>
                    <option value="2">E-Commerce Website</option>
                  </select>
                </div>
              </div>
              <Input
                label="Due Date"
                type="date"
                name="due_date"
                value={formData.due_date}
                onChange={handleChange}
                required
              />
            </CardBody>
          </Card>

          {/* Line Items */}
          <Card>
            <CardHeader
              title="Line Items"
              action={
                <Button variant="secondary" size="sm" onClick={addItem}>
                  <HiOutlinePlus className="w-4 h-4 mr-1" /> Add Item
                </Button>
              }
            />
            <CardBody className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-muted/40 text-muted-foreground border-b border-border/50">
                    <tr>
                      <th className="px-6 py-3 font-medium w-[40%]">Description</th>
                      <th className="px-4 py-3 font-medium w-[15%]">Qty</th>
                      <th className="px-4 py-3 font-medium w-[20%]">Rate ($)</th>
                      <th className="px-4 py-3 font-medium w-[20%] text-right">Amount</th>
                      <th className="px-4 py-3 font-medium w-[5%]"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {formData.items.map((item, index) => (
                      <tr key={index} className="group hover:bg-muted/10 transition-colors">
                        <td className="px-6 py-3">
                          <input
                            type="text"
                            placeholder="Item name / description"
                            value={item.description}
                            onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                            className="w-full bg-transparent border-0 border-b border-transparent focus:border-primary focus:ring-0 px-0 py-1 transition-colors placeholder:text-muted-foreground/50"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                            className="w-full bg-transparent border-0 border-b border-transparent focus:border-primary focus:ring-0 px-0 py-1 transition-colors text-right"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.rate}
                            onChange={(e) => handleItemChange(index, 'rate', e.target.value)}
                            className="w-full bg-transparent border-0 border-b border-transparent focus:border-primary focus:ring-0 px-0 py-1 transition-colors text-right"
                          />
                        </td>
                        <td className="px-4 py-3 text-right font-medium tabular-nums pl-4">
                          ${(item.quantity * item.rate).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {formData.items.length > 1 && (
                            <button
                              onClick={() => removeItem(index)}
                              className="text-muted-foreground hover:text-red-500 transition-colors p-1 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20"
                              title="Remove item"
                            >
                              <HiOutlineTrash className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {formData.items.length === 0 && (
                <div className="p-8 text-center text-muted-foreground">
                  No items added. Click "Add Item" to start.
                </div>
              )}
            </CardBody>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader title="Notes & Terms" />
            <CardBody>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Add payment terms, banking details, or thank you notes..."
                className="input min-h-[120px] resize-none"
              />
            </CardBody>
          </Card>
        </div>

        {/* Summary Sidebar */}
        <div>
          <Card className="sticky top-24 shadow-lg border-primary/10">
            <CardHeader title="Payment Summary" className="bg-muted/20" />
            <CardBody className="space-y-4 p-6">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium text-foreground">${calculateSubtotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax (18%)</span>
                <span className="font-medium text-foreground">${calculateTax().toFixed(2)}</span>
              </div>

              <div className="my-4 border-t border-dashed border-border/60"></div>

              <div className="flex justify-between items-end">
                <span className="text-base font-bold text-foreground">Total Due</span>
                <span className="text-2xl font-bold text-primary">
                  ${calculateTotal().toFixed(2)}
                </span>
              </div>

              <div className="pt-4 mt-2">
                <p className="text-xs text-muted-foreground text-center">
                  Invoice will be sent to <span className="font-medium text-foreground">Accounts Payable</span>
                </p>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
