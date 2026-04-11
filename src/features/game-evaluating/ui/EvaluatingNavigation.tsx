import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';

interface EvaluatingNavigationProps {
  onPrev: () => void;
  onNext: () => void;
  canGoPrev: boolean;
  canGoNext: boolean;
}

export const EvaluatingNavigation = ({
  onPrev,
  onNext,
  canGoPrev,
  canGoNext,
}: EvaluatingNavigationProps) => {
  return (
    <>
      <button
        onClick={onPrev}
        disabled={!canGoPrev}
        className="absolute left-8 top-1/2 -translate-y-1/2 z-30 p-4 rounded-full transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <ChevronLeftIcon
          className={`w-16 h-16 transform scale-y-[2.5] scale-x-[1.75] transition-colors ${
            canGoPrev ? 'text-gray-500 hover:text-gray-700' : 'text-gray-300'
          }`}
        />
      </button>

      <button
        onClick={onNext}
        disabled={!canGoNext}
        className="absolute right-8 top-1/2 -translate-y-1/2 z-30 p-4 rounded-full transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <ChevronRightIcon
          className={`w-16 h-16 transform scale-y-[2.5] scale-x-[1.75] transition-colors ${
            canGoNext ? 'text-gray-500 hover:text-gray-700' : 'text-gray-300'
          }`}
        />
      </button>
    </>
  );
};
