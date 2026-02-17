'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody, StatusBadge, Avatar, PageHeader } from '@/components/ui';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import api from '@/lib/api';
import { HiOutlinePlus } from 'react-icons/hi';
import { useToast } from '@/context/ToastContext';

const stages = [
  { id: 'new', label: 'New', color: 'bg-slate-500' },
  { id: 'contacted', label: 'Contacted', color: 'bg-blue-500' },
  { id: 'qualified', label: 'Qualified', color: 'bg-violet-500' },
  { id: 'proposal', label: 'Proposal', color: 'bg-amber-500' },
  { id: 'negotiation', label: 'Negotiation', color: 'bg-pink-500' },
  { id: 'won', label: 'Won', color: 'bg-emerald-500' },
];

export default function LeadsPage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewLead, setShowNewLead] = useState(false);
  const toast = useToast();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    company: '',
    email: '',
    phone: '',
    source: 'Website',
    value: ''
  });

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const response = await api.get('/leads');
      setLeads(response.items || response || []);
    } catch (error) {
      console.error('Error fetching leads:', error);
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  const getLeadsByStage = (stageId) => leads.filter(l => l.status === stageId);

  const getTotalValue = (stageId) => {
    return getLeadsByStage(stageId).reduce((sum, l) => sum + (l.value || 0), 0);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddLead = async () => {
    try {
      if (!formData.firstName || !formData.lastName || !formData.company || !formData.email) {
        toast.error("Please fill in all required fields");
        return;
      }

      await api.post('/leads', {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        phone: formData.phone,
        company: formData.company,
        source_details: formData.source,
        budget: formData.value ? parseFloat(formData.value) : 0,
        status: 'new'
      });

      toast.success("Lead added successfully");
      setShowNewLead(false);
      fetchLeads();
      setFormData({
        firstName: '', lastName: '', company: '', email: '', phone: '', source: 'Website', value: ''
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to add lead");
    }
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Page Header */}
      <PageHeader
        title="Internal Leads"
        description="Track and manage company sales leads"
      >
        <Button variant="primary" onClick={() => setShowNewLead(true)} className="shadow-lg shadow-primary/20">
          <HiOutlinePlus className="w-5 h-5" /> Add Lead
        </Button>
      </PageHeader>

      {/* Pipeline Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {stages.map((stage) => (
          <Card key={stage.id} className="text-center">
            <CardBody className="p-4">
              <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${stage.color}`} />
              <p className="text-xs text-muted-foreground font-medium">{stage.label}</p>
              <p className="text-xl font-bold text-foreground">{getLeadsByStage(stage.id).length}</p>
              <p className="text-xs text-emerald-600 font-semibold">
                ${(getTotalValue(stage.id) / 1000).toFixed(0)}K
              </p>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Kanban Pipeline */}
      <div className="flex gap-5 overflow-x-auto pb-6 -mx-6 px-6 scrollbar-thin scrollbar-thumb-border/40">
        {stages.map((stage) => (
          <div
            key={stage.id}
            className="flex-shrink-0 w-72 flex flex-col gap-4"
          >
            {/* Column Header */}
            <div className="flex items-center gap-3 px-1">
              <div className={`w-3 h-3 rounded-full ${stage.color} shadow-sm`} />
              <h3 className="font-bold text-foreground">{stage.label}</h3>
              <span className="ml-auto text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-medium">
                {getLeadsByStage(stage.id).length}
              </span>
            </div>

            {/* Lead Cards */}
            <div className="flex flex-col gap-3 min-h-[200px]">
              {getLeadsByStage(stage.id).map((lead) => (
                <div
                  key={lead.id}
                  className="group glass-card border border-white/40 dark:border-white/5 p-4 cursor-pointer hover:ring-2 hover:ring-primary/20"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-sm text-foreground">{lead.name}</h4>
                      <p className="text-xs text-muted-foreground">{lead.company}</p>
                    </div>
                    <Avatar name={lead.name} size="sm" className="ring-2 ring-background" />
                  </div>

                  <p className="text-xs text-muted-foreground mb-3">{lead.email}</p>

                  <div className="flex items-center justify-between pt-3 border-t border-border/30">
                    <span className="text-sm font-bold text-emerald-600">
                      ${lead.value?.toLocaleString()}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-muted text-muted-foreground px-2 py-1 rounded-full">
                      {lead.source}
                    </span>
                  </div>
                </div>
              ))}

              {/* Empty State */}
              {getLeadsByStage(stage.id).length === 0 && (
                <div className="h-32 border-2 border-dashed border-border/40 rounded-2xl flex items-center justify-center text-muted-foreground/50 text-sm">
                  <p>No leads</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* New Lead Modal */}
      <Modal
        isOpen={showNewLead}
        onClose={() => setShowNewLead(false)}
        title="Add New Lead"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowNewLead(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleAddLead}><HiOutlinePlus className="w-4 h-4" /> Add Lead</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="First Name" name="firstName" value={formData.firstName} onChange={handleInputChange} placeholder="John" required />
            <Input label="Last Name" name="lastName" value={formData.lastName} onChange={handleInputChange} placeholder="Smith" required />
          </div>
          <Input label="Company" name="company" value={formData.company} onChange={handleInputChange} placeholder="Company name" required />
          <Input label="Email" type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="john@company.com" required />
          <Input label="Phone" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="+1 234 567 8900" />
          <div className="grid grid-cols-2 gap-4">
            <div className="input-wrapper">
              <label className="input-label">Source</label>
              <select className="input" name="source" value={formData.source} onChange={handleInputChange}>
                <option value="Website">Website</option>
                <option value="Referral">Referral</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="Conference">Conference</option>
                <option value="Cold Call">Cold Call</option>
              </select>
            </div>
            <Input label="Estimated Value" type="number" name="value" value={formData.value} onChange={handleInputChange} placeholder="10000" />
          </div>
        </div>
      </Modal>
    </div>
  );
}
