import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface StepperStep {
  id: number;
  label: string;
}

interface StepperProps {
  steps: StepperStep[];
  currentStep: number;
  className?: string;
}

function Stepper({ steps, currentStep, className }: StepperProps) {
  return (
    <nav aria-label="Progreso del formulario" className={cn('w-full', className)}>
      <ol className="flex items-center">
        {steps.map((step, idx) => {
          const isCompleted = step.id < currentStep;
          const isActive = step.id === currentStep;
          const isLast = idx === steps.length - 1;

          return (
            <li
              key={step.id}
              className={cn('flex items-center', !isLast && 'flex-1')}
              aria-current={isActive ? 'step' : undefined}
            >
              {/* Circle */}
              <div className="flex flex-col items-center gap-2 shrink-0">
                <div
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors',
                    isCompleted && 'bg-primary-600 border-primary-600 text-white',
                    isActive && 'bg-white border-primary-600 text-primary-600',
                    !isCompleted && !isActive && 'bg-white border-neutral-300 text-neutral-400',
                  )}
                  aria-hidden="true"
                >
                  {isCompleted ? <Check className="h-5 w-5" /> : <span>{step.id}</span>}
                </div>
                <span
                  className={cn(
                    'text-xs font-medium hidden sm:block text-center max-w-[90px] leading-tight',
                    isActive ? 'text-primary-700' : 'text-neutral-500',
                    isCompleted && 'text-neutral-600',
                  )}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector */}
              {!isLast && (
                <div
                  aria-hidden="true"
                  className={cn(
                    'h-0.5 flex-1 mx-2 transition-colors',
                    isCompleted ? 'bg-primary-600' : 'bg-neutral-200',
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export { Stepper };
export type { StepperStep };
