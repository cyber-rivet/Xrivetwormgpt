import React, { useState } from 'react';
import { 
  Copy, 
  Check, 
  RotateCw, 
  Volume2, 
  VolumeX, 
  Edit3, 
  Sparkles, 
  Flame,
  User, 
  AlertCircle,
  Globe,
  ExternalLink,
  ShieldCheck,
  Link2,
  CheckCircle2
} from 'lucide-react';
import { ChatMessage, User as UserType } from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';

interface MessageItemProps {
  message: ChatMessage;
  currentUser?: UserType | null;
  onRegenerate?: () => void;
  onEditAndResend?: (content: string) => void;
  isLastAssistantMessage?: boolean;
  onRunCode?: (code: string, language: string) => void;
}

const memeYouTubeIds: Record<string, string> = {
  'abe_saale': 'lGg_80YR3Ro',
  'gajab_beizzati': 'F3t1I0z3NQQ',
  'khatam': '07hVlYl8J2Q',
  'waah_scene': 'rK-p36M-Mlk',
  'samajh_rahe_ho': '3R-aGqGfO0c'
};

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  currentUser,
  onRegenerate,
  onEditAndResend,
  isLastAssistantMessage,
  onRunCode,
}) => {
  const [copied, setCopied] = useState(false);
  const [copiedLinkUrl, setCopiedLinkUrl] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.content);
  const [hasPlayedMeme, setHasPlayedMeme] = useState(false);
  const [activeMemeVideo, setActiveMemeVideo] = useState<string | null>(null);

  const isUser = message.role === 'user';

  // Parse meme tags
  const memeMatch = !isUser ? message.content.match(/\[PLAY_MEME:([a-zA-Z0-9_]+)\]/) : null;
  let displayContent = message.content;
  
  if (memeMatch) {
    displayContent = message.content.replace(memeMatch[0], '').trim();
  }

  React.useEffect(() => {
    if (!isUser && isLastAssistantMessage && memeMatch && !hasPlayedMeme) {
      const memeId = memeMatch[1];
      const videoId = memeYouTubeIds[memeId];
      if (videoId) {
        // Play real meme audio using a hidden YouTube iframe
        setActiveMemeVideo(videoId);
        setHasPlayedMeme(true);
        // Clean up the iframe after 5 seconds to save resources
        setTimeout(() => {
          setActiveMemeVideo(null);
        }, 5000);
      }
    }
  }, [isUser, isLastAssistantMessage, memeMatch, hasPlayedMeme]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(displayContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleCopyLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedLinkUrl(url);
      setTimeout(() => setCopiedLinkUrl(null), 2000);
    } catch {
      // ignore
    }
  };

  const handleSpeak = () => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(displayContent);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editText.trim() && onEditAndResend) {
      onEditAndResend(editText.trim());
      setIsEditing(false);
    }
  };

  return (
    <div
      id={`message-${message.id}`}
      className={`py-5 px-4 md:px-6 w-full transition-colors ${
        isUser
          ? 'bg-transparent'
          : 'bg-zinc-100/50 dark:bg-zinc-900/40 border-y border-zinc-200/40 dark:border-zinc-800/40'
      }`}
    >
      {/* Hidden YouTube Iframe for Meme Audio (Bypasses Cloudflare limits) */}
      {activeMemeVideo && (
        <iframe
          width="1"
          height="1"
          src={`https://www.youtube-nocookie.com/embed/${activeMemeVideo}?autoplay=1&controls=0&disablekb=1&playsinline=1`}
          title="Meme Audio"
          frameBorder="0"
          allow="autoplay"
          className="absolute opacity-0 pointer-events-none"
        ></iframe>
      )}
      
      <div className="max-w-3xl mx-auto flex gap-4 items-start">
        {/* Avatar */}
        <div className="shrink-0 mt-0.5 select-none">
          {isUser ? (
            <div className="w-8 h-8 rounded-full bg-zinc-800 dark:bg-zinc-200 text-zinc-100 dark:text-zinc-900 flex items-center justify-center font-medium shadow-xs">
              <User className="w-4 h-4" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-xs shadow-emerald-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
              {isUser ? 'You' : 'Xrivet WormGPT'}
            </span>
            {!isUser && (
              <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full font-mono bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                <Flame className="w-2.5 h-2.5 fill-emerald-500/20" />
                {message.model ? message.model.split(' ')[0] : 'XRIVET-v8.0'}
              </span>
            )}
            <span className="text-[11px] text-zinc-400 ml-auto font-mono">
              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          {/* User editing view */}
          {isEditing ? (
            <form onSubmit={handleSaveEdit} className="mt-2 space-y-2">
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="w-full p-3 rounded-lg bg-white dark:bg-zinc-800 border border-emerald-500 text-sm text-zinc-900 dark:text-zinc-100 outline-none resize-none leading-relaxed"
                rows={3}
              />
              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium"
                >
                  Save & Submit
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 rounded-md bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : message.isError ? (
            <div className="p-3.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-sm flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
              <div className="flex-1">
                <div className="font-semibold text-xs uppercase tracking-wide mb-1">Request Notice</div>
                <div className="leading-relaxed">{message.content}</div>
                {currentUser && (
                  <div className="mt-3 p-3 bg-white/50 dark:bg-zinc-950/50 rounded-lg border border-rose-200 dark:border-rose-900/50">
                    <p className="text-xs font-semibold text-rose-800 dark:text-rose-200 mb-1.5">Invite Link:</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-[11px] font-mono bg-white dark:bg-zinc-900 px-2 py-1 rounded border border-rose-200 dark:border-rose-800 break-all">
                        {`${window.location.origin}/?ref=${currentUser.referralCode || ''}`}
                      </code>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(`${window.location.origin}/?ref=${currentUser.referralCode || ''}`);
                          alert("Link copied!");
                        }}
                        className="px-2 py-1 bg-rose-600 text-white rounded text-[10px] font-medium hover:bg-rose-700"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                )}
                {onRegenerate && (
                  <button
                    type="button"
                    onClick={onRegenerate}
                    className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-rose-600 text-white rounded text-xs font-medium hover:bg-rose-700 transition-colors"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    Retry Request
                  </button>
                )}
              </div>
            </div>
          ) : isUser ? (
            <div className="text-[15px] leading-relaxed text-zinc-900 dark:text-zinc-100 whitespace-pre-wrap break-words">
              {message.content}
            </div>
          ) : (
            <>
              <MarkdownRenderer content={displayContent} onRunCode={onRunCode} />

              {/* Verified Live Link Cards */}
              {message.verifiedLinks && message.verifiedLinks.length > 0 && (
                <div className="mt-4 space-y-2">
                  {message.verifiedLinks.map((link, idx) => (
                    <div 
                      key={idx}
                      className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-cyan-500/10 dark:from-emerald-950/40 dark:via-zinc-900/60 dark:to-cyan-950/40 border border-emerald-500/30 dark:border-emerald-500/40 shadow-sm"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                        <div className="flex items-start gap-2.5 min-w-0">
                          <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">
                            <ShieldCheck className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                                {link.title}
                              </span>
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                                <CheckCircle2 className="w-3 h-3" />
                                {link.statusMessage || 'HTTP 200 Live & Verified'}
                              </span>
                            </div>
                            {link.description && (
                              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 line-clamp-2">
                                {link.description}
                              </p>
                            )}
                            <div className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 font-mono truncate mt-0.5">
                              {link.url}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                          <button
                            type="button"
                            onClick={() => handleCopyLink(link.url)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-zinc-200/80 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors"
                            title="Copy confirmed URL"
                          >
                            {copiedLinkUrl === link.url ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-500" />
                                <span>Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copy Link</span>
                              </>
                            )}
                          </button>
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-colors"
                          >
                            <Link2 className="w-3.5 h-3.5" />
                            <span>Open Link</span>
                            <ExternalLink className="w-3 h-3 ml-0.5 opacity-80" />
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {message.searchSources && message.searchSources.length > 0 && (
                <div className="mt-4 pt-3 border-t border-zinc-200/60 dark:border-zinc-800/60">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-2">
                    <Globe className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Live Web Sources &amp; Discovered Endpoints:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {message.searchSources.map((source, idx) => (
                      <a
                        key={idx}
                        href={source.uri}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-zinc-200/70 hover:bg-zinc-300/80 dark:bg-zinc-800/80 dark:hover:bg-zinc-700/80 text-zinc-800 dark:text-zinc-200 border border-zinc-300/40 dark:border-zinc-700/50 transition-colors"
                      >
                        <span className="max-w-[200px] truncate">{source.title || source.uri}</span>
                        <ExternalLink className="w-3 h-3 text-zinc-400" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Action Bar */}
          {!message.isError && !isEditing && (
            <div className="flex items-center gap-2 mt-3 text-zinc-400">
              <button
                id={`copy-msg-btn-${message.id}`}
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1 text-xs py-1 px-1.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
                title="Copy message"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="text-[11px]">{copied ? 'Copied' : 'Copy'}</span>
              </button>

              {!isUser && 'speechSynthesis' in window && (
                <button
                  id={`speak-msg-btn-${message.id}`}
                  type="button"
                  onClick={handleSpeak}
                  className={`flex items-center gap-1 text-xs py-1 px-1.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors ${
                    isSpeaking ? 'text-emerald-500 font-medium' : 'hover:text-zinc-700 dark:hover:text-zinc-200'
                  }`}
                  title={isSpeaking ? 'Stop reading' : 'Read aloud'}
                >
                  {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                  <span className="text-[11px]">{isSpeaking ? 'Stop' : 'Listen'}</span>
                </button>
              )}

              {isUser && onEditAndResend && (
                <button
                  id={`edit-msg-btn-${message.id}`}
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1 text-xs py-1 px-1.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
                  title="Edit message"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span className="text-[11px]">Edit</span>
                </button>
              )}

              {!isUser && isLastAssistantMessage && onRegenerate && (
                <button
                  id={`regen-msg-btn-${message.id}`}
                  type="button"
                  onClick={onRegenerate}
                  className="flex items-center gap-1 text-xs py-1 px-1.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
                  title="Regenerate response"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span className="text-[11px]">Regenerate</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
