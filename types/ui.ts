export interface SegmentedOption<T extends string = string> {
  id: T;
  label: string;
  /** Optional count badge. */
  count?: number;
  /** Show a pulsing "live" dot before the label. */
  live?: boolean;
}

export interface SegmentedControlProps<T extends string = string> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (id: T) => void;
  ariaLabel: string;
  className?: string;
}

export interface ToggleSwitchProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}
