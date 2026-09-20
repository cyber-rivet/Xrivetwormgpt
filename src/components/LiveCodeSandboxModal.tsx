import React, { useState, useEffect, useRef } from 'react';
import { X, Play, RefreshCw, Copy, Check, Terminal, Code2, Sparkles, AlertCircle, ShieldCheck } from 'lucide-react';

interface LiveCodeSandboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCode: string;
  language?: string;
  onAutoFixError?: (code: string, error: string) => void;
}

export const LiveCodeSandboxModal: React.FC<LiveCodeSandboxModalProps> = ({
  isOpen,
  onClose,
  initialCode,
  language = 'html',
  onAutoFixError,
}) => {
  const [code, setCode] = useState(initialCode);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'code' | 'console'>('preview');
  const [logs, setLogs] = useState<string[]>([]);
  const [hasError, setHasError] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const [isFixing, setIsFixing] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    setCode(initialCode);
  }, [initialCode]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const runCode = () => {
    setLogs([]);
    setHasError(false);
    setLastError(null);

    if (!iframeRef.current) return;

    let executableHtml = code;

    if (!code.includes('<html') && !code.includes('<!DOCTYPE')) {
      executableHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { margin: 0; padding: 16px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #09090b; color: #f4f4f5; }
  </style>
</head>
<body>
  <div id="root">${code}</div>
  <script>
    window.onerror = function(msg, url, line, col, error) {
      window.parent.postMessage({ type: 'SANDBOX_ERROR', message: msg + ' (Line ' + line + ')' }, '*');
      return false;
    };
    console.log = function(...args) {
      window.parent.postMessage({ type: 'SANDBOX_LOG', message: args.join(' ') }, '*');
    };
    console.error = function(...args) {
      window.parent.postMessage({ type: 'SANDBOX_ERROR', message: args.join(' ') }, '*');
    };
  </script>
</body>
</html>`;
    }

    const blob = new Blob([executableHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    iframeRef.current.src = url;
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'SANDBOX_ERROR') {
        setHasError(true);
        setLastError(event.data.message);
        setLogs((prev) => [...prev, `[ERROR]: ${event.data.message}`]);
      } else if (event.data?.type === 'SANDBOX_LOG') {
        setLogs((prev) => [...prev, `[LOG]: ${event.data.message}`]);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => runCode(), 200);
    }
  }, [isOpen, code]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="bg-[#0f0f11] border border-emerald-500/40 w-full max-w-5xl h-[88vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between px-3 sm:px-6 py-3 gap-3 border-b border-zinc-800 bg-[#161618] shrink-0">
          <div className="flex items-center justify-between w-full lg:w-auto">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                <Code2 className="w-4 h-4" />
              </div>
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                  <h3 className="text-xs sm:text-sm font-bold text-zinc-100 font-mono truncate max-w-[200px] sm:max-w-none">
                    XRIVET SANDBOX <span className="hidden sm:inline">– LIVE APP PREVIEW</span>
                  </h3>
                  <span className="px-2 py-0.5 text-[9px] sm:text-[10px] font-mono uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-full flex items-center gap-1 font-bold w-fit">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    <span className="hidden sm:inline">AUTONOMOUS AGENT ACTIVE</span>
                    <span className="sm:hidden">AGENT ACTIVE</span>
                  </span>
                </div>
              </div>
            </div>
            {/* Mobile close button (visible only on small screens) */}
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 hover:text-white hover:bg-red-500 transition-colors shrink-0"
              title="Close Sandbox"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
            <div className="flex bg-zinc-900 border border-zinc-800 rounded-lg p-0.5 text-xs font-mono">
              <button
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  activeTab === 'preview' ? 'bg-emerald-600 text-white font-bold' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Live Preview
              </button>
              <button
                onClick={() => setActiveTab('code')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  activeTab === 'code' ? 'bg-emerald-600 text-white font-bold' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Code Editor
              </button>
              <button
                onClick={() => setActiveTab('console')}
                className={`px-3 py-1 rounded-md transition-colors relative ${
                  activeTab === 'console' ? 'bg-emerald-600 text-white font-bold' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Console {logs.length > 0 && `(${logs.length})`}
                {hasError && <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
              </button>
            </div>

            <button
              onClick={runCode}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-emerald-600/90 hover:bg-emerald-500 text-white text-xs font-mono font-bold flex items-center gap-1.5 transition-colors shadow"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span className="hidden sm:inline">Run</span>
            </button>

            <button
              onClick={() => {
                const blob = new Blob([code], { type: 'text/html' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `app_${Date.now()}.html`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              }}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-cyan-400 hover:text-cyan-300 hover:bg-zinc-800 text-xs font-mono flex items-center gap-1.5 transition-colors"
              title="Download Source Code (Export)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              <span className="hidden sm:inline">Export</span>
            </button>

            <button
              onClick={handleCopy}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-300 hover:text-white text-xs font-mono flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              onClick={onClose}
              className="hidden lg:flex p-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-400 hover:text-white hover:bg-red-500 hover:border-red-500 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {hasError && lastError && (
          <div className="bg-red-950/80 border-b border-red-500/40 px-4 py-2 flex items-center justify-between gap-3 text-xs font-mono text-red-200 shrink-0">
            <div className="flex items-center gap-2 overflow-hidden">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span className="truncate">Detected Error: {lastError}</span>
            </div>
            {onAutoFixError && (
              <button
                onClick={() => {
                  setIsFixing(true);
                  onAutoFixError(code, lastError);
                  onClose();
                }}
                disabled={isFixing}
                className="shrink-0 px-3 py-1 bg-red-600 hover:bg-red-500 text-white font-bold rounded text-[11px] flex items-center gap-1.5 shadow"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI AUTO-FIX ERROR</span>
              </button>
            )}
          </div>
        )}

        <div className="flex-1 bg-black overflow-hidden relative">
          <div className={`w-full h-full ${activeTab === 'preview' ? 'block' : 'hidden'}`}>
            <iframe
              ref={iframeRef}
              title="Live Code Sandbox"
              sandbox="allow-scripts allow-same-origin allow-modals allow-forms"
              className="w-full h-full border-none bg-white"
            />
          </div>

          <div className={`w-full h-full p-4 overflow-auto ${activeTab === 'code' ? 'block' : 'hidden'}`}>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-full bg-[#0a0a0a] text-zinc-200 font-mono text-xs sm:text-sm p-4 rounded-xl border border-zinc-800 focus:outline-none focus:border-emerald-500/50 resize-none leading-relaxed"
              spellCheck={false}
              placeholder="Paste or edit HTML/JS code here..."
            />
          </div>

          <div className={`w-full h-full p-4 bg-[#0a0a0a] font-mono text-xs overflow-auto space-y-1 ${activeTab === 'console' ? 'block' : 'hidden'}`}>
            <div className="text-zinc-500 pb-2 border-b border-zinc-800 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span>Execution Console & Runtime Output</span>
            </div>
            {logs.length === 0 ? (
              <div className="text-zinc-600 italic py-4">No runtime errors or console logs detected. Application clean.</div>
            ) : (
              logs.map((log, index) => (
                <div 
                  key={index}
                  className={`py-1 px-2 rounded ${
                    log.includes('[ERROR]') ? 'text-red-400 bg-red-950/30' : 'text-zinc-300 bg-zinc-900/40'
                  }`}
                >
                  {log}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
