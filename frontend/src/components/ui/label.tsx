import * as LabelPrimitive from '@radix-ui/react-label';
import { cn } from '@/lib/utils';
import { type ComponentPropsWithoutRef, type ElementRef, forwardRef } from 'react';

const Label = forwardRef<
  ElementRef<typeof LabelPrimitive.Root>,
  ComponentPropsWithoutRef<typeof LabelPrimitive.Root> & { required?: boolean }
>(({ className, required, children, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(
      'text-sm font-medium text-neutral-700 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
      className,
    )}
    {...props}
  >
    {children}
    {required && (
      <span aria-hidden="true" className="ml-1 text-danger-600">
        *
      </span>
    )}
  </LabelPrimitive.Root>
));

Label.displayName = 'Label';

export { Label };
