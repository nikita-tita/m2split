'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Info } from 'lucide-react';

interface BusinessProcessInfoProps {
  title: string;
  description: string;
  steps?: string[];
  operations?: {
    title: string;
    items: string[];
  };
  documents?: {
    title: string;
    items: string[];
  };
  accounts?: {
    title: string;
    items: string[];
  };
  variant?: 'default' | 'compact';
  defaultExpanded?: boolean;
}

export function BusinessProcessInfo({
  title,
  description,
  steps,
  operations,
  documents,
  accounts,
  variant = 'default',
  defaultExpanded = false,
}: BusinessProcessInfoProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className={`bg-blue-50 border border-blue-200 rounded-lg overflow-hidden ${
      variant === 'compact' ? 'text-sm' : ''
    }`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-blue-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />
          <span className="font-semibold text-blue-900">{title}</span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-blue-600 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-5 h-5 text-blue-600 flex-shrink-0" />
        )}
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-blue-200 pt-4">
          {/* Main Description */}
          <div className="text-blue-900">
            <p className="leading-relaxed">{description}</p>
          </div>

          {/* Process Steps */}
          {steps && steps.length > 0 && (
            <div>
              <h4 className="font-semibold text-blue-900 mb-2">Этапы процесса:</h4>
              <ol className="list-decimal list-inside space-y-1.5 text-blue-800">
                {steps.map((step, index) => (
                  <li key={index} className="leading-relaxed">{step}</li>
                ))}
              </ol>
            </div>
          )}

          {/* Operations */}
          {operations && (
            <div className="bg-white bg-opacity-50 rounded-lg p-3">
              <h4 className="font-semibold text-blue-900 mb-2">{operations.title}</h4>
              <ul className="list-disc list-inside space-y-1 text-blue-800">
                {operations.items.map((item, index) => (
                  <li key={index} className="leading-relaxed">{item}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Accounts */}
          {accounts && (
            <div className="bg-white bg-opacity-50 rounded-lg p-3">
              <h4 className="font-semibold text-blue-900 mb-2">{accounts.title}</h4>
              <ul className="list-disc list-inside space-y-1 text-blue-800">
                {accounts.items.map((item, index) => (
                  <li key={index} className="leading-relaxed">{item}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Documents */}
          {documents && (
            <div className="bg-white bg-opacity-50 rounded-lg p-3">
              <h4 className="font-semibold text-blue-900 mb-2">{documents.title}</h4>
              <ul className="list-disc list-inside space-y-1 text-blue-800">
                {documents.items.map((item, index) => (
                  <li key={index} className="leading-relaxed">{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
