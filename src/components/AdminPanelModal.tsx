import React, { useState, useEffect } from 'react';
import {
  Shield,
  Lock,
  Key,
  CheckCircle2,
  AlertCircle,
  X,
  Save,
  RotateCcw,
  Sparkles,
  Eye,
  EyeOff,
  LogOut,
  Users,
  Search,
  Trash2,
  RefreshCw,
  Clock,
  Activity,
  Megaphone,
  ExternalLink,
  Download,
  Upload,
  Radio,
  History,
  MessageSquare,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Filter,
  Copy,
  Check,
  Bot,
  FileText,
  Brain,
  Smartphone,
  Laptop,
  Zap,
  Award
} from 'lucide-react';
import { User, AdminUserStats, AnnouncementConfig, UserSearchLog } from '../types';
import { UserDeviceInfoModal } from './UserDeviceInfoModal';
import { AiTrainingSection } from './AiTrainingSection';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: User | null;
  onPromptUpdated?: () => void;
  onAnnouncementUpdated?: () => void;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onPromptUpdated,
  onAnnouncementUpdated
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('xrivet_admin_auth') === 'true';
  });
  const [savedPassword, setSavedPassword] = useState(() => {
    return sessionStorage.getItem('xrivet_admin_pass') || '';
  });

  const [activeTab, setActiveTab] = useState<'accounts' | 'history' | 'training' | 'announcement' | 'prompt' | 'apikeys'>('accounts');
  const [selectedUserForDeviceModal, setSelectedUserForDeviceModal] = useState<User | null>(null);
  const [isTrainingQueryId, setIsTrainingQueryId] = useState<string | null>(null);
  const [adminKeys, setAdminKeys] = useState<any[]>([]);
  const [isFetchingKeys, setIsFetchingKeys] = useState(false);
  const [newAdminKeyTitle, setNewAdminKeyTitle] = useState('');
  const [targetUserIdForKey, setTargetUserIdForKey] = useState('');
  const [isGeneratingAdminKey, setIsGeneratingAdminKey] = useState(false);
  const [createdKeyString, setCreatedKeyString] = useState<string | null>(null);
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);

  // User Queries & Search History state
  const [searchLogs, setSearchLogs] = useState<UserSearchLog[]>([]);
  const [selectedUserForHistory, setSelectedUserForHistory] = useState<User | null>(null);
  const [isFetchingLogs, setIsFetchingLogs] = useState(false);
  const [historySearchTerm, setHistorySearchTerm] = useState('');
  const [expandedLogIds, setExpandedLogIds] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Prompt state
  const [promptText, setPromptText] = useState('');
  const [isCustom, setIsCustom] = useState(false);

  // Accounts state
  const [userStats, setUserStats] = useState<AdminUserStats>({
    totalUsers: 0,
    totalLogins: 0,
    users: []
  });
  const [userSearch, setUserSearch] = useState('');
  const [isFetchingUsers, setIsFetchingUsers] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  // Announcement / Ad state
  const [announcementEnabled, setAnnouncementEnabled] = useState(false);
  const [announcementText, setAnnouncementText] = useState('');
  const [announcementBadge, setAnnouncementBadge] = useState('LIVE');
  const [announcementLink, setAnnouncementLink] = useState('');
  const [announcementLinkText, setAnnouncementLinkText] = useState('Visit');
  const [isSavingAnnouncement, setIsSavingAnnouncement] = useState(false);

  // Backup restore state
  const [isRestoringBackup, setIsRestoringBackup] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Load current global prompt, accounts & announcement once authenticated
  useEffect(() => {
    if (isOpen && isAuthenticated && savedPassword) {
      fetchGlobalPrompt(savedPassword);
      fetchUsers(savedPassword);
      fetchSearchLogs(savedPassword, selectedUserForHistory?.id);
      fetchAnnouncement();
      fetchAdminKeys(savedPassword);
    }
  }, [isOpen, isAuthenticated, savedPassword]);

  // When active tab changes or user filter changes, fetch search logs
  useEffect(() => {
    if (isOpen && isAuthenticated && savedPassword && activeTab === 'history') {
      fetchSearchLogs(savedPassword, selectedUserForHistory?.id);
    }
  }, [activeTab, selectedUserForHistory]);

  const fetchGlobalPrompt = async (pass: string) => {
    try {
      const res = await fetch('/api/admin/prompt', {
        headers: {
          'x-admin-password': pass
        }
      });
      if (res.ok) {
        const data = await res.json();
        setPromptText(data.prompt || '');
        setIsCustom(Boolean(data.isCustom));
      } else {
        setIsAuthenticated(false);
        sessionStorage.removeItem('xrivet_admin_auth');
        sessionStorage.removeItem('xrivet_admin_pass');
        setError('Admin session expired. Barahe karam password enter karein.');
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  const fetchUsers = async (pass: string) => {
    setIsFetchingUsers(true);
    try {
      const res = await fetch('/api/admin/users', {
        headers: {
          'x-admin-password': pass
        }
      });
      if (res.ok) {
        const data: AdminUserStats = await res.json();
        setUserStats(data);

        // Also save a copy to local storage cache so it's never lost
        try {
          if (Array.isArray(data.users) && data.users.length > 0) {
            localStorage.setItem('xrivet_backup_users_cache', JSON.stringify(data.users));
          }
        } catch {
          // Ignore
        }
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsFetchingUsers(false);
    }
  };

  const fetchSearchLogs = async (pass: string, userId?: string) => {
    setIsFetchingLogs(true);
    try {
      const url = userId 
        ? `/api/admin/searches?userId=${encodeURIComponent(userId)}` 
        : '/api/admin/searches';
      const res = await fetch(url, {
        headers: {
          'x-admin-password': pass
        }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.logs)) {
          setSearchLogs(data.logs);
        }
      }
    } catch (err) {
      console.error('Failed to fetch search logs:', err);
    } finally {
      setIsFetchingLogs(false);
    }
  };

  const fetchAnnouncement = async () => {
    try {
      const res = await fetch('/api/announcement');
      if (res.ok) {
        const data: AnnouncementConfig = await res.json();
        setAnnouncementEnabled(Boolean(data.enabled));
        setAnnouncementText(data.text || '');
        setAnnouncementBadge(data.badge || 'LIVE');
        setAnnouncementLink(data.link || '');
        setAnnouncementLinkText(data.linkText || 'Visit');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAdminKeys = async (pass: string) => {
    setIsFetchingKeys(true);
    try {
      const res = await fetch('/api/admin/keys', {
        headers: {
          'x-admin-password': pass
        }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.keys)) {
          setAdminKeys(data.keys);
        }
      }
    } catch (err) {
      console.error('Failed to fetch admin API keys:', err);
    } finally {
      setIsFetchingKeys(false);
    }
  };

  const handleToggleKeyStatus = async (keyId: string) => {
    try {
      const res = await fetch(`/api/admin/keys/${keyId}/toggle`, {
        method: 'POST',
        headers: {
          'x-admin-password': savedPassword
        }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAdminKeys(prev => prev.map(k => k.id === keyId ? data.key : k));
        setStatusMessage('API key status updated kamyabi se.');
      } else {
        setError(data.error || 'Failed to update key status.');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to update key status.');
    }
  };

  const handleDeleteAdminKey = async (keyId: string) => {
    if (!window.confirm('Kya aap waqai is API key को delete karna chahte hain?')) return;
    try {
      const res = await fetch(`/api/admin/keys/${keyId}`, {
        method: 'DELETE',
        headers: {
          'x-admin-password': savedPassword
        }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAdminKeys(prev => prev.filter(k => k.id !== keyId));
        setStatusMessage('API key delete ho gayi.');
      } else {
        setError(data.error || 'Failed to delete key.');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to delete key.');
    }
  };

  const handleGenerateAdminKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGeneratingAdminKey(true);
    setError(null);
    setStatusMessage(null);
    setCreatedKeyString(null);

    try {
      const res = await fetch('/api/admin/keys/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': savedPassword
        },
        body: JSON.stringify({
          title: newAdminKeyTitle.trim() || 'Admin Key',
          targetUserId: targetUserIdForKey || undefined
        })
      });

      const data = await res.json();
      if (res.ok && data.success && data.key) {
        setAdminKeys(prev => [data.key, ...prev]);
        setCreatedKeyString(data.key.key);
        setNewAdminKeyTitle('');
        setStatusMessage(`Nayi API Key generate ho gayi: "${data.key.title}"`);
      } else {
        setError(data.error || 'API Key generate karne me masla hua.');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to generate key.');
    } finally {
      setIsGeneratingAdminKey(false);
    }
  };

  const handleTrainSingleQuery = async (log: UserSearchLog) => {
    setIsTrainingQueryId(log.id);
    setError(null);
    setStatusMessage(null);
    try {
      const res = await fetch('/api/admin/train-query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          password: savedPassword,
          queryId: log.id,
          query: log.query,
          response: log.response || log.responsePreview || ''
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatusMessage(`AI Auto-Trained Master Q&A create ho gaya: "${data.item?.topic || log.query.substring(0, 35)}"`);
        setSearchLogs(prev => prev.map(l => l.id === log.id ? {
          ...l,
          status: 'trained',
          trainedKnowledgeId: data.item?.id,
          optimizedAnswer: data.item?.refinedAnswer
        } : l));
      } else {
        setError(data.error || 'Failed to auto-train query.');
      }
    } catch (err: any) {
      setError(err?.message || 'Error auto-training query.');
    } finally {
      setIsTrainingQueryId(null);
    }
  };

  const handleDeleteUser = async (userId: string, username: string) => {
    if (username.toLowerCase() === 'rizo8') {
      setError('Super Admin account @rizo8 delete nahi kiya ja sakta.');
      return;
    }

    if (!window.confirm(`Kya aap waqai user @${username} ka account delete karna chahte hain?`)) {
      return;
    }

    setDeletingUserId(userId);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'x-admin-password': savedPassword
        }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUserStats(prev => ({
          ...prev,
          totalUsers: Math.max(0, prev.totalUsers - 1),
          users: prev.users.filter(u => u.id !== userId)
        }));
        setStatusMessage(`User @${username} ka account delete ho gaya.`);
      } else {
        setError(data.error || 'Failed to delete user.');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to delete user.');
    } finally {
      setDeletingUserId(null);
    }
  };

  const handleExportBackup = () => {
    try {
      window.open(`/api/admin/users/export?password=${encodeURIComponent(savedPassword)}`, '_blank');
      setStatusMessage('Users database backup JSON download shuru ho gaya.');
    } catch (err: any) {
      setError(err?.message || 'Backup export failed');
    }
  };

  const handleImportBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsRestoringBackup(true);
    setError(null);
    setStatusMessage(null);

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);

      const res = await fetch('/api/admin/users/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: savedPassword,
          users: parsed
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStatusMessage(data.message || 'Users backup restored successfully!');
        fetchUsers(savedPassword);
      } else {
        setError(data.error || 'Backup restore failed.');
      }
    } catch (err: any) {
      setError('Invalid backup JSON file: ' + (err?.message || ''));
    } finally {
      setIsRestoringBackup(false);
      e.target.value = '';
    }
  };

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!password.trim()) {
      setError('Password enter karein.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: password.trim() })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsAuthenticated(true);
        setSavedPassword(password.trim());
        sessionStorage.setItem('xrivet_admin_auth', 'true');
        sessionStorage.setItem('xrivet_admin_pass', password.trim());
        setPassword('');
        fetchGlobalPrompt(password.trim());
        fetchUsers(password.trim());
        fetchAnnouncement();
        fetchAdminKeys(password.trim());
      } else {
        setError(data.error || 'Galat password! Dobara koshish karein.');
      }
    } catch (err: any) {
      setError(err?.message || 'Connection error.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAnnouncement = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSavingAnnouncement(true);
    setError(null);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/admin/announcement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: savedPassword,
          enabled: announcementEnabled,
          text: announcementText,
          badge: announcementBadge || 'LIVE',
          link: announcementLink,
          linkText: announcementLinkText || 'Visit'
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStatusMessage('Live Announcement & Ad kamyabi se publish ho gaya! Har user ko live show hoga.');
        if (onAnnouncementUpdated) onAnnouncementUpdated();
      } else {
        setError(data.error || 'Failed to save announcement.');
      }
    } catch (err: any) {
      setError(err?.message || 'Error saving announcement.');
    } finally {
      setIsSavingAnnouncement(false);
    }
  };

  const handleSavePrompt = async () => {
    setIsSaving(true);
    setError(null);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/admin/prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: savedPassword,
          prompt: promptText
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStatusMessage('Global prompt kamyabi se save ho gaya! Ab tamam users ke liye yahi active rahega.');
        setIsCustom(Boolean(promptText.trim().length > 0));
        if (onPromptUpdated) onPromptUpdated();
      } else {
        setError(data.error || 'Failed to save prompt.');
      }
    } catch (err: any) {
      setError(err?.message || 'Error saving prompt.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm('Kya aap waqai global prompt ko default par reset karna chahte hain?')) {
      return;
    }

    setIsSaving(true);
    setError(null);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/admin/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: savedPassword
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setPromptText('');
        setIsCustom(false);
        setStatusMessage('Global prompt default system instructions par reset ho gaya.');
        if (onPromptUpdated) onPromptUpdated();
      } else {
        setError(data.error || 'Failed to reset prompt.');
      }
    } catch (err: any) {
      setError(err?.message || 'Error resetting prompt.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setSavedPassword('');
    sessionStorage.removeItem('xrivet_admin_auth');
    sessionStorage.removeItem('xrivet_admin_pass');
    setPassword('');
    setStatusMessage(null);
    setError(null);
  };

  const formatDate = (ts: number) => {
    if (!ts) return 'N/A';
    try {
      const d = new Date(ts);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return String(ts);
    }
  };

  const filteredUsers = userStats.users.filter(u => {
    const q = userSearch.toLowerCase();
    return (
      u.username.toLowerCase().includes(q) ||
      u.name.toLowerCase().includes(q) ||
      u.id.toLowerCase().includes(q)
    );
  });

  if (!isOpen) return null;

  return (
    <div
      id="admin-panel-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl bg-white dark:bg-[#15161a] rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-zinc-900 dark:text-zinc-100 text-base">
                  Admin Panel
                </span>
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  Private Control
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Xrivet WormGPT System, Live Announcements &amp; Accounts Management
              </p>
            </div>
          </div>

          <button
            id="close-admin-panel-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {!isAuthenticated ? (
            /* Login View */
            <form onSubmit={handleLogin} className="space-y-4 py-4">
              <div className="text-center max-w-sm mx-auto space-y-2 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/20 mb-3 shadow-inner">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg text-zinc-900 dark:text-white">
                  Admin Authorization
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  Admin panel unlock karne ke liye secret admin password enter karein.
                </p>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="max-w-sm mx-auto space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Admin Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                      <Key className="w-4 h-4" />
                    </div>
                    <input
                      id="admin-password-input"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Admin password enter karein..."
                      className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-mono"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  id="admin-login-submit-btn"
                  type="submit"
                  disabled={isLoading || !password.trim()}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium text-sm transition-colors flex items-center justify-center gap-2 shadow-sm shadow-emerald-600/30"
                >
                  {isLoading ? (
                    <span>Verifying...</span>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Unlock Admin Panel</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* Admin Panel Dashboard View */
            <div className="space-y-5">
              {/* Authenticated Header Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-500/20">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <div>
                    <div className="text-xs font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                      <span>Admin Session Active (Hadi / rizo8)</span>
                    </div>
                    <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      Authorized to manage accounts, live announcements, and global system prompts.
                    </div>
                  </div>
                </div>
                <button
                  id="admin-logout-btn"
                  onClick={handleLogout}
                  className="self-start sm:self-auto px-3 py-1.5 text-xs rounded-lg border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 flex items-center gap-1.5 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Lock Panel</span>
                </button>
              </div>

              {/* Tab Navigation */}
              <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2 overflow-x-auto">
                <button
                  id="admin-tab-accounts-btn"
                  type="button"
                  onClick={() => setActiveTab('accounts')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
                    activeTab === 'accounts'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Registered Accounts ({userStats.totalUsers})</span>
                </button>

                <button
                  id="admin-tab-history-btn"
                  type="button"
                  onClick={() => {
                    setActiveTab('history');
                    fetchSearchLogs(savedPassword, selectedUserForHistory?.id);
                  }}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
                    activeTab === 'history'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  <History className="w-4 h-4" />
                  <span>User Searches &amp; Prompts</span>
                  {searchLogs.length > 0 && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                      {searchLogs.length}
                    </span>
                  )}
                </button>

                <button
                  id="admin-tab-training-btn"
                  type="button"
                  onClick={() => setActiveTab('training')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
                    activeTab === 'training'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  <Brain className="w-4 h-4 text-emerald-400" />
                  <span>AI Training &amp; Knowledge Base</span>
                  <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Self-Learning
                  </span>
                </button>

                <button
                  id="admin-tab-announcement-btn"
                  type="button"
                  onClick={() => setActiveTab('announcement')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
                    activeTab === 'announcement'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  <Megaphone className="w-4 h-4" />
                  <span>Live Announcement &amp; Ads</span>
                  {announcementEnabled && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  )}
                </button>

                <button
                  id="admin-tab-prompt-btn"
                  type="button"
                  onClick={() => setActiveTab('prompt')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
                    activeTab === 'prompt'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Global System Prompt</span>
                  {isCustom && (
                    <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
                  )}
                </button>

                <button
                  id="admin-tab-apikeys-btn"
                  type="button"
                  onClick={() => {
                    setActiveTab('apikeys');
                    fetchAdminKeys(savedPassword);
                  }}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
                    activeTab === 'apikeys'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  <Key className="w-4 h-4" />
                  <span>API Keys ({adminKeys.length})</span>
                </button>
              </div>

              {/* Status or Error alerts */}
              {statusMessage && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center justify-between gap-2 animate-fade-in">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    <span>{statusMessage}</span>
                  </div>
                  <button
                    onClick={() => setStatusMessage(null)}
                    className="text-emerald-600 hover:text-emerald-800"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {error && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 text-xs flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                  <button onClick={() => setError(null)} className="text-red-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* TAB 1: ACCOUNTS & LOGINS */}
              {activeTab === 'accounts' && (
                <div className="space-y-4">
                  {/* Metric Overview Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800">
                      <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 text-xs font-medium">
                        <span>Total Users</span>
                        <Users className="w-4 h-4 text-emerald-500" />
                      </div>
                      <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-1 font-mono">
                        {userStats.totalUsers}
                      </div>
                      <div className="text-[11px] text-zinc-400 mt-0.5">
                        Permanent saved accounts
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800">
                      <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 text-xs font-medium">
                        <span>Total Logins</span>
                        <Activity className="w-4 h-4 text-emerald-500" />
                      </div>
                      <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-1 font-mono">
                        {userStats.totalLogins}
                      </div>
                      <div className="text-[11px] text-zinc-400 mt-0.5">
                        Total login sessions recorded
                      </div>
                    </div>

                    <div className="col-span-2 sm:col-span-1 p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between">
                      <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 text-xs font-medium">
                        <span>Cloud Firestore</span>
                        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Permanent Sync
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1.5">
                        <button
                          id="export-users-backup-btn"
                          type="button"
                          onClick={handleExportBackup}
                          className="flex-1 py-1.5 px-2 rounded-lg text-[11px] font-semibold bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 flex items-center justify-center gap-1 transition-colors"
                          title="Download database JSON backup"
                        >
                          <Download className="w-3 h-3" />
                          <span>Backup</span>
                        </button>
                        <label
                          className="flex-1 py-1.5 px-2 rounded-lg text-[11px] font-semibold bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 flex items-center justify-center gap-1 transition-colors cursor-pointer"
                          title="Restore database from JSON"
                        >
                          <Upload className="w-3 h-3" />
                          <span>{isRestoringBackup ? '...' : 'Restore'}</span>
                          <input
                            type="file"
                            accept=".json"
                            onChange={handleImportBackup}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Search and refresh toolbar */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-400" />
                      <input
                        id="search-admin-users-input"
                        type="text"
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        placeholder="Search users by name, username or ID..."
                        className="w-full pl-9 pr-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-100 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <button
                      id="refresh-users-btn"
                      type="button"
                      onClick={() => fetchUsers(savedPassword)}
                      disabled={isFetchingUsers}
                      className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition-colors"
                      title="Refresh Accounts"
                    >
                      <RefreshCw className={`w-4 h-4 ${isFetchingUsers ? 'animate-spin text-emerald-500' : ''}`} />
                    </button>
                  </div>

                  {/* Users Table / List */}
                  <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
                    {filteredUsers.length === 0 ? (
                      <div className="py-10 text-center text-zinc-400 text-xs">
                        {userSearch ? 'Koi matching user nahi mila.' : 'Abhi tak koi user register nahi hua.'}
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-zinc-50 dark:bg-zinc-900/80 text-zinc-500 dark:text-zinc-400 font-semibold border-b border-zinc-200 dark:border-zinc-800">
                            <tr>
                              <th className="py-2.5 px-3">User</th>
                              <th className="py-2.5 px-3">Device / Mobile</th>
                              <th className="py-2.5 px-3">Registered On</th>
                              <th className="py-2.5 px-3">Last Active</th>
                              <th className="py-2.5 px-3 text-center">Logins</th>
                              <th className="py-2.5 px-3 text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                            {filteredUsers.map((u) => {
                              const isRootAdmin = u.username.toLowerCase() === 'rizo8';
                              const d = u.deviceInfo;
                              return (
                                <tr key={u.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/40 transition-colors">
                                  <td className="py-2.5 px-3">
                                    <div className="flex items-center gap-2">
                                      <div className={`w-6 h-6 rounded-full font-bold text-[10px] flex items-center justify-center shrink-0 ${isRootAdmin ? 'bg-amber-500/20 text-amber-600 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'}`}>
                                        {u.name?.[0] || u.username?.[0] || 'U'}
                                      </div>
                                      <div>
                                        <div className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                                          <span>{u.name}</span>
                                          {isRootAdmin && (
                                            <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                              Super Admin
                                            </span>
                                          )}
                                        </div>
                                        <div className="text-[10px] text-zinc-400 font-mono">
                                          @{u.username}
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="py-2.5 px-3">
                                    {d ? (
                                      <button
                                        type="button"
                                        onClick={() => setSelectedUserForDeviceModal(u)}
                                        className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-600 dark:hover:text-emerald-400 border border-zinc-200 dark:border-zinc-700 transition-colors"
                                        title="Click to view detailed mobile telemetry & specs"
                                      >
                                        {d.isMobile ? (
                                          <Smartphone className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                        ) : (
                                          <Laptop className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                                        )}
                                        <span className="max-w-[120px] truncate">
                                          {d.deviceModel || (d.isMobile ? 'Mobile' : 'Desktop')}
                                        </span>
                                      </button>
                                    ) : (
                                      <span className="text-[11px] text-zinc-400 font-mono">
                                        {u.lastKnownIp || 'Web Client'}
                                      </span>
                                    )}
                                  </td>
                                  <td className="py-2.5 px-3 text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                                    {formatDate(u.createdAt)}
                                  </td>
                                  <td className="py-2.5 px-3 text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                                    <span className="flex items-center gap-1">
                                      <Clock className="w-3 h-3 text-emerald-500" />
                                      {formatDate(u.lastLoginAt)}
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-3 text-center">
                                    <span className="inline-block px-2 py-0.5 rounded-full font-mono text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                                      {u.loginCount || 1} logins
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-3 text-right">
                                    <div className="flex items-center justify-end gap-1">
                                      <button
                                        id={`view-searches-${u.id}`}
                                        type="button"
                                        onClick={() => {
                                          setSelectedUserForHistory(u);
                                          setActiveTab('history');
                                          fetchSearchLogs(savedPassword, u.id);
                                        }}
                                        className="px-2 py-1 rounded-lg text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-emerald-500/20 transition-colors flex items-center gap-1"
                                        title="View what this user searched/asked"
                                      >
                                        <History className="w-3 h-3" />
                                        <span>Searches</span>
                                      </button>
                                      {!isRootAdmin && (
                                        <button
                                          id={`delete-user-${u.id}`}
                                          type="button"
                                          onClick={() => handleDeleteUser(u.id, u.username)}
                                          disabled={deletingUserId === u.id}
                                          className="p-1 rounded-lg text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                                          title="Delete user account"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB: USER SEARCHES & PROMPT HISTORY */}
              {activeTab === 'history' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-500/20">
                    <div>
                      <div className="flex items-center gap-2">
                        <History className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                          {selectedUserForHistory 
                            ? `Search & Chat History: @${selectedUserForHistory.username} (${selectedUserForHistory.name})`
                            : 'All Users Search & Query History'}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                        {selectedUserForHistory 
                          ? `Sirf is user ki queries aur AI ke responses yahan show ho rahe hain.`
                          : `Users jo jo sawal aur tools search kar rahe hain, sab yahan real-time record ho rahe hain taake aap AI ko train aur optimize kar sakein.`}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 flex-wrap">
                      {selectedUserForHistory && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedUserForHistory(null);
                            fetchSearchLogs(savedPassword);
                          }}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors"
                        >
                          View All Users
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          const exportData = searchLogs.map(l => ({
                            user: `@${l.username} (${l.userName})`,
                            instruction_prompt: l.query,
                            ai_response: l.response || l.responsePreview,
                            timestamp: new Date(l.timestamp).toISOString()
                          }));
                          const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `xrivet-training-dataset-${Date.now()}.json`;
                          a.click();
                          URL.revokeObjectURL(url);
                        }}
                        disabled={searchLogs.length === 0}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors disabled:opacity-50"
                        title="Download training dataset in standard JSON format for AI fine-tuning"
                      >
                        <Download className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Export AI Training JSON</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => fetchSearchLogs(savedPassword, selectedUserForHistory?.id)}
                        disabled={isFetchingLogs}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 text-xs font-bold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isFetchingLogs ? 'animate-spin text-emerald-500' : ''}`} />
                        <span>Refresh Logs</span>
                      </button>
                    </div>
                  </div>

                  {/* Filter and User Selector Bar */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-400" />
                      <input
                        type="text"
                        value={historySearchTerm}
                        onChange={(e) => setHistorySearchTerm(e.target.value)}
                        placeholder="Search queries, keywords, usernames..."
                        className="w-full pl-9 pr-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-100 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    {/* User Quick Dropdown Filter */}
                    <div className="sm:w-56 shrink-0">
                      <select
                        value={selectedUserForHistory?.id || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (!val) {
                            setSelectedUserForHistory(null);
                            fetchSearchLogs(savedPassword);
                          } else {
                            const found = userStats.users.find(u => u.id === val);
                            if (found) {
                              setSelectedUserForHistory(found);
                              fetchSearchLogs(savedPassword, found.id);
                            }
                          }
                        }}
                        className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-100 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="">Filter by User (All Users)</option>
                        {userStats.users.map((u) => (
                          <option key={u.id} value={u.id}>
                            @{u.username} - {u.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* History Logs Feed */}
                  <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-900/40">
                    {(() => {
                      const filteredLogs = searchLogs.filter(log => {
                        if (!historySearchTerm.trim()) return true;
                        const term = historySearchTerm.toLowerCase();
                        return (
                          log.query.toLowerCase().includes(term) ||
                          log.username.toLowerCase().includes(term) ||
                          log.userName.toLowerCase().includes(term) ||
                          (log.responsePreview && log.responsePreview.toLowerCase().includes(term))
                        );
                      });

                      if (isFetchingLogs && filteredLogs.length === 0) {
                        return (
                          <div className="py-12 text-center text-xs text-zinc-400 flex items-center justify-center gap-2">
                            <RefreshCw className="w-4 h-4 animate-spin text-emerald-500" />
                            <span>Firestore se search history load ho rahi hai...</span>
                          </div>
                        );
                      }

                      if (filteredLogs.length === 0) {
                        return (
                          <div className="py-12 text-center text-xs text-zinc-400 space-y-1">
                            <MessageSquare className="w-8 h-8 mx-auto text-zinc-300 dark:text-zinc-700" />
                            <p className="font-semibold text-zinc-600 dark:text-zinc-400">
                              {historySearchTerm ? 'Is keyword ke mutabiq koi query nahi mili.' : 'Abhi tak koi user queries record nahi huin.'}
                            </p>
                            <p className="text-[11px] text-zinc-400">
                              Jaise hi koi user chat mein sawal poochega ya tool search karega, wo yahan show hoga.
                            </p>
                          </div>
                        );
                      }

                      return (
                        <div className="divide-y divide-zinc-200 dark:divide-zinc-800/80 max-h-[550px] overflow-y-auto">
                          {filteredLogs.map((log) => {
                            const isExpanded = expandedLogIds[log.id] ?? false;
                            const fullResponse = log.response || log.responsePreview || '';
                            const isLong = fullResponse.length > 250;

                            const toggleExpand = () => {
                              setExpandedLogIds(prev => ({
                                ...prev,
                                [log.id]: !isExpanded
                              }));
                            };

                            const handleCopy = (textToCopy: string, copyKey: string) => {
                              navigator.clipboard.writeText(textToCopy);
                              setCopiedId(copyKey);
                              setTimeout(() => setCopiedId(null), 2000);
                            };

                            return (
                              <div key={log.id} className="p-3.5 hover:bg-zinc-50/70 dark:hover:bg-zinc-800/40 transition-colors">
                                <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md border border-emerald-500/20">
                                      @{log.username}
                                    </span>
                                    <span className="text-xs text-zinc-700 dark:text-zinc-200 font-semibold">
                                      {log.userName}
                                    </span>
                                    {log.deviceInfo && (
                                      <span className="inline-flex items-center gap-1 text-[10px] text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md border border-zinc-200 dark:border-zinc-700">
                                        {log.deviceInfo.isMobile ? (
                                          <Smartphone className="w-3 h-3 text-emerald-500 shrink-0" />
                                        ) : (
                                          <Laptop className="w-3 h-3 text-blue-500 shrink-0" />
                                        )}
                                        <span>{log.deviceInfo.deviceModel || (log.deviceInfo.isMobile ? 'Mobile' : 'Desktop')}</span>
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {log.status === 'trained' || log.trainedKnowledgeId ? (
                                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md border border-emerald-500/30 flex items-center gap-1">
                                        <Sparkles className="w-3 h-3 text-emerald-500" />
                                        <span>Trained Q&amp;A</span>
                                      </span>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() => handleTrainSingleQuery(log)}
                                        disabled={isTrainingQueryId === log.id}
                                        className="text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-500 px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-xs transition-colors disabled:opacity-50"
                                        title="Auto-train AI with this question to create verified master knowledge card"
                                      >
                                        {isTrainingQueryId === log.id ? (
                                          <RefreshCw className="w-3 h-3 animate-spin" />
                                        ) : (
                                          <Zap className="w-3 h-3" />
                                        )}
                                        <span>{isTrainingQueryId === log.id ? 'Training...' : 'Auto-Train AI'}</span>
                                      </button>
                                    )}
                                    <span className="text-[11px] text-zinc-400 flex items-center gap-1">
                                      <Clock className="w-3 h-3 text-emerald-500" />
                                      {formatDate(log.timestamp)}
                                    </span>
                                  </div>
                                </div>

                                {/* Question / User Query */}
                                <div className="bg-zinc-100/90 dark:bg-zinc-800/70 p-3 rounded-xl border border-zinc-200/80 dark:border-zinc-700/60 my-1.5">
                                  <div className="flex items-center justify-between gap-2 mb-1">
                                    <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                                      <MessageSquare className="w-3 h-3 text-emerald-500" />
                                      User Question / Search:
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => handleCopy(log.query, `q_${log.id}`)}
                                      className="text-[10px] flex items-center gap-1 text-zinc-400 hover:text-emerald-500 transition-colors"
                                      title="Copy user question"
                                    >
                                      {copiedId === `q_${log.id}` ? (
                                        <>
                                          <Check className="w-3 h-3 text-emerald-500" />
                                          <span className="text-emerald-500 font-bold">Copied</span>
                                        </>
                                      ) : (
                                        <>
                                          <Copy className="w-3 h-3" />
                                          <span>Copy</span>
                                        </>
                                      )}
                                    </button>
                                  </div>
                                  <p className="text-xs text-zinc-900 dark:text-zinc-100 font-medium whitespace-pre-wrap leading-relaxed">
                                    {log.query}
                                  </p>
                                </div>

                                {/* Full AI Response */}
                                {fullResponse ? (
                                  <div className="mt-2 bg-emerald-50/40 dark:bg-emerald-950/20 p-3 rounded-xl border border-emerald-500/20">
                                    <div className="flex items-center justify-between gap-2 mb-1.5">
                                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                                        <Bot className="w-3 h-3" />
                                        AI Response ({fullResponse.length} chars):
                                      </span>
                                      <div className="flex items-center gap-2">
                                        <button
                                          type="button"
                                          onClick={() => handleCopy(fullResponse, `r_${log.id}`)}
                                          className="text-[10px] flex items-center gap-1 text-zinc-400 hover:text-emerald-500 transition-colors"
                                          title="Copy full AI response"
                                        >
                                          {copiedId === `r_${log.id}` ? (
                                            <>
                                              <Check className="w-3 h-3 text-emerald-500" />
                                              <span className="text-emerald-500 font-bold">Copied</span>
                                            </>
                                          ) : (
                                            <>
                                              <Copy className="w-3 h-3" />
                                              <span>Copy AI Reply</span>
                                            </>
                                          )}
                                        </button>
                                        {isLong && (
                                          <button
                                            type="button"
                                            onClick={toggleExpand}
                                            className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-0.5"
                                          >
                                            {isExpanded ? (
                                              <>
                                                <span>Collapse</span>
                                                <ChevronUp className="w-3 h-3" />
                                              </>
                                            ) : (
                                              <>
                                                <span>Read Full ({fullResponse.length} chars)</span>
                                                <ChevronDown className="w-3 h-3" />
                                              </>
                                            )}
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                    <div className="text-xs text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap leading-relaxed font-sans">
                                      {isLong && !isExpanded ? (
                                        <div>
                                          {fullResponse.slice(0, 260)}...
                                          <button
                                            type="button"
                                            onClick={toggleExpand}
                                            className="ml-1.5 text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
                                          >
                                            Show more
                                          </button>
                                        </div>
                                      ) : (
                                        fullResponse
                                      )}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="mt-1 pl-2 text-[11px] text-zinc-400 italic">
                                    (Response pending or in stream)
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* TAB: AI AUTO-TRAINING & KNOWLEDGE BASE */}
              {activeTab === 'training' && (
                <AiTrainingSection
                  adminPassword={savedPassword}
                  onShowMessage={(msg) => setStatusMessage(msg)}
                  onShowError={(err) => setError(err)}
                />
              )}

              {/* TAB 2: LIVE ANNOUNCEMENT & ADS */}
              {activeTab === 'announcement' && (
                <form onSubmit={handleSaveAnnouncement} className="space-y-4">
                  <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-500/20 text-xs text-emerald-900 dark:text-emerald-300">
                    <p className="font-semibold">📢 Live Top Banner / Announcement Control</p>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                      Yahan se aap tamam visitors ke liye live announcement ya sponsored ad laga sakte hain jo chat screen ke oopar live display hoga.
                    </p>
                  </div>

                  {/* Toggle Active Switch */}
                  <div className="flex items-center justify-between p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60">
                    <div>
                      <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                        <Radio className={`w-4 h-4 ${announcementEnabled ? 'text-emerald-500 animate-pulse' : 'text-zinc-400'}`} />
                        <span>Announcement Status</span>
                      </div>
                      <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        {announcementEnabled ? 'Live on user screens' : 'Currently disabled / hidden'}
                      </div>
                    </div>

                    <button
                      id="toggle-announcement-active-btn"
                      type="button"
                      onClick={() => setAnnouncementEnabled(!announcementEnabled)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                        announcementEnabled ? 'bg-emerald-600' : 'bg-zinc-300 dark:bg-zinc-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          announcementEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Form fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        Badge Tag
                      </label>
                      <input
                        type="text"
                        value={announcementBadge}
                        onChange={(e) => setAnnouncementBadge(e.target.value)}
                        placeholder="e.g. LIVE, NOTICE, AD, UPDATE"
                        className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-100 text-xs font-semibold"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        Target Link (Optional)
                      </label>
                      <input
                        type="text"
                        value={announcementLink}
                        onChange={(e) => setAnnouncementLink(e.target.value)}
                        placeholder="https://t.me/yourchannel or website url"
                        className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-100 text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      Button Label (Optional)
                    </label>
                    <input
                      type="text"
                      value={announcementLinkText}
                      onChange={(e) => setAnnouncementLinkText(e.target.value)}
                      placeholder="e.g. Join Telegram, Visit, Learn More"
                      className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-100 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      Announcement / Ad Message
                    </label>
                    <textarea
                      value={announcementText}
                      onChange={(e) => setAnnouncementText(e.target.value)}
                      placeholder="e.g. 🔥 Join our official Telegram channel for updates, uncensored tools & prompts!"
                      rows={3}
                      className="w-full p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-100 text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  {/* Live Preview Box */}
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                      Live User Screen Preview
                    </label>
                    <div className="p-3 rounded-xl bg-zinc-900 text-white border border-zinc-800 shadow-md">
                      {announcementEnabled && announcementText.trim() ? (
                        <div className="flex items-center justify-between text-xs gap-2">
                          <div className="flex items-center gap-2 overflow-hidden">
                            <span className="shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[9px] font-black uppercase tracking-wider border border-emerald-400/30">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                              {announcementBadge || 'LIVE'}
                            </span>
                            <span className="truncate font-medium text-zinc-200">
                              {announcementText}
                            </span>
                          </div>
                          {announcementLink && (
                            <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500 text-zinc-950 font-bold text-[11px]">
                              {announcementLinkText || 'Visit'}
                              <ExternalLink className="w-3 h-3" />
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-2 text-zinc-500 text-xs italic">
                          Announcement currently off or message empty.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Save button */}
                  <div className="flex justify-end pt-2">
                    <button
                      id="save-announcement-btn"
                      type="submit"
                      disabled={isSavingAnnouncement}
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow-sm shadow-emerald-600/30 transition-colors disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      <span>{isSavingAnnouncement ? 'Publishing...' : 'Publish Live Announcement'}</span>
                    </button>
                  </div>
                </form>
              )}

               {/* TAB 3: GLOBAL SYSTEM PROMPT */}
              {activeTab === 'prompt' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                      Global System Prompt
                    </label>
                    <span className="text-[11px] font-mono text-zinc-400">
                      {promptText.length} chars
                    </span>
                  </div>

                  <div className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed bg-zinc-50 dark:bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800">
                    <p>
                      💡 <strong>Server-side Auto-Injection:</strong> Jo bhi custom prompt yahan save karenge, woh server ke database mein store ho jayega aur har user ki chat requests par autonomously apply hoga.
                    </p>
                  </div>

                  <textarea
                    id="admin-global-prompt-textarea"
                    value={promptText}
                    onChange={(e) => setPromptText(e.target.value)}
                    placeholder="Yahan apna custom prompt paste karein... (e.g. You are Xrivet WormGPT...)"
                    rows={9}
                    className="w-full p-3.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-900/70 text-zinc-900 dark:text-zinc-100 text-xs font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all resize-y"
                  />

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                    <button
                      id="admin-reset-prompt-btn"
                      type="button"
                      onClick={handleReset}
                      disabled={isSaving || !promptText}
                      className="w-full sm:w-auto px-4 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-40"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset to Default</span>
                    </button>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        id="admin-save-prompt-btn"
                        type="button"
                        onClick={handleSavePrompt}
                        disabled={isSaving}
                        className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm shadow-emerald-600/30 transition-colors disabled:opacity-50"
                      >
                        <Save className="w-4 h-4" />
                        <span>{isSaving ? 'Saving Globally...' : 'Save For All Users'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: API KEYS MANAGEMENT */}
              {activeTab === 'apikeys' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                        <Key className="w-4 h-4 text-emerald-500" />
                        <span>Xrivet WormGPT API Key Engine & Management</span>
                      </h4>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        Generate new API keys for any user, monitor request volumes, and instantly block or delete keys.
                      </p>
                    </div>
                    <button
                      id="refresh-admin-keys-btn"
                      type="button"
                      onClick={() => fetchAdminKeys(savedPassword)}
                      disabled={isFetchingKeys}
                      className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition-colors"
                      title="Refresh API Keys"
                    >
                      <RefreshCw className={`w-4 h-4 ${isFetchingKeys ? 'animate-spin text-emerald-500' : ''}`} />
                    </button>
                  </div>

                  {/* Generate New API Key Card */}
                  <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-50/20 dark:bg-emerald-950/10 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                      <Key className="w-3.5 h-3.5" />
                      <span>Nayi API Key Generate Karein</span>
                    </div>

                    <form onSubmit={handleGenerateAdminKey} className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end">
                      <div className="sm:col-span-6">
                        <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                          Key Title / Project Name
                        </label>
                        <input
                          id="admin-new-key-title-input"
                          type="text"
                          value={newAdminKeyTitle}
                          onChange={(e) => setNewAdminKeyTitle(e.target.value)}
                          placeholder="e.g. Python Trading Bot, Pentest Tool, Relay API"
                          className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>

                      <div className="sm:col-span-4">
                        <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                          Assign To User
                        </label>
                        <select
                          id="admin-new-key-user-select"
                          value={targetUserIdForKey}
                          onChange={(e) => setTargetUserIdForKey(e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                          <option value="">Admin (@rizo8)</option>
                          {userStats.users.map((u) => (
                            <option key={u.id} value={u.id}>
                              {u.name} (@{u.username})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="sm:col-span-2">
                        <button
                          id="admin-generate-key-btn"
                          type="submit"
                          disabled={isGeneratingAdminKey}
                          className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm shadow-emerald-600/30 transition-colors disabled:opacity-50"
                        >
                          <Key className="w-3.5 h-3.5" />
                          <span>{isGeneratingAdminKey ? 'Generating...' : 'Generate'}</span>
                        </button>
                      </div>
                    </form>

                    {/* Recently Generated Key Success Banner */}
                    {createdKeyString && (
                      <div className="p-3 rounded-lg bg-zinc-900 text-zinc-100 border border-emerald-500/40 space-y-2 mt-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Nayi Key Successfully Generate Ho Gayi:
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(createdKeyString);
                              setCopiedKeyId('created_key');
                              setTimeout(() => setCopiedKeyId(null), 2000);
                            }}
                            className="text-[11px] px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium flex items-center gap-1 transition-colors"
                          >
                            {copiedKeyId === 'created_key' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedKeyId === 'created_key' ? 'Copied!' : 'Copy Key'}</span>
                          </button>
                        </div>
                        <div className="font-mono text-xs bg-zinc-950 p-2 rounded border border-zinc-800 break-all text-emerald-300">
                          {createdKeyString}
                        </div>
                        <p className="text-[10px] text-zinc-400">
                          Use via standard OpenAI format: <code className="text-zinc-200">curl -H "Authorization: Bearer {createdKeyString.substring(0, 15)}..." http://localhost:3000/api/v1/chat/completions</code>
                        </p>
                      </div>
                    )}
                  </div>

                  {/* API Keys Table */}
                  <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
                    {adminKeys.length === 0 ? (
                      <div className="py-12 text-center text-zinc-400 text-xs">
                        {isFetchingKeys ? 'Loading API keys...' : 'Abhi tak kisi user ne koi API key generate nahi ki.'}
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-zinc-50 dark:bg-zinc-900/80 text-zinc-500 dark:text-zinc-400 font-semibold border-b border-zinc-200 dark:border-zinc-800">
                            <tr>
                              <th className="py-2.5 px-3">User</th>
                              <th className="py-2.5 px-3">Key Title &amp; Token</th>
                              <th className="py-2.5 px-3">Created</th>
                              <th className="py-2.5 px-3 text-center">Requests</th>
                              <th className="py-2.5 px-3 text-center">Status</th>
                              <th className="py-2.5 px-3 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                            {adminKeys.map((k) => (
                              <tr key={k.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/40 transition-colors">
                                <td className="py-2.5 px-3">
                                  <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                                    {k.name}
                                  </div>
                                  <div className="text-[10px] text-zinc-400 font-mono">
                                    @{k.username}
                                  </div>
                                </td>
                                <td className="py-2.5 px-3">
                                  <div className="font-semibold text-zinc-800 dark:text-zinc-200">
                                    {k.title}
                                  </div>
                                  <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-500/20 max-w-[180px] truncate">
                                      {k.key}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        navigator.clipboard.writeText(k.key);
                                        setCopiedKeyId(k.id);
                                        setTimeout(() => setCopiedKeyId(null), 2000);
                                      }}
                                      className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
                                      title="Copy API key"
                                    >
                                      {copiedKeyId === k.id ? (
                                        <Check className="w-3 h-3 text-emerald-500" />
                                      ) : (
                                        <Copy className="w-3 h-3" />
                                      )}
                                    </button>
                                  </div>
                                </td>
                                <td className="py-2.5 px-3 text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                                  {formatDate(k.createdAt)}
                                </td>
                                <td className="py-2.5 px-3 text-center">
                                  <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">
                                    {k.requestCount || 0}
                                  </span>
                                </td>
                                <td className="py-2.5 px-3 text-center">
                                  <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    k.status === 'active'
                                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                                      : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                                  }`}>
                                    {k.status.toUpperCase()}
                                  </span>
                                </td>
                                <td className="py-2.5 px-3 text-right">
                                  <div className="flex items-center justify-end gap-1.5">
                                    <button
                                      id={`toggle-key-${k.id}`}
                                      type="button"
                                      onClick={() => handleToggleKeyStatus(k.id)}
                                      className={`px-2 py-1 rounded-lg text-[11px] font-semibold border transition-colors ${
                                        k.status === 'active'
                                          ? 'text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 border-amber-500/20'
                                          : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border-emerald-500/20'
                                      }`}
                                    >
                                      {k.status === 'active' ? 'Block' : 'Activate'}
                                    </button>
                                    <button
                                      id={`delete-key-${k.id}`}
                                      type="button"
                                      onClick={() => handleDeleteAdminKey(k.id)}
                                      className="p-1 rounded-lg text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                                      title="Delete API key"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 text-[11px] text-zinc-400 flex items-center justify-between">
          <span>Xrivet WormGPT Administration Dashboard</span>
          <span className="flex items-center gap-1.5 text-zinc-400 font-medium">
            <Lock className="w-3 h-3 text-emerald-500" />
            <span>Private Access Only</span>
          </span>
        </div>
      </div>

      {/* Mobile Telemetry Modal */}
      <UserDeviceInfoModal
        isOpen={Boolean(selectedUserForDeviceModal)}
        onClose={() => setSelectedUserForDeviceModal(null)}
        user={selectedUserForDeviceModal}
      />
    </div>
  );
};
