import Icon from '../Icon';
import { icons } from '../icons';
import { cn } from '../../lib/cn';
import type { ChatMessageProps } from '../../types/pages/EditorScreen';

export default function ChatMessage({ accent, message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div className="flex gap-2">
      <div
        className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full text-[9px] font-semibold"
        style={{ background: isUser ? 'rgba(0,0,0,0.07)' : accent }}
      >
        {isUser ? 'Y' : <Icon d={icons.bot} size={11} stroke="#fff" />}
      </div>
      <div className="flex-1">
        <div className={cn('text-[10px] font-[480] text-[rgba(0,0,0,0.32)]', isUser ? 'mb-[3px]' : 'mb-1')}>{isUser ? 'You' : 'Assistant'}</div>
        {isUser ? (
          <div className="text-[12.5px] leading-[1.5] tracking-[-0.1px]">{message.text}</div>
        ) : (
          <>
            <div className="mb-1.5 text-[12.5px] leading-[1.55]">{message.result.title}</div>
            {message.result.bullets.map((bullet) => (
              <div key={bullet} className="mb-[3px] flex gap-[5px] text-[11.5px] text-black/50">
                <span style={{ color: accent }}>·</span>
                {bullet}
              </div>
            ))}
            {message.result.note && <div className="mb-2 text-[11px] text-[rgba(0,0,0,0.4)]">{message.result.note}</div>}
            <span
              className="inline-block rounded-full px-2.5 py-[3px] text-[11px] font-[480]"
              style={{
                background: message.result.badge.style === 'solid' ? accent : `${accent}18`,
                color: message.result.badge.style === 'solid' ? '#fff' : accent,
              }}
            >
              {message.result.badge.label}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
