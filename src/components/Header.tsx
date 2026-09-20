import React, { useState, useRef, useEffect } from 'react';
import { 
  Menu, 
  Download, 
  RotateCcw, 
  Sliders, 
  Sparkles,
  Flame,
  ChevronDown,
  Shield,
  Terminal,
  Code2,
  Key,
  LogOut,
  MoreVertical,
  Plus,
  X
} from 'lucide-react';
import { ChatSession, ServerHealthStatus, User } from '../types';

interface HeaderProps {
  onToggleSidebar: () => void;
  activeSession: ChatSession | null;
  onClearSession: () => void;
  onExportSession: () => void;
  onOpenSettings: () => void;
  onOpenAdmin?: () => void;
  onOpenWorkbench?: () => void;
  onOpenAgentStudio?: () => void;
  onOpenApiKeys?: () => void;
  currentUser?: User | null;
  onLogout?: () => void;
  serverStatus: ServerHealthStatus | null;
  onNewChat?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  activeSession,
  onClearSession,
  onExportSession,
  onOpenSettings,
  onOpenAdmin,
  onOpenWorkbench,
  onOpenAgentStudio,
  onOpenApiKeys,
  currentUser,
  onLogout,
  serverStatus,
  onNewChat,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close mobile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMobileMenuOpen(false);
      }
    };
    if (mobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [mobileMenuOpen]);

  return (
    <header
      id="app-header"
      className="h-14 border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white/90 dark:bg-[#0f0f11]/90 backdrop-blur-xl sticky top-0 z-30 px-2.5 sm:px-4 md:px-5 flex items-center justify-between transition-colors shadow-xs select-none"
    >
      {/* Left: Mobile sidebar toggle + Xrivet WormGPT Uncensored Brand */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0 shrink-0">
        <button
          id="toggle-sidebar-btn"
          type="button"
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer shrink-0"
          title="Toggle sidebar"
          aria-label="Toggle navigation sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Brand Title: Xrivet WormGPT Uncensored */}
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-sm shadow-emerald-500/20 shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="font-bold tracking-tight text-sm sm:text-base text-zinc-900 dark:text-white whitespace-nowrap">
              Xrivet WormGPT
            </span>
            {/* Desktop badge */}
            <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shadow-xs whitespace-nowrap shrink-0">
              <Flame className="w-3 h-3 text-emerald-500 fill-emerald-500/20" />
              Uncensored
              <span className="border-l border-emerald-500/30 pl-1 ml-1">
                Credits: Unlimited
              </span>
            </span>
            {/* Mobile compact badge */}
            <span className="md:hidden inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 text-[9px] font-bold uppercase tracking-wider shrink-0" title="Uncensored v4.5">
              <Flame className="w-2.5 h-2.5 text-emerald-500 fill-emerald-500/20" />
              v4.5
              <span className="border-l border-emerald-500/30 pl-0.5 ml-0.5">
                Credits: ∞
              </span>
            </span>
          </div>
        </div>

        {/* Active conversation title breadcrumb (Desktop xl+) */}
        {activeSession && activeSession.messages.length > 0 && (
          <div className="hidden xl:flex items-center gap-2 pl-3 border-l border-zinc-200 dark:border-zinc-800 min-w-0">
            <span className="truncate text-xs font-normal text-zinc-400 dark:text-zinc-500 max-w-[180px]">
              {activeSession.title}
            </span>
          </div>
        )}
      </div>

      {/* Right on Desktop (md and above): Direct action buttons */}
      <div className="hidden md:flex items-center gap-1.5 shrink-0">
        {/* Model status indicator badge */}
        <button
          id="model-indicator-badge"
          type="button"
          onClick={onOpenSettings}
          className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-zinc-100 dark:bg-zinc-800/90 hover:bg-zinc-200/80 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/70 text-xs font-semibold text-zinc-800 dark:text-zinc-200 shadow-xs transition-all cursor-pointer shrink-0"
          title="Click to view model & system prompt settings"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-mono text-[11.5px]">{serverStatus?.activeModel || 'Xrivet WormGPT'}</span>
          <ChevronDown className="w-3 h-3 text-zinc-400 ml-0.5" />
        </button>

        {/* AI Agent Studio Button */}
        {onOpenAgentStudio && (
          <button
            onClick={onOpenAgentStudio}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-500 text-xs font-mono font-bold transition-all shadow-xs active:scale-95 shrink-0 cursor-pointer"
            title="Open AI Agent Coder (Build Apps)"
          >
            <Code2 className="w-4 h-4 shrink-0" />
            <span>AI AGENT</span>
          </button>
        )}

        {/* Workbench */}
        {onOpenWorkbench && (
          <button
            id="header-workbench-btn"
            type="button"
            onClick={onOpenWorkbench}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-600 dark:text-teal-400 border border-teal-500/30 text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0"
            title="Cyber Security Workbench (Recon, Encoders, Phishing URL Inspector)"
          >
            <Terminal className="w-4 h-4 text-teal-500 shrink-0" />
            <span className="hidden xl:inline">Workbench</span>
          </button>
        )}



        {/* API Keys */}
        {currentUser && onOpenApiKeys && (
          <button
            id="header-apikeys-btn"
            type="button"
            onClick={onOpenApiKeys}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold transition-colors cursor-pointer shrink-0"
            title="Manage API Keys & Whitelabeling"
          >
            <Key className="w-4 h-4 text-emerald-500 shrink-0" />
            <span className="hidden xl:inline">API Keys</span>
          </button>
        )}

        {/* Admin */}
        {currentUser?.username?.toLowerCase() === 'rizo8' && onOpenAdmin && (
          <button
            id="header-admin-btn"
            type="button"
            onClick={onOpenAdmin}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-emerald-500/20 text-xs font-semibold transition-colors cursor-pointer shrink-0"
            title="Admin Panel"
          >
            <Shield className="w-4 h-4 shrink-0" />
            <span className="hidden xl:inline">Admin</span>
          </button>
        )}

        {/* Export & Clear if session active */}
        {activeSession && activeSession.messages.length > 0 && (
          <div className="flex items-center gap-1 shrink-0">
            <button
              id="export-chat-btn"
              type="button"
              onClick={onExportSession}
              className="p-2 rounded-xl text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-800 dark:hover:text-zinc-100 transition-colors shrink-0 cursor-pointer"
              title="Export chat as Markdown (.md)"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              id="clear-active-chat-btn"
              type="button"
              onClick={onClearSession}
              className="p-2 rounded-xl text-zinc-500 dark:text-zinc-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 dark:hover:text-rose-400 transition-colors shrink-0 cursor-pointer"
              title="Clear current messages"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Settings */}
        <button
          id="header-settings-btn"
          type="button"
          onClick={onOpenSettings}
          className="p-2 rounded-xl text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-800 dark:hover:text-zinc-100 transition-colors shrink-0 cursor-pointer"
          title="Settings & System Prompt"
        >
          <Sliders className="w-4 h-4" />
        </button>

        {/* User profile & Logout */}
        {currentUser && (
          <div className="flex items-center gap-1.5 pl-1.5 border-l border-zinc-200 dark:border-zinc-800 shrink-0">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/60">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-[10px] uppercase">
                {currentUser.name?.[0] || currentUser.username?.[0] || 'U'}
              </span>
              <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 max-w-[90px] truncate">
                {currentUser.name || currentUser.username}
              </span>
            </div>
            {onLogout && (
              <button
                id="header-logout-btn"
                type="button"
                onClick={onLogout}
                className="p-1.5 rounded-xl text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors shrink-0 cursor-pointer"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>


        {/* Credits Badge (Desktop) */}
        {currentUser && (
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 cursor-pointer hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors" title="Invite friends to get more credits!" onClick={() => {
            const link = `${window.location.origin}/?ref=${currentUser.referralCode || ''}`;
            navigator.clipboard.writeText(link);
            alert("Invite link copied! Dost ko bhejein aur 5 credits free paayen.");
          }}>
            <Flame className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
              Unlimited Credits
            </span>
          </div>
        )}

      {/* Right on Mobile (< md): Clean, non-overlapping controls + More Menu */}
      <div className="md:hidden flex items-center gap-1 shrink-0" ref={menuRef}>
        {/* Quick New Chat Button on mobile */}
        {onNewChat && (
          <button
            type="button"
            onClick={onNewChat}
            className="p-2 rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shrink-0 cursor-pointer"
            title="Start new chat"
          >
            <Plus className="w-4 h-4 text-emerald-500" />
          </button>
        )}

        {/* Compact AI Agent Studio Icon Button on mobile */}
        {onOpenAgentStudio && (
          <button
            onClick={onOpenAgentStudio}
            className="p-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 shadow-xs transition-colors shrink-0 cursor-pointer"
            title="Open AI Agent Studio"
          >
            <Code2 className="w-4 h-4" />
          </button>
        )}



        {/* Mobile More Options Dropdown Toggle */}
        <button
          id="mobile-header-more-btn"
          type="button"
          onClick={() => setMobileMenuOpen(prev => !prev)}
          className={`p-2 rounded-xl transition-colors shrink-0 cursor-pointer ${
            mobileMenuOpen 
              ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100' 
              : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
          }`}
          title="More tools and actions"
        >
          {mobileMenuOpen ? <X className="w-4 h-4" /> : <MoreVertical className="w-4 h-4" />}
        </button>

        {/* Mobile Dropdown Popover */}
        {mobileMenuOpen && (
          <div className="absolute right-2 top-14 w-64 max-w-[calc(100vw-16px)] bg-white dark:bg-[#141417] border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
            
            {/* Status Header */}
            <div className="px-2.5 py-2 mb-1 rounded-xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                {serverStatus?.activeModel || 'Xrivet WormGPT'}
              </span>
              {currentUser && (
                <button 
                  onClick={() => {
                    const link = `${window.location.origin}/?ref=${currentUser.referralCode || ''}`;
                    navigator.clipboard.writeText(link);
                    alert("Invite link copied! Dost ko bhejein aur 5 credits free paayen.");
                  }}
                  className="flex items-center gap-1 bg-emerald-100 dark:bg-emerald-900/40 px-2 py-0.5 rounded-full text-[10px] text-emerald-700 dark:text-emerald-400 font-bold"
                >
                  <Flame className="w-3 h-3" />
                  Unlimited Credits
                </button>
              )}
            </div>


            <div className="space-y-1 text-xs font-medium">
              {onOpenWorkbench && (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenWorkbench();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-teal-600 dark:text-teal-400 hover:bg-teal-500/10 transition-colors text-left"
                >
                  <Terminal className="w-4 h-4 shrink-0" />
                  <span>Cyber Security Workbench</span>
                </button>
              )}



              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenSettings();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-left"
              >
                <Sliders className="w-4 h-4 shrink-0 text-zinc-500" />
                <span>Settings &amp; System Prompt</span>
              </button>

              {currentUser && onOpenApiKeys && (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenApiKeys();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-left"
                >
                  <Key className="w-4 h-4 shrink-0 text-emerald-500" />
                  <span>API Keys &amp; Whitelabeling</span>
                </button>
              )}

              {currentUser?.username?.toLowerCase() === 'rizo8' && onOpenAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAdmin();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 transition-colors text-left"
                >
                  <Shield className="w-4 h-4 shrink-0" />
                  <span>Admin Panel</span>
                </button>
              )}

              {activeSession && activeSession.messages.length > 0 && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onExportSession();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-left"
                  >
                    <Download className="w-4 h-4 shrink-0 text-zinc-500" />
                    <span>Export Chat as .md</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onClearSession();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-colors text-left"
                  >
                    <RotateCcw className="w-4 h-4 shrink-0" />
                    <span>Clear Active Chat</span>
                  </button>
                </>
              )}
            </div>

            {/* User Details & Logout in Mobile Menu */}
            {currentUser && (
              <div className="mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between px-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs uppercase shrink-0">
                    {currentUser.name?.[0] || currentUser.username?.[0] || 'U'}
                  </span>
                  <div className="min-w-0 truncate">
                    <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate leading-tight">
                      {currentUser.name || currentUser.username}
                    </p>
                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate font-mono">
                      @{currentUser.username}
                    </p>
                  </div>
                </div>
                {onLogout && (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onLogout();
                    }}
                    className="p-1.5 text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors shrink-0"
                    title="Log out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};


