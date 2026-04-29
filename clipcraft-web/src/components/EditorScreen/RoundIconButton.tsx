import Icon from '../Icon';
import { icons } from '../icons';
import type { RoundIconButtonProps } from '../../types/pages/EditorScreen';

export default function RoundIconButton({ active = false, ariaLabel, icon, onClick, size = 28 }: RoundIconButtonProps) {
  return (
    <button
      aria-label={ariaLabel}
      className="flex cursor-pointer items-center justify-center rounded-full border-0 bg-[rgba(0,0,0,0.05)]"
      onClick={onClick}
      style={{ height: size, width: size }}
      type="button"
    >
      <Icon d={icons[icon]} size={12} stroke={active ? '#000' : 'rgba(0,0,0,0.5)'} />
    </button>
  );
}
