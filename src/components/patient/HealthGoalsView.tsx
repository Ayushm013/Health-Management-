import React, { useState, useEffect } from 'react';
import { Target, Plus, CheckCircle, TrendingUp, Calendar, X, Edit2, Trash2 } from 'lucide-react';
import { api } from '../../services/api.js';
import { HealthGoal, GoalType } from '../../types/index.js';

export const HealthGoalsView: React.FC = () => {
  const [goals, setGoals] = useState<HealthGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<HealthGoal | null>(null);

  // Form
  const [goalName, setGoalName] = useState('');
  const [goalType, setGoalType] = useState<GoalType>('target_weight');
  const [targetValue, setTargetValue] = useState('');
  const [currentValue, setCurrentValue] = useState('');
  const [unit, setUnit] = useState('kg');
  const [targetDate, setTargetDate] = useState('2026-12-31');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      setLoading(true);
      const res = await api.getHealthGoals();
      setGoals(res.goals || []);
    } catch (err) {
      console.error('Failed to load goals:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingGoal(null);
    setGoalName('Target Weight');
    setGoalType('target_weight');
    setTargetValue('64');
    setCurrentValue('66.2');
    setUnit('kg');
    setTargetDate('2026-12-31');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (goal: HealthGoal) => {
    setEditingGoal(goal);
    setGoalName(goal.goalName);
    setGoalType(goal.goalType);
    setTargetValue(String(goal.targetValue));
    setCurrentValue(String(goal.currentValue));
    setUnit(goal.unit);
    setTargetDate(goal.targetDate);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingGoal) {
        await api.updateHealthGoal(editingGoal.id, {
          goalName,
          goalType,
          targetValue: Number(targetValue),
          currentValue: Number(currentValue),
          unit,
          targetDate
        });
      } else {
        await api.createHealthGoal({
          goalName,
          goalType,
          targetValue: Number(targetValue),
          currentValue: Number(currentValue) || 0,
          unit,
          targetDate
        });
      }
      setIsModalOpen(false);
      await loadGoals();
    } catch (err) {
      alert('Unable to save health goal.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this health goal?')) return;
    try {
      await api.deleteHealthGoal(id);
      await loadGoals();
    } catch (err) {
      alert('Failed to delete goal.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Personal Health Goals
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Set and track clinical wellness objectives, target weight, steps, and hydration
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-2xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Establish New Goal</span>
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading goals...</div>
      ) : goals.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center space-y-3">
          <Target className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-800">No personal health goals yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Establishing targeted hydration, cardio, or weight goals encourages sustained preventive wellness.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {goals.map((g) => {
            const pct = Math.min(Math.round((g.currentValue / g.targetValue) * 100), 100);
            return (
              <div
                key={g.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{g.goalName}</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Target by: <span className="font-mono">{g.targetDate}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(g)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(g.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono tabular-nums">
                    <span className="text-slate-600 font-sans">Current Progress:</span>
                    <span className="font-bold text-slate-900">
                      {g.currentValue} / {g.targetValue} {g.unit} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-teal-600 h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                  <span>Started: {g.startDate}</span>
                  <span className={`font-semibold capitalize ${
                    pct >= 100 ? 'text-emerald-700' : 'text-teal-700'
                  }`}>
                    {pct >= 100 ? '✓ Goal Completed' : 'In Progress'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {editingGoal ? 'Update Health Goal' : 'Establish New Health Goal'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Goal Title *</label>
                <input
                  type="text"
                  required
                  value={goalName}
                  onChange={(e) => setGoalName(e.target.value)}
                  placeholder="e.g. Target Healthy Weight"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-teal-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Target Value *</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={targetValue}
                    onChange={(e) => setTargetValue(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-teal-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Current Progress</label>
                  <input
                    type="number"
                    step="any"
                    value={currentValue}
                    onChange={(e) => setCurrentValue(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-teal-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Measurement Unit</label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="kg, steps, ml, hours"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-teal-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Target Completion Date</label>
                  <input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-teal-600"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-2xs"
                >
                  {saving ? 'Saving...' : 'Save Goal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
