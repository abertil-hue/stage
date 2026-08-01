import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../config/supabaseClient';
import logo from '../logo/logo.svg';
import Navbar from './Navbar';
import { 
  Plus, 
  Search, 
  X, 
  Calendar, 
  MapPin, 
  User, 
  BookOpen, 
  Globe,
  Users,
  Eye,
  AlertCircle,
  Trash2,
  AlertTriangle,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

const ALGERIAN_ARABIC_MONTHS = [
  'جانفي', 'فيفري', 'مارس', 'أفريل', 'ماي', 'جوان',
  'جويلية', 'أوت', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
];

export default function Dashboard() {
  const { t, i18n } = useTranslation();
  const [formations, setFormations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'upcoming' | 'ended'
  const [dateFilter, setDateFilter] = useState(''); // 'YYYY-MM-DD'

  // Create Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [trainerName, setTrainerName] = useState('');
  const [location, setLocation] = useState('');
  const [creating, setCreating] = useState(false);
  const [modalError, setModalError] = useState('');

  // Delete Confirmation Modal State
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    fetchFormations();
  }, []);
  useEffect(() => {
    document.title = `${t("Dashboard")} | Algérie Télécom`;
  }, [i18n.language, t]);

  const fetchFormations = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const { data, error } = await supabase
        .from('formations')
        .select('*, presences(id)')
        .order('id', { ascending: false });

      if (error) {
        console.error('Error fetching formations:', error);
        setFetchError(error.message);
      } else {
        setFormations(data || []);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setFetchError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Status calculator with +2 Hours workshop duration buffer
  const isWorkshopEnded = (dateStr, timeStr) => {
    if (!dateStr) return false;

    try {
      let year, month, day;

      if (dateStr.includes('-')) {
        const parts = dateStr.slice(0, 10).split('-');
        if (parts[0].length === 4) {
          [year, month, day] = parts.map(Number);
        } else {
          [day, month, year] = parts.map(Number);
        }
      } else if (dateStr.includes('/')) {
        const parts = dateStr.slice(0, 10).split('/');
        if (parts[0].length === 4) {
          [year, month, day] = parts.map(Number);
        } else {
          [day, month, year] = parts.map(Number);
        }
      } else {
        const parsedDate = new Date(dateStr);
        if (isNaN(parsedDate.getTime())) return false;
        year = parsedDate.getFullYear();
        month = parsedDate.getMonth() + 1;
        day = parsedDate.getDate();
      }

      let hours = 23;
      let minutes = 59;
      let seconds = 59;

      if (timeStr) {
        const timeMatch = timeStr.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?/);
        if (timeMatch) {
          hours = parseInt(timeMatch[1], 10);
          minutes = parseInt(timeMatch[2], 10);
          seconds = timeMatch[3] ? parseInt(timeMatch[3], 10) : 0;
        }
      }

      const workshopStart = new Date(year, month - 1, day, hours, minutes, seconds);

      if (isNaN(workshopStart.getTime())) return false;

      // Add 2 hours buffer
      const workshopEndTime = new Date(workshopStart.getTime() + (2 * 60 * 60 * 1000));

      return workshopEndTime < new Date();
    } catch (err) {
      console.error('Error calculating workshop status:', err);
      return false;
    }
  };

  // Summary Metrics
  const totalCount = formations.length;
  const endedCount = formations.filter((f) => isWorkshopEnded(f.date, f.time)).length;
  const upcomingCount = totalCount - endedCount;

  // Execute Deletion
  const confirmDeleteFormation = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError('');

    try {
      await supabase.from('presences').delete().eq('formation_id', deleteTarget.id);

      const { error } = await supabase
        .from('formations')
        .delete()
        .eq('id', deleteTarget.id);

      if (error) {
        setDeleteError(error.message);
      } else {
        setFormations((prev) => prev.filter((item) => item.id !== deleteTarget.id));
        setDeleteTarget(null);
      }
    } catch (err) {
      setDeleteError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const handleCreateFormation = async (e) => {
    e.preventDefault();
    setModalError('');

    if (date) {
      const selectedYear = new Date(date).getFullYear();
      if (isNaN(selectedYear) || selectedYear < 2024 || selectedYear > 2035) {
        setModalError(t('Please select a valid date between 2024 and 2035.'));
        return;
      }
    }

    if (time) {
      const [hours] = time.split(':').map(Number);
      if (hours < 7 || hours >= 19) {
        setModalError(t('Workshop hours must be scheduled between 07:00 AM and 07:00 PM.'));
        return;
      }
    }

    setCreating(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase.from('formations').insert([
        {
          title,
          date,
          time,
          trainer_name: trainerName,
          location,
          trainer_id: user?.id || null,
        },
      ]);

      if (!error) {
        setTitle('');
        setDate('');
        setTime('');
        setTrainerName('');
        setLocation('');
        setModalError('');
        setShowCreateModal(false);
        fetchFormations();
      } else {
        setModalError(t('Error creating workshop') + ': ' + error.message);
      }
    } catch (err) {
      setModalError(t('Error creating workshop') + ': ' + err.message);
    } finally {
      setCreating(false);
    }
  };

  const formatDateDisplay = (dateString) => {
    if (!dateString) return t('Date TBD');
    const parsed = new Date(dateString);
    if (isNaN(parsed.getTime())) return t('Date TBD');

    const lang = i18n.language || 'fr';

    if (lang.startsWith('ar')) {
      const dayNum = parsed.getDate();
      const monthName = ALGERIAN_ARABIC_MONTHS[parsed.getMonth()];
      const yearNum = parsed.getFullYear();
      return `${dayNum} ${monthName} ${yearNum}`;
    }

    return parsed.toLocaleDateString(lang, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Combined Filtering Logic
  const filteredFormations = formations.filter((f) => {
    // 1. Search Query Match
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !term ||
      f.title?.toLowerCase().includes(term) ||
      f.trainer_name?.toLowerCase().includes(term);

    // 2. Status Filter Match
    const hasEnded = isWorkshopEnded(f.date, f.time);
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'ended' && hasEnded) ||
      (statusFilter === 'upcoming' && !hasEnded);

    // 3. Date Filter Match
    let matchesDate = true;
    if (dateFilter) {
      if (!f.date) {
        matchesDate = false;
      } else {
        const rawDate = f.date.slice(0, 10);
        matchesDate = rawDate === dateFilter;
      }
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  const isAnyFilterActive = searchTerm !== '' || statusFilter !== 'all' || dateFilter !== '';

  const clearAllFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setDateFilter('');
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-16">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* HERO BANNER WITH STATS */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left rtl:sm:text-right">
            <img 
              src={logo} 
              alt="Algérie Télécom Logo" 
              className="h-16 sm:h-20 w-auto object-contain shrink-0"
            />
            <div className="space-y-1">
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
                {t("Formation & Workshop Management")}
              </h1>
              <p className="text-slate-500 text-xs sm:text-sm leading-relaxed max-w-xl">
                {t("Manage all official corporate training sessions, monitor student sign-in registers, and export session data.")}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2.5 shrink-0 w-full sm:w-auto border-t sm:border-t-0 pt-4 sm:pt-0 border-slate-100">
            <div className="inline-flex items-center gap-1.5 bg-slate-100 border border-slate-200 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700">
              <Globe size={14} className="text-slate-500" />
              <span>{t("Total")}: <strong className="text-slate-900">{totalCount}</strong></span>
            </div>

            <div className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200/80 px-3 py-2 rounded-xl text-xs font-semibold text-emerald-800">
              <Clock size={14} className="text-emerald-600" />
              <span>{t("Upcoming")}: <strong className="text-emerald-950 font-bold">{upcomingCount}</strong></span>
            </div>

            <div className="inline-flex items-center gap-1.5 bg-slate-100 border border-slate-200 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600">
              <CheckCircle2 size={14} className="text-slate-500" />
              <span>{t("Ended")}: <strong className="text-slate-800">{endedCount}</strong></span>
            </div>

            <button
              onClick={() => {
                setModalError('');
                setShowCreateModal(true);
              }}
              className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold px-4 py-2 rounded-xl text-xs transition-all shadow-xs hover:shadow-md cursor-pointer ml-1"
            >
              <Plus size={16} />
              <span>{t("Add New Formation")}</span>
            </button>
          </div>
        </div>

        {/* SEARCH & FILTER BAR */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex flex-col md:flex-row items-center gap-3">
            
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search size={18} className="absolute left-3.5 rtl:left-auto rtl:right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t("Search by workshop title or trainer name...")}
                className="w-full pl-10 rtl:pl-4 rtl:pr-10 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-600/20 transition-all text-slate-800 placeholder-slate-400"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 rtl:right-auto rtl:left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Status Filter Chips */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-full md:w-auto justify-center">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  statusFilter === 'all'
                    ? 'bg-white text-emerald-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t("Total")}
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('upcoming')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  statusFilter === 'upcoming'
                    ? 'bg-white text-emerald-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t("Upcoming")}
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('ended')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  statusFilter === 'ended'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t("Ended")}
              </button>
            </div>

            {/* Date Filter */}
            <div className="relative w-full md:w-auto shrink-0">
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full md:w-auto px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-600/20 transition-all"
              />
              {dateFilter && (
                <button
                  onClick={() => setDateFilter('')}
                  className="absolute right-2 rtl:right-auto rtl:left-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Clear Filters Button */}
            {isAnyFilterActive && (
              <button
                onClick={clearAllFilters}
                className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline px-2 py-1.5 whitespace-nowrap cursor-pointer shrink-0"
              >
                {t("Cancel")}
              </button>
            )}

            {/* Results Count Badge */}
            <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-3.5 py-2 rounded-xl border border-slate-200 whitespace-nowrap hidden lg:inline-block shrink-0">
              {filteredFormations.length} {filteredFormations.length === 1 ? t('Workshop Available') : t('Workshops Available')}
            </span>

          </div>
        </div>

        {fetchError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-700 text-xs">
            <AlertCircle size={18} className="shrink-0 text-red-600" />
            <p><strong>{t("Error")}:</strong> {fetchError}</p>
          </div>
        )}

        {loading ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-xs">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-slate-200 border-t-emerald-600 mb-3" />
            <p className="text-slate-500 text-xs font-medium">{t("Loading session database...")}</p>
          </div>
        ) : filteredFormations.length === 0 ? (
          <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center flex flex-col items-center justify-center">
            <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mb-3">
              <BookOpen size={26} />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              {isAnyFilterActive ? t('No matching workshops found') : t('No training sessions available')}
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              {isAnyFilterActive
                ? `${t('No results match')} "${searchTerm || statusFilter || dateFilter}".`
                : t('Click "Add New Formation" above to create your first session register.')}
            </p>
            {isAnyFilterActive && (
              <button
                onClick={clearAllFilters}
                className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                {t("Cancel")}
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredFormations.map((item) => {
              const registerCount = item.presences?.length || 0;
              const hasEnded = isWorkshopEnded(item.date, item.time);

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-slate-300 transition-all duration-200 flex flex-col justify-between overflow-hidden"
                >
                  <div className="p-5 space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1.5">
                        {hasEnded ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                            <CheckCircle2 size={11} />
                            {t("Ended")}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <Clock size={11} />
                            {t("Upcoming")}
                          </span>
                        )}

                        <h2 className="text-base font-bold text-slate-900 capitalize leading-snug line-clamp-2">
                          {item.title}
                        </h2>
                      </div>

                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-full border border-emerald-200/60 shrink-0">
                        <Users size={13} className="text-emerald-600" />
                        {registerCount}
                      </span>
                    </div>

                    <div className="h-px w-full bg-slate-100" />

                    <div className="space-y-2.5 text-xs text-slate-600">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-slate-100 text-slate-600 rounded-xl shrink-0">
                          <User size={15} />
                        </div>
                        <div className="truncate">
                          <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">{t("Trainer")}</p>
                          <p className="text-slate-900 font-semibold truncate">
                            {item.trainer_name || t('Unassigned')}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-100">
                          <Calendar size={14} className="text-emerald-600 shrink-0" />
                          <span className="font-medium text-slate-700 text-[11px] truncate">
                            {formatDateDisplay(item.date)}
                            {item.time ? ` ${t('at')} ${item.time}` : ''}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-100">
                          <MapPin size={14} className="text-emerald-600 shrink-0" />
                          <span className="font-medium text-slate-700 text-[11px] truncate">
                            {item.location || t('Location TBD')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 pt-0 flex items-center gap-2">
                    <Link
                      to={`/session/${item.id}`}
                      className="flex-1 inline-flex items-center justify-center gap-2 font-semibold text-slate-800 bg-slate-100 hover:bg-emerald-600 hover:text-white active:bg-emerald-700 py-2.5 px-4 rounded-xl text-xs transition-colors duration-200 cursor-pointer touch-manipulation border border-slate-200/80 hover:border-emerald-600"
                    >
                      <Eye size={15} />
                      <span>{t("View Workshop")}</span>
                    </Link>

                    <button
                      onClick={() => {
                        setDeleteError('');
                        setDeleteTarget({ id: item.id, title: item.title });
                      }}
                      className="inline-flex items-center justify-center p-2.5 rounded-xl text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-600 hover:text-white transition-colors duration-200 cursor-pointer border border-rose-200/80 shrink-0"
                      title={t("Delete Workshop")}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CREATE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden relative border border-slate-200 my-auto">
            <div className="bg-slate-900 p-5 text-white flex items-center justify-between border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold">{t("Create New Workshop")}</h3>
                <p className="text-[11px] text-slate-300">{t("Add a formation program register.")}</p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateFormation} className="p-6 space-y-4">
              {modalError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0 text-red-600" />
                  <span>{modalError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {t("Workshop Title *")}
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t("e.g. Fiber Optic Technical Training")}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 bg-slate-50 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {t("Trainer Name")}
                </label>
                <input
                  type="text"
                  value={trainerName}
                  onChange={(e) => setTrainerName(e.target.value)}
                  placeholder={t("e.g. Karim Mansouri")}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 bg-slate-50 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    {t("Session Date")}
                  </label>
                  <input
                    type="date"
                    min="2024-01-01"
                    max="2035-12-31"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 bg-slate-50 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    {t("Session Time")}
                  </label>
                  <input
                    type="time"
                    min="07:00"
                    max="19:00"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 bg-slate-50 text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {t("Location / Room")}
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder={t("e.g. Training Center Lab 01")}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 bg-slate-50 text-slate-900"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  {t("Cancel")}
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-900/20 cursor-pointer disabled:opacity-50"
                >
                  {creating ? t('Saving...') : t('Create Workshop')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-sm w-full shadow-2xl p-6 border border-slate-200 text-center space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto border border-rose-200">
              <AlertTriangle size={24} />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">{t("Delete Workshop?")}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {t("Are you sure you want to delete")} <strong className="text-slate-800">"{deleteTarget.title}"</strong>? {t("This action cannot be undone.")}
              </p>
            </div>

            {deleteError && (
              <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs text-left">
                {deleteError}
              </div>
            )}

            <div className="flex gap-2.5 justify-center pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="flex-1 py-2.5 px-4 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                {t("Cancel")}
              </button>
              <button
                type="button"
                onClick={confirmDeleteFormation}
                disabled={deleting}
                className="flex-1 py-2.5 px-4 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-rose-900/20 cursor-pointer disabled:opacity-50"
              >
                {deleting ? t("Deleting...") : t("Yes, Delete")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}