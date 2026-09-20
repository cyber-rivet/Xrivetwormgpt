import React, { useState } from 'react';
import { 
  Plus, 
  MessageSquare, 
  Trash2, 
  Edit2, 
  Check, 
  X, 
  Pin, 
  Sun, 
  Moon, 
  Sliders,
  Skull, 
  Sparkles,
  Flame,
  Search,
  Bot,
  Shield,
  Terminal,
  Code2
} from 'lucide-react';
import { ChatSession, ServerHealthStatus, User } from '../types';
import { LogOut, User as UserIcon } from 'lucide-react';

interface SidebarProps {
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string) => void;
  onRenameSession: (id: string, newTitle: string) => void;
  onTogglePinSession: (id: string) => void;
  onClearAllSessions: () => void;
  serverStatus: ServerHealthStatus | null;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenSettings: () => void;
  onOpenAdmin?: () => void;
  onOpenWorkbench?: () => void;
  onOpenAgentStudio?: () => void;
  currentUser?: User | null;
  onUpdateUser?: (user: User) => void;
  onLogout?: () => void;
  isOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onRenameSession,
  onTogglePinSession,
  onClearAllSessions,
  serverStatus,
  darkMode,
  onToggleDarkMode,
  onOpenSettings,
  onOpenAdmin,
  onOpenWorkbench,
  onOpenAgentStudio,
  currentUser,
  onUpdateUser,
  onLogout,
  isOpen,
  onCloseMobile,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const startRename = (s: ChatSession, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(s.id);
    setEditingTitle(s.title);
  };

  const saveRename = (id: string, e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (editingTitle.trim()) {
      onRenameSession(id, editingTitle.trim());
    }
    setEditingId(null);
  };

  // Filter sessions
  const filteredSessions = sessions.filter(s => 
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.messages.some(m => m.content.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Group by time
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;

  const pinned = filteredSessions.filter(s => s.pinned);
  const nonPinned = filteredSessions.filter(s => !s.pinned);

  const today = nonPinned.filter(s => (now - s.updatedAt) < oneDay);
  const yesterday = nonPinned.filter(s => (now - s.updatedAt) >= oneDay && (now - s.updatedAt) < 2 * oneDay);
  const last7Days = nonPinned.filter(s => (now - s.updatedAt) >= 2 * oneDay && (now - s.updatedAt) < 7 * oneDay);
  const older = nonPinned.filter(s => (now - s.updatedAt) >= 7 * oneDay);

  const renderSessionItem = (session: ChatSession) => {
    const isActive = session.id === activeSessionId;
    const isEditing = session.id === editingId;

    return (
      <div
        key={session.id}
        id={`session-item-${session.id}`}
        onClick={() => {
          onSelectSession(session.id);
          onCloseMobile();
        }}
        className={`group relative flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors cursor-pointer select-none ${
          isActive
            ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-white font-medium shadow-xs'
            : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 hover:text-zinc-900 dark:hover:text-zinc-200'
        }`}
      >
        <div className="flex items-center gap-2.5 truncate min-w-0 pr-2">
          {session.pinned ? (
            <Pin className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400 fill-emerald-600/20 rotate-45" />
          ) : (
            <MessageSquare className="w-4 h-4 shrink-0 opacity-70" />
          )}

          {isEditing ? (
            <form onSubmit={(e) => saveRename(session.id, e)} className="flex items-center gap-1 w-full" onClick={(e) => e.stopPropagation()}>
              <input
                id={`rename-input-${session.id}`}
                type="text"
                autoFocus
                value={editingTitle}
                onChange={(e) => setEditingTitle(e.target.value)}
                onBlur={() => saveRename(session.id)}
                className="w-full bg-white dark:bg-zinc-900 px-1.5 py-0.5 rounded border border-emerald-500 text-xs text-zinc-900 dark:text-zinc-100 outline-none"
              />
              <button
                type="submit"
                id={`save-rename-${session.id}`}
                className="p-1 text-emerald-600 hover:text-emerald-500"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                id={`cancel-rename-${session.id}`}
                onClick={() => setEditingId(null)}
                className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </form>
          ) : (
            <span className="truncate text-[13.5px]">{session.title}</span>
          )}
        </div>

        {!isEditing && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              id={`pin-session-${session.id}`}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onTogglePinSession(session.id);
              }}
              title={session.pinned ? 'Unpin' : 'Pin'}
              className="p-1 rounded hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-100"
            >
              <Pin className={`w-3.5 h-3.5 ${session.pinned ? 'fill-current' : ''}`} />
            </button>
            <button
              id={`rename-btn-${session.id}`}
              type="button"
              onClick={(e) => startRename(session, e)}
              title="Rename"
              className="p-1 rounded hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-100"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              id={`delete-btn-${session.id}`}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteSession(session.id);
              }}
              title="Delete chat"
              className="p-1 rounded hover:bg-rose-100 dark:hover:bg-rose-950/50 text-zinc-500 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          id="sidebar-backdrop"
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden"
        />
      )}

      <aside
        id="app-sidebar"
        className={`fixed md:static inset-y-0 left-0 z-40 flex flex-col w-72 bg-zinc-50 dark:bg-[#18181b] border-r border-zinc-200 dark:border-zinc-800/80 transition-transform duration-200 ease-in-out select-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:w-72'
        }`}
      >
        {/* Top bar: Brand + New Chat */}
        <div className="p-3.5 border-b border-zinc-200/80 dark:border-zinc-800/80 space-y-3 bg-zinc-100/40 dark:bg-zinc-900/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold tracking-tight text-zinc-900 dark:text-white text-base">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 leading-tight">
                  <span>Xrivet WormGPT</span>
                  <span className="text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.2 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                    Uncensored
                  </span>
                </div>
                <span className="text-[10px] font-normal text-zinc-400 dark:text-zinc-500">Autonomous Intelligence</span>
              </div>
            </div>
            
            <button
              id="mobile-close-sidebar"
              type="button"
              onClick={onCloseMobile}
              className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 md:hidden cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <button
            id="new-chat-button"
            type="button"
            onClick={() => {
              onNewChat();
              onCloseMobile();
            }}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm shadow-sm shadow-emerald-600/20 transition-all cursor-pointer active:scale-[0.99] group"
          >
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
              <span>New Chat</span>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-700/60 text-emerald-100 opacity-80">
              ⌘K
            </span>
          </button>

          {/* Quick Search */}
          {sessions.length > 3 && (
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                id="search-sessions-input"
                type="text"
                placeholder="Search chats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-2.5 py-1.5 rounded-md bg-white dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/60 text-xs text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 outline-none focus:border-emerald-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Sessions list */}
        <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4 text-xs font-medium text-zinc-400 dark:text-zinc-500">
          {sessions.length === 0 ? (
            <div className="text-center py-8 px-4 text-zinc-400 dark:text-zinc-600 text-xs">
              No conversations yet. Start a new chat!
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className="text-center py-6 px-4 text-zinc-400 dark:text-zinc-600 text-xs">
              No matching chats found.
            </div>
          ) : (
            <>
              {pinned.length > 0 && (
                <div>
                  <div className="px-3 pb-1 text-[11px] uppercase tracking-wider font-semibold text-emerald-600 dark:text-emerald-400">
                    Pinned
                  </div>
                  <div className="space-y-0.5">
                    {pinned.map(renderSessionItem)}
                  </div>
                </div>
              )}

              {today.length > 0 && (
                <div>
                  <div className="px-3 pb-1 text-[11px] uppercase tracking-wider font-semibold">
                    Today
                  </div>
                  <div className="space-y-0.5">
                    {today.map(renderSessionItem)}
                  </div>
                </div>
              )}

              {yesterday.length > 0 && (
                <div>
                  <div className="px-3 pb-1 text-[11px] uppercase tracking-wider font-semibold">
                    Yesterday
                  </div>
                  <div className="space-y-0.5">
                    {yesterday.map(renderSessionItem)}
                  </div>
                </div>
              )}

              {last7Days.length > 0 && (
                <div>
                  <div className="px-3 pb-1 text-[11px] uppercase tracking-wider font-semibold">
                    Previous 7 Days
                  </div>
                  <div className="space-y-0.5">
                    {last7Days.map(renderSessionItem)}
                  </div>
                </div>
              )}

              {older.length > 0 && (
                <div>
                  <div className="px-3 pb-1 text-[11px] uppercase tracking-wider font-semibold">
                    Older
                  </div>
                  <div className="space-y-0.5">
                    {older.map(renderSessionItem)}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Bottom Footer info & controls */}
        <div className="p-3 border-t border-zinc-200 dark:border-zinc-800/80 bg-zinc-100/70 dark:bg-zinc-900/50 space-y-2">
          {/* Active status */}
          <div className="px-2.5 py-1.5 rounded-lg bg-zinc-200/60 dark:bg-zinc-800/70 text-[11.5px] flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-medium text-zinc-700 dark:text-zinc-300 truncate">
              <span className="w-2 h-2 rounded-full shrink-0 bg-emerald-500 animate-pulse" />
              <span className="truncate font-semibold">
                Xrivet WormGPT
              </span>
            </span>
            <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold uppercase">
              Online
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1.5 pt-1">
            <button
              id="toggle-dark-mode-btn"
              type="button"
              onClick={onToggleDarkMode}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors justify-center cursor-pointer"
              title="Toggle Theme"
            >
              {darkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-zinc-600" />}
              <span>{darkMode ? 'Light' : 'Dark'}</span>
            </button>

            <button
              id="open-settings-btn"
              type="button"
              onClick={onOpenSettings}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors justify-center cursor-pointer"
              title="System Prompt & Model Parameters"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Settings</span>
            </button>

            {onOpenAgentStudio && (
              <button
                id="sidebar-agent-studio-btn"
                type="button"
                onClick={onOpenAgentStudio}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 transition-colors justify-center cursor-pointer"
                title="AI Agent Studio"
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>Agent Studio</span>
              </button>
            )}

            {onOpenWorkbench && (
              <button
                id="sidebar-workbench-btn"
                type="button"
                onClick={onOpenWorkbench}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-teal-600 dark:text-teal-400 hover:bg-teal-500/10 transition-colors justify-center cursor-pointer"
                title="Cyber Security Workbench"
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>Workbench</span>
              </button>
            )}

            {currentUser?.username?.toLowerCase() === 'rizo8' && onOpenAdmin && (
              <button
                id="sidebar-admin-btn"
                type="button"
                onClick={onOpenAdmin}
                className="col-span-2 flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 border border-emerald-500/20 transition-colors cursor-pointer"
                title="Admin Panel"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Admin Dashboard</span>
              </button>
            )}

            <button
              id="panic-wipe-btn"
              type="button"
              onClick={() => { 
                if(window.confirm("FATAL WARNING: Erase all traces, chats, and self-destruct local session?")) { 
                  localStorage.clear(); 
                  sessionStorage.clear(); 
                  window.location.reload(); 
                } 
              }}
              className="col-span-2 flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold text-red-600 dark:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
              title="Anti-Forensics Panic Wipe"
            >
              <Skull className="w-3.5 h-3.5 animate-pulse" />
              <span>Zero Trace (Panic Wipe)</span>
            </button>
          </div>



          {/* User Details & Logout in Sidebar */}
          {currentUser && (
            <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs uppercase border border-emerald-500/30 shrink-0">
                  {currentUser.name?.[0] || currentUser.username?.[0] || 'U'}
                </div>
                <div className="min-w-0 leading-tight">
                  <div className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate font-mono">
                    @{currentUser.username}
                  </div>
                </div>
              </div>
              {onLogout && (
                <button
                  id="sidebar-user-logout-btn"
                  type="button"
                  onClick={onLogout}
                  className="p-1.5 text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors"
                  title="Log out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          {sessions.length > 0 && (
            <button
              id="clear-all-sessions-btn"
              type="button"
              onClick={onClearAllSessions}
              className="w-full text-center py-1 text-[11px] text-zinc-400 hover:text-rose-500 transition-colors"
            >
              Clear conversation history
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
