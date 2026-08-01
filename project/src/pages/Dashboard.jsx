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
  AlertCircle
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Dashboard() {
  const { t } = useTranslation();
  const [formations, setFormations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [trainerName, setTrainerName] = useState('');
  const [location, setLocation] = useState('');
  const [creating, setCreating] = useState(false);
  const [modalError, setModalError] = useState('');

  useEffect(() => {
    fetchFormations();
  }, []);

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
    } font-medium {
      setLoading(false);
    }
  };

  const handleCreateFormation = async (e) => {
    e.preventDefault();
    setModalError('');

    // --- 1. Date Validation ---
    if (date) {
      const selectedYear = new Date(date).getFullYear();
      if (isNaN(selectedYear) || selectedYear < 2024 || selectedYear > 2035) {
        setModalError(t('Please select a valid date between 2024 and 2035.'));
        return;
      }
    }

    // --- 2. Time Validation (07:00 AM - 07:00 PM) ---
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
        setModalError('Error creating workshop: ' + error.message);
      }
    } catch (err) {
      setModalError('Error creating workshop: ' + err.message);
    } finally {
      setCreating(false);
    }
  };

  // Safe date display helper
  const formatDateDisplay = (dateString) => {
    if (!dateString) return t('Date TBD');
    const parsed = new Date(dateString);
    if (isNaN(parsed.getTime())) return t('Date TBD');
    return parsed.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const filteredFormations = formations.filter((f) => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    return (
      f.title?.toLowerCase().includes(term) ||
      f.trainer_name?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-16">
      {/* 1. TOP NAVBAR */}
      <Navbar />

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        
        {/* HERO BANNER */}
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

          {/* Action Buttons & Metrics */}
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-3 shrink-0 w-full sm:w-auto border-t sm:border-t-0 pt-4 sm:pt-0 border-slate-100">
            <div className="inline-flex items-center gap-2 bg-slate-100 border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-700">
              <Globe size={16} className="text-emerald-600" />
              <span>{t("Active Workshops")}: <strong className="text-slate-900 font-bold">{formations.length}</strong></span>
            </div>

            <button
              onClick={() => {
                setModalError('');
                setShowCreateModal(true);
              }}
              className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold px-4 py-2.5 rounded-xl text-xs transition-all shadow-xs hover:shadow-md cursor-pointer"
            >
              <Plus size={16} />
              <span>{t("Add New Formation")}</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-3">
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
                className="absolute right-3 rtl:right-auto rtl:left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-3.5 py-2 rounded-xl border border-slate-200 whitespace-nowrap">
            {filteredFormations.length} {filteredFormations.length === 1 ? t('Workshop Available') : t('Workshops Available')}
          </span>
        </div>

        {/* Fetch Error Banner */}
        {fetchError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-700 text-xs">
            <AlertCircle size={18} className="shrink-0 text-red-600" />
            <p><strong>Error:</strong> {fetchError}</p>
          </div>
        )}

        {/* Cards Grid */}
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
              {searchTerm ? t('No matching workshops found') : t('No training sessions available')}
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              {searchTerm
                ? `${t('No results match')} "${searchTerm}".`
                : t('Click "Add New Formation" above to create your first session register.')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredFormations.map((item) => {
              const registerCount = item.presences?.length || 0;

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-slate-300 transition-all duration-200 flex flex-col justify-between overflow-hidden"
                >
                  <div className="p-5 space-y-4">
                    {/* Header: Title & Participant Counter */}
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="text-base font-bold text-slate-900 capitalize leading-snug line-clamp-2">
                        {item.title}
                      </h2>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-full border border-emerald-200/60 shrink-0">
                        <Users size={13} className="text-emerald-600" />
                        {registerCount}
                      </span>
                    </div>

                    <div className="h-px w-full bg-slate-100" />

                    {/* Metadata */}
                    <div className="space-y-2.5 text-xs text-slate-600">
                      {/* Trainer */}
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

                      {/* Date & Location */}
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-100">
                          <Calendar size={14} className="text-emerald-600 shrink-0" />
                          <span className="font-medium text-slate-700 text-[11px] truncate">
                            {formatDateDisplay(item.date)}
                            {item.time ? ` at ${item.time}` : ''}
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

                  {/* Card Action Button */}
                  <div className="p-5 pt-0">
                    <Link
                      to={`/session/${item.id}`}
                      className="w-full inline-flex items-center justify-center gap-2 font-semibold text-slate-800 bg-slate-100 hover:bg-emerald-600 hover:text-white active:bg-emerald-700 py-2.5 px-4 rounded-xl text-xs transition-colors duration-200 cursor-pointer touch-manipulation border border-slate-200/80 hover:border-emerald-600"
                    >
                      <Eye size={15} />
                      <span>{t("View Workshop")}</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal: Create Formation */}
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
              {/* Error Box */}
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

              {/* Date & Time */}
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
    </div>
  );
}