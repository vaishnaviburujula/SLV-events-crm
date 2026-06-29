import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import Modal from '../components/Modal';
import {
  Plus,
  Edit,
  Trash2,
  Mail,
  Phone,
  ShieldAlert,
  UserCheck,
  UserX,
  AlertCircle
} from 'lucide-react';

const Employees = () => {
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();

  const [employees, setEmployees] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isOpen, setIsOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'employee',
    status: 'active',
    phone: '',
  });

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await api.get('/employees');
      if (res.data.success) {
        setEmployees(res.data.data.employees);
        setAdmins(res.data.data.admins);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      showToast('error', 'Failed to load employee list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'employee',
      status: 'active',
      phone: '',
    });
  };

  const handleCreateOpen = () => {
    resetForm();
    setIsEdit(false);
    setIsOpen(true);
  };

  const handleEditOpen = (emp) => {
    setSelectedEmp(emp);
    setFormData({
      name: emp.name,
      email: emp.email,
      password: '', // Leave blank so we don't update password unless required
      role: emp.role,
      status: emp.status,
      phone: emp.phone || '',
    });
    setIsEdit(true);
    setIsOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEdit) {
        // Prevent editing password in this simple form
        const updatePayload = {
          name: formData.name,
          email: formData.email,
          role: formData.role,
          status: formData.status,
          phone: formData.phone,
        };

        const res = await api.put(`/employees/${selectedEmp.id || selectedEmp._id}`, updatePayload);
        if (res.data.success) {
          showToast('success', 'Employee profile updated!');
          setIsOpen(false);
          fetchEmployees();
        }
      } else {
        const res = await api.post('/employees', formData);
        if (res.data.success) {
          showToast('success', 'Employee account created successfully!');
          setIsOpen(false);
          fetchEmployees();
        }
      }
    } catch (error) {
      showToast('error', error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (Number(id) === Number(currentUser.id || currentUser._id)) {
      showToast('warning', 'You cannot delete your own account');
      return;
    }

    if (window.confirm('Are you sure you want to remove this employee? This will permanently delete their account.')) {
      try {
        const res = await api.delete(`/employees/${id}`);
        if (res.data.success) {
          showToast('success', 'Employee account removed');
          fetchEmployees();
        }
      } catch (error) {
        showToast('error', error.response?.data?.message || 'Failed to remove employee');
      }
    }
  };

  const renderEmpCard = (emp) => {
    const isSelf = Number(emp.id || emp._id) === Number(currentUser.id || currentUser._id);

    return (
      <div
        key={emp.id || emp._id}
        className="glass-card flex flex-col justify-between hover:border-dark-700/50 transition-all duration-300 group relative"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={emp.avatar ? `http://localhost:5000${emp.avatar}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(emp.name)}&background=8b5cf6&color=fff`}
                alt={emp.name}
                className="w-11 h-11 rounded-xl object-cover border border-dark-800"
              />
              <span
                className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-dark-900 ${
                  emp.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'
                }`}
              ></span>
            </div>
            <div>
              <h3 className="font-bold text-white group-hover:text-brand-400 transition-colors text-sm flex items-center gap-1.5">
                <span>{emp.name}</span>
                {isSelf && (
                  <span className="px-1.5 py-0.5 bg-brand-500/10 text-brand-400 text-[8px] font-extrabold uppercase rounded-md tracking-wider">
                    You
                  </span>
                )}
              </h3>
              <p className="text-[10px] text-brand-400 font-bold uppercase tracking-wider mt-0.5">
                {emp.role}
              </p>
            </div>
          </div>

          <div className="space-y-2 pt-3 border-t border-dark-850/60 text-xs">
            <p className="text-dark-300 flex items-center gap-2">
              <Mail className="w-4 h-4 text-dark-500 shrink-0" />
              <span className="truncate">{emp.email}</span>
            </p>
            <p className="text-dark-300 flex items-center gap-2">
              <Phone className="w-4 h-4 text-dark-500 shrink-0" />
              <span>{emp.phone || 'No phone recorded'}</span>
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-5 pt-3 border-t border-dark-850/30">
          <button
            onClick={() => handleEditOpen(emp)}
            className="p-2 text-dark-400 hover:text-white hover:bg-dark-800 rounded-xl transition-all border border-transparent hover:border-dark-800"
            title="Edit Employee"
          >
            <Edit className="w-4 h-4" />
          </button>
          {!isSelf && (
            <button
              onClick={() => handleDelete(emp.id || emp._id)}
              className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-all border border-transparent hover:border-rose-500/20"
              title="Remove Employee"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Employee Directory</h2>
          <p className="text-xs text-dark-400 mt-0.5">Manage user credentials and role-based planner permissions</p>
        </div>
        <button
          onClick={handleCreateOpen}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-brand-500/25"
        >
          <Plus className="w-4 h-4" />
          <span>Add Employee</span>
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-48 rounded-2xl shimmer border border-dark-800/20"></div>
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          <div className="space-y-4">
            <h3 className="text-xs font-extrabold text-dark-400 uppercase tracking-widest flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-brand-500" />
              <span>Administrators ({admins.length})</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {admins.map(renderEmpCard)}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-extrabold text-dark-400 uppercase tracking-widest flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-brand-500" />
              <span>Event Planners ({employees.length})</span>
            </h3>
            {employees.length === 0 ? (
              <div className="glass-card p-8 text-center text-xs text-dark-500 font-semibold">
                No planners registered yet. Click "Add Employee" to create accounts.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {employees.map(renderEmpCard)}
              </div>
            )}
          </div>
        </div>
      )}

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={isEdit ? 'Modify Employee Profile' : 'Register New Employee'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-dark-300 uppercase tracking-wider">Employee Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full glass-input"
              placeholder="Alice Vance"
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
                placeholder="alice@eventcrm.com"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-dark-300 uppercase tracking-wider">Phone Number</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full glass-input"
                placeholder="1234567890"
              />
            </div>
          </div>

          {!isEdit && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-dark-300 uppercase tracking-wider">Default Password</label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full glass-input"
                placeholder="••••••••"
              />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-dark-300 uppercase tracking-wider">Access Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full glass-input"
              >
                <option value="employee">Event Planner (Employee)</option>
                <option value="admin">System Administrator (Admin)</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-dark-300 uppercase tracking-wider">Account Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full glass-input"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive (Deactivated)</option>
              </select>
            </div>
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
              {isEdit ? 'Save Changes' : 'Create Account'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Employees;
