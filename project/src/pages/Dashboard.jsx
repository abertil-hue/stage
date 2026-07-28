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
  Eye
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Dashboard() {
  const { t } = useTranslation();
  const [formations, setFormations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [trainerName, setTrainerName] = useState('');
  const [location, setLocation] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchFormations();
  }, []);

  const fetchFormations = async () => {
    setLoading(true);
    let { data, error } = await supabase
      .from('formations')
      .select('*, presences(id)')
      .order('id', { ascending: false });

    if (!error) {
      setFormations(data || []);
    } else {
      console.error('Error fetching formations:', error.message);
    }
    setLoading(false);
  };

  const handleCreateFormation = async (e) => {
    e.preventDefault();
    setCreating(true);

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
      setShowCreateModal(false);
      fetchFormations();
    } else {
      alert('Error creating workshop: ' + error.message);
    }
    setCreating(false);
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
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-12">
      {/* TOP NAVBAR */}
      <Navbar />

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        
        {/* LOGO SECTION */}
        <div className="flex flex-col items-center justify-center text-center py-2 space-y-3">
          <img 
            src={logo} 
            alt="Algérie Télécom Logo" 
            className="h-28 sm:h-36 w-auto object-contain drop-shadow-sm transition-all"
          />
        </div>

        {/* DASHBOARD CONTROLS HEADER */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-2xl">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              {t("Formation & Workshop Management")}
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
              {t("Manage all official corporate training sessions, monitor student sign-in registers, and export session data.")}
            </p>
          </div>

          {/* Action Buttons & Metrics */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <div className="inline-flex items-center gap-2.5 bg-slate-100 border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-700">
              <Globe size={16} className="text-emerald-600" />
              <span>{t("Active Workshops")}: <strong className="text-slate-900 font-bold">{formations.length}</strong></span>
            </div>

            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold px-5 py-2.5 rounded-xl text-xs transition-all shadow-xs hover:shadow-md cursor-pointer"
            >
              <Plus size={16} /> {t("Add New Formation")}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t("Search by workshop title or trainer name...")}
              className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-600/20 transition-all text-slate-800 placeholder-slate-400"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <span className="text-xs font-semibold text-slate-800 bg-slate-100 px-3.5 py-2 rounded-xl border border-slate-200 whitespace-nowrap">
            {filteredFormations.length} {filteredFormations.length === 1 ? t('Workshop Available') : t('Workshops Available')}
          </span>
        </div>

        {/* Cards Grid */}
        {loading ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-xs">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-slate-900 border-t-emerald-500 mb-3" />
            <p className="text-slate-500 text-xs font-medium">{t("Loading session database...")}</p>
          </div>
        ) : filteredFormations.length === 0 ? (
          <div className="bg-emerald-50/50 rounded-3xl border border-dashed border-emerald-200 p-12 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-emerald-700 shadow-xs mb-4">
              <BookOpen size={28} />
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFormations.map((item) => {
              const registerCount = item.presences?.length || 0;

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between overflow-hidden relative"
                >
                  <div className="p-6 space-y-4">
                    {/* Header: Title & Participant Counter */}
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="text-base sm:text-lg font-bold text-slate-900 capitalize leading-snug line-clamp-2">
                        {item.title}
                      </h2>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-full border border-emerald-200/60 shrink-0">
                        <Users size={13} className="text-emerald-600" />
                        {registerCount}
                      </span>
                    </div>

                    <div className="h-px w-full bg-slate-100" />

                    {/* Metadata */}
                    <div className="space-y-3 text-xs text-slate-600">
                      {/* Trainer */}
                      <div className="flex items-center gap-3">
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
                        <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          <Calendar size={14} className="text-emerald-600 shrink-0" />
                          <span className="font-medium text-slate-700 text-[11px] truncate">
                            {item.date
                              ? new Date(item.date).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })
                              : t('Date TBD')}
                            {item.time ? ` @ ${item.time}` : ''}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          <MapPin size={14} className="text-emerald-600 shrink-0" />
                          <span className="font-medium text-slate-700 text-[11px] truncate">
                            {item.location || t('Location TBD')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer Button - Fixed Mobile Hit Area */}
                  <div className="p-4 pt-0">
                    <Link
                      to={`/session/${item.id}`}
                      className="w-full inline-flex items-center justify-center gap-2 font-semibold text-slate-800 bg-slate-100 hover:bg-emerald-600 hover:text-white active:bg-emerald-700 py-3 px-4 rounded-xl text-xs transition-colors duration-200 cursor-pointer touch-manipulation border border-slate-200/80 hover:border-emerald-600"
                    >
                      <Eye size={16} />
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