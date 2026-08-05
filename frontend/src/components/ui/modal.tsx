'use client';

import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { type ComponentPropsWithoutRef, type ElementRef, forwardRef } from 'react';

const Modal = DialogPrimitive.Root;
const ModalTrigger = DialogPrimitive.Trigger;
const ModalPortal = DialogPrimitive.Portal;
const ModalClose = DialogPrimitive.Close;

const ModalOverlay = forwardRef<
  ElementRef<typeof DialogPrimitive.Overlay>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-50 bg-black/50 backdrop-blur-sm',
      'data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out',
      className,
    )}
    {...props}
  />
));
ModalOverlay.displayName = 'ModalOverlay';

const ModalContent = forwardRef<
  ElementRef<typeof DialogPrimitive.Content>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & { showClose?: boolean }
>(({ className, children, showClose = true, ...props }, ref) => (
  <ModalPortal>
    <ModalOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        'fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%]',
        'w-full max-w-lg max-h-[90dvh] overflow-y-auto',
        'rounded-xl bg-white shadow-xl border border-neutral-200',
        'data-[state=open]:animate-slide-up',
        'focus:outline-none',
        className,
      )}
      {...props}
    >
      {showClose && (
        <ModalClose
          className={cn(
            'absolute right-4 top-4 rounded-full p-1 text-neutral-500',
            'hover:bg-neutral-100 hover:text-neutral-700',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600',
            'transition-colors',
          )}
          aria-label="Cerrar"
        >
          <X className="h-4 w-4" />
        </ModalClose>
      )}
      {children}
    </DialogPrimitive.Content>
  </ModalPortal>
));
ModalContent.displayName = 'ModalContent';

const ModalHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col gap-1 p-6 pb-4', className)} {...props} />
);
ModalHeader.displayName = 'ModalHeader';

const ModalFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex flex-col-reverse sm:flex-row sm:justify-end gap-3 p-6 pt-4 border-t border-neutral-100',
      className,
    )}
    {...props}
  />
);
ModalFooter.displayName = 'ModalFooter';

const ModalTitle = forwardRef<
  ElementRef<typeof DialogPrimitive.Title>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn('text-lg font-semibold text-neutral-900', className)}
    {...props}
  />
));
ModalTitle.displayName = 'ModalTitle';

const ModalDescription = forwardRef<
  ElementRef<typeof DialogPrimitive.Description>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn('text-sm text-neutral-500', className)}
    {...props}
  />
));
ModalDescription.displayName = 'ModalDescription';

export {
  Modal,
  ModalTrigger,
  ModalPortal,
  ModalClose,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalTitle,
  ModalDescription,
};
