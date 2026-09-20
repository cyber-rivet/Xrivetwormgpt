import React, { useState, useRef, useEffect } from 'react';
import { 
  X, Play, RefreshCw, Sparkles, Code2, AlertTriangle, 
  Terminal, Copy, Check, ShieldAlert, Wand2, Download,
  Paperclip, Image as ImageIcon, Link as LinkIcon
} from 'lucide-react';

interface AgentCoderStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendToChat?: (prompt: string) => void;
}

export const AgentCoderStudioModal: React.FC<AgentCoderStudioModalProps> = ({
  isOpen,
  onClose,
  onSendToChat,
}) => {
  const [projectPrompt, setProjectPrompt] = useState('');
  const [referenceUrl, setReferenceUrl] = useState('');
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'code' | 'console'>('preview');
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  const [detectedError, setDetectedError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const [generatedCode, setGeneratedCode] = useState<string>(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Autonomous Web App</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-zinc-950 text-zinc-100 min-h-screen flex flex-col items-center justify-center p-4">
  <div class="max-w-md w-full bg-zinc-900 border border-emerald-500/30 rounded-2xl p-6 shadow-2xl space-y-4">
    <div class="flex items-center gap-3">
      <div class="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-lg">
        🤖
      </div>
      <div>
        <h1 class="text-lg font-bold text-white font-mono">Autonomous App Sandbox</h1>
        <p class="text-xs text-zinc-400">Live generated & fully reactive</p>
      </div>
    </div>
    <div class="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
      <p class="text-sm text-zinc-300" id="status-text">Click the button below to execute reactive agent logic:</p>
      <div class="flex gap-2">
        <button onclick="triggerDemo()" class="flex-1 py-2 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs font-mono transition-all">
          Trigger Action
        </button>
        <button onclick="triggerErrorTest()" class="py-2 px-3 bg-red-950 hover:bg-red-900 text-red-400 border border-red-800 font-bold rounded-lg text-xs font-mono transition-all" title="Test Auto-Healer">
          Test Error
        </button>
      </div>
    </div>
    <div id="output" class="text-xs font-mono text-emerald-400 min-h-[30px] p-2 rounded bg-black/50 border border-zinc-800 flex items-center justify-center">
      Ready for execution.
    </div>
  </div>

  <script>
    function triggerDemo() {
      const output = document.getElementById('output');
      const time = new Date().toLocaleTimeString();
      output.innerHTML = '<span class="text-emerald-400 font-bold">✓ Success:</span> Counter incremented at ' + time;
      console.log('User executed autonomous agent trigger at ' + time);
    }
    function triggerErrorTest() {
      console.error('Simulated Exception: Uncaught ReferenceError: missingAgentService is not defined at triggerErrorTest (line 42)');
      throw new Error('Uncaught ReferenceError: missingAgentService is not defined at triggerErrorTest (line 42)');
    }
  </script>
</body>
</html>`);

  const runPreview = (codeToRun: string) => {
    setConsoleLogs([]);
    setDetectedError(null);
    if (!iframeRef.current) return;

    const injectedCode = codeToRun.replace(
      '<head>',
      `<head>
      <script>
        window.onerror = function(msg, url, line) {
          window.parent.postMessage({ type: 'SANDBOX_ERROR', message: msg + ' (Line ' + line + ')' }, '*');
          return false;
        };
        console.log = function(...args) {
          window.parent.postMessage({ type: 'SANDBOX_LOG', message: args.join(' ') }, '*');
        };
        console.error = function(...args) {
          window.parent.postMessage({ type: 'SANDBOX_ERROR', message: args.join(' ') }, '*');
        };
      </script>`
    );

    const blob = new Blob([injectedCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    iframeRef.current.src = url;
  };

  useEffect(() => {
    const handleMsg = (e: MessageEvent) => {
      if (e.data?.type === 'SANDBOX_ERROR') {
        setDetectedError(e.data.message);
        setConsoleLogs((prev) => [...prev, `[ERROR]: ${e.data.message}`]);
      } else if (e.data?.type === 'SANDBOX_LOG') {
        setConsoleLogs((prev) => [...prev, `[LOG]: ${e.data.message}`]);
      }
    };
    window.addEventListener('message', handleMsg);
    return () => window.removeEventListener('message', handleMsg);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => runPreview(generatedCode), 300);
    }
  }, [isOpen]);

  const handleGenerateApp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!projectPrompt.trim() && !referenceUrl.trim() && !attachedImage) return;

    setIsGenerating(true);
    setConsoleLogs((prev) => [...prev, `[AGENT]: Contacting DeepSeek V4 Flash engine...`]);

    try {
      let fullPrompt = `Act as an autonomous full-stack AI coding agent. You must output a complete, standalone, production-ready single-file HTML web application with inline CSS (or CDN Tailwind CSS) and JavaScript logic. Return the code inside a standard \`\`\`html code block.\n\n`;
      if (referenceUrl.trim()) {
        fullPrompt += `[Reference Website Link to Clone]: ${referenceUrl.trim()}\nAnalyze its visual UI, layout, and functionality to generate an exact clone.\n\n`;
      }
      if (attachedImage) {
        fullPrompt += `[Attached Screenshot UI Reference]: Provided for design layout cloning.\n\n`;
      }
      fullPrompt += `User Instructions: ${projectPrompt || 'Create a modern web application.'}`;

      const res = await fetch('/api/agent/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: fullPrompt })
      });

      const data = await res.json();
      if (data?.content) {
        let code = data.content;
        const htmlMatch = code.match(/```html([\s\S]*?)```/i) || code.match(/```xml([\s\S]*?)```/i) || code.match(/```([\s\S]*?)```/i);
        if (htmlMatch && htmlMatch[1]) {
          code = htmlMatch[1].trim();
        } else {
          code = code.trim();
        }

        setGeneratedCode(code);
        runPreview(code);
        setActiveTab('preview');
        setConsoleLogs((prev) => [...prev, `[AGENT]: Successfully generated with DeepSeek V4 Flash!`]);
      } else {
        throw new Error(data?.error || 'Empty response from Agent API');
      }
    } catch (err: any) {
      setConsoleLogs((prev) => [...prev, `[AGENT ERROR]: ${err.message || 'Generation failed'}`]);
      // Fallback to chat if modal direct gen fails
      if (onSendToChat) {
        onSendToChat(`Build app: ${projectPrompt}`);
        onClose();
      }
    } finally {
      setIsGenerating(false);
    }
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

  const handleAutoHealError = async () => {
    if (!detectedError) return;
    setIsDiagnosing(true);
    setConsoleLogs((prev) => [...prev, `[AUTO-HEALER]: Diagnosing error with DeepSeek V4 Flash...`]);

    try {
      const fixPrompt = `You are an automated code healing engine. Fix this runtime error in the HTML app:\n\nERROR:\n${detectedError}\n\nCURRENT CODE:\n\`\`\`html\n${generatedCode}\n\`\`\`\n\nReturn ONLY the complete, fixed standalone HTML code inside a \`\`\`html code block.`;
      
      const res = await fetch('/api/agent/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: fixPrompt })
      });

      const data = await res.json();
      if (data?.content) {
        let code = data.content;
        const htmlMatch = code.match(/```html([\s\S]*?)```/i) || code.match(/```([\s\S]*?)```/i);
        if (htmlMatch && htmlMatch[1]) {
          code = htmlMatch[1].trim();
        }
        setGeneratedCode(code);
        runPreview(code);
        setDetectedError(null);
        setConsoleLogs((prev) => [...prev, `[AUTO-HEALER]: Bug fixed and preview reloaded!`]);
      }
    } catch (err: any) {
      setConsoleLogs((prev) => [...prev, `[AUTO-HEALER ERROR]: ${err.message}`]);
    } finally {
      setIsDiagnosing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="bg-[#0f0f11] border border-emerald-500/40 w-full max-w-6xl h-[92vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-zinc-800 bg-[#161618] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-zinc-100 font-mono">
                  XRIVET AUTONOMOUS AI AGENT
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-mono uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-full font-bold">
                  AUTONOMOUS BUILD & SELF-HEAL
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                navigator.clipboard.writeText(generatedCode);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-300 hover:text-white text-xs font-mono flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy Code'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-3 sm:p-4 bg-zinc-900/60 border-b border-zinc-800 shrink-0 space-y-3">
          {/* Attached image preview or website link chip */}
          {(attachedImage || referenceUrl) && (
            <div className="flex flex-wrap items-center gap-2">
              {attachedImage && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-zinc-950 border border-emerald-500/40 rounded-lg text-xs text-zinc-200">
                  <ImageIcon className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="truncate max-w-[150px]">Attached Screenshot</span>
                  <button
                    type="button"
                    onClick={() => setAttachedImage(null)}
                    className="p-0.5 hover:text-rose-400"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              {referenceUrl && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-zinc-950 border border-teal-500/40 rounded-lg text-xs text-zinc-200">
                  <LinkIcon className="w-4 h-4 text-teal-400 shrink-0" />
                  <span className="truncate max-w-[200px]">{referenceUrl}</span>
                  <button
                    type="button"
                    onClick={() => setReferenceUrl('')}
                    className="p-0.5 hover:text-rose-400"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleGenerateApp} className="space-y-2.5">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={projectPrompt}
                onChange={(e) => setProjectPrompt(e.target.value)}
                placeholder="Describe what you want to build (e.g., 'Make an exact clone of this dashboard')..."
                className="flex-1 bg-zinc-950 border border-zinc-700 focus:border-emerald-500/60 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 font-mono focus:outline-none transition-colors"
              />
              <input
                type="url"
                value={referenceUrl}
                onChange={(e) => setReferenceUrl(e.target.value)}
                placeholder="Or paste website link (https://...) to clone..."
                className="w-full sm:w-72 bg-zinc-950 border border-zinc-700 focus:border-teal-500/60 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 font-mono focus:outline-none transition-colors"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white text-xs font-mono flex items-center gap-1.5 transition-colors"
                  title="Upload Screenshot of website to clone"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Upload Screenshot / Pic</span>
                </button>
                <span className="text-[11px] text-zinc-500 hidden sm:inline">
                  Upload screenshot or paste link to clone website design.
                </span>
              </div>

              <button
                type="submit"
                disabled={isGenerating || (!projectPrompt.trim() && !referenceUrl.trim() && !attachedImage)}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-mono font-bold text-xs sm:text-sm rounded-xl flex items-center gap-2 shadow-md transition-all active:scale-95 shrink-0"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>DeepSeek Generating...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    <span>Generate App</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="flex items-center justify-between px-4 py-2 bg-[#0a0a0a] border-b border-zinc-800/80 shrink-0">
          <div className="flex bg-zinc-900 border border-zinc-800 rounded-lg p-0.5 text-xs font-mono">
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1 rounded-md transition-colors ${
                activeTab === 'preview' ? 'bg-emerald-600 text-white font-bold' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Live App Preview
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className={`px-3 py-1 rounded-md transition-colors ${
                activeTab === 'code' ? 'bg-emerald-600 text-white font-bold' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Source Code
            </button>
            <button
              onClick={() => setActiveTab('console')}
              className={`px-3 py-1 rounded-md transition-colors relative ${
                activeTab === 'console' ? 'bg-emerald-600 text-white font-bold' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Console ({consoleLogs.length})
              {detectedError && <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => runPreview(generatedCode)}
              className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded text-xs font-mono flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reload</span>
            </button>
          </div>
        </div>

        {detectedError && (
          <div className="bg-red-950/90 border-b border-red-500/50 px-4 py-2.5 flex items-center justify-between gap-3 text-xs font-mono text-red-200 shrink-0 animate-in slide-in-from-top-2">
            <div className="flex items-center gap-2 overflow-hidden">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 animate-bounce" />
              <span className="font-semibold truncate">Auto-Healer Alert: {detectedError}</span>
            </div>
            <button
              onClick={handleAutoHealError}
              disabled={isDiagnosing}
              className="shrink-0 px-3 py-1 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg text-xs font-mono flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI AUTO-FIX BUG NOW</span>
            </button>
          </div>
        )}

        <div className="flex-1 bg-black overflow-hidden relative">
          <div className={`w-full h-full ${activeTab === 'preview' ? 'block' : 'hidden'}`}>
            <iframe
              ref={iframeRef}
              title="Autonomous App Sandbox"
              sandbox="allow-scripts allow-same-origin allow-modals allow-forms"
              className="w-full h-full border-none bg-white"
            />
          </div>

          <div className={`w-full h-full p-4 overflow-auto ${activeTab === 'code' ? 'block' : 'hidden'}`}>
            <textarea
              value={generatedCode}
              onChange={(e) => setGeneratedCode(e.target.value)}
              className="w-full h-full bg-[#0a0a0a] text-zinc-200 font-mono text-xs sm:text-sm p-4 rounded-xl border border-zinc-800 focus:outline-none focus:border-emerald-500/50 resize-none leading-relaxed"
              spellCheck={false}
            />
          </div>

          <div className={`w-full h-full p-4 bg-[#0a0a0a] font-mono text-xs overflow-auto space-y-1.5 ${activeTab === 'console' ? 'block' : 'hidden'}`}>
            {consoleLogs.length === 0 ? (
              <div className="text-zinc-600 italic py-4">No runtime errors or execution messages logged yet.</div>
            ) : (
              consoleLogs.map((log, idx) => (
                <div
                  key={idx}
                  className={`py-1 px-2 rounded text-xs ${
                    log.includes('[ERROR]') ? 'text-red-400 bg-red-950/40 border border-red-500/30' : 'text-zinc-300 bg-zinc-900/40'
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
