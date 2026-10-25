import React, { useState, useEffect } from 'react';
import {
  HeartPulse,
  Droplet,
  Moon,
  Footprints,
  Flame,
  Dumbbell,
  Smile,
  Save,
  CheckCircle,
  Calendar
} from 'lucide-react';
import { api } from '../../services/api.js';
import { DailyWellness } from '../../types/index.js';

export const DailyWellnessTracker: React.FC = () => {
  const [logs, setLogs] = useState<DailyWellness[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedOk, setSavedOk] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);

  // Form
  const [waterIntakeMl, setWaterIntakeMl] = useState('2200');
  const [sleepHours, setSleepHours] = useState('7.5');
  const [steps, setSteps] = useState('8500');
  const [exerciseMinutes, setExerciseMinutes] = useState('35');
  const [calories, setCalories] = useState('1950');
  const [mood, setMood] = useState<'great' | 'good' | 'neutral' | 'tired' | 'unwell'>('good');
  const [notes, setNotes] = useState('Good energy today; hydrated adequately throughout workday.');

  useEffect(() => {
    loadDaily();
  }, []);

  const loadDaily = async () => {
    try {
      setLoading(true);
      const res = await api.getDailyWellness();
      const list = res.dailyWellness || [];
      setLogs(list);

      const foundToday = list.find(l => l.date === selectedDate);
      if (foundToday) {
        setWaterIntakeMl(String(foundToday.waterIntakeMl));
        setSleepHours(String(foundToday.sleepHours));
        setSteps(String(foundToday.steps));
        setExerciseMinutes(String(foundToday.exerciseMinutes));
        setCalories(String(foundToday.calories));
        setMood(foundToday.mood);
        setNotes(foundToday.notes || '');
      }
    } catch (err) {
      console.error('Error loading wellness logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedOk(false);
    try {
      await api.saveDailyWellness({
        date: selectedDate,
        waterIntakeMl: Number(waterIntakeMl),
        sleepHours: Number(sleepHours),
        steps: Number(steps),
        exerciseMinutes: Number(exerciseMinutes),
        calories: Number(calories),
        mood,
        notes
      });
      setSavedOk(true);
      await loadDaily();
      setTimeout(() => setSavedOk(false), 3000);
    } catch (err) {
      alert('Unable to save daily wellness log.');
    } finally {
      setSaving(false);
    }
  };

  const moods: Array<{ id: any; label: string; emoji: string }> = [
    { id: 'great', label: 'Great', emoji: '😄' },
    { id: 'good', label: 'Good', emoji: '🙂' },
    { id: 'neutral', label: 'Neutral', emoji: '😐' },
    { id: 'tired', label: 'Tired', emoji: '🥱' },
    { id: 'unwell', label: 'Unwell', emoji: '🤒' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Daily Wellness & Lifestyle Tracker
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Log hydration, sleep patterns, active movement, and subjective mood state
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => {
              setSelectedDate(e.target.value);
              const found = logs.find(l => l.date === e.target.value);
              if (found) {
                setWaterIntakeMl(String(found.waterIntakeMl));
                setSleepHours(String(found.sleepHours));
                setSteps(String(found.steps));
                setExerciseMinutes(String(found.exerciseMinutes));
                setCalories(String(found.calories));
                setMood(found.mood);
                setNotes(found.notes || '');
              }
            }}
            className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-teal-600 bg-white"
          />
        </div>
      </div>

      {/* Main Tracker Form */}
      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <HeartPulse className="w-4 h-4 text-teal-600" />
            <span>Daily Vitals for {selectedDate}</span>
          </h3>
          <span className="text-xs text-slate-400 capitalize">Mood: {mood}</span>
        </div>

        {/* 4 Primary Trackers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          
          {/* Water */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-sky-800">
              <span className="flex items-center gap-1.5">
                <Droplet className="w-4 h-4 text-sky-600" />
                <span>Water Hydration</span>
              </span>
              <span className="font-mono text-slate-500">ml</span>
            </div>
            <input
              type="number"
              value={waterIntakeMl}
              onChange={(e) => setWaterIntakeMl(e.target.value)}
              className="w-full px-3 py-2 text-base font-bold text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-teal-600 font-mono"
            />
            <p className="text-[11px] text-slate-400">Target: 2,500 ml/day</p>
          </div>

          {/* Sleep */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-indigo-800">
              <span className="flex items-center gap-1.5">
                <Moon className="w-4 h-4 text-indigo-600" />
                <span>Night Sleep</span>
              </span>
              <span className="font-mono text-slate-500">hours</span>
            </div>
            <input
              type="number"
              step="0.1"
              value={sleepHours}
              onChange={(e) => setSleepHours(e.target.value)}
              className="w-full px-3 py-2 text-base font-bold text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-teal-600 font-mono"
            />
            <p className="text-[11px] text-slate-400">Target: 7–8 hours restorative</p>
          </div>

          {/* Steps */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-teal-800">
              <span className="flex items-center gap-1.5">
                <Footprints className="w-4 h-4 text-teal-600" />
                <span>Daily Steps (Morning Walk / सैर)</span>
              </span>
              <span className="font-mono text-slate-500">steps</span>
            </div>
            <input
              type="number"
              value={steps}
              onChange={(e) => setSteps(e.target.value)}
              className="w-full px-3 py-2 text-base font-bold text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-teal-600 font-mono"
            />
            <p className="text-[11px] text-slate-400">Target: 8,000–10,000 brisk steps</p>
          </div>

          {/* Exercise Minutes */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-emerald-800">
              <span className="flex items-center gap-1.5">
                <Dumbbell className="w-4 h-4 text-emerald-600" />
                <span>Yoga, Pranayama & Exercise</span>
              </span>
              <span className="font-mono text-slate-500">minutes</span>
            </div>
            <input
              type="number"
              value={exerciseMinutes}
              onChange={(e) => setExerciseMinutes(e.target.value)}
              className="w-full px-3 py-2 text-base font-bold text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-teal-600 font-mono"
            />
            <p className="text-[11px] text-slate-400">Surya Namaskar, Anulom Vilom, or Cardio</p>
          </div>

          {/* Calories Burned */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-rose-800">
              <span className="flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-rose-600" />
                <span>Active Calories</span>
              </span>
              <span className="font-mono text-slate-500">kcal</span>
            </div>
            <input
              type="number"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              className="w-full px-3 py-2 text-base font-bold text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-teal-600 font-mono"
            />
            <p className="text-[11px] text-slate-400">Estimated metabolic energy</p>
          </div>

          {/* Mood Selector */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <span className="text-xs font-semibold text-slate-800 block">
              Overall Subjective Mood
            </span>
            <div className="grid grid-cols-5 gap-1 pt-1">
              {moods.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMood(m.id)}
                  className={`py-2 rounded-lg text-lg flex items-center justify-center transition-all ${
                    mood === m.id
                      ? 'bg-teal-600 text-white shadow-xs scale-105'
                      : 'bg-white border border-slate-200 hover:bg-slate-100'
                  }`}
                  title={m.label}
                >
                  {m.emoji}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-400 text-center capitalize">{mood} energy</p>
          </div>

        </div>

        {/* Daily Journal Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Lifestyle Notes, Nutrition & Symptoms
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Record meal timing, stress levels, caffeine intake, or physical symptoms..."
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-teal-600 resize-none"
          />
        </div>

        {/* Action button */}
        <div className="flex justify-end pt-2 border-t border-slate-100">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-2xs transition-colors disabled:opacity-50"
          >
            {savedOk ? (
              <>
                <CheckCircle className="w-4 h-4 text-white" />
                <span>Daily Log Saved</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{saving ? 'Recording...' : 'Save Wellness Record'}</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Historical Logs List */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
        <h3 className="text-sm font-bold text-slate-900">Recent Lifestyle Logs</h3>
        <div className="divide-y divide-slate-100">
          {logs.slice(0, 5).map((l) => (
            <div key={l.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 font-mono">{l.date}</span>
                  <span className="capitalize text-slate-500 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                    Mood: {l.mood}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-slate-500 font-mono tabular-nums text-[11px]">
                  <span>💧 {l.waterIntakeMl} ml</span>
                  <span>🌙 {l.sleepHours} hrs</span>
                  <span>👟 {l.steps} steps</span>
                  <span>🏃 {l.exerciseMinutes} mins</span>
                </div>
                {l.notes && (
                  <p className="text-slate-600 text-[11px] italic">"{l.notes}"</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
