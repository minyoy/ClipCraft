import { useEffect, useRef, useState } from 'react';
import Icon from '@/components/Icon';
import { icons } from '@/components/icons';
import type { EditChatMessage } from '@/types/app';
import type { AiAssistantProps } from '@/types/pages/EditorScreen';

const EDIT_CHAT_HISTORY_KEY = 'editor-edit-chat-history';

type DisplayEditChatMessage = EditChatMessage & {
  pending?: boolean;
};

function isEditChatMessage(value: unknown): value is EditChatMessage {
  if (!value || typeof value !== 'object') return false;

  const message = value as Partial<EditChatMessage>;
  return (
    typeof message.id === 'number' &&
    (message.role === 'user' || message.role === 'system') &&
    typeof message.content === 'string' &&
    typeof message.createdAt === 'string'
  );
}

function loadEditChatHistory(): EditChatMessage[] {
  if (typeof window === 'undefined') return [];

  try {
    const saved = window.localStorage.getItem(EDIT_CHAT_HISTORY_KEY);
    if (!saved) return [];

    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) && parsed.every(isEditChatMessage) ? parsed : [];
  } catch {
    return [];
  }
}

function formatMessageTime(createdAt: string): string {
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return '';

  return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
}

export default function AiAssistant({ accent, onApplyCommand }: AiAssistantProps) {
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState<DisplayEditChatMessage[]>(loadEditChatHistory);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const responseTimersRef = useRef<number[]>([]);

  useEffect(() => {
    try {
      if (messages.length === 0) {
        window.localStorage.removeItem(EDIT_CHAT_HISTORY_KEY);
        return;
      }

      window.localStorage.setItem(EDIT_CHAT_HISTORY_KEY, JSON.stringify(messages.filter((message) => !message.pending)));
    } catch {
      // localStorage availability can vary by browser settings.
    }
  }, [messages]);

  useEffect(() => {
    const chatScroll = chatScrollRef.current;
    if (!chatScroll) return;

    window.requestAnimationFrame(() => {
      chatScroll.scrollTop = chatScroll.scrollHeight;
    });
  }, [messages]);

  useEffect(() => {
    return () => {
      responseTimersRef.current.forEach((timerId) => window.clearTimeout(timerId));
    };
  }, []);

  const sendMessage = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    const now = Date.now();
    const createdAt = new Date(now).toISOString();
    const loadingMessage: DisplayEditChatMessage = {
      id: now + 1,
      role: 'system',
      content: '',
      createdAt,
      pending: true,
    };

    setMessages((current) => [...current, { id: now, role: 'user', content: trimmed, createdAt }, loadingMessage]);
    setDraft('');

    const timerId = window.setTimeout(() => {
      const result = onApplyCommand(trimmed);
      const systemMessage: EditChatMessage = {
        id: loadingMessage.id,
        role: 'system',
        content: result.message,
        createdAt,
      };

      setMessages((current) => current.map((message) => (message.id === loadingMessage.id ? systemMessage : message)));
      responseTimersRef.current = responseTimersRef.current.filter((id) => id !== timerId);
    }, 1000);
    responseTimersRef.current.push(timerId);
  };

  const clearHistory = () => {
    responseTimersRef.current.forEach((timerId) => window.clearTimeout(timerId));
    responseTimersRef.current = [];
    window.localStorage.removeItem(EDIT_CHAT_HISTORY_KEY);
    setMessages([]);
  };

  return (
    <aside className="flex min-h-0 flex-col border-l border-[rgba(0,0,0,0.08)] max-[1180px]:border-t max-[1180px]:border-l-0">
      <div className="flex items-center gap-2 border-b border-[rgba(0,0,0,0.08)] px-[18px] py-3.5">
        <div className="flex h-6 w-6 items-center justify-center rounded-full" style={{ background: accent }}>
          <Icon d={icons.bot} size={12} stroke="#fff" />
        </div>
        <span className="text-[13px] font-[540] tracking-[-0.2px]">AI 어시스턴트</span>
        <div className="flex-1" />
        <button
          className="cursor-pointer rounded-full border border-[rgba(0,0,0,0.1)] bg-white px-2.5 py-1 text-[11px] font-[480] text-black/45 transition-colors hover:text-black/70 disabled:cursor-default disabled:opacity-35"
          disabled={messages.length === 0}
          onClick={clearHistory}
          type="button"
        >
          기록 초기화
        </button>
      </div>

      <div ref={chatScrollRef} className="flex flex-1 flex-col gap-2.5 overflow-y-auto px-4 py-3.5">
        <style>{`@keyframes edit-chat-message-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } } @keyframes edit-chat-loading-dot { 0%, 80%, 100% { opacity: 0.25; transform: translateY(0); } 40% { opacity: 1; transform: translateY(-2px); } }`}</style>
        {messages.length === 0 ? (
          <div className="flex flex-1 items-center justify-center px-5 text-center text-[12px] leading-[1.5] text-black/30">
            어떤 장면을 편집할까요? <br />
            원하는 장면과 편집 내용을 입력해보세요
          </div>
        ) : (
          messages.map((message) => {
            const isUser = message.role === 'user';

            return (
              <div key={message.id} className={`flex flex-col gap-1 ${isUser ? 'items-end' : 'items-start'}`} style={{ animation: 'edit-chat-message-in 180ms ease-out both' }}>
                <div
                  className="max-w-[88%] rounded-[10px] px-3 py-2 text-[12.5px] leading-[1.45] break-words"
                  style={{
                    background: isUser ? accent : 'rgba(0,0,0,0.05)',
                    color: isUser ? '#fff' : 'rgba(0,0,0,0.72)',
                  }}
                >
                  {message.pending ? (
                    <span className="flex h-[18px] items-center gap-1">
                      {[0, 1, 2].map((dot) => (
                        <span
                          key={dot}
                          className="h-1.5 w-1.5 rounded-full bg-black/35"
                          style={{ animation: `edit-chat-loading-dot 900ms ${dot * 120}ms infinite ease-in-out` }}
                        />
                      ))}
                    </span>
                  ) : (
                    message.content
                  )}
                </div>
                {!message.pending && <div className="px-1 font-mono text-[9.5px] text-black/25">{formatMessageTime(message.createdAt)}</div>}
              </div>
            );
          })
        )}
      </div>

      <div className="border-t border-[rgba(0,0,0,0.08)] px-3.5 py-2.5">
        <div className="flex items-center gap-2 rounded-full border border-[rgba(0,0,0,0.12)] py-[7px] pr-[7px] pl-3.5">
          <input
            data-testid="chat-input"
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') sendMessage();
            }}
            placeholder="예: 끓이는 장면 2배속 해줘"
            className="flex-1 border-0 bg-transparent text-[12.5px] outline-none"
            value={draft}
          />
          <button data-testid="chat-send-button" className="flex h-7 cursor-pointer items-center gap-1.5 rounded-full border-0 px-3 text-[11.5px] font-[540] text-white" onClick={sendMessage} style={{ background: accent }} type="button">
            <Icon d={icons.send} size={11} stroke="#fff" />
          </button>
        </div>
      </div>
    </aside>
  );
}
