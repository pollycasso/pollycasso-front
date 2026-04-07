import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';

interface EvaluatingNavigationProps {
  onPrev: () => void;
  onNext: () => void;
  disabled?: boolean;
}

export const EvaluatingNavigation = ({
  onPrev,
  onNext,
  disabled = false,
}: EvaluatingNavigationProps) => {
  return (
    <>
      <button
        onClick={onPrev}
        disabled={disabled}
        className="absolute left-8 top-1/2 -translate-y-1/2 z-30 p-4 rounded-full transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <ChevronLeftIcon className="w-16 h-16 text-gray-300 hover:text-gray-400 transform scale-y-[2.5] scale-x-[1.75]" />
      </button>

      <button
        onClick={onNext}
        disabled={disabled}
        className="absolute right-8 top-1/2 -translate-y-1/2 z-30 p-4 rounded-full transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <ChevronRightIcon className="w-16 h-16 text-gray-300 hover:text-gray-400 transform scale-y-[2.5] scale-x-[1.75]" />
      </button>
    </>
  );
};
