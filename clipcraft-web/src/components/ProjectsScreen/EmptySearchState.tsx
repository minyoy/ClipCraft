import Icon from '../Icon';
import PillButton from '../PillButton';
import { icons } from '../icons';

interface EmptySearchStateProps {
  onClear: () => void;
  query: string;
}

export default function EmptySearchState({ onClear, query }: EmptySearchStateProps) {
  return (
    <div className="rounded-[14px] border border-dashed border-[rgba(0,0,0,0.12)] bg-white px-10 py-20 text-center">
      <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-[14px] bg-[rgba(0,0,0,0.04)]">
        <Icon d={icons.search} size={22} stroke="rgba(0,0,0,0.35)" />
      </div>
      <h3 className="mb-1.5 text-xl font-[620] tracking-[-0.4px]">"{query}" 검색 결과가 없어요</h3>
      <p className="mb-[18px] text-[13.5px] tracking-[-0.1px] text-[rgba(0,0,0,0.45)]">다른 키워드로 검색하거나, 새 프로젝트를 만들어보세요.</p>
      <PillButton onClick={onClear} small variant="white">
        검색 초기화
      </PillButton>
    </div>
  );
}
