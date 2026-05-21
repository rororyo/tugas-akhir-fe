'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { HelpCircle, X } from 'lucide-react';

interface HelpPopoverProps {
  label: string;
  title: string;
  children: React.ReactNode;
}

export function HelpPopover({ label, title, children }: HelpPopoverProps) {
  const [open, setOpen] = useState(false);
  const popoverId = useId();
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const panelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const handleCloseOtherPopovers = (event: Event) => {
      const customEvent = event as CustomEvent<{ sourceId?: string }>;
      if (customEvent.detail?.sourceId !== popoverId) {
        setOpen(false);
      }
    };

    window.addEventListener('sigap-close-help-popovers', handleCloseOtherPopovers);
    return () => window.removeEventListener('sigap-close-help-popovers', handleCloseOtherPopovers);
  }, [popoverId]);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      const clickedTrigger = wrapperRef.current?.contains(target);
      const clickedPanel = panelRef.current?.contains(target);

      if (!clickedTrigger && !clickedPanel) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const panel = open ? (
    <>
      <span
        className="help-popover__scrim"
        aria-hidden="true"
        onPointerDown={() => setOpen(false)}
      />
      <span
        ref={panelRef}
        id={popoverId}
        role="dialog"
        aria-modal="false"
        aria-label={title}
        className="help-popover__panel"
      >
        <span className="help-popover__header">
          <strong>{title}</strong>
          <button
            type="button"
            className="help-popover__close"
            aria-label="Tutup penjelasan"
            onClick={() => setOpen(false)}
          >
            <X size={16} aria-hidden="true" />
          </button>
        </span>
        <span className="help-popover__body">{children}</span>
        <button
          type="button"
          className="help-popover__mobile-close"
          onClick={() => setOpen(false)}
        >
          Tutup
        </button>
      </span>
    </>
  ) : null;

  return (
    <span ref={wrapperRef} className="help-popover">
      <button
        type="button"
        className="help-popover__trigger"
        aria-label={label}
        aria-expanded={open}
        aria-controls={open ? popoverId : undefined}
        onMouseEnter={() => {
          window.dispatchEvent(new CustomEvent('sigap-close-help-popovers', { detail: { sourceId: popoverId } }));
          setOpen(true);
        }}
        onFocus={() => {
          window.dispatchEvent(new CustomEvent('sigap-close-help-popovers', { detail: { sourceId: popoverId } }));
          setOpen(true);
        }}
        onClick={() => {
          window.dispatchEvent(new CustomEvent('sigap-close-help-popovers', { detail: { sourceId: popoverId } }));
          setOpen((current) => !current);
        }}
      >
        <HelpCircle size={18} aria-hidden="true" />
      </button>

      {panel ? createPortal(panel, document.body) : null}
    </span>
  );
}
