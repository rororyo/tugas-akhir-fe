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
  const [openMode, setOpenMode] = useState<'closed' | 'hover' | 'click'>('closed');
  const popoverId = useId();
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const panelRef = useRef<HTMLSpanElement>(null);
  const tooltipId = `${popoverId}-tooltip`;
  const isTooltipOpen = openMode === 'hover';
  const isModalOpen = openMode === 'click';

  useEffect(() => {
    const handleCloseOtherPopovers = (event: Event) => {
      const customEvent = event as CustomEvent<{ sourceId?: string }>;
      if (customEvent.detail?.sourceId !== popoverId) {
        setOpenMode('closed');
      }
    };

    window.addEventListener('sigap-close-help-popovers', handleCloseOtherPopovers);
    return () => window.removeEventListener('sigap-close-help-popovers', handleCloseOtherPopovers);
  }, [popoverId]);

  useEffect(() => {
    if (!isModalOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      const clickedTrigger = wrapperRef.current?.contains(target);
      const clickedPanel = panelRef.current?.contains(target);

      if (!clickedTrigger && !clickedPanel) {
        setOpenMode('closed');
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpenMode('closed');
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isModalOpen]);

  const modalPanel = isModalOpen ? (
    <>
      <span
        className="help-popover__scrim"
        aria-hidden="true"
        onPointerDown={() => setOpenMode('closed')}
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
            onClick={() => setOpenMode('closed')}
          >
            <X size={16} aria-hidden="true" />
          </button>
        </span>
        <span className="help-popover__body">{children}</span>
        <button
          type="button"
          className="help-popover__mobile-close"
          onClick={() => setOpenMode('closed')}
        >
          Tutup
        </button>
      </span>
    </>
  ) : null;

  const tooltip = isTooltipOpen ? (
    <span
      id={tooltipId}
      role="tooltip"
      className="help-popover__tooltip"
    >
      {children}
    </span>
  ) : null;

  return (
    <span
      ref={wrapperRef}
      className="help-popover"
      onMouseLeave={() => {
        if (openMode === 'hover') setOpenMode('closed');
      }}
      onBlur={(event) => {
        if (openMode !== 'hover') return;
        if (!wrapperRef.current?.contains(event.relatedTarget as Node | null)) {
          setOpenMode('closed');
        }
      }}
    >
      <button
        type="button"
        className="help-popover__trigger"
        aria-label={label}
        aria-expanded={isModalOpen}
        aria-controls={isModalOpen ? popoverId : undefined}
        aria-describedby={isTooltipOpen ? tooltipId : undefined}
        onMouseEnter={() => {
          window.dispatchEvent(new CustomEvent('sigap-close-help-popovers', { detail: { sourceId: popoverId } }));
          setOpenMode((current) => (current === 'click' ? current : 'hover'));
        }}
        onFocus={() => {
          window.dispatchEvent(new CustomEvent('sigap-close-help-popovers', { detail: { sourceId: popoverId } }));
          setOpenMode((current) => (current === 'click' ? current : 'hover'));
        }}
        onClick={() => {
          window.dispatchEvent(new CustomEvent('sigap-close-help-popovers', { detail: { sourceId: popoverId } }));
          setOpenMode((current) => (current === 'click' ? 'closed' : 'click'));
        }}
      >
        <HelpCircle size={18} aria-hidden="true" />
      </button>

      {tooltip}
      {modalPanel ? createPortal(modalPanel, document.body) : null}
    </span>
  );
}
