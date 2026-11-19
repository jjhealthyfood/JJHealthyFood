"use client";

export function Chip({
  label,
  selected,
  onClick,
  classNameOverride,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  classNameOverride?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 min-h-[44px] px-4 rounded-full border-[1.5px] text-[15px] transition-colors active:scale-95 ${
        classNameOverride ?? (selected
          ? "bg-primary text-on-primary border-primary font-bold"
          : "bg-white text-on-surface border-outline-variant hover:border-[#2F6E00]/60 font-medium")
      }`}
    >
      {selected && <span className="text-on-primary">✓</span>}
      {label}
    </button>
  );
}
