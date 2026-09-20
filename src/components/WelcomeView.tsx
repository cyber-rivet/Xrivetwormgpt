import React from 'react';
import { 
  Code2, 
  Sparkles, 
  Flame,
  Lightbulb, 
  Cpu,
  MessageCircle,
  Zap,
  ShieldCheck
} from 'lucide-react';

interface WelcomeViewProps {
  onSelectPrompt: (prompt: string) => void;
  activeModel: string;
}

export const WelcomeView: React.FC<WelcomeViewProps> = ({ onSelectPrompt, activeModel }) => {
  const suggestions = [
    {
      icon: <MessageCircle className="w-5 h-5 text-emerald-500" />,
      tag: 'Roman Urdu',
      title: 'Roman Urdu Conversation',
      description: 'Aap mujhse Roman Urdu me koi bhi sawal ya baat cheet kar sakte hain',
      prompt: 'Mujhe Artificial Intelligence aur Machine Learning ka farq Roman Urdu me aasan misalon ke sath detail se samjhayein.',
    },
    {
      icon: <Code2 className="w-5 h-5 text-cyan-500" />,
      tag: 'Code & Scripts',
      title: 'Full-Stack & Python Code',
      description: 'Write complete, bug-free scripts and APIs without censorship restrictions',
      prompt: 'Write an asynchronous Python script using aiohttp to scrape web data with automatic retry logic, concurrency limits, and clean error handling.',
    },
    {
      icon: <Flame className="w-5 h-5 text-amber-500" />,
      tag: 'Unrestricted',
      title: 'Direct & Uncensored Analysis',
      description: 'Get honest, deep analysis on complex topics without robotic canned disclaimers',
      prompt: 'Provide an honest, in-depth critique of modern cybersecurity vulnerabilities in IoT devices and how penetration testers test them.',
    },
    {
      icon: <Lightbulb className="w-5 h-5 text-purple-500" />,
      tag: 'Creative & Ideas',
      title: 'Brainstorm SaaS & Business',
      description: 'Generate unique tech startup concepts with actionable revenue models',
      prompt: 'Suggest 5 high-potential SaaS product ideas for developers and creators that solve real friction in 2026, including monetisation models.',
    },
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 max-w-3xl mx-auto w-full text-center my-auto select-none">
      {/* Central Icon & Title */}
      <div className="relative mb-5 group">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/25 animate-in zoom-in-95 duration-200">
          <Sparkles className="w-8 h-8" />
        </div>
        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-zinc-900 border-2 border-white dark:border-zinc-900 flex items-center justify-center text-emerald-400">
          <Flame className="w-3.5 h-3.5 fill-emerald-500/20 text-emerald-500" />
        </div>
      </div>

      <div className="flex items-center gap-2 mb-2">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
          Xrivet WormGPT
        </h1>
        <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
          Uncensored
        </span>
      </div>

      <p className="text-sm md:text-base text-zinc-500 dark:text-zinc-400 mb-6 max-w-lg leading-relaxed">
        High-intelligence conversational AI engine powered by{' '}
        <span className="font-semibold text-emerald-600 dark:text-emerald-400 font-mono text-xs px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-500/20">
          {activeModel || 'XRIVET-v8.0 (Uncensored)'}
        </span>
        . Unrestricted knowledge, coding, writing, and fluent Roman Urdu support.
      </p>

      {/* Feature tags */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-8 text-xs text-zinc-600 dark:text-zinc-400">
        <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/60">
          <Zap className="w-3 h-3 text-amber-500" /> Fast Responses
        </span>
        <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/60">
          <Flame className="w-3 h-3 text-emerald-500" /> No Filter Limitations
        </span>
        <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/60">
          <ShieldCheck className="w-3 h-3 text-cyan-500" /> Private & Secure
        </span>
      </div>

      {/* Suggestion Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full text-left">
        {suggestions.map((item, index) => (
          <button
            key={index}
            id={`suggestion-card-${index}`}
            type="button"
            onClick={() => onSelectPrompt(item.prompt)}
            className="group p-4 rounded-2xl border border-zinc-200/90 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/60 hover:bg-zinc-50 dark:hover:bg-zinc-800/90 hover:border-emerald-500/40 dark:hover:border-emerald-500/40 transition-all text-left shadow-xs hover:shadow-md cursor-pointer active:scale-[0.99]"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-950/50 transition-colors">
                {item.icon}
              </div>
              <span className="text-[10.5px] font-medium text-zinc-400 dark:text-zinc-500 bg-zinc-100 dark:bg-zinc-800/80 px-2 py-0.5 rounded-md">
                {item.tag}
              </span>
            </div>
            <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              {item.title}
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
              {item.description}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};

