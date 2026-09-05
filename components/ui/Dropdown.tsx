'use client';

import React, { useState, useRef, useEffect, useId } from 'react';
import { cn } from '@/lib/utils/cn';
import { ChevronDown, Check } from 'lucide-react';

export type DropdownOption = {
  value: string;
  label: string;
  description?: string;
  badge?: string;
  disabled?: boolean;
};

export type DropdownProps = {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
  disabled?: boolean;
  align?: 'left' | 'right';
  size?: 'sm' | 'md';
};

export function Dropdown({
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  label,
  className,
  disabled = false,
  align = 'left',
  size = 'md',
}: DropdownProps): React.ReactElement {
  const [isOpen, setIsOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
  } | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const uniqueId = useId();

  const selectedOption = options.find((opt) => opt.value === value);

  // Position popover relative to trigger button to break out of overflow-hidden / overflow-y-auto scroll containers
  useEffect(() => {
    if (!isOpen || !triggerRef.current) return;

    const updatePosition = (): void => {
      if (!triggerRef.current) return;
      const rect = triggerRef.current.getBoundingClientRect();
      const popoverHeight = size === 'sm' ? Math.min(options.length * 38 + 16, 200) : 280;
      const spaceBelow = window.innerHeight - rect.bottom;
      const openUpwards = spaceBelow < popoverHeight && rect.top > popoverHeight;

      if (openUpwards) {
        setMenuPosition({
          bottom: window.innerHeight - rect.top + 6,
          left: align === 'right' ? undefined : rect.left,
          right: align === 'right' ? window.innerWidth - rect.right : undefined,
        });
      } else {
        setMenuPosition({
          top: rect.bottom + 6,
          left: align === 'right' ? undefined : rect.left,
          right: align === 'right' ? window.innerWidth - rect.right : undefined,
        });
      }
    };

    updatePosition();
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen, align, size, options.length]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent): void => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (val: string): void => {
    onChange(val);
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  return (
    <div className={cn('relative w-full', className)} ref={containerRef}>
      {label && (
        <label
          htmlFor={uniqueId}
          className="mb-1 block text-xs font-semibold tracking-wider text-slate-500 uppercase"
        >
          {label}
        </label>
      )}

      {/* Main Trigger Container */}
      <div className="relative">
        {/* Desktop Interactive Custom Trigger Button */}
        <button
          id={uniqueId}
          ref={triggerRef}
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen((prev) => !prev)}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          className={cn(
            'group flex w-full items-center justify-between gap-1.5 rounded-lg border border-slate-200 bg-white text-left font-bold text-slate-800 shadow-xs transition-all',
            size === 'sm' ? 'px-2.5 py-1 text-[11px]' : 'px-3 py-2 text-xs',
            'hover:border-slate-300 hover:bg-slate-50/60',
            'focus:border-[var(--uc-blue)] focus:ring-2 focus:ring-[var(--uc-blue)]/20 focus:outline-none',
            isOpen && 'border-[var(--uc-blue)] ring-2 ring-[var(--uc-blue)]/20',
            disabled && 'cursor-not-allowed opacity-50',
          )}
        >
          <div className="min-w-0 flex-1">
            <span className="block truncate text-slate-900">
              {selectedOption ? selectedOption.label : placeholder}
            </span>
            {size === 'md' && selectedOption?.description && (
              <span className="block truncate text-[11px] font-normal text-slate-500">
                {selectedOption.description}
              </span>
            )}
          </div>

          <ChevronDown
            className={cn(
              'shrink-0 text-slate-400 transition-transform duration-150',
              size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4',
              isOpen && 'rotate-180 text-[var(--uc-blue)]',
            )}
          />
        </button>

        {/* Mobile View: Invisible Native Select Overlay (Invokes Native iOS/Android Wheel Sheet) */}
        <select
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          aria-label={label || placeholder}
          className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0 sm:hidden"
        >
          {placeholder && !selectedOption && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label} {opt.description ? `(${opt.description})` : ''}
            </option>
          ))}
        </select>

        {/* Desktop View: Custom Styled Popover Listbox (Fixed positioning prevents table row & overflow clipping) */}
        {isOpen && menuPosition && (
          <div
            role="listbox"
            tabIndex={-1}
            style={{
              position: 'fixed',
              top: menuPosition.top !== undefined ? `${menuPosition.top}px` : undefined,
              bottom: menuPosition.bottom !== undefined ? `${menuPosition.bottom}px` : undefined,
              left: menuPosition.left !== undefined ? `${menuPosition.left}px` : undefined,
              right: menuPosition.right !== undefined ? `${menuPosition.right}px` : undefined,
            }}
            className={cn(
              'z-50 hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-2xl sm:block',
              size === 'sm' ? 'w-48' : 'w-full max-w-lg min-w-[340px] sm:min-w-[420px]',
              'animate-in fade-in-50 zoom-in-95 duration-100',
            )}
          >
            <div className="max-h-72 space-y-1 overflow-y-auto">
              {options.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    disabled={opt.disabled}
                    onClick={() => handleSelect(opt.value)}
                    className={cn(
                      'group flex w-full items-start justify-between gap-3 rounded-lg p-2.5 text-left text-xs transition-colors',
                      isSelected
                        ? 'bg-[var(--uc-blue-container)]/50 text-[var(--uc-blue-deep)]'
                        : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900',
                      opt.disabled && 'cursor-not-allowed opacity-40',
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={cn(
                            'truncate text-xs',
                            isSelected
                              ? 'font-bold text-[var(--uc-blue-deep)]'
                              : 'font-semibold text-slate-900',
                          )}
                        >
                          {opt.label}
                        </span>
                        <div className="flex shrink-0 items-center gap-1.5">
                          {opt.badge && (
                            <span className="rounded-md border border-slate-200/80 bg-slate-100 px-2 py-0.5 text-[10px] font-medium whitespace-nowrap text-slate-600">
                              {opt.badge}
                            </span>
                          )}
                          {isSelected && !opt.description && (
                            <Check className="h-3.5 w-3.5 stroke-[2.5] text-[var(--uc-blue-deep)]" />
                          )}
                        </div>
                      </div>

                      {opt.description && (
                        <div className="mt-1 flex items-center justify-between gap-2 text-[11px] text-slate-500">
                          <span className="truncate">{opt.description}</span>
                          {isSelected && (
                            <span className="inline-flex shrink-0 items-center gap-1 font-mono text-[10px] font-bold text-[var(--uc-blue-deep)]">
                              <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                              ACTIVE
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
