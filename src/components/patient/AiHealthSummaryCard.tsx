import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  RefreshCw,
  TrendingUp,
  Activity,
  Heart,
  Droplet,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Zap,
  Info
} from 'lucide-react';
import { api } from '../../services/api.js';
import { AiHealthSummary } from '../../types/index.js';

interface AiHealthSummaryCardProps {
  onRefreshMetrics?: () => void;
  onOpenQuickUpdate?: () => void;
}

export const AiHealthSummaryCard: React.FC<AiHealthSummaryCardProps> = ({
  onRefreshMetrics,
  onOpenQuickUpdate
}) => {
  const [summary, setSummary] = useState<AiHealthSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'trends' | 'lifestyle' | 'observations'>('trends');
  const [isExpanded, setIsExpanded] = useState(true);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const res = await api.getAiHealthSummary();
      if (res && res.summary) {
        setSummary(res.summary);
      }
    } catch (err) {
      console.error('Failed to fetch AI health summary:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Automatically fetch on mount
    fetchSummary();
  }, []);

  const getStatusBadge = (color: string) => {
    switch (color) {
      case 'emerald':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'amber':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'rose':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      default:
        return 'bg-teal-50 text-teal-800 border-teal-200';
    }
  };

  const getMetricStatusStyle = (status: string) => {
    switch (status) {
      case 'optimal':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'elevated':
        return 'text-amber-800 bg-amber-50 border-amber-200';
      case 'attention':
        return 'text-rose-700 bg-rose-50 border-rose-200';
      default:
        return 'text-slate-700 bg-slate-50 border-slate-200';
    }
  };

  return (
    <div className="bg-gradient-to-br from-white via-teal-50/20 to-emerald-50/30 rounded-2xl border border-teal-200/80 shadow-xs overflow-hidden">
      
      {/* Top Bar with AI Badge and Actions */}
      <div className="p-5 border-b border-teal-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-600 to-emerald-600 text-white flex items-center justify-center shadow-xs shrink-0">
            <Sparkles className="w-5 h-5 text-teal-100 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                AI Health Insights & Biometric Trends
              </h2>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-teal-100/80 text-teal-900 border border-teal-200 rounded-full flex items-center gap-1">
                <Zap className="w-3 h-3 text-teal-600" />
                <span>Gemini 3.8 Flash</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Live algorithmic synthesis of vitals, medication adherence, and Indian lifestyle habits
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          {onOpenQuickUpdate && (
            <button
              onClick={onOpenQuickUpdate}
              className="px-3 py-1.5 text-xs font-semibold text-teal-800 bg-white hover:bg-teal-50 border border-teal-200 rounded-lg shadow-2xs transition-colors"
            >
              + Update Vitals / Upload
            </button>
          )}

          <button
            onClick={fetchSummary}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-2xs transition-colors disabled:opacity-50"
            title="Re-analyze with Gemini API"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Analyzing...' : 'Refresh AI Summary'}</span>
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-teal-100/50 transition-colors"
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Body */}
      {isExpanded && (
        <div className="p-5 sm:p-6 space-y-5">
          
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin" />
              <div>
                <p className="text-xs font-bold text-slate-800">
                  Gemini 3.8 Flash is analyzing your clinical metrics...
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Synthesizing blood pressure trends, BMI status, daily step counts, and active prescriptions
                </p>
              </div>
            </div>
          ) : !summary ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No analysis available yet. Click "Refresh AI Summary" to generate.
            </div>
          ) : (
            <>
              {/* Executive Status Banner */}
              <div className="bg-white rounded-xl border border-teal-100 p-4 shadow-2xs space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg border w-fit ${getStatusBadge(summary.statusColor)}`}>
                    <Activity className="w-3.5 h-3.5" />
                    <span>Executive Clinical Status</span>
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Last synthesized: {new Date(summary.generatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                  {summary.headline}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {summary.overallStatus}
                </p>
              </div>

              {/* Navigation Pill Tabs */}
              <div className="flex items-center gap-2 border-b border-teal-100 pb-2 overflow-x-auto text-xs font-semibold">
                <button
                  onClick={() => setActiveTab('trends')}
                  className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                    activeTab === 'trends'
                      ? 'bg-teal-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-teal-50'
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Metric Trends ({summary.metricsAnalysis?.length || 0})</span>
                </button>

                <button
                  onClick={() => setActiveTab('lifestyle')}
                  className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                    activeTab === 'lifestyle'
                      ? 'bg-teal-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-teal-50'
                  }`}
                >
                  <Lightbulb className="w-3.5 h-3.5" />
                  <span>Lifestyle Adjustments ({summary.lifestyleAdjustments?.length || 0})</span>
                </button>

                <button
                  onClick={() => setActiveTab('observations')}
                  className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                    activeTab === 'observations'
                      ? 'bg-teal-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-teal-50'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Key Positives & Alerts</span>
                </button>
              </div>

              {/* TAB 1: METRIC TRENDS */}
              {activeTab === 'trends' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {summary.metricsAnalysis?.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2 hover:border-teal-200 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          <Activity className="w-3.5 h-3.5 text-teal-600" />
                          <span>{item.metric}</span>
                        </span>
                        {item.value && (
                          <span className="text-xs font-mono font-bold text-slate-800">
                            {item.value}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded capitalize border ${getMetricStatusStyle(item.status)}`}>
                          {item.status}
                        </span>
                        <span className="px-2 py-0.5 text-[10px] font-semibold text-slate-600 bg-slate-100 rounded capitalize">
                          Trend: {item.trend}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed pt-1">
                        {item.interpretation}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 2: LIFESTYLE ADJUSTMENTS */}
              {activeTab === 'lifestyle' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {summary.lifestyleAdjustments?.map((adj, idx) => (
                    <div
                      key={idx}
                      className="bg-white p-4 rounded-xl border border-teal-100 shadow-2xs space-y-2 relative overflow-hidden"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-teal-800 uppercase tracking-wider bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                          {adj.category}
                        </span>
                        {adj.priority && (
                          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded capitalize ${
                            adj.priority === 'high' ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {adj.priority} Priority
                          </span>
                        )}
                      </div>

                      <p className="text-xs font-bold text-slate-900 leading-snug">
                        {adj.recommendation}
                      </p>

                      <p className="text-[11px] text-slate-500 leading-relaxed italic border-t border-slate-100 pt-2">
                        <strong>Clinical Rationale:</strong> {adj.rationale}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 3: POSITIVES & ALERTS */}
              {activeTab === 'observations' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Positives */}
                  <div className="bg-white p-4 rounded-xl border border-emerald-100 shadow-2xs space-y-3">
                    <h4 className="text-xs font-bold text-emerald-900 flex items-center gap-1.5 border-b border-emerald-50 pb-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Positive Observations ({summary.positiveObservations?.length || 0})</span>
                    </h4>
                    <ul className="space-y-2">
                      {summary.positiveObservations?.map((pos, idx) => (
                        <li key={idx} className="text-xs text-slate-700 flex items-start gap-2">
                          <span className="text-emerald-500 font-bold shrink-0 mt-0.5">✓</span>
                          <span>{pos}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Areas for Attention */}
                  <div className="bg-white p-4 rounded-xl border border-amber-100 shadow-2xs space-y-3">
                    <h4 className="text-xs font-bold text-amber-950 flex items-center gap-1.5 border-b border-amber-50 pb-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <span>Areas for Attention ({summary.areasForAttention?.length || 0})</span>
                    </h4>
                    <ul className="space-y-2">
                      {summary.areasForAttention?.map((att, idx) => (
                        <li key={idx} className="text-xs text-slate-700 flex items-start gap-2">
                          <span className="text-amber-600 font-bold shrink-0 mt-0.5">!</span>
                          <span>{att}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                </div>
              )}

              {/* Disclaimer */}
              <div className="text-[11px] text-slate-500 bg-slate-100/70 p-3 rounded-xl border border-slate-200 flex items-start gap-2">
                <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <span>{summary.disclaimer}</span>
              </div>
            </>
          )}

        </div>
      )}

    </div>
  );
};
