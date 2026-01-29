'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardHeader, CardBody } from '@/components/ui';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import api from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { HiOutlineArrowLeft, HiOutlineCheck } from 'react-icons/hi';

export default function EditEmployeePage() {
  const { id } = useParams();
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);

  const [formData, setFormData] = useState({
    // Personal Info (from EmployeeBase)
    date_of_birth: '',
    gender: '',
    blood_group: '',
    marital_status: '',
    nationality: '',
    personal_email: '',
    personal_phone: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    emergency_contact_relation: '',
    // Address
    current_address: '',
    permanent_address: '',
    city: '',
    state: '',
    country: '',
    postal_code: '',
    // Employment (from EmployeeUpdate)
    department_id: '',
    designation_id: '',
    manager_id: '',
    shift_id: '',
    employment_type: 'full_time',
    employment_status: 'active',
    work_mode: 'office',
    // Bank
    bank_name: '',
    bank_account_number: '',
    bank_ifsc_code: '',
    bank_branch: '',
    // Documents
    pan_number: '',
    aadhar_number: '',
    passport_number: '',
    passport_expiry: '',
    // Other
    notes: '',
    is_active: true,
  });

  // User info (display only, can't edit via employee update)
  const [userInfo, setUserInfo] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [empData, deptRes, desigRes] = await Promise.all([
        api.get(`/employees/${id}`),
        api.get('/organizations/departments').catch(() => ({ items: [] })),
        api.get('/organizations/designations').catch(() => ({ items: [] })),
      ]);

      setDepartments(deptRes.items || deptRes || []);
      setDesignations(desigRes.items || desigRes || []);

      // Set user info (display only)
      setUserInfo({
        first_name: empData.user?.first_name || '',
        last_name: empData.user?.last_name || '',
        email: empData.user?.email || '',
        phone: empData.user?.phone || '',
      });

      // Set editable employee fields
      setFormData({
        date_of_birth: empData.date_of_birth || '',
        gender: empData.gender || '',
        blood_group: empData.blood_group || '',
        marital_status: empData.marital_status || '',
        nationality: empData.nationality || '',
        personal_email: empData.personal_email || '',
        personal_phone: empData.personal_phone || '',
        emergency_contact_name: empData.emergency_contact_name || '',
        emergency_contact_phone: empData.emergency_contact_phone || '',
        emergency_contact_relation: empData.emergency_contact_relation || '',
        current_address: empData.current_address || '',
        permanent_address: empData.permanent_address || '',
        city: empData.city || '',
        state: empData.state || '',
        country: empData.country || '',
        postal_code: empData.postal_code || '',
        department_id: empData.department_id || '',
        designation_id: empData.designation_id || '',
        manager_id: empData.manager_id || '',
        shift_id: empData.shift_id || '',
        employment_type: empData.employment_type || 'full_time',
        employment_status: empData.employment_status || 'active',
        work_mode: empData.work_mode || 'office',
        bank_name: empData.bank_name || '',
        bank_account_number: empData.bank_account_number || '',
        bank_ifsc_code: empData.bank_ifsc_code || '',
        bank_branch: empData.bank_branch || '',
        pan_number: empData.pan_number || '',
        aadhar_number: empData.aadhar_number || '',
        passport_number: empData.passport_number || '',
        passport_expiry: empData.passport_expiry || '',
        notes: empData.notes || '',
        is_active: empData.is_active !== false,
      });
    } catch (error) {
      console.error('Error fetching employee:', error);
      toast.error('Failed to load employee data');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSaving(true);
    try {
      // Clean form data - convert empty strings to null for ID fields
      const cleanData = { ...formData };
      const integerFields = ['department_id', 'designation_id', 'manager_id', 'shift_id'];
      integerFields.forEach(key => {
        if (cleanData[key] === '' || cleanData[key] === undefined) {
          cleanData[key] = null;
        } else if (cleanData[key]) {
          cleanData[key] = parseInt(cleanData[key], 10);
        }
      });

      // Remove empty date fields
      if (!cleanData.date_of_birth) delete cleanData.date_of_birth;
      if (!cleanData.passport_expiry) delete cleanData.passport_expiry;

      await api.put(`/employees/${id}`, cleanData);
      toast.success('Employee updated successfully');
      setTimeout(() => router.push(`/employees/${id}`), 1500);
    } catch (error) {
      console.error('Error updating employee:', error);
      if (error.detail && Array.isArray(error.detail)) {
        error.detail.forEach(err => toast.error(`${err.field || err.loc?.join('.')}: ${err.msg || err.message}`));
      } else {
        toast.error(error.message || 'Failed to update employee');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in-up">
      <div className="page-header">
        <div>
          <Link href={`/employees/${id}`} className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
            <HiOutlineArrowLeft className="w-4 h-4" /> Back to Employee
          </Link>
          <div className="flex items-baseline gap-2 mt-2">
            <h1 className="page-title">Edit Employee</h1>
            <span className="text-muted-foreground font-normal text-base">- {userInfo.first_name} {userInfo.last_name}</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <Card>
          <CardHeader title="Personal Information" />
          <CardBody className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Input label="Date of Birth" type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} />

              <div className="input-wrapper">
                <label className="input-label">Gender</label>
                <select name="gender" value={formData.gender} onChange={handleChange} className="input">
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="input-wrapper">
                <label className="input-label">Blood Group</label>
                <select name="blood_group" value={formData.blood_group} onChange={handleChange} className="input">
                  <option value="">Select</option>
                  <option value="A+">A+</option><option value="A-">A-</option>
                  <option value="B+">B+</option><option value="B-">B-</option>
                  <option value="O+">O+</option><option value="O-">O-</option>
                  <option value="AB+">AB+</option><option value="AB-">AB-</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="input-wrapper">
                <label className="input-label">Marital Status</label>
                <select name="marital_status" value={formData.marital_status} onChange={handleChange} className="input">
                  <option value="">Select</option>
                  <option value="single">Single</option>
                  <option value="married">Married</option>
                  <option value="divorced">Divorced</option>
                </select>
              </div>
              <Input label="Nationality" name="nationality" value={formData.nationality} onChange={handleChange} />
              <Input label="Personal Phone" type="tel" name="personal_phone" value={formData.personal_phone} onChange={handleChange} />
            </div>

            <Input label="Personal Email" type="email" name="personal_email" value={formData.personal_email} onChange={handleChange} />
          </CardBody>
        </Card>

        {/* Emergency Contact */}
        <Card>
          <CardHeader title="Emergency Contact" />
          <CardBody className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Input label="Contact Name" name="emergency_contact_name" value={formData.emergency_contact_name} onChange={handleChange} />
            <Input label="Contact Phone" type="tel" name="emergency_contact_phone" value={formData.emergency_contact_phone} onChange={handleChange} />
            <Input label="Relationship" name="emergency_contact_relation" value={formData.emergency_contact_relation} onChange={handleChange} />
          </CardBody>
        </Card>

        {/* Address */}
        <Card>
          <CardHeader title="Address" />
          <CardBody className="space-y-6">
            <div className="input-wrapper">
              <label className="input-label">Current Address</label>
              <textarea name="current_address" value={formData.current_address} onChange={handleChange} className="input min-h-[80px]" />
            </div>
            <div className="input-wrapper">
              <label className="input-label">Permanent Address</label>
              <textarea name="permanent_address" value={formData.permanent_address} onChange={handleChange} className="input min-h-[80px]" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <Input label="City" name="city" value={formData.city} onChange={handleChange} />
              <Input label="State" name="state" value={formData.state} onChange={handleChange} />
              <Input label="Country" name="country" value={formData.country} onChange={handleChange} />
              <Input label="Postal Code" name="postal_code" value={formData.postal_code} onChange={handleChange} />
            </div>
          </CardBody>
        </Card>

        {/* Employment Details */}
        <Card>
          <CardHeader title="Employment Details" />
          <CardBody className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="input-wrapper">
                <label className="input-label">Department</label>
                <select name="department_id" value={formData.department_id} onChange={handleChange} className="input">
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
              </div>
              <div className="input-wrapper">
                <label className="input-label">Designation</label>
                <select name="designation_id" value={formData.designation_id} onChange={handleChange} className="input">
                  <option value="">Select Designation</option>
                  {designations.map(desig => (
                    <option key={desig.id} value={desig.id}>{desig.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="input-wrapper">
                <label className="input-label">Employment Type</label>
                <select name="employment_type" value={formData.employment_type} onChange={handleChange} className="input">
                  <option value="full_time">Full Time</option>
                  <option value="part_time">Part Time</option>
                  <option value="contract">Contract</option>
                  <option value="intern">Intern</option>
                  <option value="freelance">Freelance</option>
                </select>
              </div>
              <div className="input-wrapper">
                <label className="input-label">Employment Status</label>
                <select name="employment_status" value={formData.employment_status} onChange={handleChange} className="input">
                  <option value="active">Active</option>
                  <option value="probation">Probation</option>
                  <option value="on_leave">On Leave</option>
                  <option value="notice_period">Notice Period</option>
                  <option value="terminated">Terminated</option>
                  <option value="resigned">Resigned</option>
                </select>
              </div>
              <div className="input-wrapper">
                <label className="input-label">Work Mode</label>
                <select name="work_mode" value={formData.work_mode} onChange={handleChange} className="input">
                  <option value="office">Office</option>
                  <option value="wfh">Work from Home</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="remote">Remote</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2 p-4 bg-muted/20 rounded-xl border border-border/50">
              <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleChange} className="w-4 h-4 text-primary focus:ring-primary/20 rounded border-gray-400" />
              <label className="text-sm font-medium">Employee is Active</label>
            </div>
          </CardBody>
        </Card>

        {/* Bank Information */}
        <Card>
          <CardHeader title="Bank Information" />
          <CardBody className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Input label="Bank Name" name="bank_name" value={formData.bank_name} onChange={handleChange} />
            <Input label="Account Number" name="bank_account_number" value={formData.bank_account_number} onChange={handleChange} />
            <Input label="IFSC Code" name="bank_ifsc_code" value={formData.bank_ifsc_code} onChange={handleChange} />
            <Input label="Branch" name="bank_branch" value={formData.bank_branch} onChange={handleChange} />
          </CardBody>
        </Card>

        {/* Documents */}
        <Card>
          <CardHeader title="Identity Documents" />
          <CardBody className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Input label="PAN Number" name="pan_number" value={formData.pan_number} onChange={handleChange} placeholder="ABCDE1234F" />
            <Input label="Aadhar Number" name="aadhar_number" value={formData.aadhar_number} onChange={handleChange} placeholder="1234 5678 9012" />
            <Input label="Passport Number" name="passport_number" value={formData.passport_number} onChange={handleChange} />
            <Input label="Passport Expiry" type="date" name="passport_expiry" value={formData.passport_expiry} onChange={handleChange} />
          </CardBody>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader title="Additional Notes" />
          <CardBody>
            <textarea name="notes" value={formData.notes} onChange={handleChange} className="input min-h-[100px]" placeholder="Any additional notes about the employee..." />
          </CardBody>
        </Card>

        <div className="flex gap-4 pt-6 border-t border-border/50 sticky bottom-0 bg-background/95 backdrop-blur-sm z-10 pb-4">
          <Button type="button" variant="secondary" onClick={() => router.back()} className="flex-1">Cancel</Button>
          <Button type="submit" variant="primary" loading={saving} className="flex-1 shadow-lg shadow-primary/20">
            <HiOutlineCheck className="w-5 h-5" /> Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
