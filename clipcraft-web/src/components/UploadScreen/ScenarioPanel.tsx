import { useEffect, useRef, useState } from 'react';
import type { DragEvent, KeyboardEvent } from 'react';
import { motion } from 'framer-motion';
import Icon from '../Icon';
import MonoLabel from '../MonoLabel';
import { icons } from '../icons';
import { fadeInUp } from '../../lib/animations';
import { cn } from '../../lib/cn';
import type { ScenarioItem } from '../../types/app';

interface ScenarioPanelProps {
  accent: string;
  panelPadding: string;
  accentTint: string;
  useEmptyStateDesign: boolean;
  onItemsChange: (items: ScenarioItem[]) => void;
}

function DragDots() {
  return (
    <svg width="12" height="14" viewBox="0 0 12 14" fill="none">
      {[2, 6, 10].flatMap((x) =>
        [3, 7, 11].map((y) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r={1.2} fill="#000" />
        )),
      )}
    </svg>
  );
}

export default function ScenarioPanel({ accent, panelPadding, accentTint, useEmptyStateDesign, onItemsChange }: ScenarioPanelProps) {
  const [items, setItems] = useState<ScenarioItem[]>([]);
  const [draggingItem, setDraggingItem] = useState<number | null>(null);
  const [hoverItem, setHoverItem] = useState<number | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    onItemsChange(items);
  }, [items, onItemsChange]);

  const addItem = (value = inputValue) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    setItems((current) => [
      ...current,
      {
        id: current.reduce((maxId, item) => Math.max(maxId, item.id), 0) + 1,
        ko: trimmed,
        en: trimmed,
      },
    ]);
    setInputValue('');
    inputRef.current?.focus();
  };

  const removeItem = (itemId: number) => {
    setItems((current) => current.filter((item) => item.id !== itemId));
  };

  const handleDrop = (targetId: number) => {
    if (!draggingItem || draggingItem === targetId) return;
    const from = items.findIndex((item) => item.id === draggingItem);
    const to = items.findIndex((item) => item.id === targetId);
    const next = [...items];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setItems(next);
    setDraggingItem(null);
    setHoverItem(null);
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>, itemId: number) => {
    event.preventDefault();
    if (itemId !== draggingItem) setHoverItem(itemId);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !event.nativeEvent.isComposing) {
      event.preventDefault();
      addItem();
    }
  };

  return (
    <motion.section
      className={cn('flex flex-col bg-white', useEmptyStateDesign ? 'rounded-[14px]' : 'rounded-xl', panelPadding)}
      style={{
        border: items.length === 0 ? '1px dashed rgba(0,0,0,0.14)' : '1px solid rgba(0,0,0,0.1)',
        transition: 'background-color 0.18s ease, border-color 0.18s ease',
      }}
      variants={fadeInUp}
    >
      <div className="mb-1.5 flex items-center gap-2">
        <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: useEmptyStateDesign ? 'rgba(0,0,0,0.18)' : accent }} />
        <MonoLabel>02 - 편집 시나리오 입력</MonoLabel>
      </div>
      <p className={cn('mb-5 text-[13px] tracking-[-0.1px]', useEmptyStateDesign ? 'leading-[1.55] text-[rgba(0,0,0,0.38)]' : 'text-[rgba(0,0,0,0.4)]')}>
        영상에서 추출할 장면의 순서를 입력해 주세요.
      </p>

      {items.length === 0 ? (
        <div className="mb-3.5 flex flex-1 flex-col items-center justify-center gap-3.5 rounded-[10px] border border-dashed border-[rgba(0,0,0,0.09)] bg-[rgba(0,0,0,0.022)] px-6 py-8">
          <div className="relative h-11 w-[60px]">
            {[2, 1, 0].map((stack) => (
              <div
                key={stack}
                className="absolute h-7 rounded-[7px] border border-[rgba(0,0,0,0.07)]"
                style={{
                  top: stack * 4,
                  left: stack * 4,
                  right: -(stack * 4),
                  background: stack === 0 ? 'rgba(0,0,0,0.06)' : stack === 1 ? 'rgba(0,0,0,0.04)' : 'rgba(0,0,0,0.025)',
                }}
              />
            ))}
          </div>
          <div className="text-center">
            <div className="mb-[5px] text-sm font-[490] tracking-[-0.2px] text-[rgba(0,0,0,0.4)]">아직 입력된 장면이 없어요</div>
            <div className="text-[12.5px] leading-[1.5] tracking-[-0.1px] text-[rgba(0,0,0,0.28)]">
              아래 입력창에 장면 이름을 입력하고
              <br />
              Enter 또는 + 버튼으로 추가하세요.
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-3 flex flex-1 flex-col gap-[5px]">
          {items.map((item, index) => {
            const isHovered = hoverItem === item.id;
            const isDragging = draggingItem === item.id;
            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 8, scale: 0.99 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                draggable
                onDragStart={() => setDraggingItem(item.id)}
                onDragOver={(event) => handleDragOver(event, item.id)}
                onDrop={() => handleDrop(item.id)}
                onDragEnd={() => {
                  setDraggingItem(null);
                  setHoverItem(null);
                }}
                className="flex cursor-grab items-center gap-2.5 rounded-lg px-3.5 py-2.5 transition-[border-color,background,transform,box-shadow,opacity]"
                style={{
                  background: isHovered ? accentTint : isDragging ? 'rgba(0,0,0,0.025)' : '#fff',
                  border: `1px solid ${isHovered ? accent : isDragging ? 'rgba(0,0,0,0.05)' : 'rgba(0,0,0,0.08)'}`,
                  boxShadow: isHovered ? `0 4px 12px ${accent}22` : 'none',
                  opacity: isDragging ? 0.4 : 1,
                  transform: isHovered ? 'translateY(-1px)' : 'none',
                }}
              >
                <div className="flex shrink-0 cursor-grab items-center pr-0.5 opacity-25 transition-opacity hover:opacity-60">
                  <DragDots />
                </div>
                <span
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full font-mono text-[10px] transition-all"
                  style={{
                    background: isHovered ? accent : 'rgba(0,0,0,0.06)',
                    color: isHovered ? '#fff' : 'rgba(0,0,0,0.4)',
                  }}
                >
                  {index + 1}
                </span>
                <span className="flex-1 text-[13.5px] tracking-[-0.1px]">{item.ko}</span>
                <button
                  className="flex h-5 w-5 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent opacity-25 transition-opacity hover:opacity-70"
                  onClick={() => removeItem(item.id)}
                  type="button"
                  aria-label={`${item.ko} 삭제`}
                >
                  <Icon d={icons.trash} size={12} stroke="#000" />
                </button>
              </motion.div>
            );
          })}
        </div>
      )}

      <div className="mt-auto flex gap-2">
        <div
          className="flex flex-1 items-center gap-2 rounded-[10px] bg-white px-3.5 py-2.5 transition-colors"
          style={{ border: `1.5px solid ${isInputFocused ? accent : 'rgba(0,0,0,0.12)'}` }}
        >
          <Icon d={icons.plus} size={14} stroke={isInputFocused ? accent : 'rgba(0,0,0,0.28)'} />
          <input
            ref={inputRef}
            className="flex-1 border-0 bg-transparent text-[13.5px] tracking-[-0.1px] text-black outline-none placeholder:text-[rgba(0,0,0,0.28)]"
            onBlur={() => setIsInputFocused(false)}
            onChange={(event) => setInputValue(event.target.value)}
            onFocus={() => setIsInputFocused(true)}
            onKeyDown={handleKeyDown}
            placeholder="찾고 싶은 장면을 입력하세요"
            value={inputValue}
          />
        </div>
        <button
          className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-[10px] border-0 transition-colors"
          onClick={() => addItem()}
          style={{
            background: inputValue.trim() ? accent : 'rgba(0,0,0,0.07)',
            cursor: inputValue.trim() ? 'pointer' : 'default',
          }}
          type="button"
          aria-label="장면 추가"
        >
          <Icon d={icons.plus} size={16} stroke={inputValue.trim() ? '#fff' : 'rgba(0,0,0,0.3)'} strokeWidth={3} />
        </button>
      </div>
    </motion.section>
  );
}
