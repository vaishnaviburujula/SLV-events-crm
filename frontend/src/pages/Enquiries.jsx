import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import Modal from '../components/Modal';
import {
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Calendar,
  User,
  Eye,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  AlertCircle,
  FileText
} from 'lucide-react';

const Enquiries = () => {
  const { user, isAdmin } = useAuth();
  const { showToast } = useToast();

  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortFilter, setSortFilter] = useState('newest');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [employees, setEmployees] = useState([]);
  const [customers, setCustomers] = useState([]);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isConvertOpen, setIsConvertOpen] = useState(false);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);

  const [isNewCustomer, setIsNewCustomer] = useState(true);
  const [formData, setFormData] = useState({
    customerId: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    company: '',
    priority: 'normal',
    rentalCategory: 'Self-Drive',
    pickupDate: '',
    durationDays: '1',
    pickupLocation: '',
    cost: '',
    nextFollowUp: '',
    assignedTo: '',
    notes: '',
  });

  const [convertData, setConvertData] = useState({
    vehicleName: '',
    pickupDate: '',
    pickupLocation: '',
    returnDate: '',
    returnLocation: '',
    amount: '',
    paidAmount: '0',
    assignedTo: '',
  });

  const fetchEnquiries = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/enquiries', {
        params: {
          search,
          status: statusFilter,
          rentalCategory: categoryFilter === 'all' ? undefined : categoryFilter,
          page,
          limit: 10,
        },
      });
      if (res.data.success) {
        let data = res.data.data;
        
        // Apply date range filter locally if selected
        if (startDate) {
          data = data.filter(e => new Date(e.pickupDate) >= new Date(startDate));
        }
        if (endDate) {
          data = data.filter(e => new Date(e.pickupDate) <= new Date(endDate));
        }

        // Apply sorting
        if (sortFilter === 'newest') {
          data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        } else if (sortFilter === 'oldest') {
          data.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        }

        setEnquiries(data);
        setTotalPages(res.data.pagination.pages);
        setTotalCount(res.data.pagination.total);
      }
    } catch (error) {
      console.error('Error fetching enquiries:', error);
      showToast('error', 'Failed to load enquiries');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, categoryFilter, sortFilter, startDate, endDate, page]);

  const fetchHelperData = async () => {
    try {
      const custRes = await api.get('/customers');
      if (custRes.data.success) {
        setCustomers(custRes.data.data);
      }

      if (isAdmin) {
        const empRes = await api.get('/employees');
        if (empRes.data.success) {
          setEmployees(empRes.data.data.all);
        }
      }
    } catch (error) {
      console.error('Error fetching helper data:', error);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, [fetchEnquiries]);

  useEffect(() => {
    fetchHelperData();
  }, [isAdmin]);

  const resetForm = () => {
    setFormData({
      customerId: '',
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      company: '',
      priority: 'normal',
      rentalCategory: 'Self-Drive',
      pickupDate: '',
      durationDays: '1',
      pickupLocation: '',
      cost: '',
      nextFollowUp: '',
      assignedTo: isAdmin ? '' : user?.id || '',
      notes: '',
    });
    setIsNewCustomer(true);
  };

  const handleAddOpen = () => {
    resetForm();
    setIsAddOpen(true);
  };

  const handleEditOpen = (enquiry) => {
    setSelectedEnquiry(enquiry);
    setFormData({
      customerId: enquiry.customer?.id || enquiry.customer?._id || '',
      customerName: enquiry.customer?.name || '',
      customerEmail: enquiry.customer?.email || '',
      customerPhone: enquiry.customer?.phone || '',
      company: enquiry.customer?.company || '',
      priority: enquiry.priority || 'normal',
      rentalCategory: enquiry.rentalCategory,
      pickupDate: enquiry.pickupDate ? new Date(enquiry.pickupDate).toISOString().split('T')[0] : '',
      durationDays: enquiry.durationDays,
      pickupLocation: enquiry.pickupLocation,
      cost: enquiry.cost,
      nextFollowUp: enquiry.nextFollowUp ? new Date(enquiry.nextFollowUp).toISOString().split('T')[0] : '',
      assignedTo: enquiry.assignedTo?.id || enquiry.assignedTo?._id || '',
      notes: enquiry.notes,
      status: enquiry.status,
    });
    setIsNewCustomer(false);
    setIsEditOpen(true);
  };

  const handleConvertOpen = (enquiry) => {
    setSelectedEnquiry(enquiry);
    
    // Auto calculate return date based on duration
    let returnD = '';
    if (enquiry.pickupDate) {
      const pDate = new Date(enquiry.pickupDate);
      pDate.setDate(pDate.getDate() + Number(enquiry.durationDays || 1));
      returnD = pDate.toISOString().split('T')[0];
    }

    setConvertData({
      vehicleName: '',
      pickupDate: enquiry.pickupDate || '',
      pickupLocation: enquiry.pickupLocation || '',
      returnDate: returnD,
      returnLocation: enquiry.pickupLocation || '',
      amount: enquiry.cost || '',
      paidAmount: '0',
      assignedTo: enquiry.assignedTo?.id || enquiry.assignedTo?._id || user?.id || '',
    });
    setIsConvertOpen(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = { ...formData };
      if (!isNewCustomer) {
        submitData.customerName = undefined;
        submitData.customerEmail = undefined;
        submitData.customerPhone = undefined;
        submitData.company = undefined;
      } else {
        submitData.customerId = undefined;
      }

      const res = await api.post('/enquiries', submitData);
      if (res.data.success) {
        showToast('success', 'Lead enquiry created successfully!');
        setIsAddOpen(false);
        fetchEnquiries();
        fetchHelperData();
      }
    } catch (error) {
      showToast('error', error.response?.data?.message || 'Failed to create enquiry');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put(`/enquiries/${selectedEnquiry.id || selectedEnquiry._id}`, formData);
      if (res.data.success) {
        showToast('success', 'Lead enquiry updated successfully!');
        setIsEditOpen(false);
        fetchEnquiries();
      }
    } catch (error) {
      showToast('error', error.response?.data?.message || 'Failed to update enquiry');
    }
  };

  const handleConvertSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/bookings', {
        enquiryId: selectedEnquiry.id || selectedEnquiry._id,
        customerId: selectedEnquiry.customer.id || selectedEnquiry.customer._id,
        vehicleName: convertData.vehicleName,
        pickupDate: convertData.pickupDate,
        pickupLocation: convertData.pickupLocation,
        returnDate: convertData.returnDate,
        returnLocation: convertData.returnLocation,
        amount: Number(convertData.amount),
        paidAmount: Number(convertData.paidAmount),
        assignedTo: convertData.assignedTo,
      });

      if (res.data.success) {
        showToast('success', 'Lead successfully converted to confirmed booking!');
        setIsConvertOpen(false);
        fetchEnquiries();
      }
    } catch (error) {
      showToast('error', error.response?.data?.message || 'Conversion failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this enquiry? This action cannot be undone.')) {
      try {
        const res = await api.delete(`/enquiries/${id}`);
        if (res.data.success) {
          showToast('success', 'Enquiry deleted successfully');
          fetchEnquiries();
        }
      } catch (error) {
        showToast('error', error.response?.data?.message || 'Failed to delete enquiry');
      }
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'urgent':
        return <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase bg-rose-500/10 text-rose-500 border border-rose-500/20">Urgent</span>;
      case 'high':
        return <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase bg-amber-500/10 text-amber-500 border border-amber-500/20">High</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase bg-slate-500/10 text-slate-400 border border-slate-500/20">Normal</span>;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'new':
        return <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-blue-500/15 text-blue-400">New</span>;
      case 'contacted':
        return <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-indigo-500/15 text-indigo-400">Contacted</span>;
      case 'follow_up':
        return <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-purple-500/15 text-purple-400">Follow-up</span>;
      case 'confirmed':
        return <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/15 text-emerald-400">Confirmed</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-rose-500/15 text-rose-400">Lost</span>;
    }
  };

  const statuses = ['all', 'new', 'contacted', 'follow_up', 'confirmed', 'lost'];
  const categories = ['Self-Drive', 'Chauffeur Drive', 'Outstation Tour'];
  const priorities = ['normal', 'high', 'urgent'];

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight">Lead Enquiries</h2>
          <p className="text-xs text-dark-400 mt-0.5">Manage and track car rental customer inquiries</p>
        </div>
        <button
          onClick={handleAddOpen}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-brand-500/25"
        >
          <Plus className="w-4 h-4" />
          <span>New Lead Enquiry</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-dark-900 border border-dark-800/85 rounded-3xl p-6 space-y-4 shadow-xl">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-80">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-500">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Search name, phone, pickup location..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full bg-[#0a0f1d]/60 border border-[#1e293b] rounded-xl pl-11 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-all"
            />
          </div>

          <div className="flex flex-wrap w-full md:w-auto gap-3 items-center justify-end">
            <div className="flex items-center gap-2 bg-dark-950/40 px-3 py-2 rounded-xl border border-dark-800/60 w-full sm:w-auto">
              <Filter className="w-3.5 h-3.5 text-dark-400" />
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="bg-transparent text-xs text-dark-200 focus:outline-none cursor-pointer"
              >
                <option value="all">-- All Statuses --</option>
                {statuses.filter(s => s !== 'all').map((s) => (
                  <option key={s} value={s}>
                    {s.replace('_', ' ').toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 bg-dark-950/40 px-3 py-2 rounded-xl border border-dark-800/60 w-full sm:w-auto">
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setPage(1);
                }}
                className="bg-transparent text-xs text-dark-200 focus:outline-none cursor-pointer"
              >
                <option value="all">-- All Rental Categories --</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 bg-dark-950/40 px-3 py-2 rounded-xl border border-dark-800/60 w-full sm:w-auto">
              <select
                value={sortFilter}
                onChange={(e) => setSortFilter(e.target.value)}
                className="bg-transparent text-xs text-dark-200 focus:outline-none cursor-pointer font-semibold"
              >
                <option value="newest">Sort: Newest Lead First</option>
                <option value="oldest">Sort: Oldest Lead First</option>
              </select>
            </div>
          </div>
        </div>

        {/* Date Range Picker */}
        <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-dark-850/40 text-xs text-dark-400">
          <span className="font-bold uppercase tracking-wider text-[10px]">Pickup Date Filter:</span>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-[#0a0f1d]/50 border border-[#1e293b] rounded-lg px-3 py-1.5 text-slate-100 focus:outline-none focus:border-brand-500"
            />
            <span>to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-[#0a0f1d]/50 border border-[#1e293b] rounded-lg px-3 py-1.5 text-slate-100 focus:outline-none focus:border-brand-500"
            />
            {(startDate || endDate) && (
              <button
                onClick={() => {
                  setStartDate('');
                  setEndDate('');
                }}
                className="text-xs text-rose-400 hover:text-rose-300 font-semibold ml-2"
              >
                Clear Dates
              </button>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 rounded-2xl shimmer border border-dark-800/20"></div>
          ))}
        </div>
      ) : enquiries.length === 0 ? (
        <div className="glass-card p-12 text-center text-dark-400 space-y-3">
          <AlertCircle className="w-10 h-10 text-dark-500 mx-auto" />
          <h3 className="font-bold text-white text-base">No Leads Found</h3>
          <p className="text-xs max-w-xs mx-auto">
            Try adjusting your filters or create a new lead enquiry.
          </p>
        </div>
      ) : (
        /* Widescreen Table Layout */
        <div className="bg-dark-900 border border-dark-800/80 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-dark-800/60 bg-dark-950/40 text-[11px] font-bold text-dark-400 uppercase tracking-wider">
                  <th className="py-4 px-6">Customer Name</th>
                  <th className="py-4 px-6">Priority</th>
                  <th className="py-4 px-6">Rental Details</th>
                  <th className="py-4 px-6">Pickup Location</th>
                  <th className="py-4 px-6">Cost</th>
                  <th className="py-4 px-6">Next Follow-Up</th>
                  <th className="py-4 px-6">Assigned Staff</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-800/30 text-xs">
                {enquiries.map((enq) => (
                  <tr key={enq.id || enq._id} className="hover:bg-dark-850/15 transition-colors group">
                    {/* Customer Name */}
                    <td className="py-4 px-6">
                      <p className="font-bold text-white group-hover:text-brand-450 transition-colors">{enq.customer?.name}</p>
                      <p className="text-[10px] text-dark-500 mt-0.5">{enq.customer?.phone}</p>
                    </td>
                    {/* Priority */}
                    <td className="py-4 px-6">
                      {getPriorityBadge(enq.priority)}
                    </td>
                    {/* Rental Details */}
                    <td className="py-4 px-6">
                      <p className="font-semibold text-dark-100">{enq.rentalCategory}</p>
                      <p className="text-[10px] text-dark-500 mt-0.5">
                        {enq.pickupDate ? new Date(enq.pickupDate).toLocaleDateString('en-US', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        }) : 'TBD'}{' '}
                        • {enq.durationDays} Days
                      </p>
                    </td>
                    {/* Pickup Location */}
                    <td className="py-4 px-6 text-dark-300 font-medium">{enq.pickupLocation}</td>
                    {/* Cost */}
                    <td className="py-4 px-6 text-dark-100 font-bold">
                      {formatCurrency(enq.cost)}
                    </td>
                    {/* Next Follow Up */}
                    <td className="py-4 px-6">
                      {enq.nextFollowUp ? (
                        <span className="text-dark-300 font-medium">
                          {new Date(enq.nextFollowUp).toLocaleDateString('en-US', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      ) : (
                        <span className="text-dark-600 font-semibold">None Scheduled</span>
                      )}
                    </td>
                    {/* Assigned Staff */}
                    <td className="py-4 px-6 text-dark-300 font-medium">
                      {enq.assignedTo?.name || 'Unassigned'}
                    </td>
                    {/* Status */}
                    <td className="py-4 px-6">
                      {getStatusBadge(enq.status)}
                    </td>
                    {/* Actions */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {enq.status !== 'confirmed' && enq.status !== 'lost' && (
                          <button
                            onClick={() => handleConvertOpen(enq)}
                            className="px-2.5 py-1 bg-brand-600/15 hover:bg-brand-600/25 border border-brand-500/30 text-brand-450 rounded-lg text-[10px] font-bold transition-all mr-1"
                          >
                            Convert
                          </button>
                        )}
                        <button
                          onClick={() => handleEditOpen(enq)}
                          className="p-1.5 text-dark-400 hover:text-white hover:bg-dark-800 rounded-lg transition-all"
                          title="Edit Lead"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {isAdmin && (
                          <button
                            onClick={() => handleDelete(enq.id || enq._id)}
                            className="p-1.5 text-rose-450 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
                            title="Delete Lead"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-dark-800/40 pt-4">
          <span className="text-xs text-dark-400 font-medium">
            Showing {enquiries.length} of {totalCount} leads
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 bg-dark-900 border border-dark-800 hover:bg-dark-800 text-dark-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 bg-dark-900 border border-dark-800 hover:bg-dark-800 text-dark-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Add Lead Enquiry Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Create Lead Enquiry" size="lg">
        <form onSubmit={handleAddSubmit} className="space-y-6">
          <div className="bg-dark-950/40 border border-dark-850 p-4 rounded-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-dark-850/60">
              <span className="text-xs font-bold text-brand-400 flex items-center gap-1.5">
                <UserPlus className="w-4 h-4" />
                <span>Customer Information</span>
              </span>
              <button
                type="button"
                onClick={() => setIsNewCustomer(!isNewCustomer)}
                className="text-xs font-semibold text-brand-400 hover:text-brand-300 transition-colors"
              >
                {isNewCustomer ? 'Select Existing Customer' : 'Create New Customer'}
              </button>
            </div>

            {isNewCustomer ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-dark-300 uppercase tracking-wider">Name</label>
                  <input
                    type="text"
                    required
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    className="w-full glass-input"
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-dark-300 uppercase tracking-wider">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.customerEmail}
                    onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                    className="w-full glass-input"
                    placeholder="john@example.com"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-dark-300 uppercase tracking-wider">Phone</label>
                  <input
                    type="text"
                    required
                    value={formData.customerPhone}
                    onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                    className="w-full glass-input"
                    placeholder="1234567890"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-dark-300 uppercase tracking-wider">Select Customer</label>
                <select
                  required
                  value={formData.customerId}
                  onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                  className="w-full glass-input"
                >
                  <option value="">-- Choose a Customer --</option>
                  {customers.map((c) => (
                    <option key={c.id || c._id} value={c.id || c._id}>
                      {c.name} ({c.email})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-dark-300 uppercase tracking-wider">Rental Category</label>
              <select
                value={formData.rentalCategory}
                onChange={(e) => setFormData({ ...formData, rentalCategory: e.target.value })}
                className="w-full glass-input"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-dark-300 uppercase tracking-wider">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full glass-input"
              >
                {priorities.map((p) => (
                  <option key={p} value={p}>
                    {p.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-dark-300 uppercase tracking-wider">Pickup Date</label>
              <input
                type="date"
                required
                value={formData.pickupDate}
                onChange={(e) => setFormData({ ...formData, pickupDate: e.target.value })}
                className="w-full glass-input"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-dark-300 uppercase tracking-wider">Duration (Days)</label>
              <input
                type="number"
                required
                value={formData.durationDays}
                onChange={(e) => setFormData({ ...formData, durationDays: e.target.value })}
                className="w-full glass-input"
                placeholder="3"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-dark-300 uppercase tracking-wider">Pickup Location</label>
              <input
                type="text"
                required
                value={formData.pickupLocation}
                onChange={(e) => setFormData({ ...formData, pickupLocation: e.target.value })}
                className="w-full glass-input"
                placeholder="Indiranagar, Bangalore"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-dark-300 uppercase tracking-wider">Cost (₹)</label>
              <input
                type="number"
                required
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                className="w-full glass-input"
                placeholder="35000"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-dark-300 uppercase tracking-wider">Next Follow-up Date</label>
              <input
                type="date"
                value={formData.nextFollowUp}
                onChange={(e) => setFormData({ ...formData, nextFollowUp: e.target.value })}
                className="w-full glass-input"
              />
            </div>
            {isAdmin && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-dark-300 uppercase tracking-wider">Assign Staff Member</label>
                <select
                  value={formData.assignedTo}
                  onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                  className="w-full glass-input"
                >
                  <option value="">Select Staff</option>
                  {employees.map((emp) => (
                    <option key={emp.id || emp._id} value={emp.id || emp._id}>
                      {emp.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-dark-300 uppercase tracking-wider">Notes / Requirements</label>
            <textarea
              rows="3"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full glass-input resize-none"
              placeholder="Any specific vehicle requests, requirements..."
            />
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-dark-850/60">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="px-4 py-2.5 bg-dark-850 hover:bg-dark-800 text-dark-300 rounded-xl text-sm font-semibold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-brand-500/25"
            >
              Create Lead
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Lead Enquiry Modal */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Modify Lead Details">
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-dark-300 uppercase tracking-wider">Rental Category</label>
              <select
                value={formData.rentalCategory}
                onChange={(e) => setFormData({ ...formData, rentalCategory: e.target.value })}
                className="w-full glass-input"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-dark-300 uppercase tracking-wider">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full glass-input"
              >
                {priorities.map((p) => (
                  <option key={p} value={p}>
                    {p.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-dark-300 uppercase tracking-wider">Pickup Date</label>
              <input
                type="date"
                required
                value={formData.pickupDate}
                onChange={(e) => setFormData({ ...formData, pickupDate: e.target.value })}
                className="w-full glass-input"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-dark-300 uppercase tracking-wider">Duration (Days)</label>
              <input
                type="number"
                required
                value={formData.durationDays}
                onChange={(e) => setFormData({ ...formData, durationDays: e.target.value })}
                className="w-full glass-input"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-dark-300 uppercase tracking-wider">Cost (₹)</label>
              <input
                type="number"
                required
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                className="w-full glass-input"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-dark-300 uppercase tracking-wider">Lead Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full glass-input"
              >
                {statuses.filter((s) => s !== 'all').map((s) => (
                  <option key={s} value={s}>
                    {s.replace('_', ' ').toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-dark-300 uppercase tracking-wider">Pickup Location</label>
              <input
                type="text"
                required
                value={formData.pickupLocation}
                onChange={(e) => setFormData({ ...formData, pickupLocation: e.target.value })}
                className="w-full glass-input"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-dark-300 uppercase tracking-wider">Next Follow-up Date</label>
              <input
                type="date"
                value={formData.nextFollowUp}
                onChange={(e) => setFormData({ ...formData, nextFollowUp: e.target.value })}
                className="w-full glass-input"
              />
            </div>
          </div>

          {isAdmin && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-dark-300 uppercase tracking-wider">Assign Employee</label>
              <select
                value={formData.assignedTo}
                onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                className="w-full glass-input"
              >
                <option value="">Unassigned</option>
                {employees.map((emp) => (
                  <option key={emp.id || emp._id} value={emp.id || emp._id}>
                    {emp.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-dark-300 uppercase tracking-wider">Notes</label>
            <textarea
              rows="3"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full glass-input resize-none"
            />
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-dark-850/60">
            <button
              type="button"
              onClick={() => setIsEditOpen(false)}
              className="px-4 py-2.5 bg-dark-850 hover:bg-dark-800 text-dark-300 rounded-xl text-sm font-semibold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-brand-500/25"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Modal>

      {/* Convert to Booking Modal */}
      <Modal isOpen={isConvertOpen} onClose={() => setIsConvertOpen(false)} title="Confirm & Convert to Booking">
        <form onSubmit={handleConvertSubmit} className="space-y-4">
          <div className="bg-brand-500/5 border border-brand-500/20 p-4 rounded-2xl space-y-2 mb-2">
            <p className="text-xs text-brand-300 font-semibold uppercase tracking-wider">Rental Lead to Confirm</p>
            <h4 className="text-sm font-bold text-white">{selectedEnquiry?.rentalCategory} • {selectedEnquiry?.durationDays} Days</h4>
            <p className="text-xs text-dark-300">
              Customer: <span className="font-semibold text-white">{selectedEnquiry?.customer?.name}</span>
            </p>
            <p className="text-xs text-dark-300">
              Pickup Date: <span className="font-semibold text-white">
                {selectedEnquiry && new Date(selectedEnquiry.pickupDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </p>
            <p className="text-xs text-dark-300">
              Pickup Location: <span className="font-semibold text-white">{selectedEnquiry?.pickupLocation}</span>
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-dark-300 uppercase tracking-wider">Vehicle Name / Model</label>
            <input
              type="text"
              required
              value={convertData.vehicleName}
              onChange={(e) => setConvertData({ ...convertData, vehicleName: e.target.value })}
              className="w-full glass-input"
              placeholder="e.g. Toyota Innova Crysta"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-dark-300 uppercase tracking-wider">Pickup Date</label>
              <input
                type="date"
                required
                value={convertData.pickupDate}
                onChange={(e) => setConvertData({ ...convertData, pickupDate: e.target.value })}
                className="w-full glass-input"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-dark-300 uppercase tracking-wider">Return Date</label>
              <input
                type="date"
                required
                value={convertData.returnDate}
                onChange={(e) => setConvertData({ ...convertData, returnDate: e.target.value })}
                className="w-full glass-input"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-dark-300 uppercase tracking-wider">Pickup Location</label>
              <input
                type="text"
                required
                value={convertData.pickupLocation}
                onChange={(e) => setConvertData({ ...convertData, pickupLocation: e.target.value })}
                className="w-full glass-input"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-dark-300 uppercase tracking-wider">Return Location</label>
              <input
                type="text"
                required
                value={convertData.returnLocation}
                onChange={(e) => setConvertData({ ...convertData, returnLocation: e.target.value })}
                className="w-full glass-input"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-dark-300 uppercase tracking-wider">Total Rental Value (₹)</label>
              <input
                type="number"
                required
                value={convertData.amount}
                onChange={(e) => setConvertData({ ...convertData, amount: e.target.value })}
                className="w-full glass-input"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-dark-300 uppercase tracking-wider">Advance Paid (₹)</label>
              <input
                type="number"
                required
                value={convertData.paidAmount}
                onChange={(e) => setConvertData({ ...convertData, paidAmount: e.target.value })}
                className="w-full glass-input"
              />
            </div>
          </div>

          {isAdmin && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-dark-300 uppercase tracking-wider">Assign Planner</label>
              <select
                value={convertData.assignedTo}
                onChange={(e) => setConvertData({ ...convertData, assignedTo: e.target.value })}
                className="w-full glass-input"
              >
                <option value="">Select Planner</option>
                {employees.map((emp) => (
                  <option key={emp.id || emp._id} value={emp.id || emp._id}>
                    {emp.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex gap-3 justify-end pt-4 border-t border-dark-850/60">
            <button
              type="button"
              onClick={() => setIsConvertOpen(false)}
              className="px-4 py-2.5 bg-dark-850 hover:bg-dark-800 text-dark-300 rounded-xl text-sm font-semibold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-brand-500/25"
            >
              Confirm Booking
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Enquiries;
