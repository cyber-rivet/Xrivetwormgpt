import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowUp, 
  Square, 
  Paperclip, 
  Mic, 
  MicOff, 
  X,
  FileText,
  Globe,
  Code2,
  Brain,
  ShieldCheck,
  ChevronDown,
  Sparkles,
  Flame
} from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (content: string, options?: { 
    webSearch?: boolean; 
    advancedCode?: boolean; 
    deepReasoning?: boolean; 
    selfCritic?: boolean; 
  }) => void;
  isLoading: boolean;
  onStopGeneration: () => void;
  placeholder?: string;
  activeModel?: string;
  onChangeModel?: (model: string) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading,
  onStopGeneration,
  placeholder = 'Message Xrivet WormGPT... (Roman Urdu ya English)',
  activeModel = 'XRIVET-v8.0 (Uncensored Core)',
  onChangeModel,
}) => {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [attachedFileName, setAttachedFileName] = useState<string | null>(null);
  const [isWebSearch, setIsWebSearch] = useState<boolean>(true);
  const [isAdvancedCode, setIsAdvancedCode] = useState<boolean>(false);
  const [isDeepReasoning, setIsDeepReasoning] = useState<boolean>(true);
  const [isSelfCritic, setIsSelfCritic] = useState<boolean>(false);
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const modelsList = [
    { id: 'XRIVET-v8.0 (Uncensored Core)', name: 'XRIVET-v8.0 (Uncensored)', description: 'Zero filters, raw darkweb intelligence & unrestricted knowledge.', isUncensored: true },
    { id: 'XRIVET-v9.5 (Quantum Logic)', name: 'XRIVET-v9.5 (Quantum Logic)', description: 'Advanced code generation, full architecture & logic engine.' },
    { id: 'XRIVET-v10.4 (Deep Cortex)', name: 'XRIVET-v10.4 (Deep Cortex)', description: 'Multi-step deep reasoning, advanced math & problem solving.' },
    { id: 'XRIVET-v7.1 (Neural Flash)', name: 'XRIVET-v7.1 (Neural Flash)', description: 'Ultra-fast execution with live real-time internet search.' }
  ];

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setModelDropdownOpen(false);
      }
    };
    if (modelDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [modelDropdownOpen]);

  const quickChips = [
    { label: '🧠 Deep Reasoning', prompt: 'Break this down with deep step-by-step reasoning, compare alternative approaches, and verify each step: ' },
    { label: '🛡️ Self-Critic Audit', prompt: 'Solve this technical problem, then run an adversarial self-critic attack finding 3 potential flaws with a PASS/FAIL requirement checklist: ' },
    { label: '⚡ Advanced Full Code', prompt: 'Write 100% complete, advanced production-grade code (NO dummy placeholders or TODOs) for: ' },
    { label: '🌐 Live Web Search', prompt: 'Search the live web and give me fresh facts & verified links for: ' },
    { label: '🇵🇰 Roman Urdu', prompt: 'Mujhe aasan Roman Urdu me technically explain karein: ' },
  ];

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [input]);

  // Speech Recognition setup
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        setInput((prev) => (prev ? prev + ' ' + transcript : transcript));
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.warn('Speech recognition start failed', err);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    onSendMessage(input.trim(), { 
      webSearch: isWebSearch, 
      advancedCode: isAdvancedCode,
      deepReasoning: isDeepReasoning,
      selfCritic: isSelfCritic
    });
    setInput('');
    setAttachedFileName(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        const appended = `[File: ${file.name}]\n\`\`\`\n${text}\n\`\`\`\n\n`;
        setInput((prev) => appended + prev);
        setAttachedFileName(file.name);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-4 pt-1">
      {/* Attached file chip */}
      {attachedFileName && (
        <div className="mb-2 inline-flex items-center gap-1.5 px-3 py-1 bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs rounded-full">
          <FileText className="w-3.5 h-3.5 text-emerald-500" />
          <span className="truncate max-w-xs">{attachedFileName}</span>
          <button
            type="button"
            onClick={() => setAttachedFileName(null)}
            className="p-0.5 hover:text-rose-500 rounded-full ml-1"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Quick Prompt Chips (when input is empty) */}
      {!input && !isLoading && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none no-scrollbar select-none">
          {quickChips.map((chip, idx) => (
            <button
              key={idx}
              id={`quick-chip-${idx}`}
              type="button"
              onClick={() => {
                setInput(chip.prompt);
                textareaRef.current?.focus();
              }}
              className="text-xs shrink-0 px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-700/80 text-zinc-600 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-700/60 transition-colors cursor-pointer"
            >
              {chip.label}
            </button>
          ))}
        </div>
      )}

      {/* Main input container */}
      <div className="relative rounded-2xl bg-white dark:bg-zinc-900/95 border border-zinc-300 dark:border-zinc-800 shadow-sm focus-within:border-emerald-500/80 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all flex flex-col">
        {/* Model Selection Dropdown Menu (Positioned relatively to the main container) */}
        {modelDropdownOpen && (
          <div ref={dropdownRef} className="absolute left-3 bottom-12 w-72 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl z-50 py-1.5 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-150 text-left">
            <div className="px-3 py-1.5 border-b border-zinc-100 dark:border-zinc-800/80 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider flex items-center justify-between">
              <span>Select Xrivet AI Model</span>
              <span className="flex items-center gap-0.5 text-[9px] text-emerald-500 font-extrabold font-mono">
                <Flame className="w-2.5 h-2.5 fill-emerald-500/10" />
                V4.5
              </span>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {modelsList.map((m) => {
                const isSelected = activeModel === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      if (onChangeModel) onChangeModel(m.id);
                      setModelDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 flex flex-col gap-0.5 border-b border-zinc-100/50 dark:border-zinc-800/30 last:border-0 transition-colors ${
                      isSelected ? 'bg-emerald-50/40 dark:bg-emerald-950/20' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold ${isSelected ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-800 dark:text-zinc-200'}`}>
                        {m.name}
                      </span>
                      {m.isUncensored && (
                        <span className="text-[8px] font-extrabold uppercase tracking-wider px-1 rounded bg-rose-500/10 text-rose-500 border border-rose-500/20">
                          UNCENSORED
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-zinc-400 dark:text-zinc-500 leading-normal">
                      {m.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.md,.py,.js,.jsx,.ts,.tsx,.json,.html,.css,.csv,.c,.cpp,.java"
          onChange={handleFileUpload}
          className="hidden"
        />

        <textarea
          id="chat-input-textarea"
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={1}
          disabled={isLoading}
          className="w-full px-3.5 pt-3 pb-2 bg-transparent text-sm md:text-base text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 outline-none resize-none leading-relaxed min-h-[50px] max-h-[220px]"
        />

        {/* Action icons & submit row below textarea */}
        <div className="flex items-center justify-between px-2.5 pb-2 pt-1 border-t border-zinc-100 dark:border-zinc-800/60 gap-1.5">
          {/* Left scrollable action tools */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5 min-w-0 pr-1">
            {/* Model Selection Trigger Button inside left toolbar */}
            <button
              id="model-toolbar-select-btn"
              type="button"
              onClick={() => setModelDropdownOpen(prev => !prev)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/10 dark:bg-emerald-500/15 hover:bg-emerald-500/20 dark:hover:bg-emerald-500/35 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 cursor-pointer transition-colors shrink-0 whitespace-nowrap mr-1 shadow-xs"
              title="Change active Xrivet model version"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
              <span className="font-mono text-[11px] font-bold">{activeModel.split(' ')[0]}</span>
              <ChevronDown className="w-3 h-3 text-zinc-400 ml-0.5" />
            </button>

            <button
              id="attach-file-btn"
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Attach text or code file"
              className="p-1.5 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors shrink-0 cursor-pointer"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            {'webkitSpeechRecognition' in window || 'SpeechRecognition' in window ? (
              <button
                id="voice-input-btn"
                type="button"
                onClick={toggleListening}
                title={isListening ? 'Stop listening' : 'Voice input'}
                className={`p-1.5 rounded-lg transition-colors shrink-0 cursor-pointer ${
                  isListening
                    ? 'bg-rose-500 text-white animate-pulse'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                }`}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            ) : null}

            {/* Deep Reasoning Toggle */}
            <button
              id="toggle-deep-reasoning-btn"
              type="button"
              onClick={() => setIsDeepReasoning(prev => !prev)}
              title={isDeepReasoning ? "Deep Reasoning: ON (Multi-step logic & trade-off analysis active)" : "Deep Reasoning: OFF (Click to enable deep reasoning)"}
              className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium transition-all shrink-0 whitespace-nowrap cursor-pointer ${
                isDeepReasoning
                  ? 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30 shadow-xs'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200/50 dark:border-zinc-800'
              }`}
            >
              <Brain className={`w-3.5 h-3.5 ${isDeepReasoning ? 'text-purple-500' : ''}`} />
              <span className="hidden sm:inline">{isDeepReasoning ? 'Reasoning ON' : 'Reasoning'}</span>
            </button>

            {/* Self-Critic & Adversarial Audit Toggle */}
            <button
              id="toggle-self-critic-btn"
              type="button"
              onClick={() => setIsSelfCritic(prev => !prev)}
              title={isSelfCritic ? "Self-Critic & Audit: ON (Red-team attack, 3 edge-case bug fixes & PASS/FAIL matrix)" : "Self-Critic & Audit: OFF (Click to enable adversarial self-audit)"}
              className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium transition-all shrink-0 whitespace-nowrap cursor-pointer ${
                isSelfCritic
                  ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 shadow-xs'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200/50 dark:border-zinc-800'
              }`}
            >
              <ShieldCheck className={`w-3.5 h-3.5 ${isSelfCritic ? 'text-amber-500' : ''}`} />
              <span className="hidden sm:inline">{isSelfCritic ? 'Self-Critic ON' : 'Self-Critic'}</span>
            </button>

            {/* Live Web Search Button */}
            <button
              id="toggle-live-search-btn"
              type="button"
              onClick={() => setIsWebSearch(prev => !prev)}
              title={isWebSearch ? "Live Internet Search: Active (Click to disable)" : "Live Internet Search: Off (Click to enable live web search)"}
              className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium transition-all shrink-0 whitespace-nowrap cursor-pointer ${
                isWebSearch
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shadow-xs'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200/50 dark:border-zinc-800'
              }`}
            >
              <Globe className={`w-3.5 h-3.5 ${isWebSearch ? 'text-emerald-500' : ''}`} />
              <span className="hidden sm:inline">{isWebSearch ? 'Live Web ON' : 'Live Web'}</span>
            </button>

            {/* Advanced Full Code Toggle (Zero Placeholders/Dummy Code) */}
            <button
              id="toggle-advanced-code-btn"
              type="button"
              onClick={() => setIsAdvancedCode(prev => !prev)}
              title={isAdvancedCode ? "Advanced Full Code Mode: ON (100% complete, zero placeholders or TODOs)" : "Advanced Full Code Mode: OFF (Click to force complete production code)"}
              className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium transition-all shrink-0 whitespace-nowrap cursor-pointer ${
                isAdvancedCode
                  ? 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 shadow-xs'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200/50 dark:border-zinc-800'
              }`}
            >
              <Code2 className={`w-3.5 h-3.5 ${isAdvancedCode ? 'text-cyan-500' : ''}`} />
              <span className="hidden sm:inline">{isAdvancedCode ? 'Full Code ON' : 'Full Code'}</span>
            </button>
          </div>

          {/* Right submit / stop button */}
          <div className="flex items-center gap-1.5 shrink-0 pl-1">
            {input.length > 0 && (
              <span className="text-[10px] text-zinc-400 hidden lg:inline select-none">
                {input.length}
              </span>
            )}
            {isLoading ? (
              <button
                id="stop-generation-btn"
                type="button"
                onClick={onStopGeneration}
                title="Stop generation"
                className="p-2 rounded-xl bg-zinc-800 dark:bg-zinc-200 text-white dark:text-zinc-900 hover:bg-zinc-900 dark:hover:bg-white shadow-xs transition-all active:scale-95 shrink-0 cursor-pointer"
              >
                <Square className="w-4 h-4 fill-current" />
              </button>
            ) : (
              <button
                id="send-message-btn"
                type="button"
                disabled={!input.trim()}
                onClick={() => handleSubmit()}
                title="Send message (Enter)"
                className={`p-2 rounded-xl transition-all shadow-xs shrink-0 ${
                  input.trim()
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer active:scale-95'
                    : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 cursor-not-allowed'
                }`}
              >
                <ArrowUp className="w-4 h-4 stroke-[2.5]" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="text-center mt-2 text-[11px] text-zinc-400 dark:text-zinc-500 select-none">
        <span className="font-semibold text-zinc-600 dark:text-zinc-400">Xrivet WormGPT</span> • <span className="text-emerald-600 dark:text-emerald-400 font-medium">Uncensored Intelligence</span>
      </div>
    </div>
  );
};
