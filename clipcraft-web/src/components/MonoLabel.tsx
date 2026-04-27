import type { MonoLabelProps } from '../types/components/MonoLabel';

export default function MonoLabel({ children, className = '', style = {} }: MonoLabelProps) {
  return (
    <span className={`font-mono text-[11px] font-normal uppercase tracking-[0.6px] text-[rgba(0,0,0,0.38)] ${className}`} style={style}>
      {children}
    </span>
  );
}
