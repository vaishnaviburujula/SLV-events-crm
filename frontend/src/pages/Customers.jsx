import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import Modal from '../components/Modal';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Mail,
  Phone,
  Briefcase,
  MapPin,
  FileText,
  AlertCircle
} from 'lucide-react';

const Customers = () => {
  const { isAdmin } = useAuth();
  const { showToast } = useToast();

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [isOpen, setIsOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    address: '',
    notes: '',
  });

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/customers', {
        params: { search },
      });
      if (res.data.success) {
        setCustomers(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      showToast('error', 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      company: '',
      address: '',
      notes: '',
    });
  };

  const handleCreateOpen = () => {
    resetForm();
    setIsEdit(false);
    setIsOpen(true);
  };

  const handleEditOpen = (customer) => {
    setSelectedCustomer(customer);
    setFormData({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      company: customer.company || '',
      address: customer.address || '',
      notes: customer.notes || '',
    });
    setIsEdit(true);
    setIsOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEdit) {
        const res = await api.put(`/customers/${selectedCustomer.id || selectedCustomer._id}`, formData);
        if (res.data.success) {
          showToast('success', 'Customer profile updated!');
          setIsOpen(false);
          fetchCustomers();
        }
      } else {
        const res = await api.post('/customers', formData);
        if (res.data.success) {
          showToast('success', 'Customer registered successfully!');
          setIsOpen(false);
          fetchCustomers();
        }
      }
    } catch (error) {
      showToast('error', error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this customer? This will remove all their enquiries and bookings.')) {
      try {
        const res = await api.delete(`/customers/${id}`);
        if (res.data.success) {
          showToast('success', 'Customer deleted successfully');
          fetchCustomers();
        }
      } catch (error) {
        showToast('error', error.response?.data?.message || 'Deletion failed');
      }
    }
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Customer Directory</h2>
          <p className="text-xs text-dark-400 mt-0.5">Manage CRM accounts and contact cards for clients</p>
        </div>
        <button
          onClick={handleCreateOpen}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-brand-500/25"
        >
          <Plus className="w-4 h-4" />
          <span>Add Customer</span>
        </button>
      </div>

      <div className="bg-dark-900 border border-dark-800/80 rounded-2xl p-4 flex gap-4 items-center shadow-lg">
        <div className="relative w-full md:w-80">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-500">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search by name, email, phone, or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#0a0f1d]/60 border border-[#1e293b] rounded-xl pl-11 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-all"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 rounded-2xl shimmer border border-dark-800/20"></div>
          ))}
        </div>
      ) : customers.length === 0 ? (
        <div className="glass-card p-12 text-center text-dark-400 space-y-3">
          <AlertCircle className="w-10 h-10 text-dark-500 mx-auto" />
          <h3 className="font-bold text-white text-base">No Customers Found</h3>
          <p className="text-xs max-w-xs mx-auto">
            Try adjusting your search query or add a new customer record.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {customers.map((cust) => (
            <div key={cust.id || cust._id} className="glass-card flex flex-col justify-between hover:border-dark-700/50 transition-all duration-300 group">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center font-bold text-brand-400 text-sm">
                    {cust.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                  <div>
                    <h3 className="font-bold text-white group-hover:text-brand-400 transition-colors text-sm">
                      {cust.name}
                    </h3>
                    {cust.company && (
                      <p className="text-[10px] text-dark-400 flex items-center gap-1 mt-0.5 font-medium">
                        <Briefcase className="w-3 h-3 text-dark-500" />
                        <span>{cust.company}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2 pt-3 border-t border-dark-850/60 text-xs">
                  <p className="text-dark-300 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-dark-500 shrink-0" />
                    <span className="truncate">{cust.email}</span>
                  </p>
                  <p className="text-dark-300 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-dark-500 shrink-0" />
                    <span>{cust.phone}</span>
                  </p>
                  {cust.address && (
                    <p className="text-dark-300 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-dark-500 shrink-0" />
                      <span className="truncate">{cust.address}</span>
                    </p>
                  )}
                  {cust.notes && (
                    <p className="text-dark-400 flex items-start gap-2 bg-dark-950/40 p-2.5 rounded-xl border border-dark-850">
                      <FileText className="w-4 h-4 text-dark-500 shrink-0 mt-0.5" />
                      <span className="line-clamp-2 text-[11px] leading-relaxed">{cust.notes}</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-5 pt-3 border-t border-dark-850/30">
                <button
                  onClick={() => handleEditOpen(cust)}
                  className="p-2 text-dark-400 hover:text-white hover:bg-dark-800 rounded-xl transition-all border border-transparent hover:border-dark-800"
                  title="Edit Profile"
                >
                  <Edit className="w-4 h-4" />
                </button>
                {isAdmin && (
                  <button
                    onClick={() => handleDelete(cust.id || cust._id)}
                    className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-all border border-transparent hover:border-rose-500/20"
                    title="Delete Customer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={isEdit ? 'Modify Customer Profile' : 'Register New Customer'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-dark-300 uppercase tracking-wider">Customer Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full glass-input"
              placeholder="John Doe"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-dark-300 uppercase tracking-wider">Email Address</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full glass-input"
                placeholder="john@example.com"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-dark-300 uppercase tracking-wider">Phone Number</label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full glass-input"
                placeholder="1234567890"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-dark-300 uppercase tracking-wider">Company / Organization</label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full glass-input"
                placeholder="Acme Corp"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-dark-300 uppercase tracking-wider">Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full glass-input"
                placeholder="123 Main St, New York"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-dark-300 uppercase tracking-wider">Internal Notes</label>
            <textarea
              rows="3"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full glass-input resize-none"
              placeholder="Important notes about the client..."
            />
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-dark-850/60">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-4 py-2.5 bg-dark-850 hover:bg-dark-800 text-dark-300 rounded-xl text-sm font-semibold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-brand-500/25"
            >
              {isEdit ? 'Save Changes' : 'Register Client'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Customers;
