import React, { useState, useEffect } from 'react';
import {
  Brain,
  Sparkles,
  Zap,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit3,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Clock,
  BookOpen,
  HelpCircle,
  Check,
  ChevronDown,
  ChevronUp,
  X,
  Bot,
  Play,
  Award
} from 'lucide-react';
import { LearnedKnowledgeItem, KnowledgeStats } from '../types';

interface AiTrainingSectionProps {
  adminPassword: string;
  onShowMessage: (msg: string) => void;
  onShowError: (err: string) => void;
}

export const AiTrainingSection: React.FC<AiTrainingSectionProps> = ({
  adminPassword,
  onShowMessage,
  onShowError
}) => {
  const [items, setItems] = useState<LearnedKnowledgeItem[]>([]);
  const [stats, setStats] = useState<KnowledgeStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [expandedCardIds, setExpandedCardIds] = useState<Record<string, boolean>>({});

  // Batch Auto-Train
  const [isBatchTraining, setIsBatchTraining] = useState(false);

  // Add / Edit Modal state
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<LearnedKnowledgeItem | null>(null);
  const [formTopic, setFormTopic] = useState('');
  const [formPattern, setFormPattern] = useState('');
  const [formAnswer, setFormAnswer] = useState('');
  const [formCategory, setFormCategory] = useState<any>('General');
  const [formStatus, setFormStatus] = useState<'active' | 'draft'>('active');
  const [isSavingItem, setIsSavingItem] = useState(false);

  // Live Testing Simulator
  const [testQuery, setTestQuery] = useState('');
  const [testResult, setTestResult] = useState<{ match: LearnedKnowledgeItem | null; score: number } | null>(null);

  useEffect(() => {
    fetchKnowledge();
  }, [adminPassword]);

  const fetchKnowledge = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/knowledge', {
        headers: {
          'x-admin-password': adminPassword
        }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setItems(data.items || []);
        setStats(data.stats || null);
      }
    } catch (err: any) {
      console.error('Failed to load knowledge:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBatchTrainAll = async () => {
    setIsBatchTraining(true);
    try {
      const res = await fetch('/api/admin/train-all', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password: adminPassword })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        onShowMessage(data.message || 'Batch training completed!');
        fetchKnowledge();
      } else {
        onShowError(data.error || 'Batch training failed.');
      }
    } catch (err: any) {
      onShowError(err.message || 'Server error during batch training.');
    } finally {
      setIsBatchTraining(false);
    }
  };

  const openCreateModal = () => {
    setEditingItem(null);
    setFormTopic('');
    setFormPattern('');
    setFormAnswer('');
    setFormCategory('General');
    setFormStatus('active');
    setIsEditorOpen(true);
  };

  const openEditModal = (item: LearnedKnowledgeItem) => {
    setEditingItem(item);
    setFormTopic(item.topic);
    setFormPattern(item.questionPattern);
    setFormAnswer(item.refinedAnswer);
    setFormCategory(item.category);
    setFormStatus(item.status === 'draft' ? 'draft' : 'active');
    setIsEditorOpen(true);
  };

  const handleSaveKnowledge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formPattern.trim() || !formAnswer.trim()) {
      onShowError('Question pattern aur master answer donon lazmi hain.');
      return;
    }

    setIsSavingItem(true);
    try {
      const isEdit = Boolean(editingItem);
      const url = isEdit ? `/api/admin/knowledge/${editingItem!.id}` : '/api/admin/knowledge';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          password: adminPassword,
          topic: formTopic.trim() || 'Master Knowledge',
          questionPattern: formPattern.trim(),
          refinedAnswer: formAnswer.trim(),
          category: formCategory,
          status: formStatus
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        onShowMessage(data.message || 'Knowledge saved successfully!');
        setIsEditorOpen(false);
        fetchKnowledge();
      } else {
        onShowError(data.error || 'Failed to save knowledge.');
      }
    } catch (err: any) {
      onShowError(err.message || 'Error saving knowledge item.');
    } finally {
      setIsSavingItem(false);
    }
  };

  const handleDeleteItem = async (id: string, topic: string) => {
    if (!window.confirm(`Kya aap waqai is knowledge card "${topic}" ko delete karna chahte hain?`)) return;

    try {
      const res = await fetch(`/api/admin/knowledge/${id}`, {
        method: 'DELETE',
        headers: {
          'x-admin-password': adminPassword
        }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        onShowMessage('Knowledge card deleted.');
        setItems(prev => prev.filter(i => i.id !== id));
      } else {
        onShowError(data.error || 'Failed to delete.');
      }
    } catch (err: any) {
      onShowError(err.message || 'Error deleting knowledge card.');
    }
  };

  // Live simulation / testing function
  const runSimulatorTest = () => {
    const q = testQuery.trim().toLowerCase();
    if (!q) {
      setTestResult(null);
      return;
    }

    const queryTokens = q.split(/\s+/).filter(t => t.length > 2);
    let bestMatch: LearnedKnowledgeItem | null = null;
    let highestScore = 0;

    for (const item of items) {
      if (item.status !== 'active') continue;
      let score = 0;
      const pattern = item.questionPattern.toLowerCase();
      const topic = item.topic.toLowerCase();

      if (pattern === q || topic === q) score += 100;
      if (pattern.includes(q) || q.includes(pattern)) score += 60;

      for (const token of queryTokens) {
        if (pattern.includes(token)) score += 15;
        if (topic.includes(token)) score += 10;
      }

      if (score > highestScore) {
        highestScore = score;
        bestMatch = item;
      }
    }

    setTestResult({
      match: highestScore >= 15 ? bestMatch : null,
      score: highestScore
    });
  };

  const categories = ['All', 'General', 'Coding', 'Security', 'How-To', 'Troubleshooting', 'Architecture', 'FAQ'];

  const filteredItems = items.filter(item => {
    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
    if (!matchesCat) return false;

    if (!searchQuery.trim()) return true;
    const term = searchQuery.toLowerCase();
    return (
      item.topic.toLowerCase().includes(term) ||
      item.questionPattern.toLowerCase().includes(term) ||
      item.refinedAnswer.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-4">
      {/* Overview Banner */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-900/30 via-zinc-900/40 to-emerald-950/20 border border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shrink-0 mt-0.5">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <span>AI Auto-Trainer &amp; Knowledge Base</span>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Self-Learning Active
              </span>
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xl mt-0.5 leading-relaxed">
              Users ke queries aur master answers ko AI Knowledge Cards mein train karein taake har user ko 100% accurate, deep, aur error-free jawab mile.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <button
            id="batch-train-all-btn"
            type="button"
            onClick={handleBatchTrainAll}
            disabled={isBatchTraining}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm shadow-emerald-600/30 transition-colors disabled:opacity-50"
            title="Batch train all recent user searches with NoTrack AI"
          >
            {isBatchTraining ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
            <span>{isBatchTraining ? 'Auto-Training...' : 'Batch Auto-Train Queries'}</span>
          </button>

          <button
            id="add-knowledge-card-btn"
            type="button"
            onClick={openCreateModal}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 font-bold text-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Knowledge Card</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800">
          <div className="text-zinc-500 dark:text-zinc-400 text-[11px] font-semibold flex items-center justify-between">
            <span>Total Knowledge</span>
            <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <div className="text-xl font-bold font-mono text-zinc-900 dark:text-zinc-100 mt-1">
            {stats?.totalKnowledge || items.length}
          </div>
          <div className="text-[10px] text-zinc-400">Master Q&amp;A cards</div>
        </div>

        <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800">
          <div className="text-zinc-500 dark:text-zinc-400 text-[11px] font-semibold flex items-center justify-between">
            <span>Active Cards</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
            {stats?.activeKnowledge || items.filter(i => i.status === 'active').length}
          </div>
          <div className="text-[10px] text-zinc-400">Live in user chat pipeline</div>
        </div>

        <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800">
          <div className="text-zinc-500 dark:text-zinc-400 text-[11px] font-semibold flex items-center justify-between">
            <span>Times Applied</span>
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <div className="text-xl font-bold font-mono text-zinc-900 dark:text-zinc-100 mt-1">
            {stats?.totalApplied || items.reduce((acc, i) => acc + (i.timesApplied || 0), 0)}
          </div>
          <div className="text-[10px] text-zinc-400">Auto-injected into responses</div>
        </div>

        <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800">
          <div className="text-zinc-500 dark:text-zinc-400 text-[11px] font-semibold flex items-center justify-between">
            <span>Top Category</span>
            <Award className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <div className="text-sm font-bold truncate text-zinc-900 dark:text-zinc-100 mt-1">
            {stats?.topCategories?.[0]?.category || 'Coding / Security'}
          </div>
          <div className="text-[10px] text-zinc-400">
            {stats?.topCategories?.[0] ? `${stats.topCategories[0].count} entries` : 'Optimized'}
          </div>
        </div>
      </div>

      {/* Live Question Match Simulator */}
      <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
            <Play className="w-3.5 h-3.5 text-emerald-500" />
            <span>Test Knowledge Matcher Simulator</span>
          </span>
          <span className="text-[10px] text-zinc-400">
            Simulate how the AI matches real questions
          </span>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={testQuery}
            onChange={(e) => setTestQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && runSimulatorTest()}
            placeholder="Type any question to test matching (e.g., 'How to build async port scanner in Python?')..."
            className="flex-1 px-3 py-1.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            type="button"
            onClick={runSimulatorTest}
            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors flex items-center gap-1"
          >
            <span>Test Match</span>
          </button>
        </div>

        {testResult && (
          <div className="mt-2 p-2.5 rounded-lg bg-zinc-900 text-zinc-100 text-xs border border-zinc-800 animate-fade-in">
            {testResult.match ? (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-emerald-400 font-bold text-[11px]">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Matched Card: {testResult.match.topic}</span>
                  </span>
                  <span className="font-mono text-[10px] bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/30">
                    Match Score: {testResult.score}pts
                  </span>
                </div>
                <div className="text-[11px] text-zinc-300">
                  <span className="text-zinc-400">Canonical Pattern:</span> &ldquo;{testResult.match.questionPattern}&rdquo;
                </div>
                <div className="text-[11px] text-zinc-400 line-clamp-2 italic">
                  Preview: {testResult.match.refinedAnswer.substring(0, 160)}...
                </div>
              </div>
            ) : (
              <div className="text-amber-400 flex items-center gap-1.5 text-[11px]">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Koi exact trained card match nahi hua (Will use live internet search &amp; baseline LLM).</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-2 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search trained knowledge by topic, question, or code..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-100 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Knowledge Cards List */}
      <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-900/40">
        {filteredItems.length === 0 ? (
          <div className="py-12 text-center text-xs text-zinc-400 space-y-2">
            <BookOpen className="w-8 h-8 mx-auto text-zinc-300 dark:text-zinc-700" />
            <p className="font-semibold text-zinc-600 dark:text-zinc-400">
              {searchQuery ? 'Koi matching knowledge card nahi mila.' : 'Abhi tak koi knowledge card add nahi kiya gaya.'}
            </p>
            <p className="text-[11px] text-zinc-400">
              Upar &quot;Add Knowledge Card&quot; ya &quot;Batch Auto-Train&quot; click karein.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-200 dark:divide-zinc-800 max-h-[500px] overflow-y-auto">
            {filteredItems.map((item) => {
              const isExpanded = expandedCardIds[item.id] ?? false;

              const toggleExpand = () => {
                setExpandedCardIds(prev => ({
                  ...prev,
                  [item.id]: !isExpanded
                }));
              };

              return (
                <div key={item.id} className="p-3.5 hover:bg-zinc-50/70 dark:hover:bg-zinc-800/40 transition-colors">
                  <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
                        {item.topic}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        {item.category}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
                        {item.timesApplied || 0} applied
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        {item.confidenceScore}% confidence
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => openEditModal(item)}
                        className="p-1 rounded-lg text-zinc-400 hover:text-emerald-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        title="Edit Knowledge Card"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteItem(item.id, item.topic)}
                        className="p-1 rounded-lg text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                        title="Delete Knowledge Card"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Question Pattern */}
                  <div className="text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50/40 dark:bg-emerald-950/20 p-2 rounded-lg border border-emerald-500/20 mb-2">
                    <span className="font-bold">Canonical Question:</span> &ldquo;{item.questionPattern}&rdquo;
                  </div>

                  {/* Refined Master Answer */}
                  <div className="bg-zinc-100 dark:bg-zinc-950 p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs font-mono text-zinc-800 dark:text-zinc-200 leading-relaxed whitespace-pre-wrap">
                    {isExpanded ? (
                      item.refinedAnswer
                    ) : (
                      <div>
                        {item.refinedAnswer.slice(0, 220)}
                        {item.refinedAnswer.length > 220 && (
                          <button
                            type="button"
                            onClick={toggleExpand}
                            className="ml-1 text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
                          >
                            ...show full answer
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {item.refinedAnswer.length > 220 && isExpanded && (
                    <button
                      type="button"
                      onClick={toggleExpand}
                      className="mt-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
                    >
                      Collapse
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Editor Modal for Adding / Editing Knowledge Card */}
      {isEditorOpen && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in"
          onClick={() => setIsEditorOpen(false)}
        >
          <div
            className="w-full max-w-xl bg-white dark:bg-[#16171a] rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/60">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-emerald-500" />
                <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                  {editingItem ? 'Edit Master Knowledge Card' : 'Add New Master Knowledge Card'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditorOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveKnowledge} className="p-5 overflow-y-auto space-y-3.5 flex-1 text-xs">
              <div>
                <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Topic Title
                </label>
                <input
                  type="text"
                  value={formTopic}
                  onChange={(e) => setFormTopic(e.target.value)}
                  placeholder="e.g. Python Async Scanner, Subdomain Takeover, JWT Verification"
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Category
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="General">General</option>
                    <option value="Coding">Coding</option>
                    <option value="Security">Security</option>
                    <option value="How-To">How-To</option>
                    <option value="Troubleshooting">Troubleshooting</option>
                    <option value="Architecture">Architecture</option>
                    <option value="FAQ">FAQ</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Status
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="active">Active (Injected into Live Chat)</option>
                    <option value="draft">Draft (Saved only in Admin)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Canonical Question / Trigger Pattern
                </label>
                <input
                  type="text"
                  value={formPattern}
                  onChange={(e) => setFormPattern(e.target.value)}
                  placeholder="e.g. How to write a fast port scanner in Python?"
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Master Refined Answer (Markdown / Complete Code)
                </label>
                <textarea
                  value={formAnswer}
                  onChange={(e) => setFormAnswer(e.target.value)}
                  placeholder="Write complete, production-ready verified answer with code, bullet points, and explanations..."
                  rows={8}
                  className="w-full p-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="px-4 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingItem}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 shadow-sm shadow-emerald-600/30 disabled:opacity-50"
                >
                  {isSavingItem ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>Save Knowledge Card</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
