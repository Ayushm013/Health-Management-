import React, { useState, useEffect } from 'react';
import {
  Activity,
  Plus,
  Calendar,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Info,
  Weight,
  Heart,
  Droplet,
  Thermometer,
  Wind,
  X,
  Trash2,
  Bell,
  Sliders,
  ShieldAlert
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ReferenceLine
} from 'recharts';
import { api } from '../../services/api.js';
import { HealthMetric, MetricType, MetricThresholdAlert } from '../../types/index.js';
import { MetricThresholdAlertsConfig } from './MetricThresholdAlertsConfig.js';

export const HealthMetricsView: React.FC = () => {
  const [metrics, setMetrics] = useState<HealthMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<MetricType>('blood_pressure');
  const [timeframe, setTimeframe] = useState<string>('6m');
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Add Metric State
  const [metricType, setMetricType] = useState<MetricType>('blood_pressure');
  const [value, setValue] = useState('');
  const [systolic, setSystolic] = useState('120');
  const [diastolic, setDiastolic] = useState('80');
  const [unit, setUnit] = useState('mmHg');
  const [notes, setNotes] = useState('');
  const [recordedAt, setRecordedAt] = useState(new Date().toISOString().slice(0, 16));
  const [adding, setAdding] = useState(false);

  const [thresholds, setThresholds] = useState<MetricThresholdAlert[]>([]);
  const [isThresholdModalOpen, setIsThresholdModalOpen] = useState(false);

  useEffect(() => {
    loadMetrics();
    loadThresholds();
  }, []);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      const res = await api.getHealthMetrics();
      setMetrics(res.metrics || []);
    } catch (err) {
      console.error('Error loading metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadThresholds = async () => {
    try {
      const res = await api.getMetricThresholds();
      setThresholds(res.thresholds || []);
    } catch (err) {
      console.error('Error loading thresholds:', err);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    try {
      const payload: Partial<HealthMetric> = {
        metricType,
        recordedAt: new Date(recordedAt).toISOString(),
        notes
      };

      if (metricType === 'blood_pressure') {
        payload.systolic = Number(systolic);
        payload.diastolic = Number(diastolic);
        payload.value = Number(systolic);
        payload.unit = 'mmHg';
      } else {
        payload.value = Number(value);
        payload.unit = unit;
      }

      await api.addHealthMetric(payload);
      setIsAddOpen(false);
      setValue('');
      setNotes('');
      await loadMetrics();
    } catch (err) {
      alert('Failed to record health reading.');
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this health metric entry?')) return;
    try {
      await api.deleteHealthMetric(id);
      await loadMetrics();
    } catch (err) {
      alert('Unable to delete metric entry.');
    }
  };

  // Filter metrics for the selected tab
  const currentTabMetrics = metrics.filter(m => m.metricType === activeTab);

  // Compute stats: Latest, Average, Min, Max
  const values = currentTabMetrics.map(m => m.metricType === 'blood_pressure' ? (m.systolic || m.value) : m.value);
  const latest = currentTabMetrics[currentTabMetrics.length - 1];
  const avg = values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 0;
  const min = values.length ? Math.min(...values) : 0;
  const max = values.length ? Math.max(...values) : 0;

  // Determine trend direction
  let trendDirection = 'stable';
  if (values.length >= 2) {
    const first = values[0];
    const last = values[values.length - 1];
    if (last > first) trendDirection = 'increasing';
    else if (last < first) trendDirection = 'decreasing';
  }

  // Check if any reading in current tab is out of range
  const hasOutOfRange = currentTabMetrics.some(m => m.isOutOfRange);

  // Latest values map for threshold evaluation
  const latestMetricsMap: Record<string, number> = {};
  metrics.forEach(m => {
    if (m.metricType === 'blood_pressure') {
      latestMetricsMap['blood_pressure'] = m.systolic || m.value;
    } else {
      latestMetricsMap[m.metricType] = m.value;
    }
  });

  // Calculate live BMI if weight is available (height default 168 cm)
  if (latestMetricsMap['weight']) {
    const hM = (latestMetricsMap['height'] || 168) / 100;
    latestMetricsMap['bmi'] = Number((latestMetricsMap['weight'] / (hM * hM)).toFixed(1));
  }

  // Active breached threshold rules
  const activeBreaches = thresholds.filter(t => {
    if (!t.enabled) return false;
    const current = latestMetricsMap[t.metricType];
    if (current === undefined) return false;

    if (t.condition === 'greater_than') return current > t.thresholdValue;
    if (t.condition === 'less_than') return current < t.thresholdValue;
    if (t.condition === 'outside_range') {
      return current < t.thresholdValue || current > (t.thresholdMax ?? t.thresholdValue);
    }
    return false;
  }).map(t => ({
    ...t,
    currentValue: latestMetricsMap[t.metricType]
  }));

  const thresholdForActiveTab = thresholds.find(t => t.enabled && t.metricType === activeTab);

  // Chart data formatting
  const chartData = currentTabMetrics.map(m => {
    const dStr = new Date(m.recordedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    if (m.metricType === 'blood_pressure') {
      return {
        date: dStr,
        systolic: m.systolic || m.value,
        diastolic: m.diastolic || 80
      };
    }
    return {
      date: dStr,
      value: m.value
    };
  });

  const metricTabs: Array<{ id: MetricType; label: string; icon: any; unit: string }> = [
    { id: 'blood_pressure', label: 'Blood Pressure', icon: Activity, unit: 'mmHg' },
    { id: 'weight', label: 'Body Weight', icon: Weight, unit: 'kg' },
    { id: 'blood_glucose', label: 'Blood Glucose', icon: Droplet, unit: 'mg/dL' },
    { id: 'heart_rate', label: 'Heart Rate', icon: Heart, unit: 'bpm' },
    { id: 'oxygen_saturation', label: 'Oxygen (SpO2)', icon: Wind, unit: '%' },
    { id: 'body_temperature', label: 'Temperature', icon: Thermometer, unit: '°F' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Health Analytics & Vitals Monitoring
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Continuous biometric trend analysis with standard reference range evaluation & custom threshold alerts
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsThresholdModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-teal-700 bg-white hover:bg-teal-50 border border-slate-200 rounded-lg shadow-2xs transition-colors"
          >
            <Bell className="w-4 h-4 text-teal-600" />
            <span>Threshold Alerts</span>
            {activeBreaches.length > 0 ? (
              <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-rose-500 text-white font-mono font-bold animate-pulse">
                {activeBreaches.length} Alert{activeBreaches.length > 1 ? 's' : ''}
              </span>
            ) : (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 text-slate-600 font-mono">
                {thresholds.filter(t => t.enabled).length} active
              </span>
            )}
          </button>

          <button
            onClick={() => {
              setMetricType(activeTab);
              setIsAddOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-2xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Record New Vital</span>
          </button>
        </div>
      </div>

      {/* Active Threshold Breach Alert Banner */}
      {activeBreaches.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-xs text-rose-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-start gap-3">
            <div className="p-1.5 bg-rose-100 rounded-lg text-rose-700 mt-0.5 shrink-0">
              <ShieldAlert className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-bold text-rose-900 text-sm">
                  Active Custom Threshold Alert Triggered ({activeBreaches.length})
                </p>
                <span className="text-[10px] uppercase font-bold bg-rose-200 text-rose-800 px-2 py-0.5 rounded-full">
                  Action Required
                </span>
              </div>
              <div className="mt-1 space-y-1">
                {activeBreaches.map(b => (
                  <p key={b.id} className="text-xs text-rose-900 leading-relaxed">
                    • <strong className="capitalize">{b.metricType.replace('_', ' ')}:</strong> Current measurement is <strong>{b.currentValue} {b.unit}</strong> which breaches your configured limit of <strong>{b.thresholdValue} {b.unit}</strong>. {b.customMessage && <span className="italic">(&quot;{b.customMessage}&quot;)</span>}
                  </p>
                ))}
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsThresholdModalOpen(true)}
            className="self-start sm:self-center shrink-0 px-3 py-1.5 bg-white text-rose-700 border border-rose-300 hover:bg-rose-100 font-semibold rounded-lg text-xs transition-colors"
          >
            Manage Thresholds
          </button>
        </div>
      )}

      {/* Reference Range Alert (Complying with Section 14) */}
      {hasOutOfRange && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 flex items-start gap-3 shadow-2xs">
          <Info className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-amber-950">
              Reference Range Informational Advisory
            </p>
            <p className="leading-relaxed text-amber-900/90">
              Your recorded value is outside the configured reference range. Consider discussing it with a qualified healthcare professional during your next scheduled consultation.
            </p>
          </div>
        </div>
      )}

      {/* Metric Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {metricTabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                isActive
                  ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Summary KPI Cards for Active Metric */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] text-slate-500 font-medium">Latest Measurement</span>
          <div className="text-xl font-bold text-slate-900 font-mono tabular-nums mt-1">
            {latest ? (
              activeTab === 'blood_pressure' ? (
                `${latest.systolic || latest.value}/${latest.diastolic || 80}`
              ) : (
                `${latest.value} ${latest.unit}`
              )
            ) : '--'}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">
            {latest ? new Date(latest.recordedAt).toLocaleDateString() : 'No data'}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] text-slate-500 font-medium">Average Value</span>
          <div className="text-xl font-bold text-slate-900 font-mono tabular-nums mt-1">
            {avg || '--'}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Calculated across records</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] text-slate-500 font-medium">Minimum Value</span>
          <div className="text-xl font-bold text-slate-900 font-mono tabular-nums mt-1">
            {min || '--'}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Lowest recorded</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] text-slate-500 font-medium">Maximum Value</span>
          <div className="text-xl font-bold text-slate-900 font-mono tabular-nums mt-1">
            {max || '--'}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Peak measurement</p>
        </div>

        <div className="col-span-2 lg:col-span-1 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] text-slate-500 font-medium">Observed Trend</span>
          <div className="text-xl font-bold text-teal-700 capitalize flex items-center gap-1.5 mt-1">
            {trendDirection === 'increasing' ? (
              <TrendingUp className="w-5 h-5 text-amber-600" />
            ) : trendDirection === 'decreasing' ? (
              <TrendingDown className="w-5 h-5 text-teal-600" />
            ) : (
              <Activity className="w-5 h-5 text-slate-500" />
            )}
            <span className="text-sm">{trendDirection}</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Longitudinal assessment</p>
        </div>
      </div>

      {/* Main Chart Container */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 capitalize">
              {activeTab.replace('_', ' ')} Trajectory
            </h3>
            <p className="text-xs text-slate-500">
              Interactive historical time series data
            </p>
          </div>

          {/* Timeframe Filter Buttons */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-medium">
            {['7d', '30d', '3m', '6m', '1y'].map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1 rounded-md uppercase font-mono text-[11px] transition-colors ${
                  timeframe === tf
                    ? 'bg-white text-slate-900 font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        <div className="h-72 w-full pt-2">
          {chartData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              No biometric readings recorded yet for this metric.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} domain={['auto', 'auto']} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                {activeTab === 'blood_pressure' ? (
                  <>
                    <Line
                      type="monotone"
                      dataKey="systolic"
                      name="Systolic (mmHg)"
                      stroke="#0d9488"
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: '#0d9488' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="diastolic"
                      name="Diastolic (mmHg)"
                      stroke="#0284c7"
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: '#0284c7' }}
                    />
                  </>
                ) : (
                  <Line
                    type="monotone"
                    dataKey="value"
                    name={activeTab.replace('_', ' ')}
                    stroke="#0d9488"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#0d9488' }}
                  />
                )}
                {thresholdForActiveTab && (
                  <ReferenceLine
                    y={thresholdForActiveTab.thresholdValue}
                    stroke="#e11d48"
                    strokeDasharray="4 4"
                    strokeWidth={1.5}
                    label={{
                      value: `Alert Limit: ${thresholdForActiveTab.thresholdValue} ${thresholdForActiveTab.unit}`,
                      fill: '#be123c',
                      fontSize: 10,
                      position: 'insideTopRight'
                    }}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Historical Readings Log Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Recorded Observations History</h3>
          <span className="text-xs text-slate-500 font-mono tabular-nums">{currentTabMetrics.length} total entries</span>
        </div>

        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
            <tr>
              <th className="py-2.5 px-4 font-semibold">Timestamp</th>
              <th className="py-2.5 px-4 font-semibold">Measured Value</th>
              <th className="py-2.5 px-4 font-semibold">Clinical Range Status</th>
              <th className="py-2.5 px-4 font-semibold">Observation Notes</th>
              <th className="py-2.5 px-4 font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono">
            {currentTabMetrics.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-6 text-center text-slate-400 font-sans">
                  No readings recorded yet.
                </td>
              </tr>
            ) : (
              currentTabMetrics.map((met) => (
                <tr key={met.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-4 text-slate-600">
                    {new Date(met.recordedAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                  </td>
                  <td className="py-2.5 px-4 font-bold text-slate-900">
                    {met.metricType === 'blood_pressure' ? `${met.systolic || met.value}/${met.diastolic || 80} mmHg` : `${met.value} ${met.unit}`}
                  </td>
                  <td className="py-2.5 px-4 font-sans">
                    {met.isOutOfRange ? (
                      <span className="text-[10px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        Outside reference range
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Normal physiological range
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-4 font-sans text-slate-600 max-w-xs truncate">
                    {met.notes || 'Routine observation'}
                  </td>
                  <td className="py-2.5 px-4 text-right">
                    <button
                      onClick={() => handleDelete(met.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Metric Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Record Health Measurement</h3>
              <button onClick={() => setIsAddOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Metric Type</label>
                <select
                  value={metricType}
                  onChange={(e) => {
                    const t = e.target.value as MetricType;
                    setMetricType(t);
                    if (t === 'weight') setUnit('kg');
                    else if (t === 'blood_glucose') setUnit('mg/dL');
                    else if (t === 'heart_rate') setUnit('bpm');
                    else if (t === 'oxygen_saturation') setUnit('%');
                    else if (t === 'body_temperature') setUnit('°F');
                  }}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-teal-600 bg-white"
                >
                  <option value="blood_pressure">Blood Pressure (mmHg)</option>
                  <option value="weight">Body Weight (kg)</option>
                  <option value="blood_glucose">Blood Glucose (mg/dL)</option>
                  <option value="heart_rate">Heart Rate (bpm)</option>
                  <option value="oxygen_saturation">Oxygen Saturation (%)</option>
                  <option value="body_temperature">Body Temperature (°F)</option>
                </select>
              </div>

              {metricType === 'blood_pressure' ? (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Systolic (mmHg)</label>
                    <input
                      type="number"
                      required
                      value={systolic}
                      onChange={(e) => setSystolic(e.target.value)}
                      placeholder="e.g. 120"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-teal-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Diastolic (mmHg)</label>
                    <input
                      type="number"
                      required
                      value={diastolic}
                      onChange={(e) => setDiastolic(e.target.value)}
                      placeholder="e.g. 80"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-teal-600"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Reading Value *</label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      placeholder="Numeric reading"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-teal-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Unit</label>
                    <input
                      type="text"
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-teal-600 bg-slate-50"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Measurement Date & Time</label>
                <input
                  type="datetime-local"
                  required
                  value={recordedAt}
                  onChange={(e) => setRecordedAt(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-teal-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Notes / Circumstances</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. After 10 min rest, pre-breakfast, etc."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-teal-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adding}
                  className="px-5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-2xs"
                >
                  {adding ? 'Recording...' : 'Save Measurement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Threshold Alerts Configuration Modal */}
      <MetricThresholdAlertsConfig
        isOpen={isThresholdModalOpen}
        onClose={() => setIsThresholdModalOpen(false)}
        metrics={metrics}
        onThresholdsUpdated={loadThresholds}
      />
    </div>
  );
};
