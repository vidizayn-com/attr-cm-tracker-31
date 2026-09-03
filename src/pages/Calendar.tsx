import React, { useState, useEffect, useMemo } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, User, AlertCircle, FileText, Loader2 } from 'lucide-react';
import { strapiGet } from '@/lib/strapiClient';
import { useNavigate } from 'react-router-dom';

interface CalendarEvent {
  id: string;
  patientId: string;
  patientName: string;
  date: string; // YYYY-MM-DD
  title: string;
  type: 'deadline' | 'appointment' | 'visit';
}

const Calendar = () => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [eventTypeFilter, setEventTypeFilter] = useState<'all' | 'deadline' | 'appointment'>('all');

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await strapiGet<any>('/api/auth/doctor/my-patients');
        const primary = res.primaryPatients || [];
        const consulting = res.consultingPatients || [];
        const combined = [...primary, ...consulting];

        const list: CalendarEvent[] = [];
        const map = new Map<number, boolean>();

        combined.forEach((p: any) => {
          if (map.has(p.id)) return;
          map.set(p.id, true);

          const name = `${p.first_name || p.firstName || ''} ${p.last_name || p.lastName || ''}`.trim() || `Patient #${p.id}`;
          const docId = p.document_id || p.documentId || String(p.id);

          if (p.report_deadline || p.reportDeadline) {
            const dateStr = (p.report_deadline || p.reportDeadline).split('T')[0];
            list.push({
              id: `deadline-${p.id}`,
              patientId: docId,
              patientName: name,
              date: dateStr,
              title: 'Medication Report Renewal Deadline',
              type: 'deadline',
            });
          }

          if (p.next_appointment || p.nextAppointment) {
            const dateStr = (p.next_appointment || p.nextAppointment).split('T')[0];
            list.push({
              id: `app-${p.id}`,
              patientId: docId,
              patientName: name,
              date: dateStr,
              title: 'Follow-up Consultation Appointment',
              type: 'appointment',
            });
          }

          if (p.last_visit || p.lastVisit) {
            const dateStr = (p.last_visit || p.lastVisit).split('T')[0];
            list.push({
              id: `visit-${p.id}`,
              patientId: docId,
              patientName: name,
              date: dateStr,
              title: 'Previous Clinical Visit',
              type: 'visit',
            });
          }
        });

        setEvents(list);
      } catch (err) {
        console.error("Failed to load calendar events", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const calendarDays = useMemo(() => {
    const days: Array<{ dayNumber: number | null; dateStr: string | null }> = [];
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push({ dayNumber: null, dateStr: null });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const mm = String(month + 1).padStart(2, '0');
      const dd = String(d).padStart(2, '0');
      days.push({ dayNumber: d, dateStr: `${year}-${mm}-${dd}` });
    }
    return days;
  }, [year, month, firstDayOfWeek, daysInMonth]);

  const filteredEvents = useMemo(() => {
    return events.filter(e => {
      if (eventTypeFilter !== 'all' && e.type !== eventTypeFilter) return false;
      return true;
    });
  }, [events, eventTypeFilter]);

  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    filteredEvents.forEach(e => {
      const existing = map.get(e.date) || [];
      map.set(e.date, [...existing, e]);
    });
    return map;
  }, [filteredEvents]);

  const upcomingEvents = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    return filteredEvents
      .filter(e => e.date >= todayStr)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 8);
  }, [filteredEvents]);

  return (
    <Layout>
      <div className="container mx-auto p-4 sm:p-6" style={{ zIndex: 10, position: 'relative' }}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: '#056a75' }}>Medical Calendar</h1>
            <p className="text-slate-500 mt-1">Track patient appointments and medication report deadlines.</p>
          </div>

          <div className="flex gap-2">
            <Button
              variant={eventTypeFilter === 'all' ? 'default' : 'outline'}
              onClick={() => setEventTypeFilter('all')}
              className={`rounded-xl text-xs ${eventTypeFilter === 'all' ? 'bg-[#089bab] text-white' : ''}`}
            >
              All Events
            </Button>
            <Button
              variant={eventTypeFilter === 'deadline' ? 'default' : 'outline'}
              onClick={() => setEventTypeFilter('deadline')}
              className={`rounded-xl text-xs ${eventTypeFilter === 'deadline' ? 'bg-red-600 text-white' : ''}`}
            >
              Report Deadlines
            </Button>
            <Button
              variant={eventTypeFilter === 'appointment' ? 'default' : 'outline'}
              onClick={() => setEventTypeFilter('appointment')}
              className={`rounded-xl text-xs ${eventTypeFilter === 'appointment' ? 'bg-blue-600 text-white' : ''}`}
            >
              Appointments
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Month Calendar */}
          <div className="lg:col-span-2">
            <Card className="glass-card shadow-lg border-none rounded-3xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-slate-800 to-slate-900 text-white p-4 sm:p-6 flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                  <CalendarIcon className="w-6 h-6 text-cyan-400" />
                  <CardTitle className="text-xl font-bold">{monthName} {year}</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={prevMonth} className="text-white hover:bg-white/10 rounded-full">
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={nextMonth} className="text-white hover:bg-white/10 rounded-full">
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 bg-white/95">
                {loading ? (
                  <div className="flex justify-center items-center py-24">
                    <Loader2 className="w-8 h-8 animate-spin text-[#089bab]" />
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-7 gap-1 text-center font-semibold text-xs text-slate-500 mb-3">
                      <div>Sun</div>
                      <div>Mon</div>
                      <div>Tue</div>
                      <div>Wed</div>
                      <div>Thu</div>
                      <div>Fri</div>
                      <div>Sat</div>
                    </div>

                    <div className="grid grid-cols-7 gap-1 sm:gap-2">
                      {calendarDays.map((cell, idx) => {
                        if (!cell.dayNumber) {
                          return <div key={`empty-${idx}`} className="h-20 sm:h-24 bg-slate-50/50 rounded-xl" />;
                        }

                        const dayEvents = eventsByDate.get(cell.dateStr!) || [];
                        const isToday = cell.dateStr === new Date().toISOString().split('T')[0];

                        return (
                          <div
                            key={cell.dateStr}
                            className={`h-20 sm:h-24 p-1 sm:p-2 rounded-xl border transition-all flex flex-col justify-between ${
                              isToday ? 'bg-cyan-50/80 border-[#089bab]' : 'bg-white border-slate-100 hover:border-slate-300'
                            }`}
                          >
                            <div className="flex justify-between items-center">
                              <span className={`text-xs font-bold ${isToday ? 'text-[#089bab]' : 'text-slate-700'}`}>
                                {cell.dayNumber}
                              </span>
                              {dayEvents.length > 0 && (
                                <Badge className="bg-slate-200 text-slate-700 text-[9px] px-1 py-0 rounded-full">
                                  {dayEvents.length}
                                </Badge>
                              )}
                            </div>

                            <div className="space-y-1 overflow-y-auto max-h-14">
                              {dayEvents.slice(0, 2).map((ev) => (
                                <div
                                  key={ev.id}
                                  onClick={() => navigate(`/patients/${ev.patientId}`)}
                                  className={`text-[9px] sm:text-[10px] p-1 rounded font-semibold cursor-pointer truncate ${
                                    ev.type === 'deadline'
                                      ? 'bg-red-100 text-red-800 hover:bg-red-200'
                                      : ev.type === 'appointment'
                                      ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                                      : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                  }`}
                                  title={`${ev.patientName} - ${ev.title}`}
                                >
                                  {ev.patientName}
                                </div>
                              ))}
                              {dayEvents.length > 2 && (
                                <span className="text-[8px] text-slate-400 block text-center">
                                  +{dayEvents.length - 2} more
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Schedule Side Panel */}
          <div>
            <Card className="glass-card shadow-lg border-none rounded-3xl overflow-hidden">
              <CardHeader className="bg-white border-b border-slate-100 p-4">
                <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#089bab]" />
                  Upcoming Events
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                {upcomingEvents.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-6">No upcoming events scheduled.</p>
                ) : (
                  upcomingEvents.map((ev) => (
                    <div
                      key={ev.id}
                      onClick={() => navigate(`/patients/${ev.patientId}`)}
                      className="p-3 rounded-2xl bg-white border border-slate-100 hover:shadow-md transition-all cursor-pointer flex flex-col gap-1"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-cyan-600" />
                          {ev.patientName}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                          {ev.date}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 font-medium flex items-center gap-1">
                        {ev.type === 'deadline' ? (
                          <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                        ) : (
                          <FileText className="w-3.5 h-3.5 text-blue-500" />
                        )}
                        {ev.title}
                      </p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Calendar;
