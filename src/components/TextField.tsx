import { InputHTMLAttributes } from "react";

export default function TextField(props: InputHTMLAttributes<HTMLInputElement>) {
  const { className, ...rest } = props;
  return (
    <input
      {...rest}
      className={`w-full border-2 border-ink bg-white px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-clay ${className ?? ""}`}
    />
  );
}
