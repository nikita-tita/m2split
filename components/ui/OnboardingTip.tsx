'use client';

import React, { useState, useEffect } from 'react';
import { X, Lightbulb, ArrowRight } from 'lucide-react';
import { Button } from './Button';
import Link from 'next/link';

interface OnboardingTipProps {
  id: string;
  title: string;
  description: string;
  actionText?: string;
  actionHref?: string;
  onDismiss?: () => void;
}

export function OnboardingTip({
  id,
  title,
  description,
  actionText,
  actionHref,
  onDismiss,
}: OnboardingTipProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if this tip was already dismissed
    const dismissed = localStorage.getItem(`onboarding-tip-${id}`);
    if (!dismissed) {
      setIsVisible(true);
    }
  }, [id]);

  const handleDismiss = () => {
    localStorage.setItem(`onboarding-tip-${id}`, 'true');
    setIsVisible(false);
    onDismiss?.();
  };

  if (!isVisible) return null;

  return (
    <div className="bg-gradient-to-r from-primary-50 to-primary-100 border-2 border-primary-300 rounded-lg p-6 shadow-lg relative">
      <button
        onClick={handleDismiss}
        className="absolute top-4 right-4 text-primary-500 hover:text-primary-700 transition-colors"
        aria-label="Закрыть подсказку"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center">
            <Lightbulb className="w-6 h-6 text-white" />
          </div>
        </div>

        <div className="flex-1 pr-8">
          <h3 className="text-lg font-semibold text-primary-900 mb-2">
            {title}
          </h3>
          <p className="text-primary-800 leading-relaxed mb-4">
            {description}
          </p>

          {actionText && actionHref && (
            <Link href={actionHref}>
              <Button size="sm" className="inline-flex items-center gap-2">
                {actionText}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
