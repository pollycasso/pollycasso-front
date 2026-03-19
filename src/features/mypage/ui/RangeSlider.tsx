import type { ComponentProps } from 'react';

interface RangeSliderProps extends Omit<ComponentProps<'input'>, 'type'> {
  label: string;
  value: number;
  unit?: string;
  minLabel?: string;
  maxLabel?: string;
  description?: string;
}

export const RangeSlider = ({
  label,
  value,
  unit = '',
  minLabel = '0',
  maxLabel = '100',
  description,
  className,
  ...props
}: RangeSliderProps) => {
  return (
    <div className={`flex flex-col gap-4 w-2/5 ${className}`}>
      <div className="text-2xl font-light flex items-center gap-3">
        <span>{label}</span>
        <span className="text-white">
          {value}
          {unit}
        </span>
      </div>
      <div className="flex flex-col items-center gap-y-3">
        <input type="range" className="custom-range" value={value} {...props} />
        <div className="flex justify-between w-full text-white/50">
          <span className="text-sm font-pretendard">{minLabel}</span>
          <span className="text-sm font-pretendard">{maxLabel}</span>
        </div>
      </div>
      {description && (
        <p className="text-sm text-gray-300 font-pretendard ml-1">
          {description}
        </p>
      )}
    </div>
  );
};
