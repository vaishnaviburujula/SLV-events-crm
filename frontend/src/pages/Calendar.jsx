import React, { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import Modal from '../components/Modal';
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Users,
  Mail,
  Phone,
  DollarSign,
  CalendarCheck,
  Sparkles
} from 'lucide-react';

const Calendar = () => {
  const { showToast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();

      const start = new Date(year, month - 1, 1).toISOString();
      const end = new Date(year, month + 2, 0).toISOString();

      const res = await api.get('/events', {
        params: { start, end },
      });

      if (res.data.success) {
        setEvents(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      showToast('error', 'Failed to load calendar events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [currentDate]);

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    return { firstDayIndex, totalDays };
  };

  const { firstDayIndex, totalDays } = getDaysInMonth(currentDate);

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleDayClick = (eventList) => {
    if (eventList.length === 1) {
      handleEventClick(eventList[0]);
    }
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setIsDetailsOpen(true);
  };

  const getDayEvents = (day) => {
    return events.filter((e) => {
      const eventDate = new Date(e.start);
      return (
        eventDate.getDate() === day &&
        eventDate.getMonth() === currentDate.getMonth() &&
        eventDate.getFullYear() === currentDate.getFullYear()
      );
    });
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Grid cells calculation
  const calendarCells = [];
  const prevMonthDays = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).getDate();

  // Add padding from previous month
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    calendarCells.push({
      day: prevMonthDays - i,
      isCurrentMonth: false,
    });
  }

  // Add current month days
  for (let i = 1; i <= totalDays; i++) {
    calendarCells.push({
      day: i,
      isCurrentMonth: true,
      events: getDayEvents(i),
    });
  }

  // Add padding from next month
  const totalCells = 42; // 6 rows of 7 days
  const remainingCells = totalCells - calendarCells.length;
  for (let i = 1; i <= remainingCells; i++) {
    calendarCells.push({
      day: i,
      isCurrentMonth: false,
    });
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-dark-900 border border-dark-800/60 p-4 rounded-2xl shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-brand-500/10 border border-brand-500/20 text-brand-400 rounded-xl">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white leading-tight">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <p className="text-[10px] text-dark-500 font-semibold uppercase tracking-wider mt-0.5">
              Event Logistics Coordinator
            </p>
          </div>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={prevMonth}
            className="flex-1 sm:flex-initial p-2 bg-dark-800 border border-dark-700/50 hover:bg-dark-700 text-dark-200 rounded-xl transition-all flex items-center justify-center"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-4 py-2 bg-dark-800 border border-dark-700/50 hover:bg-dark-700 text-xs font-bold text-white rounded-xl transition-all"
          >
            Today
          </button>
          <button
            onClick={nextMonth}
            className="flex-1 sm:flex-initial p-2 bg-dark-800 border border-dark-700/50 hover:bg-dark-700 text-dark-200 rounded-xl transition-all flex items-center justify-center"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="glass-card p-4 overflow-hidden">
        <div className="grid grid-cols-7 gap-1 border-b border-dark-800/40 pb-2 text-center">
          {weekdays.map((day) => (
            <div key={day} className="text-xs font-bold text-dark-400 py-1 uppercase tracking-wider">
              {day}
            </div>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-7 gap-1 mt-1 h-[600px]">
            {[...Array(42)].map((_, i) => (
              <div key={i} className="shimmer rounded-xl border border-dark-850/30"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-1.5 mt-2">
            {calendarCells.map((cell, index) => {
              const isToday =
                cell.day === new Date().getDate() &&
                currentDate.getMonth() === new Date().getMonth() &&
                currentDate.getFullYear() === new Date().getFullYear() &&
                cell.isCurrentMonth;

              return (
                <div
                  key={index}
                  onClick={() => cell.events && handleDayClick(cell.events)}
                  className={`calendar-day-cell rounded-xl border p-2 flex flex-col gap-1 transition-all group ${
                    cell.isCurrentMonth
                      ? 'bg-dark-950/25 border-dark-850 hover:border-dark-700/50 hover:bg-dark-900/10 cursor-pointer'
                      : 'bg-dark-950/10 border-transparent text-dark-600 cursor-not-allowed'
                  } ${isToday ? 'border-brand-500/55 bg-brand-500/5' : ''}`}
                >
                  <span
                    className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                      isToday
                        ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
                        : cell.isCurrentMonth
                        ? 'text-dark-300'
                        : 'text-dark-600'
                    }`}
                  >
                    {cell.day}
                  </span>

                  <div className="flex-1 overflow-y-auto space-y-1 mt-1 scrollbar-none">
                    {cell.events?.map((ev) => (
                      <div
                        key={ev.id || ev._id}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEventClick(ev);
                        }}
                        style={{ backgroundColor: `${ev.color}15`, borderColor: `${ev.color}30`, color: ev.color }}
                        className="px-2 py-1 rounded-lg border text-[9px] font-bold truncate transition-all hover:brightness-110 cursor-pointer flex items-center gap-1"
                      >
                        <span className="w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: ev.color }}></span>
                        <span className="truncate">{ev.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Modal isOpen={isDetailsOpen} onClose={() => setIsDetailsOpen(false)} title="Event Details">
        {selectedEvent && (
          <div className="space-y-6">
            <div className="flex items-start gap-3.5 bg-dark-950/40 border border-dark-850 p-4 rounded-2xl">
              <div className="p-3 bg-brand-500/10 border border-brand-500/20 rounded-xl text-brand-400">
                <CalendarCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">{selectedEvent.title}</h4>
                <p className="text-xs text-dark-400 mt-1">
                  Scheduled:{' '}
                  <span className="font-semibold text-dark-200">
                    {new Date(selectedEvent.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}{' '}
                    -{' '}
                    {new Date(selectedEvent.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs border-y border-dark-850/60 py-5">
              <div className="space-y-3">
                <h5 className="text-[10px] font-bold text-brand-400 uppercase tracking-wider">Venue Details</h5>
                <p className="text-dark-300 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-dark-500 shrink-0" />
                  <span className="font-semibold text-white">{selectedEvent.booking?.venue}</span>
                </p>
                <p className="text-dark-300 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-dark-500 shrink-0" />
                  <span>
                    Guest Count: <span className="font-semibold text-white">{selectedEvent.booking?.guestCount}</span>
                  </span>
                </p>
              </div>

              <div className="space-y-3">
                <h5 className="text-[10px] font-bold text-brand-400 uppercase tracking-wider">Client Contact</h5>
                <p className="text-dark-200 font-bold">{selectedEvent.booking?.customer?.name}</p>
                <p className="text-dark-400 flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-dark-500 shrink-0" />
                  <span>{selectedEvent.booking?.customer?.email}</span>
                </p>
                <p className="text-dark-400 flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-dark-500 shrink-0" />
                  <span>{selectedEvent.booking?.customer?.phone}</span>
                </p>
              </div>
            </div>

            <div className="flex justify-between items-center bg-emerald-500/5 border border-emerald-500/10 p-4 rounded-2xl">
              <div className="flex items-center gap-1 text-emerald-400 text-xs font-bold">
                <DollarSign className="w-4 h-4" />
                <span>Total Booking Value</span>
              </div>
              <span className="text-sm font-extrabold text-white">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(selectedEvent.booking?.totalAmount || 0)}
              </span>
            </div>

            <div className="flex justify-end pt-4 border-t border-dark-850/40">
              <button
                onClick={() => setIsDetailsOpen(false)}
                className="px-6 py-2.5 bg-dark-850 hover:bg-dark-800 text-dark-300 rounded-xl text-sm font-semibold transition-all"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Calendar;
