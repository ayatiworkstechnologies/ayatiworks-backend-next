'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardHeader, CardBody } from '@/components/ui';
import Button from '@/components/ui/Button';
import api from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import {
  HiOutlineArrowLeft, HiOutlineCalendar, HiOutlineCheck,
  HiOutlineClock, HiOutlineDocumentText, HiOutlinePhone
} from 'react-icons/hi';

export default function ApplyLeavePage() {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [balances, setBalances] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    leave_type_id: '',
    from_date: '',
    to_date: '',
    is_half_day: false,
    half_day_type: 'first_half',
    reason: '',
    contact_during_leave: '',
  });

  // Fetch leave types and balances on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [typesRes, balancesRes] = await Promise.all([
          api.get('/leave-types').catch(() => []),
          api.get('/leaves/my-balance').catch(() => []),
        ]);
        setLeaveTypes(typesRes || []);
        setBalances(balancesRes || []);
      } catch (error) {
        console.error('Error fetching leave data:', error);
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.leave_type_id) newErrors.leave_type_id = 'Leave type is required';
    if (!formData.from_date) newErrors.from_date = 'From date is required';
    if (!formData.to_date) newErrors.to_date = 'To date is required';
    if (formData.from_date && formData.to_date && formData.from_date > formData.to_date) {
      newErrors.to_date = 'To date must be after from date';
    }
    if (!formData.reason.trim() || formData.reason.trim().length < 5) {
      newErrors.reason = 'Reason is required (minimum 5 characters)';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast?.error?.('Please fix the validation errors');
      return;
    }

    setLoading(true);
    try {
      const submitData = {
        leave_type_id: parseInt(formData.leave_type_id, 10),
        from_date: formData.from_date,
        to_date: formData.to_date,
        is_half_day: formData.is_half_day,
        half_day_type: formData.is_half_day ? formData.half_day_type : null,
        reason: formData.reason.trim(),
      };

      // Only include contact if provided
      if (formData.contact_during_leave?.trim()) {
        submitData.contact_during_leave = formData.contact_during_leave.trim();
      }

      await api.post('/leaves', submitData);
      toast?.success?.('Leave request submitted successfully!');
      setTimeout(() => router.push('/leaves'), 1500);
    } catch (error) {
      console.error('Error applying leave:', error);
      const errorMessage = error?.data?.detail || error?.message || 'Failed to apply leave';
      toast?.error?.(typeof errorMessage === 'string' ? errorMessage : 'Failed to apply leave');
    } finally {
      setLoading(false);
    }
  };

  // Calculate days excluding weekends (matches backend logic)
  const calculateDays = useCallback(() => {
    if (!formData.from_date || !formData.to_date) return 0;
    if (formData.is_half_day) return 0.5;

    const from = new Date(formData.from_date);
    const to = new Date(formData.to_date);
    let days = 0;
    const current = new Date(from);

    while (current <= to) {
      const dayOfWeek = current.getDay();
      // Skip weekends (0 = Sunday, 6 = Saturday)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        days++;
      }
      current.setDate(current.getDate() + 1);
    }

    return days;
  }, [formData.from_date, formData.to_date, formData.is_half_day]);

  const getLeaveColor = (type) => {
    const typeLower = type?.toLowerCase() || '';
    if (typeLower.includes('sick')) return 'text-green-500';
    if (typeLower.includes('casual')) return 'text-blue-500';
    if (typeLower.includes('earned')) return 'text-purple-500';
    return 'text-orange-500';
  };

  const getLeaveTextColor = (type) => {
    const typeLower = type?.toLowerCase() || '';
    if (typeLower.includes('sick')) return 'text-green-600';
    if (typeLower.includes('casual')) return 'text-blue-600';
    if (typeLower.includes('earned')) return 'text-purple-600';
    return 'text-orange-600';
  };

  // Get selected leave type balance
  const selectedBalance = balances.find(b => String(b.leave_type_id) === formData.leave_type_id);

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="page-header">
        <div>
          <Link href="/leaves" className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-700">
            <HiOutlineArrowLeft className="w-4 h-4" /> Back to Leaves
          </Link>
          <h1 className="page-title mt-2">Apply for Leave</h1>
        </div>
      </div>

      {/* Leave Balance Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {loadingData ? (
          Array(3).fill(0).map((_, i) => (
            <Card key={i}>
              <CardBody className="p-4 text-center">
                <div className="w-6 h-6 mx-auto mb-2 bg-gray-200 rounded animate-pulse" />
                <div className="h-3 w-16 mx-auto bg-gray-200 rounded animate-pulse mb-2" />
                <div className="h-8 w-12 mx-auto bg-gray-200 rounded animate-pulse" />
              </CardBody>
            </Card>
          ))
        ) : balances.length > 0 ? (
          balances.slice(0, 4).map((balance) => (
            <Card key={balance.leave_type_id} className={formData.leave_type_id === String(balance.leave_type_id) ? 'ring-2 ring-blue-500' : ''}>
              <CardBody className="p-4 text-center">
                <HiOutlineCalendar className={`w-6 h-6 mx-auto mb-2 ${getLeaveColor(balance.leave_type_name)}`} />
                <p className="text-xs text-gray-500">{balance.leave_type_name}</p>
                <p className={`text-2xl font-bold ${getLeaveTextColor(balance.leave_type_name)}`}>
                  {balance.available ?? 0}
                </p>
                <p className="text-xs text-gray-500">Available</p>
              </CardBody>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center text-gray-500 py-4">No leave balances available</div>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader title="Leave Details" />
          <CardBody className="space-y-4">
            <div className="input-wrapper">
              <label className="input-label">Leave Type <span className="text-red-500">*</span></label>
              <select
                name="leave_type_id"
                value={formData.leave_type_id}
                onChange={handleChange}
                className={`input ${errors.leave_type_id ? 'input-error' : ''}`}
                disabled={loadingData}
              >
                <option value="">Select leave type</option>
                {leaveTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name} {type.days_allowed ? `(${type.days_allowed} days/year)` : ''}
                  </option>
                ))}
              </select>
              {errors.leave_type_id && <p className="error-message">{errors.leave_type_id}</p>}
              {selectedBalance && (
                <p className="text-sm text-gray-500 mt-1">
                  Available: <span className="font-medium text-green-600">{selectedBalance.available ?? 0}</span> days
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="input-wrapper">
                <label className="input-label">From Date <span className="text-red-500">*</span></label>
                <input
                  type="date"
                  name="from_date"
                  value={formData.from_date}
                  onChange={handleChange}
                  className={`input ${errors.from_date ? 'input-error' : ''}`}
                />
                {errors.from_date && <p className="error-message">{errors.from_date}</p>}
              </div>
              <div className="input-wrapper">
                <label className="input-label">To Date <span className="text-red-500">*</span></label>
                <input
                  type="date"
                  name="to_date"
                  value={formData.to_date}
                  onChange={handleChange}
                  className={`input ${errors.to_date ? 'input-error' : ''}`}
                  min={formData.from_date || ''}
                />
                {errors.to_date && <p className="error-message">{errors.to_date}</p>}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="is_half_day" checked={formData.is_half_day} onChange={handleChange} className="rounded" />
                <span className="text-sm">Half Day</span>
              </label>
              {formData.is_half_day && (
                <select name="half_day_type" value={formData.half_day_type} onChange={handleChange} className="input w-auto">
                  <option value="first_half">First Half</option>
                  <option value="second_half">Second Half</option>
                </select>
              )}
            </div>

            <div className="bg-blue-50 p-4 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HiOutlineClock className="w-5 h-5 text-blue-500" />
                <span className="text-gray-600">Total Days (excluding weekends)</span>
              </div>
              <span className="text-2xl font-bold text-blue-600">{calculateDays()}</span>
            </div>

            <div className="input-wrapper">
              <label className="input-label">Reason <span className="text-red-500">*</span></label>
              <div className="relative">
                <HiOutlineDocumentText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <textarea
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  placeholder="Please provide the reason for your leave (minimum 5 characters)..."
                  className={`input min-h-[100px] pl-10 ${errors.reason ? 'input-error' : ''}`}
                />
              </div>
              {errors.reason && <p className="error-message">{errors.reason}</p>}
            </div>

            <div className="input-wrapper">
              <label className="input-label">Contact During Leave <span className="text-gray-400">(Optional)</span></label>
              <div className="relative">
                <HiOutlinePhone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="contact_during_leave"
                  value={formData.contact_during_leave}
                  onChange={handleChange}
                  placeholder="Phone number or email for emergencies"
                  className="input pl-10"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="secondary" onClick={() => router.back()} className="flex-1">Cancel</Button>
              <Button type="submit" variant="primary" loading={loading} disabled={loading || loadingData} className="flex-1">
                <HiOutlineCheck className="w-4 h-4" /> Submit Request
              </Button>
            </div>
          </CardBody>
        </Card>
      </form>
    </div>
  );
}
