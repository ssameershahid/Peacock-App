import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  confirmVariant?: 'default' | 'destructive';
  className?: string;
}

export function Modal({
  open,
  onClose,
  title,
  children,
  confirmLabel,
  cancelLabel = 'Cancel',
  onConfirm,
  confirmVariant = 'default',
  className,
}: ModalProps) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className={cn(
        'relative bg-white rounded-3xl shadow-modal w-full max-w-lg animate-in fade-in zoom-in-95 duration-200',
        className
      )}>
        <div className="flex items-center justify-between p-6 border-b border-warm-100">
          <h3 className="font-display text-2xl text-forest-600">{title}</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-warm-50 flex items-center justify-center hover:bg-warm-100 transition-colors"
          >
            <X className="w-4 h-4 text-warm-500" />
          </button>
        </div>

        <div className="p-6">{children}</div>

        {(onConfirm || cancelLabel) && (
          <div className="flex items-center justify-end gap-3 p-6 border-t border-warm-100">
            <Button variant="ghost" className="rounded-full transition-all duration-200" onClick={onClose}>{cancelLabel}</Button>
            {onConfirm && (
              <Button variant={confirmVariant === 'destructive' ? 'destructive' : 'default'} className="rounded-full transition-all duration-200" onClick={onConfirm}>
                {confirmLabel || 'Confirm'}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
