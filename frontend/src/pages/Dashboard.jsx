import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import {
  TrendingUp,
  DollarSign,
  FileText,
  CalendarCheck,
  Percent,
  ArrowUpRight,
  Plus,
  Calendar as CalendarIcon
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const Dashboard = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const [recent, setRecent] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, chartsRes, recentRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/dashboard/charts'),
        api.get('/dashboard/recent'),
      ]);

      if (statsRes.data.success) setStats(statsRes.data.data);
      if (chartsRes.data.success) setCharts(chartsRes.data.data);
      if (recentRes.data.success) setRecent(recentRes.data.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      showToast('error', 'Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const COLORS = ['#8b5cf6', '#a78bfa', '#6366f1', '#4f46e5', '#10b981', '#f43f5e'];

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 rounded-2xl shimmer border border-dark-800/20"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 rounded-2xl shimmer border border-dark-800/20"></div>
          <div className="h-96 rounded-2xl shimmer border border-dark-800/20"></div>
        </div>
      </div>
    );
  }

  const cards = [
    {
      title: 'Total Revenue',
      value: formatCurrency(stats?.totalRevenue || 0),
      subtitle: `Collected: ${formatCurrency(stats?.collectedRevenue || 0)}`,
      icon: DollarSign,
      color: 'from-emerald-500/10 to-teal-500/10 text-emerald-400 border-emerald-500/20',
    },
    {
      title: 'Active Bookings',
      value: stats?.totalBookings || 0,
      subtitle: `${stats?.confirmedBookings || 0} Confirmed`,
      icon: CalendarCheck,
      color: 'from-indigo-500/10 to-blue-500/10 text-indigo-400 border-indigo-500/20',
    },
    {
      title: 'Total Enquiries',
      value: stats?.totalEnquiries || 0,
      subtitle: `${stats?.newEnquiries || 0} New Leads`,
      icon: FileText,
      color: 'from-brand-500/10 to-purple-500/10 text-brand-400 border-brand-500/20',
    },
    {
      title: 'Conversion Rate',
      value: `${stats?.conversionRate || 0}%`,
      subtitle: `Collection: ${stats?.collectionRate || 0}%`,
      icon: Percent,
      color: 'from-amber-500/10 to-orange-500/10 text-amber-400 border-amber-500/20',
    },
  ];

  return (
    <div className="p-6 space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-br from-dark-900 to-dark-950 p-6 rounded-3xl border border-dark-800/60 relative overflow-hidden shadow-xl">
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-brand-500/10 blur-3xl"></div>
        <div>
          <h2 className="text-xl font-bold text-white md:text-2xl">
            Welcome back, {user?.name}!
          </h2>
          <p className="text-dark-400 text-sm mt-1 font-medium">
            Here's what is happening with your car rentals and enquiries today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/enquiries"
            className="flex items-center gap-2 px-4 py-2.5 bg-dark-800 hover:bg-dark-700 text-white rounded-xl text-sm font-semibold border border-dark-700/50 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Lead</span>
          </Link>
          <Link
            to="/calendar"
            className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-brand-500/25"
          >
            <CalendarIcon className="w-4 h-4" />
            <span>View Calendar</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, idx) => (
          <div
            key={idx}
            className={`bg-gradient-to-br border rounded-2xl p-5 flex items-center justify-between shadow-lg shadow-black/5 glass-panel-hover ${card.color}`}
          >
            <div className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-dark-400">
                {card.title}
              </span>
              <h3 className="text-2xl font-bold text-white tracking-tight">{card.value}</h3>
              <p className="text-xs text-dark-400 font-medium">{card.subtitle}</p>
            </div>
            <div className="p-3 bg-dark-900 border border-dark-800 rounded-xl">
              <card.icon className="w-6 h-6" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card flex flex-col justify-between">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-base font-bold text-white">Revenue Analysis</h3>
              <p className="text-xs text-dark-400 mt-0.5">Estimated revenue vs collected payments (last 6 months)</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full font-medium">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Active Growth</span>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={charts?.monthlyRevenue || []}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.3} />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  formatter={(value) => formatCurrency(value)}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#1e293b',
                    borderRadius: '12px',
                    color: '#f8fafc',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="Revenue"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
                <Area
                  type="monotone"
                  dataKey="Collected"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorCollected)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Lead Stages</h3>
            <p className="text-xs text-dark-400 mt-0.5">Distribution of lead stages</p>
          </div>
          <div className="h-64 w-full relative flex items-center justify-center">
            {charts?.enquiryStatus?.some((d) => d.value > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.enquiryStatus.filter((d) => d.value > 0)}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {charts.enquiryStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#1e293b',
                      borderRadius: '12px',
                      color: '#f8fafc',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-dark-500 font-medium">No lead stage data yet.</div>
            )}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 justify-center mt-2">
            {charts?.enquiryStatus?.map((item, idx) => (
              <div key={idx} className="flex items-center gap-1.5 text-xs text-dark-300">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                ></span>
                <span>
                  {item.name}: {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-base font-bold text-white">Recent Enquiries</h3>
              <p className="text-xs text-dark-400 mt-0.5">Recently added car rental leads</p>
            </div>
            <Link
              to="/enquiries"
              className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1 hover:underline transition-all"
            >
              <span>View all</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-dark-800/60 text-[11px] font-semibold text-dark-400 uppercase tracking-wider">
                  <th className="pb-3 font-semibold">Client / Category</th>
                  <th className="pb-3 font-semibold">Pickup Date</th>
                  <th className="pb-3 font-semibold">Cost</th>
                  <th className="pb-3 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-800/30">
                {recent?.recentEnquiries?.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-6 text-center text-xs text-dark-500">
                      No enquiries yet.
                    </td>
                  </tr>
                ) : (
                  recent?.recentEnquiries?.map((enq) => (
                    <tr key={enq.id || enq._id} className="group hover:bg-dark-850/10 transition-colors">
                      <td className="py-3.5 pr-2">
                        <p className="text-xs font-semibold text-white group-hover:text-brand-400 transition-colors">
                          {enq.rentalCategory}
                        </p>
                        <p className="text-[10px] text-dark-500 mt-0.5">{enq.customer?.name}</p>
                      </td>
                      <td className="py-3.5 text-xs text-dark-300 font-medium">
                        {enq.pickupDate ? new Date(enq.pickupDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        }) : 'TBD'}
                      </td>
                      <td className="py-3.5 text-xs text-dark-300 font-medium font-semibold text-emerald-400">
                        {formatCurrency(enq.cost)}
                      </td>
                      <td className="py-3.5 text-right">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                            enq.status === 'new'
                              ? 'bg-blue-500/15 text-blue-400'
                              : enq.status === 'confirmed'
                              ? 'bg-emerald-500/15 text-emerald-400'
                              : enq.status === 'lost'
                              ? 'bg-rose-500/15 text-rose-400'
                              : 'bg-amber-500/15 text-amber-400'
                          }`}
                        >
                          {enq.status.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="glass-card overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-base font-bold text-white">Recent Bookings</h3>
              <p className="text-xs text-dark-400 mt-0.5">Recently confirmed rentals</p>
            </div>
            <Link
              to="/bookings"
              className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1 hover:underline transition-all"
            >
              <span>View all</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-dark-800/60 text-[11px] font-semibold text-dark-400 uppercase tracking-wider">
                  <th className="pb-3 font-semibold">Client / Vehicle</th>
                  <th className="pb-3 font-semibold">Pickup Location</th>
                  <th className="pb-3 font-semibold">Total Cost</th>
                  <th className="pb-3 font-semibold text-right">Payment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-800/30">
                {recent?.recentBookings?.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-6 text-center text-xs text-dark-500">
                      No bookings yet.
                    </td>
                  </tr>
                ) : (
                  recent?.recentBookings?.map((book) => (
                    <tr key={book.id || book._id} className="group hover:bg-dark-850/10 transition-colors">
                      <td className="py-3.5 pr-2">
                        <p className="text-xs font-semibold text-white group-hover:text-brand-400 transition-colors">
                          {book.vehicleName}
                        </p>
                        <p className="text-[10px] text-dark-500 mt-0.5">{book.customer?.name}</p>
                      </td>
                      <td className="py-3.5 text-xs text-dark-300 font-medium truncate max-w-[100px]">
                        {book.pickupLocation}
                      </td>
                      <td className="py-3.5 text-xs text-dark-300 font-medium font-semibold">
                        {formatCurrency(book.amount)}
                      </td>
                      <td className="py-3.5 text-right">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                            book.paymentStatus === 'fully_paid'
                              ? 'bg-emerald-500/15 text-emerald-400'
                              : book.paymentStatus === 'partially_paid'
                              ? 'bg-amber-500/15 text-amber-400'
                              : 'bg-rose-500/15 text-rose-400'
                          }`}
                        >
                          {book.paymentStatus.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
