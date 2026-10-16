import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

interface ButtonProps extends React.ComponentPropsWithRef<'button'> {
  variant?: ButtonVariant;
  full?: boolean;
}

const BUTTON_STYLES: Record<ButtonVariant, string> = {
  primary: 'bg-ink text-white hover:bg-ink-hover',
  secondary: 'bg-soft text-ink hover:bg-soft-hover',
  ghost: 'bg-transparent text-ink hover:bg-soft',
};

// Pill button. min-h-11 keeps every touch target at 44px or more.
export const Button: React.FC<ButtonProps> = ({ variant = 'primary', full, className = '', children, ...rest }) => (
  <button
    type="button"
    {...rest}
    className={`inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-full px-5 text-[15px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer ${
      BUTTON_STYLES[variant]
    } ${full ? 'w-full' : ''} ${className}`}
  >
    {children}
  </button>
);

export const Card: React.FC<React.HTMLAttributes<HTMLDivElement> & { as?: 'div' | 'section' }> = ({
  as: Tag = 'div',
  className = '',
  children,
  ...rest
}) => (
  <Tag {...rest} className={`rounded-card border border-card-line bg-card shadow-card ${className}`}>
    {children}
  </Tag>
);

export const Chip: React.FC<{ children: React.ReactNode; className?: string; dark?: boolean }> = ({ children, className = '', dark }) => (
  <span
    className={`inline-flex items-center rounded-full px-3 py-1 text-[13px] font-medium ${
      dark ? 'bg-ink text-white' : 'bg-soft text-muted-strong'
    } ${className}`}
  >
    {children}
  </span>
);

export const Eyebrow: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`text-[12px] font-semibold uppercase tracking-[0.08em] text-muted ${className}`}>{children}</div>
);

export type MasteryLevel = 'mastered' | 'getting_there' | 'review';

const TAG_TEXT: Record<MasteryLevel, string> = {
  mastered: 'Mastered',
  getting_there: 'Getting there',
  review: 'Review tomorrow',
};

const TAG_STYLES: Record<MasteryLevel, string> = {
  mastered: 'bg-ink text-white border-ink',
  getting_there: 'bg-soft text-muted-strong border-soft',
  review: 'bg-white text-ink border-ink',
};

export const MasteryTag: React.FC<{ level: MasteryLevel }> = ({ level }) => (
  <span className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5 text-[12px] font-semibold ${TAG_STYLES[level]}`}>
    {TAG_TEXT[level]}
  </span>
);

export const Bar: React.FC<{ value: number; muted?: boolean; label: string }> = ({ value, muted, label }) => (
  <div
    role="progressbar"
    aria-label={label}
    aria-valuenow={Math.round(value)}
    aria-valuemin={0}
    aria-valuemax={100}
    className="h-2 w-full overflow-hidden rounded-full bg-track"
  >
    <div
      className={`h-full rounded-full transition-[width] duration-500 ${muted ? 'bg-at-risk' : 'bg-ink'}`}
      style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
    />
  </div>
);

export const Ring: React.FC<{ value: number; atRisk?: boolean; size?: number; label: string }> = ({
  value,
  atRisk,
  size = 64,
  label,
}) => {
  const stroke = 7;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }} role="img" aria-label={label}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className="stroke-track" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct / 100)}
          className={atRisk ? 'stroke-at-risk' : 'stroke-ink'}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[15px] font-bold">{Math.round(pct)}%</span>
    </div>
  );
};

export const EmptyState: React.FC<{ title: string; body: string; action?: React.ReactNode }> = ({ title, body, action }) => (
  <Card className="p-8 text-center">
    <h2 className="text-lg">{title}</h2>
    <p className="mx-auto mt-1 max-w-md text-muted">{body}</p>
    {action && <div className="mt-5 flex justify-center">{action}</div>}
  </Card>
);

export const PageTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h1 className="text-[28px] leading-tight sm:text-[34px]">{children}</h1>
);
