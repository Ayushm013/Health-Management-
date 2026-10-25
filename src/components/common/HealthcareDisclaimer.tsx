import React, { useState } from 'react';
import { AlertCircle, X, ShieldAlert } from 'lucide-react';

interface DisclaimerProps {
  compact?: boolean;
}

export const HealthcareDisclaimer: React.FC<DisclaimerProps> = ({ compact = false }) => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  if (compact) {
    return (
      <div className="bg-amber-50/80 border-b border-amber-200/80 px-4 py-2 text-xs text-amber-900 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
          <span>
            <strong>Medical Notice:</strong> This platform is intended for health information management and educational purposes. It is not a substitute for professional medical diagnosis, treatment, or emergency care.
          </span>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-amber-700 hover:text-amber-900 p-0.5 rounded transition-colors"
          aria-label="Dismiss disclaimer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 my-4 text-xs text-amber-900 shadow-xs">
      <div className="flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-amber-950">
            Important Healthcare & Clinical Information Notice
          </p>
          <p className="leading-relaxed text-amber-900/90">
            This platform is intended for health information management and educational record-keeping purposes. It is not a substitute for professional medical diagnosis, treatment, or emergency clinical care. Always seek the advice of your physician or other qualified healthcare provider with any questions you may have regarding a medical condition.
          </p>
          <p className="text-amber-950/80 font-medium pt-1">
            For medical emergencies in India, immediately dial <strong>108</strong> (Ambulance), <strong>112</strong> (National Emergency), or visit the nearest hospital casualty / emergency ward.
          </p>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-amber-700 hover:text-amber-900 p-1 rounded-md transition-colors ml-auto"
          aria-label="Dismiss disclaimer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
