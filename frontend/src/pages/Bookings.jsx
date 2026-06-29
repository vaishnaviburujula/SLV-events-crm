import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import Modal from '../components/Modal';
import {
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Calendar,
  DollarSign,
  User,
  Upload,
  Download,
  CheckCircle,
  FileText,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Car,
  MapPin
} from 'lucide-react';

const Bookings = () => {
  const { user, isAdmin } = useAuth();
  const { showToast } = useToast();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [sortFilter, setSortFilter] = useState('earliest');
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [employees, setEmployees] = useState([]);

  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const [editForm, setEditForm] = useState({
    vehicleName: '',
    pickupDate: '',
    pickupLocation: '',
    returnDate: '',
    returnLocation: '',
    amount: '',
    assignedTo: '',
    status: '',
  });

  const [paymentInput, setPaymentInput] = useState('');
  const [contractFile, setContractFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/bookings', {
        params: {
          search,
          status: statusFilter,
          paymentStatus: paymentFilter,
          page,
          limit: 10,
        },
      });
      if (res.data.success) {
        let data = res.data.data;
        
        // Apply sorting
        if (sortFilter === 'earliest') {
          data.sort((a, b) => new Date(a.pickupDate) - new Date(b.pickupDate));
        } else if (sortFilter === 'latest') {
          data.sort((a, b) => new Date(b.pickupDate) - new Date(a.pickupDate));
        }

        setBookings(data);
        setTotalPages(res.data.pagination.pages);
        setTotalCount(res.data.pagination.total);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      showToast('error', 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, paymentFilter, sortFilter, page]);

  const fetchEmployees = async () => {
    try {
      if (isAdmin) {
        const res = await api.get('/employees');
        if (res.data.success) {
          setEmployees(res.data.data.all);
        }
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  useEffect(() => {
    fetchEmployees();
  }, [isAdmin]);

  const handleDetailsOpen = (booking) => {
    setSelectedBooking(booking);
    setPaymentInput('');
    setContractFile(null);
    setIsDetailsOpen(true);
  };

  const handleEditOpen = (booking) => {
    setSelectedBooking(booking);
    setEditForm({
      vehicleName: booking.vehicleName,
      pickupDate: booking.pickupDate ? new Date(booking.pickupDate).toISOString().split('T')[0] : '',
      pickupLocation: booking.pickupLocation,
      returnDate: booking.returnDate ? new Date(booking.returnDate).toISOString().split('T')[0] : '',
      returnLocation: booking.returnLocation,
      amount: booking.amount,
      assignedTo: booking.assignedTo?.id || booking.assignedTo?._id || '',
      status: booking.status,
    });
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put(`/bookings/${selectedBooking.id || selectedBooking._id}`, editForm);
      if (res.data.success) {
        showToast('success', 'Booking updated successfully!');
        setIsEditOpen(false);
        fetchBookings();
      }
    } catch (error) {
      showToast('error', error.response?.data?.message || 'Failed to update booking');
    }
  };

  const handleAddPayment = async (e) => {
    e.preventDefault();
    const addAmount = Number(paymentInput);
    if (!paymentInput || isNaN(addAmount) || addAmount <= 0) {
      showToast('warning', 'Please enter a valid payment amount');
      return;
    }

    const newPaidAmount = Number(selectedBooking.paidAmount) + addAmount;
    if (newPaidAmount > Number(selectedBooking.amount)) {
      showToast('warning', `Payment exceeds booking total. Remaining due is ₹${Number(selectedBooking.amount) - Number(selectedBooking.paidAmount)}`);
      return;
    }

    try {
      const res = await api.put(`/bookings/${selectedBooking.id || selectedBooking._id}`, {
        paidAmount: newPaidAmount,
      });

      if (res.data.success) {
        showToast('success', `Payment of ₹${addAmount} added!`);
        setSelectedBooking(res.data.data);
        setPaymentInput('');
        fetchBookings();
      }
    } catch (error) {
      showToast('error', 'Failed to record payment');
    }
  };

  const handleContractUpload = async (e) => {
    e.preventDefault();
    if (!contractFile) {
      showToast('warning', 'Please select a file to upload');
      return;
    }

    const formData = new FormData();
    formData.append('contract', contractFile);

    try {
      setIsUploading(true);
      const res = await api.put(`/bookings/${selectedBooking.id || selectedBooking._id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.data.success) {
        showToast('success', 'Contract uploaded successfully!');
        setSelectedBooking(res.data.data);
        setContractFile(null);
        fetchBookings();
      }
    } catch (error) {
      showToast('error', error.response?.data?.message || 'Failed to upload contract');
    } finally {
      setIsUploading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      const res = await api.put(`/bookings/${selectedBooking.id || selectedBooking._id}`, {
        status: newStatus,
      });

      if (res.data.success) {
        showToast('success', `Booking status updated to ${newStatus}`);
        setSelectedBooking(res.data.data);
        fetchBookings();
      }
    } catch (error) {
      showToast('error', 'Failed to update booking status');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this booking? This will also remove the associated calendar event.')) {
      try {
        const res = await api.delete(`/bookings/${id}`);
        if (res.data.success) {
          showToast('success', 'Booking deleted successfully');
          fetchBookings();
        }
      } catch (error) {
        showToast('error', error.response?.data?.message || 'Failed to delete booking');
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

  const formatBookingId = (id) => {
    const num = String(id).padStart(3, '0');
    return `BK${num}`;
  };

  const getPaymentPill = (status) => {
    switch (status) {
      case 'fully_paid':
        return <span className="inline-block bg-[#10b981] text-white font-bold px-3 py-1 rounded-full text-[10px]">Paid</span>;
      case 'partially_paid':
        return <span className="inline-block bg-[#f59e0b] text-white font-bold px-3 py-1 rounded-full text-[10px]">Partial</span>;
      default:
        return <span className="inline-block bg-[#ef4444] text-white font-bold px-3 py-1 rounded-full text-[10px]">Unpaid</span>;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-600 border border-blue-500/20">Completed</span>;
      case 'cancelled':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-600 border border-rose-500/20">Cancelled</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">Confirmed</span>;
    }
  };

  const statuses = ['confirmed', 'completed', 'cancelled'];
  const paymentStatuses = ['unpaid', 'partially_paid', 'fully_paid'];

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-extrabold text-white tracking-tight">Car Rental Bookings</h2>
        <p className="text-xs text-dark-400 mt-0.5">Track active rentals, vehicle details, and payments</p>
      </div>

      {/* Filter Bar */}
      <div className="bg-dark-900 border border-dark-800/80 rounded-2xl p-4 flex flex-col md:flex-row gap-4 justify-between items-center shadow-lg">
        <div className="relative w-full md:w-80">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-500">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search ID, customer, vehicle, location..."
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
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s.replace('_', ' ').toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 bg-dark-950/40 px-3 py-2 rounded-xl border border-dark-800/60 w-full sm:w-auto">
            <DollarSign className="w-3.5 h-3.5 text-dark-400" />
            <select
              value={paymentFilter}
              onChange={(e) => {
                setPaymentFilter(e.target.value);
                setPage(1);
              }}
              className="bg-transparent text-xs text-dark-200 focus:outline-none cursor-pointer"
            >
              <option value="all">-- All Payment Statuses --</option>
              {paymentStatuses.map((ps) => (
                <option key={ps} value={ps}>
                  {ps.replace('_', ' ').toUpperCase()}
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
              <option value="earliest">Pickup Date: Earliest First</option>
              <option value="latest">Pickup Date: Latest First</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 rounded-2xl shimmer border border-dark-800/20"></div>
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <div className="glass-card p-12 text-center text-dark-400 space-y-3">
          <AlertCircle className="w-10 h-10 text-dark-500 mx-auto" />
          <h3 className="font-bold text-white text-base">No Bookings Found</h3>
          <p className="text-xs max-w-xs mx-auto">
            No active rental bookings found matching your search.
          </p>
        </div>
      ) : (
        /* Widescreen Table Layout */
        <div className="bg-dark-900 border border-dark-800/80 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-dark-800/60 bg-dark-950/40 text-[11px] font-bold text-dark-400 uppercase tracking-wider">
                  <th className="py-4 px-6">Booking ID</th>
                  <th className="py-4 px-6">Customer</th>
                  <th className="py-4 px-6">Vehicle</th>
                  <th className="py-4 px-6">Pickup</th>
                  <th className="py-4 px-6">Return</th>
                  <th className="py-4 px-6">Amount</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Payment</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-800/30 text-xs">
                {bookings.map((book) => (
                  <tr key={book.id || book._id} className="hover:bg-dark-850/15 transition-colors group">
                    {/* Booking ID */}
                    <td className="py-4 px-6 font-bold text-dark-200">
                      {formatBookingId(book.id || book._id)}
                    </td>
                    {/* Customer */}
                    <td className="py-4 px-6">
                      <p className="font-bold text-white group-hover:text-brand-450 transition-colors">{book.customer?.name}</p>
                      <p className="text-[10px] text-dark-500 mt-0.5">{book.customer?.phone}</p>
                    </td>
                    {/* Vehicle */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <Car className="w-4 h-4 text-brand-450 shrink-0" />
                        <span className="font-semibold text-dark-100">{book.vehicleName}</span>
                      </div>
                    </td>
                    {/* Pickup */}
                    <td className="py-4 px-6">
                      <p className="font-semibold text-dark-200">
                        {book.pickupDate ? new Date(book.pickupDate).toLocaleDateString('en-US', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        }) : 'TBD'}
                      </p>
                      <p className="text-[10px] text-dark-500 mt-0.5 flex items-center gap-0.5">
                        <MapPin className="w-3 h-3" />
                        <span>{book.pickupLocation}</span>
                      </p>
                    </td>
                    {/* Return */}
                    <td className="py-4 px-6">
                      <p className="font-semibold text-dark-200">
                        {book.returnDate ? new Date(book.returnDate).toLocaleDateString('en-US', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        }) : 'TBD'}
                      </p>
                      <p className="text-[10px] text-dark-500 mt-0.5 flex items-center gap-0.5">
                        <MapPin className="w-3 h-3" />
                        <span>{book.returnLocation}</span>
                      </p>
                    </td>
                    {/* Amount */}
                    <td className="py-4 px-6 text-white font-bold text-sm">
                      {formatCurrency(book.amount)}
                    </td>
                    {/* Status */}
                    <td className="py-4 px-6">
                      {getStatusBadge(book.status)}
                    </td>
                    {/* Payment */}
                    <td className="py-4 px-6">
                      {getPaymentPill(book.paymentStatus)}
                    </td>
                    {/* Actions */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleDetailsOpen(book)}
                          className="p-1.5 text-dark-400 hover:text-white hover:bg-dark-800 rounded-lg transition-all"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditOpen(book)}
                          className="p-1.5 text-dark-400 hover:text-white hover:bg-dark-800 rounded-lg transition-all"
                          title="Edit Booking"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {isAdmin && (
                          <button
                            onClick={() => handleDelete(book.id || book._id)}
                            className="p-1.5 text-rose-450 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
                            title="Delete Booking"
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
            Showing {bookings.length} of {totalCount} bookings
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

      {/* Booking Details Modal */}
      <Modal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        title="Rental Details & Operations"
        size="lg"
      >
        {selectedBooking && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-dark-950/40 border border-dark-850 p-4 rounded-2xl">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-brand-600/10 border border-brand-500/20 text-brand-450 rounded-xl">
                  <Car className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">{selectedBooking.vehicleName}</h4>
                  <p className="text-xs text-dark-400 mt-0.5">Booking ID: {formatBookingId(selectedBooking.id || selectedBooking._id)}</p>
                </div>
              </div>
              <div className="flex flex-col sm:items-end gap-1.5">
                {getStatusBadge(selectedBooking.status)}
                <select
                  value={selectedBooking.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="bg-dark-900 border border-dark-850 text-xs text-dark-200 rounded-lg px-2.5 py-1 focus:outline-none cursor-pointer font-medium"
                >
                  {statuses.map((s) => (
                    <option key={s} value={s}>
                      Set {s.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h5 className="text-xs font-bold text-brand-400 uppercase tracking-wider border-b border-dark-850 pb-1.5">
                  Client Information
                </h5>
                <div className="space-y-2 text-xs">
                  <p className="text-dark-300">
                    Name: <span className="font-semibold text-white">{selectedBooking.customer?.name}</span>
                  </p>
                  <p className="text-dark-300">
                    Email: <span className="font-semibold text-white">{selectedBooking.customer?.email}</span>
                  </p>
                  <p className="text-dark-300">
                    Phone: <span className="font-semibold text-white">{selectedBooking.customer?.phone}</span>
                  </p>
                  <p className="text-dark-300">
                    Company: <span className="font-semibold text-white">{selectedBooking.customer?.company || 'N/A'}</span>
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h5 className="text-xs font-bold text-brand-400 uppercase tracking-wider border-b border-dark-850 pb-1.5">
                  Rental Logistics
                </h5>
                <div className="space-y-2.5 text-xs">
                  <p className="text-dark-300 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-dark-500" />
                    <span>
                      Pickup:{' '}
                      <span className="font-semibold text-white">
                        {new Date(selectedBooking.pickupDate).toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}{' '}
                        at {selectedBooking.pickupLocation}
                      </span>
                    </span>
                  </p>
                  <p className="text-dark-300 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-dark-500" />
                    <span>
                      Return:{' '}
                      <span className="font-semibold text-white">
                        {new Date(selectedBooking.returnDate).toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}{' '}
                        at {selectedBooking.returnLocation}
                      </span>
                    </span>
                  </p>
                  <p className="text-dark-300">
                    Assigned Driver / Staff:{' '}
                    <span className="font-semibold text-white">
                      {selectedBooking.assignedTo?.name || 'Unassigned'}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Payments Section */}
            <div className="border-t border-dark-850 pt-4 space-y-4">
              <h5 className="text-xs font-bold text-brand-400 uppercase tracking-wider">Financial Payments</h5>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-dark-950/30 border border-dark-850 p-4 rounded-2xl text-center">
                  <p className="text-[10px] text-dark-500 uppercase font-bold">Total Rental Cost</p>
                  <p className="text-lg font-bold text-white mt-1">
                    {formatCurrency(selectedBooking.amount)}
                  </p>
                </div>
                <div className="bg-emerald-500/5 border border-emerald-500/10 p-4 rounded-2xl text-center">
                  <p className="text-[10px] text-emerald-500/70 uppercase font-bold">Total Paid</p>
                  <p className="text-lg font-bold text-emerald-400 mt-1">
                    {formatCurrency(selectedBooking.paidAmount)}
                  </p>
                </div>
                <div className="bg-rose-500/5 border border-rose-500/10 p-4 rounded-2xl text-center">
                  <p className="text-[10px] text-rose-500/70 uppercase font-bold">Remaining Due</p>
                  <p className="text-lg font-bold text-rose-400 mt-1">
                    {formatCurrency(Number(selectedBooking.amount) - Number(selectedBooking.paidAmount))}
                  </p>
                </div>
              </div>

              {Number(selectedBooking.paidAmount) < Number(selectedBooking.amount) && (
                <form onSubmit={handleAddPayment} className="flex gap-3 items-end max-w-md">
                  <div className="flex-1 space-y-1.5">
                    <label className="text-[10px] font-semibold text-dark-400 uppercase tracking-wider">
                      Record New Payment (₹)
                    </label>
                    <input
                      type="number"
                      value={paymentInput}
                      onChange={(e) => setPaymentInput(e.target.value)}
                      placeholder="e.g. 5000"
                      className="w-full glass-input py-2 text-xs"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-500/10 h-fit mb-0.5"
                  >
                    Add Payment
                  </button>
                </form>
              )}
            </div>

            {/* Contract Section */}
            <div className="border-t border-dark-850 pt-4 space-y-4">
              <h5 className="text-xs font-bold text-brand-400 uppercase tracking-wider">Rental Agreement / Contract</h5>

              {selectedBooking.contractAttachment ? (
                <div className="flex items-center justify-between p-4 bg-dark-950/40 border border-dark-850 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-brand-500/10 border border-brand-500/20 rounded-xl text-brand-400">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Signed Car Rental Agreement</p>
                      <p className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
                        <CheckCircle className="w-3 h-3" />
                        <span>Agreement verified</span>
                      </p>
                    </div>
                  </div>
                  <a
                    href={`http://localhost:5000${selectedBooking.contractAttachment}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-semibold transition-all shadow-md shadow-brand-500/15"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </a>
                </div>
              ) : (
                <div className="p-4 bg-dark-950/20 border border-dashed border-dark-800 rounded-2xl text-center">
                  <p className="text-xs text-dark-400">No contract/agreement uploaded yet.</p>
                </div>
              )}

              <form onSubmit={handleContractUpload} className="flex flex-col sm:flex-row gap-3 items-end">
                <div className="w-full sm:flex-1 space-y-1.5">
                  <label className="text-[10px] font-semibold text-dark-400 uppercase tracking-wider">
                    Upload Signed Agreement (PDF or Images)
                  </label>
                  <input
                    type="file"
                    required
                    onChange={(e) => setContractFile(e.target.files[0])}
                    className="w-full text-xs text-dark-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-dark-800 file:text-dark-200 hover:file:bg-dark-750 file:transition-all"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="w-full sm:w-auto px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-1.5 h-fit"
                >
                  {isUploading ? (
                    <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <Upload className="w-3.5 h-3.5" />
                  )}
                  <span>Upload Agreement</span>
                </button>
              </form>
            </div>

            <div className="flex justify-end pt-4 border-t border-dark-850/60">
              <button
                onClick={() => setIsDetailsOpen(false)}
                className="px-6 py-2.5 bg-dark-850 hover:bg-dark-800 text-dark-300 rounded-xl text-sm font-semibold transition-all"
              >
                Close Panel
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Booking Modal */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Modify Booking Details">
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-dark-300 uppercase tracking-wider">Vehicle Name / Model</label>
            <input
              type="text"
              required
              value={editForm.vehicleName}
              onChange={(e) => setEditForm({ ...editForm, vehicleName: e.target.value })}
              className="w-full glass-input"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-dark-300 uppercase tracking-wider">Pickup Date</label>
              <input
                type="date"
                required
                value={editForm.pickupDate}
                onChange={(e) => setEditForm({ ...editForm, pickupDate: e.target.value })}
                className="w-full glass-input"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-dark-300 uppercase tracking-wider">Return Date</label>
              <input
                type="date"
                required
                value={editForm.returnDate}
                onChange={(e) => setEditForm({ ...editForm, returnDate: e.target.value })}
                className="w-full glass-input"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-dark-300 uppercase tracking-wider">Pickup Location</label>
              <input
                type="text"
                required
                value={editForm.pickupLocation}
                onChange={(e) => setEditForm({ ...editForm, pickupLocation: e.target.value })}
                className="w-full glass-input"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-dark-300 uppercase tracking-wider">Return Location</label>
              <input
                type="text"
                required
                value={editForm.returnLocation}
                onChange={(e) => setEditForm({ ...editForm, returnLocation: e.target.value })}
                className="w-full glass-input"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-dark-300 uppercase tracking-wider">Total Value (₹)</label>
              <input
                type="number"
                required
                value={editForm.amount}
                onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                className="w-full glass-input"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-dark-300 uppercase tracking-wider">Booking Status</label>
              <select
                value={editForm.status}
                onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                className="w-full glass-input"
              >
                {statuses.map((s) => (
                  <option key={s} value={s}>
                    {s.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {isAdmin && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-dark-300 uppercase tracking-wider">Assign Staff</label>
              <select
                value={editForm.assignedTo}
                onChange={(e) => setEditForm({ ...editForm, assignedTo: e.target.value })}
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
    </div>
  );
};

export default Bookings;
