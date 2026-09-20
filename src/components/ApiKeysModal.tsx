import React, { useState, useEffect } from 'react';
import { Key, Copy, Check, Trash2, Plus, Shield, Sparkles, X, Terminal, ExternalLink, AlertCircle } from 'lucide-react';
import { User } from '../types';

interface ApiKeysModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: User | null;
}

interface ApiKeyItem {
  id: string;
  key: string;
  title: string;
  createdAt: number;
  status: 'active' | 'blocked';
  requestCount: number;
  lastUsedAt: number;
}

export const ApiKeysModal: React.FC<ApiKeysModalProps> = ({
  isOpen,
  onClose,
  currentUser
}) => {
  const [keys, setKeys] = useState<ApiKeyItem[]>([]);
  const [title, setTitle] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchKeys = async () => {
    if (!currentUser) return;
    try {
      const token = localStorage.getItem('xrivet_token') || currentUser.id;
      const res = await fetch('/api/keys/list', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-user-id': currentUser.id
        }
      });
      if (res.ok) {
        const data = await res.json();
        setKeys(data.keys || []);
      }
    } catch (err) {
      console.error('Error fetching API keys:', err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchKeys();
      setTitle('');
      setError(null);
      setSuccessMsg(null);
    }
  }, [isOpen, currentUser]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setIsGenerating(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const token = localStorage.getItem('xrivet_token') || currentUser.id;
      const res = await fetch('/api/keys/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-user-id': currentUser.id
        },
        body: JSON.stringify({ title: title.trim() || 'My External Project API Key' })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate API key.');
      }

      setSuccessMsg('API Key generated successfully! Make sure to copy it now.');
      setTitle('');
      fetchKeys();
    } catch (err: any) {
      setError(err.message || 'Error generating key');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDelete = async (keyId: string) => {
    if (!confirm('Are you sure you want to revoke and delete this API key? Any external app using it will stop working immediately.')) return;
    try {
      const token = localStorage.getItem('xrivet_token') || currentUser?.id;
      const res = await fetch(`/api/keys/${keyId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-user-id': currentUser?.id || ''
        }
      });
      if (res.ok) {
        fetchKeys();
      }
    } catch (err) {
      console.error('Error deleting key:', err);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKeyId(id);
    setTimeout(() => setCopiedKeyId(null), 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-3xl bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                Xrivet WormGPT API Key Manager
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Whitelabeled
                </span>
              </h2>
              <p className="text-xs text-zinc-500">
                Generate secure API keys to power your external projects. Completely hides underlying provider credentials.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Generator Form */}
          <form onSubmit={handleGenerate} className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-4">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-500" />
              Generate New API Key
            </h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="Project Name / Label (e.g. My Telegram Bot, Python Script)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="submit"
                disabled={isGenerating}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 shrink-0"
              >
                {isGenerating ? (
                  <>Generating...</>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Create API Key
                  </>
                )}
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            {successMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                {successMsg}
              </div>
            )}
          </form>

          {/* Integration Guide Box */}
          <div className="p-4 rounded-xl bg-zinc-900 text-zinc-300 font-mono text-xs space-y-2 border border-zinc-800 shadow-inner">
            <div className="text-emerald-400 font-bold flex items-center gap-2">
              <Terminal className="w-4 h-4" />
              OpenAI-Compatible Integration (Any External Project):
            </div>
            <p className="text-zinc-400 text-[11px]">
              Use your generated <code className="text-emerald-300">xrivet_...</code> key in any OpenAI SDK or HTTP client:
            </p>
            <pre className="p-3 rounded-lg bg-black/60 text-emerald-300 overflow-x-auto text-[11px]">
{`const openai = new OpenAI({
  baseURL: "https://${window.location.host}/api/v1",
  apiKey: "xrivet_live_your_key_here"
});`}
            </pre>
          </div>

          {/* Keys List */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center justify-between">
              <span>Your Active API Keys ({keys.length})</span>
              <span className="text-xs font-normal text-zinc-500">Whitelabeled as Xrivet WormGPT</span>
            </h3>

            {keys.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
                <Key className="w-8 h-8 text-zinc-400 mx-auto mb-2 opacity-50" />
                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">No API keys generated yet.</p>
                <p className="text-xs text-zinc-500 mt-1">Create your first key above to integrate into external projects.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {keys.map((k) => (
                  <div
                    key={k.id}
                    className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 truncate">
                          {k.title}
                        </span>
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${k.status === 'active' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'}`}>
                          {k.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 font-mono text-xs text-zinc-500 dark:text-zinc-400">
                        <span className="bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-emerald-600 dark:text-emerald-400 select-all">
                          {k.key}
                        </span>
                        <span>Requests: <strong className="text-zinc-700 dark:text-zinc-300">{k.requestCount}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleCopy(k.key, k.id)}
                        className="px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-300 transition-colors flex items-center gap-1.5 cursor-pointer"
                        title="Copy API Key"
                      >
                        {copiedKeyId === k.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            Copy Key
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(k.id)}
                        className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                        title="Revoke / Delete Key"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
