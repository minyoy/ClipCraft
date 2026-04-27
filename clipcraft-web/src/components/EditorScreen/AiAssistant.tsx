import { useState } from 'react';
import Icon from '../Icon';
import { icons } from '../icons';
import type { AccentProps, EditorChatMessage } from '../../types/pages/EditorScreen';
import ChatMessage from './ChatMessage';

export default function AiAssistant({ accent }: AccentProps) {
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState<EditorChatMessage[]>([
    { role: 'user', text: 'Speed up the boiling part to 2x.' },
    {
      role: 'bot',
      result: {
        title: 'I detected the boiling section.',
        bullets: ['Detected: 02:14 - 04:47', 'Apply 2x speed to this segment.'],
        badge: { label: 'Awaiting confirmation', style: 'outline' },
      },
    },
    { role: 'user', text: 'Remove all silent parts.' },
    {
      role: 'bot',
      result: {
        title: 'I analyzed the audio and found silent segments.',
        bullets: ['00:03 - 00:08 (5 sec)', '01:42 - 01:49 (7 sec)', '05:30 - 06:34 (4 sec)'],
        note: 'Total of 16 seconds will be trimmed.',
        badge: { label: 'Ready to cut', style: 'solid' },
      },
    },
  ]);

  const sendMessage = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;

    setMessages((current) => [
      ...current,
      { role: 'user', text: trimmed },
      {
        role: 'bot',
        result: {
          title: 'I will apply that edit to the current timeline.',
          bullets: ['Preview update queued', 'Review the timeline before export.'],
          badge: { label: 'Queued', style: 'outline' },
        },
      },
    ]);
    setDraft('');
  };

  return (
    <aside className="flex flex-col border-l border-[rgba(0,0,0,0.08)]">
      <div className="flex items-center gap-2 border-b border-[rgba(0,0,0,0.08)] px-[18px] py-3.5">
        <div className="flex h-6 w-6 items-center justify-center rounded-full" style={{ background: accent }}>
          <Icon d={icons.bot} size={12} stroke="#fff" />
        </div>
        <span className="text-[13px] font-[540] tracking-[-0.2px]">AI Assistant</span>
      </div>

      <div className="flex flex-1 flex-col gap-3.5 overflow-y-auto px-4 py-3.5">
        {messages.map((message, index) => (
          <ChatMessage key={`${message.role}-${index}`} accent={accent} message={message} />
        ))}
      </div>

      <div className="border-t border-[rgba(0,0,0,0.08)] px-3.5 py-2.5">
        <div className="flex items-center gap-2 rounded-full border border-[rgba(0,0,0,0.12)] py-[7px] pr-[7px] pl-3.5">
          <input
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') sendMessage();
            }}
            placeholder="Ask AI to edit, filter, or trim..."
            className="flex-1 border-0 bg-transparent text-[12.5px] outline-none"
            value={draft}
          />
          <button className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border-0" onClick={sendMessage} style={{ background: accent }} type="button">
            <Icon d={icons.send} size={12} stroke="#fff" />
          </button>
        </div>
      </div>
    </aside>
  );
}
