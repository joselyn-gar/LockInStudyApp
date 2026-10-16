import React, { useState, useRef } from 'react';
import { HelpCircle, ExternalLink, Key, Check, Info, X } from 'lucide-react';

interface PatHelpTooltipProps {
  placement?: 'top' | 'bottom' | 'auto';
  className?: string;
}

export const PatHelpTooltip: React.FC<PatHelpTooltipProps> = ({
  placement = 'auto',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [hasCopied, setHasCopied] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const copyUrl = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard?.writeText('https://canvas.instructure.com');
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  };

  return (
    <div
      ref={containerRef}
      className={`relative inline-flex items-center ml-1.5 ${className}`}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {/* The '?' Icon Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="How to get your Canvas Personal Access Token"
        className="w-4 h-4 rounded-full bg-[#3B4232] hover:bg-[#2A3123] text-[#C4F46C] hover:text-white font-black text-[11px] leading-none flex items-center justify-center transition-all hover:scale-125 border border-[#4F5943] shadow-xs cursor-pointer focus:outline-hidden"
        title="Click or hover to learn how to get your Canvas token"
      >
        ?
      </button>

      {/* Floating Tooltip Card */}
      {isOpen && (
        <div
          role="tooltip"
          className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-72 sm:w-84 bg-[#1C2216] text-[#F7F4EB] p-4 rounded-2xl shadow-2xl border-2 border-[#576449] z-50 text-left animate-in fade-in zoom-in-95 duration-150"
          style={{ filter: 'drop-shadow(0 12px 28px rgba(0,0,0,0.55))' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-2.5 border-b border-[#3D4834] mb-3">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-[#3B4232] text-[#C4F46C] flex items-center justify-center font-black text-xs">
                ?
              </div>
              <span className="text-xs font-black uppercase tracking-wider text-[#C4F46C]">
                How to get your Canvas Token
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="sm:hidden text-[#92A37E] hover:text-white p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Step-by-Step Instructions */}
          <ol className="space-y-2.5 text-[11px] text-[#DFE8D3] leading-relaxed">
            <li className="flex items-start gap-2.5">
              <span className="w-4 h-4 rounded-full bg-[#3B4232] text-[#C4F46C] font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                1
              </span>
              <span>
                Log in to Canvas at{' '}
                <button
                  type="button"
                  onClick={copyUrl}
                  className="inline-flex items-center gap-1 font-mono text-[#C4F46C] underline hover:text-white"
                  title="Click to copy standard Canvas URL"
                >
                  canvas.instructure.com
                  {hasCopied ? (
                    <Check className="w-3 h-3 text-[#C4F46C]" />
                  ) : (
                    <ExternalLink className="w-2.5 h-2.5 opacity-80" />
                  )}
                </button>{' '}
                (or your school portal).
              </span>
            </li>

            <li className="flex items-start gap-2.5">
              <span className="w-4 h-4 rounded-full bg-[#3B4232] text-[#C4F46C] font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                2
              </span>
              <span>
                Click <strong>Account</strong> (profile photo) in the left sidebar → Select{' '}
                <strong className="text-white">Settings</strong>.
              </span>
            </li>

            <li className="flex items-start gap-2.5">
              <span className="w-4 h-4 rounded-full bg-[#3B4232] text-[#C4F46C] font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                3
              </span>
              <span>
                Scroll down to the <strong>Approved Integrations</strong> section.
              </span>
            </li>

            <li className="flex items-start gap-2.5">
              <span className="w-4 h-4 rounded-full bg-[#3B4232] text-[#C4F46C] font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                4
              </span>
              <span>
                Click <span className="text-[#C4F46C] font-bold">+ New Access Token</span>. Type
                Purpose: <em>"Lock In"</em>.
              </span>
            </li>

            <li className="flex items-start gap-2.5">
              <span className="w-4 h-4 rounded-full bg-[#3B4232] text-[#C4F46C] font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                5
              </span>
              <span>
                Click <strong>Generate Token</strong>, copy the generated code, and paste it here!
              </span>
            </li>
          </ol>

          {/* Privacy Note */}
          <div className="mt-3 pt-2.5 border-t border-[#3D4834] flex items-center justify-between text-[10px] text-[#A2B490]">
            <span className="flex items-center gap-1 font-medium">
              🔒 Read-only access to your enrolled courses & files
            </span>
          </div>

          {/* Downward Pointer Tail */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-[#1C2216]" />
        </div>
      )}
    </div>
  );
};
