import { InputHTMLAttributes } from "react";

export default function TextField(props: InputHTMLAttributes<HTMLInputElement>) {
  const { className, ...rest } = props;
  return (
    <input
      {...rest}
<<<<<<< HEAD
      className={`w-full border-2 border-ink bg-white px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-clay ${className ?? ""}`}
=======
      className={`w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-sm font-body shadow-sm transition-all duration-150 ease-smooth placeholder:text-mute focus:border-clay focus:outline-none focus:ring-2 focus:ring-clay/40 disabled:bg-mute/5 ${className ?? ""}`}
>>>>>>> master
    />
  );
}
