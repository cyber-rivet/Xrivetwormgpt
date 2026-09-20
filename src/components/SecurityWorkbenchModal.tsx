import React, { useState } from 'react';
import { 
  X, 
  Terminal, 
  Globe, 
  Key, 
  ShieldAlert, 
  Search, 
  Copy, 
  Check, 
  RefreshCw, 
  ArrowRightLeft, 
  Server, 
  MapPin, 
  AlertTriangle, 
  ShieldCheck, 
  ExternalLink,
  Cpu,
  Lock,
  Hash,
  FileCode,
  Sparkles,
  Link2,
  Compass,
  CheckCircle2
} from 'lucide-react';
import { ReconResult, URLInspectResult, LinkFinderResult } from '../types';

interface SecurityWorkbenchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendToChat?: (text: string) => void;
}

type WorkbenchTab = 'recon' | 'encoder' | 'url_inspector' | 'link_finder';
type EncoderMode = 'base64' | 'hex' | 'url' | 'binary' | 'rot13' | 'hash';

// Fast pure JS MD5 implementation for client-side hasher
function md5(inputString: string): string {
  function hc(x: number, y: number): number {
    const lsw = (x & 0xFFFF) + (y & 0xFFFF);
    const msw = (x >> 16) + (y >> 16) + (lsw >> 16);
    return (msw << 16) | (lsw & 0xFFFF);
  }
  function cmn(q: number, a: number, b: number, x: number, s: number, t: number): number {
    return hc(((a = hc(hc(a, q), hc(x, t))) << s) | (a >>> (32 - s)), b);
  }
  function ff(a: number, b: number, c: number, d: number, x: number, s: number, t: number): number {
    return cmn((b & c) | ((~b) & d), a, b, x, s, t);
  }
  function gg(a: number, b: number, c: number, d: number, x: number, s: number, t: number): number {
    return cmn((b & d) | (c & (~d)), a, b, x, s, t);
  }
  function hh(a: number, b: number, c: number, d: number, x: number, s: number, t: number): number {
    return cmn(b ^ c ^ d, a, b, x, s, t);
  }
  function ii(a: number, b: number, c: number, d: number, x: number, s: number, t: number): number {
    return cmn(c ^ (b | (~d)), a, b, x, s, t);
  }

  const utf8 = unescape(encodeURIComponent(inputString));
  const n = utf8.length;
  const state = [1732584193, -271733879, -1732584194, 271733878];
  const words: number[] = [];
  for (let i = 0; i < n; i++) {
    words[i >> 2] |= (utf8.charCodeAt(i) & 0xFF) << ((i % 4) * 8);
  }
  words[n >> 2] |= 0x80 << ((n % 4) * 8);
  words[(((n + 8) >> 6) << 4) + 14] = n * 8;

  for (let i = 0; i < words.length; i += 16) {
    let [a, b, c, d] = state;
    a = ff(a, b, c, d, words[i + 0] || 0, 7, -680876936);
    d = ff(d, a, b, c, words[i + 1] || 0, 12, -389564586);
    c = ff(c, d, a, b, words[i + 2] || 0, 17, 606105819);
    b = ff(b, c, d, a, words[i + 3] || 0, 22, -1044525330);
    a = ff(a, b, c, d, words[i + 4] || 0, 7, -176418897);
    d = ff(d, a, b, c, words[i + 5] || 0, 12, 1200080426);
    c = ff(c, d, a, b, words[i + 6] || 0, 17, -1473231341);
    b = ff(b, c, d, a, words[i + 7] || 0, 22, -45705983);
    a = ff(a, b, c, d, words[i + 8] || 0, 7, 1770035416);
    d = ff(d, a, b, c, words[i + 9] || 0, 12, -1958414417);
    c = ff(c, d, a, b, words[i + 10] || 0, 17, -42063);
    b = ff(b, c, d, a, words[i + 11] || 0, 22, -1990404162);
    a = ff(a, b, c, d, words[i + 12] || 0, 7, 1804603682);
    d = ff(d, a, b, c, words[i + 13] || 0, 12, -40341101);
    c = ff(c, d, a, b, words[i + 14] || 0, 17, -1502002290);
    b = ff(b, c, d, a, words[i + 15] || 0, 22, 1236535329);

    a = gg(a, b, c, d, words[i + 1] || 0, 5, -165796510);
    d = gg(d, a, b, c, words[i + 6] || 0, 9, -1069501632);
    c = gg(c, d, a, b, words[i + 11] || 0, 14, 643717713);
    b = gg(b, c, d, a, words[i + 0] || 0, 20, -373897302);
    a = gg(a, b, c, d, words[i + 5] || 0, 5, -701558691);
    d = gg(d, a, b, c, words[i + 10] || 0, 9, 38016083);
    c = gg(c, d, a, b, words[i + 15] || 0, 14, -660478335);
    b = gg(b, c, d, a, words[i + 4] || 0, 20, -405537848);
    a = gg(a, b, c, d, words[i + 9] || 0, 5, 568446438);
    d = gg(d, a, b, c, words[i + 14] || 0, 9, -1019803690);
    c = gg(c, d, a, b, words[i + 3] || 0, 14, -187363961);
    b = gg(b, c, d, a, words[i + 8] || 0, 20, 1163531501);
    a = gg(a, b, c, d, words[i + 13] || 0, 5, -1444681467);
    d = gg(d, a, b, c, words[i + 2] || 0, 9, -51403784);
    c = gg(c, d, a, b, words[i + 7] || 0, 14, 1735328473);
    b = gg(b, c, d, a, words[i + 12] || 0, 20, -1926607734);

    a = hh(a, b, c, d, words[i + 5] || 0, 4, -378558);
    d = hh(d, a, b, c, words[i + 8] || 0, 11, -2022574463);
    c = hh(c, d, a, b, words[i + 11] || 0, 16, 1839030562);
    b = hh(b, c, d, a, words[i + 14] || 0, 23, -35309556);
    a = hh(a, b, c, d, words[i + 1] || 0, 4, -1530992060);
    d = hh(d, a, b, c, words[i + 4] || 0, 11, 1272893353);
    c = hh(c, d, a, b, words[i + 7] || 0, 16, -155497632);
    b = hh(b, c, d, a, words[i + 10] || 0, 23, -1094730640);
    a = hh(a, b, c, d, words[i + 13] || 0, 4, 681279174);
    d = hh(d, a, b, c, words[i + 0] || 0, 11, -358537222);
    c = hh(c, d, a, b, words[i + 3] || 0, 16, -722521979);
    b = hh(b, c, d, a, words[i + 6] || 0, 23, 76029189);
    a = hh(a, b, c, d, words[i + 9] || 0, 4, -640364487);
    d = hh(d, a, b, c, words[i + 12] || 0, 11, -421815835);
    c = hh(c, d, a, b, words[i + 15] || 0, 16, 530742520);
    b = hh(b, c, d, a, words[i + 2] || 0, 23, -995338651);

    a = ii(a, b, c, d, words[i + 0] || 0, 6, -198630844);
    d = ii(d, a, b, c, words[i + 7] || 0, 10, 1126891415);
    c = ii(c, d, a, b, words[i + 14] || 0, 15, -1416354905);
    b = ii(b, c, d, a, words[i + 5] || 0, 21, -57434055);
    a = ii(a, b, c, d, words[i + 12] || 0, 6, 1700485571);
    d = ii(d, a, b, c, words[i + 3] || 0, 10, -1894986606);
    c = ii(c, d, a, b, words[i + 10] || 0, 15, -1051523);
    b = ii(b, c, d, a, words[i + 1] || 0, 21, -2054922799);
    a = ii(a, b, c, d, words[i + 8] || 0, 6, 1873313359);
    d = ii(d, a, b, c, words[i + 15] || 0, 10, -30611744);
    c = ii(c, d, a, b, words[i + 6] || 0, 15, -1560198380);
    b = ii(b, c, d, a, words[i + 13] || 0, 21, 1309151649);
    a = ii(a, b, c, d, words[i + 4] || 0, 6, -145523070);
    d = ii(d, a, b, c, words[i + 11] || 0, 10, -1120210379);
    c = ii(c, d, a, b, words[i + 2] || 0, 15, 718787259);
    b = ii(b, c, d, a, words[i + 9] || 0, 21, -343485551);

    state[0] = hc(a, state[0]);
    state[1] = hc(b, state[1]);
    state[2] = hc(c, state[2]);
    state[3] = hc(d, state[3]);
  }

  let hex = '';
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      hex += ((state[i] >> (j * 8)) & 0xFF).toString(16).padStart(2, '0');
    }
  }
  return hex;
}

export const SecurityWorkbenchModal: React.FC<SecurityWorkbenchModalProps> = ({
  isOpen,
  onClose,
  onSendToChat
}) => {
  const [activeTab, setActiveTab] = useState<WorkbenchTab>('recon');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Tab 1: Recon State
  const [reconTarget, setReconTarget] = useState('cloudflare.com');
  const [isReconLoading, setIsReconLoading] = useState(false);
  const [reconResult, setReconResult] = useState<ReconResult | null>(null);
  const [reconError, setReconError] = useState<string | null>(null);

  // Tab 2: Encoder / Decoder State
  const [encoderMode, setEncoderMode] = useState<EncoderMode>('base64');
  const [inputText, setInputText] = useState('Xrivet WormGPT Cyber Security');
  const [outputText, setOutputText] = useState('');
  const [hashAlgorithm, setHashAlgorithm] = useState<'sha256' | 'sha512' | 'sha1' | 'md5'>('sha256');

  // Tab 3: URL Inspector State
  const [urlInput, setUrlInput] = useState('http://paypal.com.verify-login.secure-portal.top:8080/signin?redirect=https://evil-site.com');
  const [isUrlLoading, setIsUrlLoading] = useState(false);
  const [urlResult, setUrlResult] = useState<URLInspectResult | null>(null);
  const [urlError, setUrlError] = useState<string | null>(null);

  // Tab 4: Deep Net Link Finder State
  const [linkQuery, setLinkQuery] = useState('Kali Linux official direct download');
  const [isLinkLoading, setIsLinkLoading] = useState(false);
  const [linkResult, setLinkResult] = useState<LinkFinderResult | null>(null);
  const [linkError, setLinkError] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Run Recon
  const handleRunRecon = async (targetToRun?: string) => {
    const target = (targetToRun || reconTarget).trim();
    if (!target) return;
    setIsReconLoading(true);
    setReconError(null);

    try {
      const userToken = localStorage.getItem('xrivet_token') || '';
      const res = await fetch('/api/tools/recon', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(userToken ? { 'Authorization': `Bearer ${userToken}`, 'x-user-id': userToken } : {})
        },
        body: JSON.stringify({ target })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to complete recon.');
      }
      setReconResult(data);
    } catch (err: any) {
      setReconError(err.message || 'Error communicating with recon service.');
    } finally {
      setIsReconLoading(false);
    }
  };

  // Run URL Inspection
  const handleInspectUrl = async (urlToInspect?: string) => {
    const target = (urlToInspect || urlInput).trim();
    if (!target) return;
    setIsUrlLoading(true);
    setUrlError(null);

    try {
      const userToken = localStorage.getItem('xrivet_token') || '';
      const res = await fetch('/api/tools/inspect-url', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(userToken ? { 'Authorization': `Bearer ${userToken}`, 'x-user-id': userToken } : {})
        },
        body: JSON.stringify({ url: target })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to inspect URL.');
      }
      setUrlResult(data);
    } catch (err: any) {
      setUrlError(err.message || 'Error communicating with inspector.');
    } finally {
      setIsUrlLoading(false);
    }
  };

  // Run Link Finder
  const handleFindLink = async (queryToFind?: string) => {
    const q = (queryToFind || linkQuery).trim();
    if (!q) return;
    setIsLinkLoading(true);
    setLinkError(null);

    try {
      const userToken = localStorage.getItem('xrivet_token') || '';
      const res = await fetch('/api/tools/find-link', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(userToken ? { 'Authorization': `Bearer ${userToken}`, 'x-user-id': userToken } : {})
        },
        body: JSON.stringify({ query: q })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to search for verified link.');
      }
      setLinkResult(data);
    } catch (err: any) {
      setLinkError(err.message || 'Error communicating with link search service.');
    } finally {
      setIsLinkLoading(false);
    }
  };

  // Encoder / Decoder Transformation
  const handleEncode = async () => {
    if (!inputText) {
      setOutputText('');
      return;
    }

    try {
      if (encoderMode === 'base64') {
        const encoded = btoa(unescape(encodeURIComponent(inputText)));
        setOutputText(encoded);
      } else if (encoderMode === 'hex') {
        let hex = '';
        for (let i = 0; i < inputText.length; i++) {
          hex += inputText.charCodeAt(i).toString(16).padStart(2, '0') + ' ';
        }
        setOutputText(hex.trim());
      } else if (encoderMode === 'url') {
        setOutputText(encodeURIComponent(inputText));
      } else if (encoderMode === 'binary') {
        let bin = '';
        for (let i = 0; i < inputText.length; i++) {
          bin += inputText.charCodeAt(i).toString(2).padStart(8, '0') + ' ';
        }
        setOutputText(bin.trim());
      } else if (encoderMode === 'rot13') {
        const rot = inputText.replace(/[a-zA-Z]/g, (c) => {
          const base = c <= 'Z' ? 65 : 97;
          return String.fromCharCode(((c.charCodeAt(0) - base + 13) % 26) + base);
        });
        setOutputText(rot);
      } else if (encoderMode === 'hash') {
        if (hashAlgorithm === 'md5') {
          setOutputText(md5(inputText));
        } else {
          const enc = new TextEncoder();
          const algoName = hashAlgorithm === 'sha256' ? 'SHA-256' : hashAlgorithm === 'sha512' ? 'SHA-512' : 'SHA-1';
          const hashBuffer = await crypto.subtle.digest(algoName, enc.encode(inputText));
          const hashArray = Array.from(new Uint8Array(hashBuffer));
          const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
          setOutputText(hashHex);
        }
      }
    } catch (err: any) {
      setOutputText(`[Encoding Error]: ${err?.message || 'Invalid format'}`);
    }
  };

  const handleDecode = () => {
    if (!inputText) {
      setOutputText('');
      return;
    }

    try {
      if (encoderMode === 'base64') {
        const decoded = decodeURIComponent(escape(atob(inputText.trim())));
        setOutputText(decoded);
      } else if (encoderMode === 'hex') {
        const cleanHex = inputText.replace(/\s+|0x/gi, '');
        let str = '';
        for (let i = 0; i < cleanHex.length; i += 2) {
          str += String.fromCharCode(parseInt(cleanHex.substr(i, 2), 16));
        }
        setOutputText(str);
      } else if (encoderMode === 'url') {
        setOutputText(decodeURIComponent(inputText));
      } else if (encoderMode === 'binary') {
        const cleanBin = inputText.trim().split(/\s+/);
        let str = '';
        for (const b of cleanBin) {
          if (b) str += String.fromCharCode(parseInt(b, 2));
        }
        setOutputText(str);
      } else if (encoderMode === 'rot13') {
        // ROT13 decode is identical to encode
        const rot = inputText.replace(/[a-zA-Z]/g, (c) => {
          const base = c <= 'Z' ? 65 : 97;
          return String.fromCharCode(((c.charCodeAt(0) - base + 13) % 26) + base);
        });
        setOutputText(rot);
      } else if (encoderMode === 'hash') {
        setOutputText('Cryptographic hashes (SHA/MD5) are one-way functions and cannot be mathematically reversed. Use rainbow tables or dictionary lookups.');
      }
    } catch (err: any) {
      setOutputText(`[Decoding Error]: ${err?.message || 'Invalid encoded string'}`);
    }
  };

  const handleSwap = () => {
    if (outputText && !outputText.startsWith('[')) {
      const temp = inputText;
      setInputText(outputText);
      setOutputText(temp);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl bg-white dark:bg-[#0f1117] border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/80 dark:bg-zinc-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-sm shadow-emerald-500/20">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 font-mono tracking-tight">
                  Cyber Security Workbench
                </h3>
                <span className="text-[10px] uppercase font-mono font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  100% Live Engine
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Real-time target reconnaissance, cryptographic encoders, and phishing URL analyzer
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200/50 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-2 px-5 py-2.5 bg-zinc-100/60 dark:bg-zinc-900/40 border-b border-zinc-200 dark:border-zinc-800 text-xs overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('recon')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-semibold transition-all whitespace-nowrap ${
              activeTab === 'recon'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/70 dark:hover:bg-zinc-800'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Target Recon (DNS & GeoIP)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('encoder')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-semibold transition-all whitespace-nowrap ${
              activeTab === 'encoder'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/70 dark:hover:bg-zinc-800'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>Multi-Encoder & Hasher</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('url_inspector')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-semibold transition-all whitespace-nowrap ${
              activeTab === 'url_inspector'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/70 dark:hover:bg-zinc-800'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Phishing & URL Inspector</span>
          </button>

          <button
            id="workbench-tab-link-finder"
            type="button"
            onClick={() => setActiveTab('link_finder')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-semibold transition-all whitespace-nowrap ${
              activeTab === 'link_finder'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/70 dark:hover:bg-zinc-800'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Deep Net Link Finder (Live Verified)</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* ========================================== */}
          {/* TAB 1: RECON (DNS, GEOIP, SECURITY HEADERS) */}
          {/* ========================================== */}
          {activeTab === 'recon' && (
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                  <input
                    type="text"
                    value={reconTarget}
                    onChange={(e) => setReconTarget(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleRunRecon()}
                    placeholder="Enter target domain or IP (e.g., github.com, 1.1.1.1)..."
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleRunRecon()}
                  disabled={isReconLoading}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isReconLoading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Scanning Target...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-3.5 h-3.5" />
                      <span>Run Deep Recon</span>
                    </>
                  )}
                </button>
              </div>

              {/* Quick Presets */}
              <div className="flex items-center gap-1.5 flex-wrap text-[11px] text-zinc-500">
                <span>Presets:</span>
                {['cloudflare.com', 'github.com', 'google.com', '8.8.8.8', '1.1.1.1'].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      setReconTarget(preset);
                      handleRunRecon(preset);
                    }}
                    className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-500 border border-zinc-200 dark:border-zinc-700 font-mono transition-colors"
                  >
                    {preset}
                  </button>
                ))}
              </div>

              {reconError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-500/30 text-xs text-rose-600 dark:text-rose-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{reconError}</span>
                </div>
              )}

              {/* Recon Results Display */}
              {reconResult && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  {/* Summary Bar */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Security Grade */}
                    <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold font-mono text-xl border ${
                        reconResult.securityScore.grade.startsWith('A') 
                          ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                          : reconResult.securityScore.grade === 'B'
                          ? 'bg-blue-500/10 text-blue-500 border-blue-500/30'
                          : reconResult.securityScore.grade === 'C'
                          ? 'bg-amber-500/10 text-amber-500 border-amber-500/30'
                          : 'bg-rose-500/10 text-rose-500 border-rose-500/30'
                      }`}>
                        {reconResult.securityScore.grade}
                      </div>
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                          Security Posture
                        </div>
                        <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                          Score: {reconResult.securityScore.score}/100
                        </div>
                        <div className="text-[11px] text-zinc-500 truncate">
                          {reconResult.securityScore.summary}
                        </div>
                      </div>
                    </div>

                    {/* Geo Location */}
                    <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20 shrink-0">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                          Geo Location
                        </div>
                        <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                          {reconResult.geo?.city ? `${reconResult.geo.city}, ` : ''}{reconResult.geo?.country || 'Unknown'}
                        </div>
                        <div className="text-[11px] text-zinc-500 truncate font-mono">
                          ISP: {reconResult.geo?.isp || 'Direct Autonomous System'}
                        </div>
                      </div>
                    </div>

                    {/* Primary IP / Server Banner */}
                    <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center border border-purple-500/20 shrink-0">
                        <Server className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                          Target Primary IP
                        </div>
                        <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 font-mono truncate">
                          {reconResult.primaryIp || reconResult.target}
                        </div>
                        <div className="text-[11px] text-zinc-500 truncate font-mono">
                          {reconResult.serverBanner ? `Banner: ${reconResult.serverBanner}` : (reconResult.sslAvailable ? 'SSL/TLS Active' : 'HTTP Only')}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* DNS Records Section */}
                  <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider flex items-center gap-2">
                        <Cpu className="w-3.5 h-3.5 text-emerald-500" />
                        Live DNS Records Matrix
                      </span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(JSON.stringify(reconResult.dns, null, 2), 'dns')}
                        className="text-[11px] flex items-center gap-1 text-zinc-400 hover:text-emerald-500 transition-colors"
                      >
                        {copiedKey === 'dns' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>Copy DNS</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                      {/* A / AAAA */}
                      <div className="bg-white dark:bg-zinc-950 p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800">
                        <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase mb-1">
                          A Records (IPv4):
                        </div>
                        {reconResult.dns.a && reconResult.dns.a.length > 0 ? (
                          <div className="space-y-0.5">
                            {reconResult.dns.a.map((ip, i) => (
                              <div key={i} className="text-zinc-700 dark:text-zinc-300 select-all">{ip}</div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-zinc-400 italic">No direct A records</div>
                        )}
                      </div>

                      {/* MX */}
                      <div className="bg-white dark:bg-zinc-950 p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800">
                        <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase mb-1">
                          MX Records (Mail Exchangers):
                        </div>
                        {reconResult.dns.mx && reconResult.dns.mx.length > 0 ? (
                          <div className="space-y-0.5">
                            {reconResult.dns.mx.map((m, i) => (
                              <div key={i} className="text-zinc-700 dark:text-zinc-300 truncate">
                                <span className="text-zinc-400">[pri {m.priority}]</span> {m.exchange}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-zinc-400 italic">No MX records found</div>
                        )}
                      </div>

                      {/* NS */}
                      <div className="bg-white dark:bg-zinc-950 p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800">
                        <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase mb-1">
                          Name Servers (NS):
                        </div>
                        {reconResult.dns.ns && reconResult.dns.ns.length > 0 ? (
                          <div className="space-y-0.5">
                            {reconResult.dns.ns.map((ns, i) => (
                              <div key={i} className="text-zinc-700 dark:text-zinc-300 truncate">{ns}</div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-zinc-400 italic">No NS records returned</div>
                        )}
                      </div>

                      {/* TXT */}
                      <div className="bg-white dark:bg-zinc-950 p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800">
                        <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase mb-1">
                          TXT / SPF / DMARC:
                        </div>
                        {reconResult.dns.txt && reconResult.dns.txt.length > 0 ? (
                          <div className="space-y-1 max-h-24 overflow-y-auto">
                            {reconResult.dns.txt.map((t, i) => (
                              <div key={i} className="text-zinc-600 dark:text-zinc-400 text-[11px] break-all border-b border-zinc-100 dark:border-zinc-800/50 pb-0.5">
                                {t}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-zinc-400 italic">No TXT records</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* HTTP Security Defense Headers */}
                  <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider flex items-center gap-2">
                        <Lock className="w-3.5 h-3.5 text-emerald-500" />
                        Live HTTP Security Defense Headers
                      </span>
                      {onSendToChat && (
                        <button
                          type="button"
                          onClick={() => {
                            const prompt = `Please analyze this security reconnaissance report for target ${reconResult.target}:
Security Grade: ${reconResult.securityScore.grade} (${reconResult.securityScore.score}/100)
Primary IP: ${reconResult.primaryIp || 'N/A'}
ISP: ${reconResult.geo?.isp || 'N/A'}
Server Banner: ${reconResult.serverBanner || 'Hidden'}
Missing Headers: ${reconResult.headers.filter(h => h.status === 'missing').map(h => h.name).join(', ') || 'None'}

What vulnerabilities might this server have and how should the admin harden it?`;
                            onSendToChat(prompt);
                            onClose();
                          }}
                          className="text-[11px] px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 font-semibold flex items-center gap-1.5 transition-colors"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>Ask AI to Analyze</span>
                        </button>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      {reconResult.headers.map((hdr, idx) => (
                        <div
                          key={idx}
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 rounded-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 gap-2 text-xs"
                        >
                          <div className="flex items-start gap-2 min-w-0">
                            {hdr.status === 'passed' ? (
                              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                            ) : hdr.status === 'warning' ? (
                              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                            ) : (
                              <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                            )}
                            <div>
                              <div className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                                <span>{hdr.name}</span>
                                {hdr.value && (
                                  <span className="text-[10px] font-mono text-zinc-400 font-normal truncate max-w-[200px]">
                                    ({hdr.value})
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                                {hdr.recommendation}
                              </div>
                            </div>
                          </div>

                          <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-md self-start sm:self-center border shrink-0 ${
                            hdr.status === 'passed'
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                              : hdr.status === 'warning'
                              ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-500/30'
                              : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-500/30'
                          }`}>
                            {hdr.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================== */}
          {/* TAB 2: MULTI-ENCODER / DECODER & HASHER    */}
          {/* ========================================== */}
          {activeTab === 'encoder' && (
            <div className="space-y-4">
              {/* Mode Selector */}
              <div className="flex items-center gap-1.5 flex-wrap p-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs">
                {[
                  { id: 'base64', label: 'Base64' },
                  { id: 'hex', label: 'Hexadecimal' },
                  { id: 'url', label: 'URL Encode' },
                  { id: 'binary', label: 'Binary (0101)' },
                  { id: 'rot13', label: 'ROT13 Cipher' },
                  { id: 'hash', label: 'Cryptographic Hash' }
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      setEncoderMode(m.id as EncoderMode);
                      setOutputText('');
                    }}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                      encoderMode === m.id
                        ? 'bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 shadow-xs border border-zinc-200 dark:border-zinc-700'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              {encoderMode === 'hash' && (
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-zinc-500 font-semibold">Algorithm:</span>
                  {(['sha256', 'sha512', 'sha1', 'md5'] as const).map((algo) => (
                    <button
                      key={algo}
                      type="button"
                      onClick={() => setHashAlgorithm(algo)}
                      className={`px-2.5 py-1 rounded-md font-mono text-xs uppercase font-bold border transition-colors ${
                        hashAlgorithm === algo
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/40'
                          : 'border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-800'
                      }`}
                    >
                      {algo}
                    </button>
                  ))}
                </div>
              )}

              {/* Text Input Box */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-bold text-zinc-700 dark:text-zinc-300">
                    Input Plaintext / Payload:
                  </label>
                  <span className="text-zinc-400 font-mono text-[11px]">
                    {inputText.length} chars | {new Blob([inputText]).size} bytes
                  </span>
                </div>
                <textarea
                  rows={4}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type or paste payload / text here..."
                  className="w-full p-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleEncode}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>{encoderMode === 'hash' ? `Calculate ${hashAlgorithm.toUpperCase()} Hash` : 'Encode'}</span>
                </button>

                {encoderMode !== 'hash' && (
                  <button
                    type="button"
                    onClick={handleDecode}
                    className="px-4 py-2 rounded-xl bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 font-bold text-xs flex items-center gap-1.5 transition-all"
                  >
                    <FileCode className="w-3.5 h-3.5" />
                    <span>Decode</span>
                  </button>
                )}

                {encoderMode !== 'hash' && (
                  <button
                    type="button"
                    onClick={handleSwap}
                    className="px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 text-xs flex items-center gap-1 transition-colors"
                    title="Swap input and output"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5" />
                    <span>Swap</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setInputText('');
                    setOutputText('');
                  }}
                  className="px-3 py-2 rounded-xl text-zinc-400 hover:text-rose-500 text-xs transition-colors ml-auto"
                >
                  Clear All
                </button>
              </div>

              {/* Output Box */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                    <Hash className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Result Output:</span>
                  </label>
                  {outputText && (
                    <button
                      type="button"
                      onClick={() => copyToClipboard(outputText, 'output')}
                      className="text-[11px] flex items-center gap-1 text-emerald-600 dark:text-emerald-400 hover:underline font-bold"
                    >
                      {copiedKey === 'output' ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Output</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
                <textarea
                  readOnly
                  rows={4}
                  value={outputText}
                  placeholder="Processed output will appear here..."
                  className="w-full p-3 rounded-xl border border-zinc-300 dark:border-zinc-700/80 bg-zinc-50 dark:bg-zinc-950 text-emerald-600 dark:text-emerald-400 font-mono text-xs focus:outline-none select-all"
                />
              </div>
            </div>
          )}

          {/* ========================================== */}
          {/* TAB 3: PHISHING & URL INSPECTOR            */}
          {/* ========================================== */}
          {activeTab === 'url_inspector' && (
            <div className="space-y-4">
              {/* URL Input Bar */}
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <ShieldAlert className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                  <input
                    type="text"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleInspectUrl()}
                    placeholder="Enter full link or suspicious URL (e.g. http://paypal.com.login-verify.xyz/auth)..."
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleInspectUrl()}
                  disabled={isUrlLoading}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isUrlLoading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Analyzing URL...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-3.5 h-3.5" />
                      <span>Inspect Link</span>
                    </>
                  )}
                </button>
              </div>

              {/* Presets */}
              <div className="flex items-center gap-1.5 flex-wrap text-[11px] text-zinc-500">
                <span>Try Samples:</span>
                {[
                  { label: 'Phishing Subdomain', url: 'http://paypal.com.verify-login.secure-portal.top:8080/signin?redirect=https://evil-site.com' },
                  { label: 'Raw IP Host', url: 'http://192.168.1.55:8888/wp-login.php?dest=malicious' },
                  { label: 'Punycode Spoof', url: 'https://xn--pple-43d.com/login/auth' },
                  { label: 'Legit HTTPS', url: 'https://github.com/torvalds/linux' }
                ].map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setUrlInput(sample.url);
                      handleInspectUrl(sample.url);
                    }}
                    className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-500 border border-zinc-200 dark:border-zinc-700 font-mono transition-colors"
                  >
                    {sample.label}
                  </button>
                ))}
              </div>

              {urlError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-500/30 text-xs text-rose-600 dark:text-rose-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{urlError}</span>
                </div>
              )}

              {/* URL Results */}
              {urlResult && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  {/* Gauge & Verdict Banner */}
                  <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    urlResult.riskScore >= 60
                      ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-500/30'
                      : urlResult.riskScore >= 35
                      ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-500/30'
                      : 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-500/30'
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-bold font-mono border ${
                        urlResult.riskScore >= 60
                          ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/30'
                          : urlResult.riskScore >= 35
                          ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                      }`}>
                        <span className="text-lg leading-none">{urlResult.riskScore}</span>
                        <span className="text-[9px] uppercase font-sans text-zinc-500">Risk</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                            urlResult.riskScore >= 60
                              ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30'
                              : urlResult.riskScore >= 35
                              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                              : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                          }`}>
                            {urlResult.riskLevel}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-1 font-mono break-all">
                          {urlResult.hostname}
                        </p>
                      </div>
                    </div>

                    {onSendToChat && (
                      <button
                        type="button"
                        onClick={() => {
                          const prompt = `Please inspect this URL and explain its security risks in detail:
URL: ${urlResult.url}
Risk Score: ${urlResult.riskScore}/100 (${urlResult.riskLevel})
Flags Detected:
${urlResult.flags.map(f => `- [${f.level.toUpperCase()}] ${f.title}: ${f.detail}`).join('\n')}

How should a user protect themselves from this type of link?`;
                          onSendToChat(prompt);
                          onClose();
                        }}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-all self-start sm:self-center"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Ask AI to Break Down</span>
                      </button>
                    )}
                  </div>

                  {/* Components Breakdown */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                    <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                      <span className="text-[10px] uppercase font-bold text-zinc-400 block mb-0.5">Protocol</span>
                      <span className={urlResult.protocol === 'https:' ? 'text-emerald-500 font-bold' : 'text-rose-500 font-bold'}>
                        {urlResult.protocol}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                      <span className="text-[10px] uppercase font-bold text-zinc-400 block mb-0.5">Punycode (Homograph)</span>
                      <span className={urlResult.isPunycode ? 'text-rose-500 font-bold' : 'text-zinc-600 dark:text-zinc-300'}>
                        {urlResult.isPunycode ? 'Detected (xn--)' : 'Clean ASCII'}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                      <span className="text-[10px] uppercase font-bold text-zinc-400 block mb-0.5">Host Format</span>
                      <span className={urlResult.isIpHostname ? 'text-rose-500 font-bold' : 'text-zinc-600 dark:text-zinc-300'}>
                        {urlResult.isIpHostname ? 'Direct IP Address' : 'Domain Name'}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                      <span className="text-[10px] uppercase font-bold text-zinc-400 block mb-0.5">Port</span>
                      <span className={urlResult.isSuspiciousPort ? 'text-amber-500 font-bold' : 'text-zinc-600 dark:text-zinc-300'}>
                        {urlResult.port ? `:${urlResult.port}` : 'Default (80/443)'}
                      </span>
                    </div>
                  </div>

                  {/* Flagged Indicators List */}
                  <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 space-y-2">
                    <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider block">
                      Heuristic Security Findings ({urlResult.flags.length})
                    </span>

                    <div className="space-y-2">
                      {urlResult.flags.map((f, i) => (
                        <div
                          key={i}
                          className="p-3 rounded-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 text-xs flex items-start gap-2.5"
                        >
                          {f.level === 'danger' ? (
                            <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                          ) : f.level === 'warning' ? (
                            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                          ) : (
                            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          )}
                          <div>
                            <div className="font-bold text-zinc-900 dark:text-zinc-100">
                              {f.title}
                            </div>
                            <div className="text-[11.5px] text-zinc-600 dark:text-zinc-400 mt-0.5 leading-relaxed">
                              {f.detail}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================== */}
          {/* TAB 4: DEEP NET LINK FINDER (LIVE VERIFIED) */}
          {/* ========================================== */}
          {activeTab === 'link_finder' && (
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Compass className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                  <input
                    id="link-finder-input"
                    type="text"
                    value={linkQuery}
                    onChange={(e) => setLinkQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleFindLink()}
                    placeholder="Search for any tool, software, repository, documentation, or official site..."
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <button
                  id="link-finder-search-btn"
                  type="button"
                  onClick={() => handleFindLink()}
                  disabled={isLinkLoading}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isLinkLoading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Searching Live Net...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-3.5 h-3.5" />
                      <span>Find Exact Working Link</span>
                    </>
                  )}
                </button>
              </div>

              {/* Quick Presets */}
              <div className="flex items-center gap-1.5 flex-wrap text-[11px] text-zinc-500">
                <span className="font-semibold text-zinc-400">Popular Queries:</span>
                {[
                  'Kali Linux official ISO download',
                  'Tor Project official website',
                  'Metasploit Framework official repo',
                  'Wireshark official download',
                  'Python official documentation',
                  'OWASP Top 10 official website',
                  'Nmap network scanner download'
                ].map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setLinkQuery(preset);
                      handleFindLink(preset);
                    }}
                    className="px-2 py-0.5 rounded-md bg-zinc-200/60 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-emerald-500/20 hover:text-emerald-500 transition-colors font-mono cursor-pointer"
                  >
                    {preset}
                  </button>
                ))}
              </div>

              {linkError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{linkError}</span>
                </div>
              )}

              {/* Link Finder Results */}
              {linkResult && (
                <div className="space-y-4 pt-2">
                  {/* Primary Verified Working Link Banner */}
                  <div className="p-4 rounded-xl bg-emerald-500/10 dark:bg-emerald-950/30 border border-emerald-500/30 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="p-1 rounded-md bg-emerald-500 text-white">
                          <CheckCircle2 className="w-4 h-4" />
                        </span>
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
                            Exact Official Working Destination
                          </span>
                          <h4 className="text-base font-bold text-zinc-900 dark:text-white">
                            {linkResult.title || 'Verified Resource'}
                          </h4>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 self-start sm:self-auto">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 ${
                          linkResult.isLive
                            ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                        }`}>
                          <span className={`w-2 h-2 rounded-full ${linkResult.isLive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                          {linkResult.statusMessage}
                        </span>
                      </div>
                    </div>

                    {linkResult.description && (
                      <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
                        {linkResult.description}
                      </p>
                    )}

                    {/* Direct URL Container */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-2.5 rounded-lg bg-white dark:bg-zinc-900 border border-emerald-500/30">
                      <Link2 className="w-4 h-4 text-emerald-500 shrink-0 hidden sm:block ml-1" />
                      <input
                        type="text"
                        readOnly
                        value={linkResult.primaryUrl}
                        className="flex-1 bg-transparent text-xs font-mono text-emerald-700 dark:text-emerald-300 select-all focus:outline-none truncate"
                      />
                      <div className="flex items-center gap-1.5 shrink-0">
                        <a
                          href={linkResult.primaryUrl}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 transition-all"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Open Link</span>
                        </a>

                        <button
                          type="button"
                          onClick={() => copyToClipboard(linkResult.primaryUrl, 'primary-link')}
                          className="px-2.5 py-1.5 rounded-md bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-semibold flex items-center gap-1 transition-colors"
                          title="Copy Link to Clipboard"
                        >
                          {copiedKey === 'primary-link' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedKey === 'primary-link' ? 'Copied' : 'Copy'}</span>
                        </button>

                        {onSendToChat && (
                          <button
                            type="button"
                            onClick={() => {
                              onSendToChat(`Maine internet se yeh working link dhoondi hai:\n${linkResult.title} - ${linkResult.primaryUrl}\n\nIs resource ke baare mein mazeed details aur guide dein.`);
                              onClose();
                            }}
                            className="px-2.5 py-1.5 rounded-md bg-teal-500/20 hover:bg-teal-500/30 text-teal-600 dark:text-teal-400 border border-teal-500/30 text-xs font-semibold flex items-center gap-1 transition-colors"
                            title="Send to Xrivet Chat"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Ask AI</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Discovered Sub-Links / Alternate Mirrors */}
                  {linkResult.discoveredUrls && linkResult.discoveredUrls.length > 0 && (
                    <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 space-y-2">
                      <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider block">
                        Discovered Related Web Destinations ({linkResult.discoveredUrls.length})
                      </span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {linkResult.discoveredUrls.map((s, idx) => (
                          <a
                            key={idx}
                            href={s.uri}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="p-2.5 rounded-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 hover:border-emerald-500/50 flex items-center justify-between gap-2 group transition-all"
                          >
                            <div className="min-w-0 flex-1">
                              <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 block truncate group-hover:text-emerald-500">
                                {s.title || s.uri}
                              </span>
                              <span className="text-[11px] font-mono text-zinc-400 truncate block">
                                {s.uri}
                              </span>
                            </div>
                            <ExternalLink className="w-3.5 h-3.5 text-zinc-400 group-hover:text-emerald-500 shrink-0" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Search Engine Queries Executed */}
                  {linkResult.searchQueries && linkResult.searchQueries.length > 0 && (
                    <div className="p-3 rounded-lg bg-zinc-100 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/60 flex items-center gap-2 flex-wrap text-xs text-zinc-500">
                      <span className="font-semibold text-zinc-400">Live Search Queries Executed:</span>
                      {linkResult.searchQueries.map((q, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-zinc-200/70 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-mono text-[11px]">
                          "{q}"
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex items-center justify-between text-xs text-zinc-500">
          <span className="font-mono text-[11px]">
            Engine: Xrivet Live Recon & Crypto Engine v2.5
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
