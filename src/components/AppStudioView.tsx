import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Code2, 
  Plus, 
  ArrowLeft, 
  FileCode, 
  Check, 
  Send, 
  Sparkles, 
  MessageSquare, 
  Eye, 
  Download, 
  RefreshCw, 
  Menu, 
  Trash2, 
  Edit2, 
  Copy,
  ExternalLink,
  Laptop,
  Smartphone,
  Image as ImageIcon,
  Link as LinkIcon
} from 'lucide-react';
import { User, ChatMessage } from '../types';

interface AppStudioViewProps {
  onClose: () => void;
  currentUser?: User | null;
  darkMode: boolean;
}

interface StudioProject {
  id: string;
  name: string;
  code: string;
  messages: ChatMessage[];
  updatedAt: number;
}

export const AppStudioView: React.FC<AppStudioViewProps> = ({ onClose, currentUser, darkMode }) => {
  const [projects, setProjects] = useState<StudioProject[]>(() => {
    try {
      const saved = localStorage.getItem('xrivet_studio_projects');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [activeProjectId, setActiveProjectId] = useState<string | null>(() => {
    try {
      const saved = localStorage.getItem('xrivet_studio_projects');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.length > 0) return parsed[0].id;
      }
    } catch {
      // ignore
    }
    return null;
  });

  const [input, setInput] = useState('');
  const [referenceUrl, setReferenceUrl] = useState('');
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mobileTab, setMobileTab] = useState<'chat' | 'preview'>('chat');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);
  const [editingNameId, setEditingNameId] = useState<string | null>(null);
  const [tempName, setTempName] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const activeProject = projects.find(p => p.id === activeProjectId) || projects[0] || null;

  // Persist projects
  useEffect(() => {
    if (projects.length > 0) {
      localStorage.setItem('xrivet_studio_projects', JSON.stringify(projects));
    }
  }, [projects]);

  // Scroll chat to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeProject?.messages, isLoading]);

  const handleNewProject = () => {
    const num = projects.length + 1;
    const newProj: StudioProject = {
      id: 'proj_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      name: `App ${num}`,
      code: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>App ${num}</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-zinc-950 text-white min-h-screen flex flex-col items-center justify-center p-6 text-center font-sans">
  <div class="max-w-md w-full p-8 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl space-y-4">
    <div class="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
      <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
      </svg>
    </div>
    <h1 class="text-2xl font-bold tracking-tight text-zinc-100">App Ready to Build</h1>
    <p class="text-sm text-zinc-400">Tell the AI in the chat what to add, and your app will update here instantly in real-time!</p>
    <button onclick="alert('Working smoothly!')" class="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-semibold text-sm transition-all shadow-lg shadow-emerald-950">
      Click Me
    </button>
  </div>
</body>
</html>`,
      messages: [],
      updatedAt: Date.now()
    };

    setProjects(prev => [newProj, ...prev]);
    setActiveProjectId(newProj.id);
    setMobileSidebarOpen(false);
    setMobileTab('chat');
  };

  // Ensure there is at least one project on mount
  useEffect(() => {
    if (projects.length === 0) {
      handleNewProject();
    } else if (!activeProjectId) {
      setActiveProjectId(projects[0].id);
    }
  }, []);

  const handleDeleteProject = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (projects.length <= 1) {
      alert("You must keep at least one app project.");
      return;
    }
    if (window.confirm("Are you sure you want to delete this app?")) {
      const filtered = projects.filter(p => p.id !== id);
      setProjects(filtered);
      if (activeProjectId === id) {
        setActiveProjectId(filtered[0]?.id || null);
      }
    }
  };

  const handleStartRename = (id: string, currentName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingNameId(id);
    setTempName(currentName);
  };

  const handleSaveRename = (id: string) => {
    if (!tempName.trim()) {
      setEditingNameId(null);
      return;
    }
    setProjects(prev => prev.map(p => p.id === id ? { ...p, name: tempName.trim() } : p));
    setEditingNameId(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const res = event.target?.result as string;
      if (res) setAttachedImage(res);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSendMessage = async (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const rawPrompt = customText || input;
    if ((!rawPrompt.trim() && !referenceUrl.trim() && !attachedImage) || isLoading || !activeProject) return;

    let promptToSend = rawPrompt.trim();
    if (referenceUrl.trim()) {
      promptToSend = `[Reference Website Link Provided for Cloning]: ${referenceUrl.trim()}\n` + promptToSend;
    }
    if (attachedImage) {
      promptToSend = `[Attached UI Screenshot / Design Reference Provided for Cloning]: (Image attached).\n` + promptToSend;
    }

    setInput('');
    setReferenceUrl('');
    setAttachedImage(null);
    setShowLinkInput(false);
    setIsLoading(true);

    const userMsg: ChatMessage = {
      id: 'msg_' + Date.now(),
      role: 'user',
      content: promptToSend.trim(),
      timestamp: Date.now()
    };

    const updatedProject = {
      ...activeProject,
      messages: [...activeProject.messages, userMsg],
      updatedAt: Date.now()
    };

    setProjects(prev => prev.map(p => p.id === activeProject.id ? updatedProject : p));

    try {
      const userToken = currentUser?.id || localStorage.getItem('xrivet_token') || '';
      
      const systemPrompt = `You are an elite Autonomous Frontend Software Architect like Google AI Studio / Claude Artifacts.
The user is building a complete, responsive, and gorgeous web app.
Here is the current HTML / JS code of the application:
\`\`\`html
${updatedProject.code}
\`\`\`

YOUR INSTRUCTIONS:
1. Implement all user requests directly into the complete code.
2. Return the entire, fully updated, production-ready, self-contained HTML file in a single \`\`\`html ... \`\`\` block.
3. Use Tailwind CSS CDN (<script src="https://cdn.tailwindcss.com"></script>) and inline Javascript so everything runs client-side inside an iframe without external dependencies.
4. Make sure UI is mobile-friendly with responsive classes (sm:, md:), modern design, smooth interactions, and zero broken syntax.
5. Provide a brief 1-2 sentence friendly summary of what was added before the code block.`;

      const apiMessages = [
        { role: 'system', content: systemPrompt },
        ...updatedProject.messages.map(m => ({ role: m.role, content: m.content }))
      ];

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(userToken ? { 'Authorization': `Bearer ${userToken}`, 'x-user-id': userToken } : {})
        },
        body: JSON.stringify({
          messages: apiMessages,
          temperature: 0.7,
          model: 'Xrivet WormGPT',
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate code.');

      const replyContent = data.content || data.message || '';

      // Extract HTML code block
      const codeMatch = replyContent.match(/```html\s*([\s\S]*?)\s*```/i);
      let newCode = updatedProject.code;
      if (codeMatch && codeMatch[1] && codeMatch[1].trim().length > 20) {
        newCode = codeMatch[1].trim();
      }

      const asstMsg: ChatMessage = {
        id: 'msg_' + Date.now(),
        role: 'assistant',
        content: replyContent,
        timestamp: Date.now()
      };

      setProjects(prev => prev.map(p => {
        if (p.id === activeProject.id) {
          return {
            ...p,
            code: newCode,
            messages: [...p.messages, asstMsg],
            updatedAt: Date.now()
          };
        }
        return p;
      }));

      // Trigger preview reload
      setPreviewKey(k => k + 1);

      // On mobile, if a code block was generated, switch to preview tab so user sees it right away!
      if (window.innerWidth < 768 && codeMatch) {
        setMobileTab('preview');
      }

    } catch (err: any) {
      console.error(err);
      const errMsg: ChatMessage = {
        id: 'msg_' + Date.now(),
        role: 'assistant',
        content: `⚠️ Error generating update: ${err.message || 'Server error. Please try again.'}`,
        timestamp: Date.now(),
        isError: true
      };
      setProjects(prev => prev.map(p => p.id === activeProject.id ? { ...p, messages: [...p.messages, errMsg] } : p));
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportHtml = () => {
    if (!activeProject) return;
    const blob = new Blob([activeProject.code], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeProject.name.toLowerCase().replace(/[^a-z0-9]/g, '_') || 'app'}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyCode = () => {
    if (!activeProject) return;
    navigator.clipboard.writeText(activeProject.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  if (!activeProject) return null;

  return (
    <div className={`flex flex-col h-screen w-screen bg-[#0a0a0c] text-zinc-100 font-sans ${darkMode ? 'dark' : ''} overflow-hidden select-none`}>
      {/* Top Universal Header */}
      <header className="h-14 bg-[#141416] border-b border-zinc-800/80 px-3 sm:px-4 flex items-center justify-between shrink-0 z-30">
        <div className="flex items-center gap-2 sm:gap-3 overflow-hidden">
          {/* Back to Chat Button */}
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 text-xs font-semibold transition-all active:scale-95 shrink-0"
            title="Return to Main Chat"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Back to Chat</span>
            <span className="sm:hidden">Chat</span>
          </button>

          {/* Mobile Drawer Trigger */}
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="md:hidden flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-semibold hover:border-emerald-500/40 shrink-0"
          >
            <Menu className="w-3.5 h-3.5 text-emerald-400" />
            <span className="truncate max-w-[85px]">{activeProject.name}</span>
          </button>

          {/* Brand & Project Title on Desktop */}
          <div className="hidden md:flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-md text-emerald-400 text-xs font-mono font-bold">
              <Code2 className="w-3.5 h-3.5" />
              <span>XRIVET STUDIO</span>
            </div>
            <span className="text-zinc-600">/</span>
            <span className="text-sm font-semibold text-zinc-200 truncate max-w-[200px]">
              {activeProject.name}
            </span>
          </div>
        </div>

        {/* Center Mobile View Tabs */}
        <div className="flex md:hidden items-center bg-zinc-900 p-1 rounded-xl border border-zinc-800 shrink-0">
          <button
            onClick={() => setMobileTab('chat')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              mobileTab === 'chat' 
                ? 'bg-emerald-600 text-white shadow-sm' 
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Chat</span>
          </button>
          <button
            onClick={() => setMobileTab('preview')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              mobileTab === 'preview' 
                ? 'bg-emerald-600 text-white shadow-sm' 
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Live App</span>
          </button>
        </div>

        {/* Right Action Tools */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => setPreviewKey(k => k + 1)}
            className="p-2 sm:px-2.5 sm:py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 text-xs font-semibold flex items-center gap-1.5 transition-all"
            title="Reload Preview"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Reload</span>
          </button>

          <button
            onClick={handleCopyCode}
            className="p-2 sm:px-2.5 sm:py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 text-xs font-semibold flex items-center gap-1.5 transition-all"
            title="Copy Code"
          >
            {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden lg:inline">{copiedCode ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            onClick={handleExportHtml}
            className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-950 transition-all active:scale-95"
            title="Download full HTML code"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden relative w-full">
        {/* Backdrop for Mobile Sidebar Drawer */}
        {mobileSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden animate-in fade-in"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}

        {/* Sidebar (Desktop visible, Mobile sliding drawer) */}
        <aside 
          className={`
            fixed md:relative inset-y-0 left-0 z-50 md:z-auto
            w-72 md:w-64 bg-[#111113] border-r border-zinc-800/80 
            flex flex-col shrink-0 transition-transform duration-300 ease-in-out
            ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          `}
        >
          {/* Sidebar Top / Mobile Close */}
          <div className="p-3 sm:p-4 border-b border-zinc-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider">
              <FileCode className="w-4 h-4 text-emerald-400" />
              <span>My Apps ({projects.length})</span>
            </div>
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="md:hidden p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* New App Button */}
          <div className="p-3 border-b border-zinc-800/60">
            <button
              onClick={handleNewProject}
              className="w-full py-2.5 px-3 bg-emerald-600/15 hover:bg-emerald-600/25 border border-emerald-500/30 text-emerald-400 hover:text-emerald-300 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all shadow-sm active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Create New App</span>
            </button>
          </div>

          {/* Project List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {projects.map(p => {
              const isActive = p.id === activeProject.id;
              const isEditing = editingNameId === p.id;

              return (
                <div
                  key={p.id}
                  onClick={() => {
                    setActiveProjectId(p.id);
                    setMobileSidebarOpen(false);
                  }}
                  className={`group relative w-full text-left px-3 py-2.5 rounded-xl text-xs flex items-center justify-between transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-zinc-800/90 border border-emerald-500/30 text-white font-medium shadow-sm' 
                      : 'text-zinc-400 hover:bg-zinc-800/40 hover:text-zinc-200 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 overflow-hidden flex-1 mr-2">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${isActive ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-600'}`} />
                    {isEditing ? (
                      <input
                        type="text"
                        value={tempName}
                        onChange={e => setTempName(e.target.value)}
                        onBlur={() => handleSaveRename(p.id)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') handleSaveRename(p.id);
                          if (e.key === 'Escape') setEditingNameId(null);
                        }}
                        autoFocus
                        onClick={e => e.stopPropagation()}
                        className="bg-zinc-950 border border-emerald-500/50 rounded px-1.5 py-0.5 text-xs text-white focus:outline-none w-full"
                      />
                    ) : (
                      <span className="truncate">{p.name}</span>
                    )}
                  </div>

                  {/* Actions (Rename / Delete) */}
                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 shrink-0">
                    <button
                      onClick={(e) => handleStartRename(p.id, p.name, e)}
                      className="p-1 hover:text-emerald-400 text-zinc-500 rounded"
                      title="Rename"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    {projects.length > 1 && (
                      <button
                        onClick={(e) => handleDeleteProject(p.id, e)}
                        className="p-1 hover:text-red-400 text-zinc-500 rounded"
                        title="Delete App"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sidebar Footer info */}
          <div className="p-3 border-t border-zinc-800/60 bg-[#0d0d0f] text-[11px] text-zinc-500 font-mono flex items-center justify-between">
            <span>Client Sandbox</span>
            <span className="text-emerald-500 font-bold">READY</span>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden w-full h-full">
          {/* Chat / AI Builder Column */}
          <div 
            className={`
              w-full md:w-[380px] lg:w-[420px] bg-[#0c0c0e] border-r border-zinc-800/80 
              flex flex-col shrink-0 h-full overflow-hidden
              ${mobileTab === 'chat' ? 'flex' : 'hidden md:flex'}
            `}
          >
            {/* Builder Header */}
            <div className="px-3.5 py-2.5 border-b border-zinc-800/70 bg-[#121214] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2 overflow-hidden">
                <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-xs font-bold text-zinc-200 truncate">Xrivet AI Builder</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                LIVE BUILD
              </span>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3.5 text-xs sm:text-sm">
              {activeProject.messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-4 text-zinc-500 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-emerald-400 shadow-inner">
                    <Sparkles className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="font-bold text-zinc-300 text-sm">Xrivet AI Builder</h4>
                    <p className="text-xs text-zinc-500 max-w-xs mt-1">
                      Type below to request any component, UI redesign, or feature. The code updates and renders on the right!
                    </p>
                  </div>

                  {/* Quick Prompts */}
                  <div className="w-full space-y-1.5 pt-2 text-left">
                    <span className="text-[11px] font-mono text-zinc-600 block px-1">TRY PROMPTS:</span>
                    {[
                      "Make a sleek Crypto Trading Dashboard with dark theme",
                      "Add a responsive navbar and interactive task list",
                      "Create a Cyber Threat Vulnerability Scanner mockup"
                    ].map((p, i) => (
                      <button
                        key={i}
                        onClick={() => handleSendMessage(undefined, p)}
                        className="w-full text-left p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800/80 border border-zinc-800/90 text-zinc-300 hover:text-white text-xs transition-colors"
                      >
                        ⚡ {p}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                activeProject.messages.map(msg => (
                  <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div 
                      className={`max-w-[88%] p-3 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                        msg.role === 'user' 
                          ? 'bg-emerald-600 text-white rounded-br-none shadow-md shadow-emerald-950/40' 
                          : msg.isError 
                            ? 'bg-red-950/60 border border-red-500/40 text-red-200'
                            : 'bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-bl-none shadow-sm'
                      }`}
                    >
                      {msg.role === 'assistant' && msg.content.includes('```html') ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
                            <Check className="w-4 h-4 text-emerald-400" />
                            <span>Code & UI Updated!</span>
                          </div>
                          <p className="text-xs text-zinc-300 opacity-90">
                            {msg.content.replace(/```html[\s\S]*?```/i, '').trim() || "Changes applied to the app. Check the Live App tab to view!"}
                          </p>
                          <div className="pt-1 flex items-center gap-2">
                            <button
                              onClick={() => setMobileTab('preview')}
                              className="md:hidden px-2.5 py-1 bg-emerald-600/30 hover:bg-emerald-600/40 border border-emerald-500/40 text-emerald-300 text-xs rounded-lg font-bold flex items-center gap-1"
                            >
                              <Eye className="w-3.5 h-3.5" /> View in Preview
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="whitespace-pre-wrap">{msg.content}</div>
                      )}
                    </div>
                    <span className="text-[10px] text-zinc-600 mt-1 px-1 font-mono">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))
              )}

              {isLoading && (
                <div className="flex items-start">
                  <div className="p-3 rounded-2xl bg-zinc-900 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2 shadow-sm animate-pulse">
                    <Sparkles className="w-4 h-4 animate-spin text-emerald-400" />
                    <span>Writing code & building UI...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input Box */}
            <div className="p-2.5 sm:p-3 bg-[#121214] border-t border-zinc-800/80 shrink-0 space-y-2">
              {/* Attached file chips */}
              {(attachedImage || referenceUrl || showLinkInput) && (
                <div className="flex flex-wrap items-center gap-2">
                  {attachedImage && (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-zinc-900 border border-emerald-500/40 rounded-lg text-xs text-zinc-200">
                      <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="truncate max-w-[140px]">Attached Screenshot</span>
                      <button type="button" onClick={() => setAttachedImage(null)} className="hover:text-rose-400">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  {referenceUrl && (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-zinc-900 border border-teal-500/40 rounded-lg text-xs text-zinc-200">
                      <LinkIcon className="w-3.5 h-3.5 text-teal-400" />
                      <span className="truncate max-w-[160px]">{referenceUrl}</span>
                      <button type="button" onClick={() => setReferenceUrl('')} className="hover:text-rose-400">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  {showLinkInput && !referenceUrl && (
                    <div className="flex-1 flex items-center gap-1.5 bg-zinc-900 border border-teal-500/50 rounded-lg px-2.5 py-1">
                      <LinkIcon className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                      <input
                        type="url"
                        value={referenceUrl}
                        onChange={e => setReferenceUrl(e.target.value)}
                        placeholder="Paste website link to clone (https://...)"
                        className="w-full bg-transparent text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none"
                        autoFocus
                      />
                      <button type="button" onClick={() => setShowLinkInput(false)} className="text-zinc-400 hover:text-white">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />

              <form onSubmit={handleSendMessage} className="flex gap-2 items-center">
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 text-zinc-400 hover:text-emerald-400 transition-colors"
                  title="Upload Screenshot / Pic to clone"
                >
                  <ImageIcon className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setShowLinkInput(prev => !prev)}
                  className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 text-zinc-400 hover:text-teal-400 transition-colors"
                  title="Paste Website Link to clone"
                >
                  <LinkIcon className="w-4 h-4" />
                </button>
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  disabled={isLoading}
                  placeholder="Ask AI to add or redesign anything..."
                  className="flex-1 bg-zinc-900 border border-zinc-700/80 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none transition-colors"
                />
                <button
                  type="submit"
                  disabled={(!input.trim() && !referenceUrl.trim() && !attachedImage) || isLoading}
                  className="w-10 h-10 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl flex items-center justify-center transition-all active:scale-95 shrink-0 shadow-md shadow-emerald-950"
                  title="Send to AI Builder"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>

          {/* Live Preview Column */}
          <div 
            className={`
              flex-1 flex flex-col bg-zinc-950 h-full overflow-hidden
              ${mobileTab === 'preview' ? 'flex' : 'hidden md:flex'}
            `}
          >
            {/* Preview Sub-bar */}
            <div className="px-3 py-2 bg-[#121214] border-b border-zinc-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Live App Preview</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPreviewKey(k => k + 1)}
                  className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 text-xs flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Reload</span>
                </button>
                <button
                  onClick={handleExportHtml}
                  className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 text-xs flex items-center gap-1.5"
                >
                  <Download className="w-3 h-3" />
                  <span>Download .html</span>
                </button>
              </div>
            </div>

            {/* IFrame Screen Canvas */}
            <div className="flex-1 w-full h-full bg-white relative overflow-hidden">
              <iframe
                key={previewKey}
                title="Live App Sandbox"
                srcDoc={activeProject.code}
                sandbox="allow-scripts allow-same-origin allow-forms allow-modals"
                className="w-full h-full border-none bg-white"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
