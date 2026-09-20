import React, { useState } from 'react';
import { Play } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Check, Copy } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
  onRunCode?: (code: string, language: string) => void;
}

function renderBadgedText(text: string): React.ReactNode {
  if (typeof text !== 'string') return text;
  
  const regex = /(\[(?:FACT|INFERENCE|UNCERTAIN|PASS|FAIL|SELF-CRITIC)\])/g;
  if (!regex.test(text)) return text;
  
  const parts = text.split(regex);
  return parts.map((part, i) => {
    if (part === '[FACT]') {
      return (
        <span key={i} className="inline-flex items-center px-1.5 py-0.5 mx-0.5 rounded text-[11px] font-bold font-mono bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
          FACT
        </span>
      );
    }
    if (part === '[INFERENCE]') {
      return (
        <span key={i} className="inline-flex items-center px-1.5 py-0.5 mx-0.5 rounded text-[11px] font-bold font-mono bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30">
          INFERENCE
        </span>
      );
    }
    if (part === '[UNCERTAIN]') {
      return (
        <span key={i} className="inline-flex items-center px-1.5 py-0.5 mx-0.5 rounded text-[11px] font-bold font-mono bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
          UNCERTAIN
        </span>
      );
    }
    if (part === '[PASS]') {
      return (
        <span key={i} className="inline-flex items-center px-1.5 py-0.5 mx-0.5 rounded text-[11px] font-bold font-mono bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/40">
          ✓ PASS
        </span>
      );
    }
    if (part === '[FAIL]') {
      return (
        <span key={i} className="inline-flex items-center px-1.5 py-0.5 mx-0.5 rounded text-[11px] font-bold font-mono bg-rose-500/20 text-rose-600 dark:text-rose-300 border border-rose-500/40">
          ✕ FAIL
        </span>
      );
    }
    if (part === '[SELF-CRITIC]') {
      return (
        <span key={i} className="inline-flex items-center px-1.5 py-0.5 mx-0.5 rounded text-[11px] font-bold font-mono bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
          🛡️ SELF-CRITIC
        </span>
      );
    }
    return part;
  });
}

function processChildren(children: React.ReactNode): React.ReactNode {
  return React.Children.map(children, child => {
    if (typeof child === 'string') {
      return renderBadgedText(child);
    }
    return child;
  });
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, onRunCode }) => {
  return (
    <div className="text-[15px] leading-relaxed break-words space-y-3 prose-dark max-w-none">
      <ReactMarkdown
        components={{
          code({ inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            const lang = match ? match[1] : '';
            const codeString = String(children).replace(/\n$/, '');

            if (!inline && (match || codeString.includes('\n'))) {
              return <CodeBlock language={lang || 'code'} code={codeString} onRunCode={onRunCode} />;
            }

            return (
              <code
                className="px-1.5 py-0.5 rounded text-[13.5px] font-mono bg-zinc-200/70 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-200 border border-zinc-300/60 dark:border-zinc-700/60"
                {...props}
              >
                {children}
              </code>
            );
          },
          p({ children }) {
            return <p className="mb-2.5 last:mb-0 leading-7 text-zinc-800 dark:text-zinc-200">{processChildren(children)}</p>;
          },
          ul({ children }) {
            return <ul className="list-disc pl-6 mb-3 space-y-1 text-zinc-800 dark:text-zinc-200">{children}</ul>;
          },
          ol({ children }) {
            return <ol className="list-decimal pl-6 mb-3 space-y-1 text-zinc-800 dark:text-zinc-200">{children}</ol>;
          },
          li({ children }) {
            return <li className="leading-relaxed">{processChildren(children)}</li>;
          },
          blockquote({ children }) {
            return (
              <blockquote className="border-l-4 border-emerald-500/60 pl-4 py-1 italic my-3 text-zinc-600 dark:text-zinc-400 bg-emerald-50/40 dark:bg-emerald-950/20 rounded-r">
                {children}
              </blockquote>
            );
          },
          h1({ children }) {
            return <h1 className="text-2xl font-bold mt-4 mb-2 text-zinc-900 dark:text-zinc-100">{children}</h1>;
          },
          h2({ children }) {
            return <h2 className="text-xl font-bold mt-3 mb-2 text-zinc-900 dark:text-zinc-100">{children}</h2>;
          },
          h3({ children }) {
            return <h3 className="text-lg font-semibold mt-2.5 mb-1 text-zinc-900 dark:text-zinc-100">{children}</h3>;
          },
          table({ children }) {
            return (
              <div className="overflow-x-auto my-3 rounded-lg border border-zinc-200 dark:border-zinc-800">
                <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800 text-sm">
                  {children}
                </table>
              </div>
            );
          },
          th({ children }) {
            return (
              <th className="px-4 py-2.5 bg-zinc-100 dark:bg-zinc-800 text-left font-semibold text-zinc-900 dark:text-zinc-100">
                {children}
              </th>
            );
          },
          td({ children }) {
            return (
              <td className="px-4 py-2 border-t border-zinc-200 dark:border-zinc-800/60 text-zinc-800 dark:text-zinc-300">
                {processChildren(children)}
              </td>
            );
          },
          hr() {
            return <hr className="my-4 border-zinc-200 dark:border-zinc-800" />;
          },
          a({ href, children }) {
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-600 dark:text-emerald-400 underline underline-offset-2 hover:text-emerald-500"
              >
                {children}
              </a>
            );
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

const CodeBlock: React.FC<{ language: string; code: string; onRunCode?: (code: string, language: string) => void; }> = ({ language, code, onRunCode }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const showRunButton = onRunCode && (language === 'html' || language === 'jsx' || language === 'javascript' || language === 'js' || language === 'css' || code.includes('<'));

  return (
    <div className="my-3 rounded-lg overflow-hidden border border-zinc-800 bg-[#1e1e1e] text-zinc-100 font-mono text-[13px] shadow-sm">
      <div className="flex items-center justify-between px-4 py-1.5 bg-[#2d2d2d] text-zinc-400 text-xs border-b border-zinc-800 select-none">
        <div className="flex items-center gap-2">
          <span className="font-semibold lowercase tracking-wider text-zinc-300">{language}</span>
          {showRunButton && (
            <button
              onClick={() => onRunCode(code, language)}
              className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-600/90 hover:bg-emerald-500 text-white font-mono text-[10px] font-bold transition-all shadow-sm active:scale-95"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>Run App / Preview</span>
            </button>
          )}
        </div>
        <button
          id={`copy-code-${language}-${Math.random().toString(36).substring(2, 6)}`}
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors cursor-pointer py-0.5 px-2 rounded hover:bg-zinc-700/60"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[11px] text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span className="text-[11px]">Copy</span>
            </>
          )}
        </button>
      </div>
      <div className="p-4 overflow-x-auto bg-[#18181b] leading-6">
        <pre className="m-0 font-mono text-[13.5px] text-zinc-200">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
};
