import { cn } from '@/shared/lib';
import { COLORS, UI_TEXT } from '../constants/game';

interface GameSubmitButtonProps {
  onComplete?: () => void;
  completedCount: number;
  totalCount: number;
  isReady: boolean;
  showBadge?: boolean;
  disabled?: boolean;
}

export const GameSubmitButton = ({
  onComplete,
  completedCount,
  totalCount,
  isReady,
  showBadge = true,
  disabled = false,
}: GameSubmitButtonProps) => {
  return (
    <div className="relative mt-4 w-full">
      {showBadge && (
        <div
          className="absolute top-[-2rem] left-1/2 z-0 flex -translate-x-1/2 items-center justify-center whitespace-nowrap rounded-t-xl px-6 py-2 text-sm font-bold text-white shadow-md"
          style={{ backgroundColor: COLORS.BADGE_PINK }}
        >
          {completedCount}/{totalCount} 완료
        </div>
      )}

      <button
        type="button"
        onClick={onComplete}
        disabled={disabled}
        className={cn(
          'relative z-10 h-16 w-[110%] -left-[5%] rounded-full text-2xl font-extrabold shadow-lg transition-all',
          disabled
            ? 'cursor-not-allowed opacity-50'
            : 'hover:brightness-95 active:scale-95',
          isReady ? 'text-white' : 'bg-white text-black',
        )}
        style={{
          backgroundColor: isReady ? COLORS.TIMER_RED : undefined,
        }}
      >
        {isReady ? UI_TEXT.BUTTON.CANCEL : UI_TEXT.BUTTON.COMPLETE}
      </button>
    </div>
  );
};