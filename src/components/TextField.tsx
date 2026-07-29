import { InputHTMLAttributes } from "react";

export default function TextField(props: InputHTMLAttributes<HTMLInputElement>) {
  const { className, ...rest } = props;
  return (
    <input
      {...rest}
      className={`w-full rounded-xl border border-ink/10 bg-surface px-4 py-3 text-sm font-body shadow-sm transition-all duration-150 ease-smooth placeholder:text-mute/70 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 disabled:bg-mute/5 ${className ?? ""}`}
    />
  );
}
