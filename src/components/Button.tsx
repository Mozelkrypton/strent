import { ButtonHTMLAttributes } from "react";

export default function Button(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  const { className, children, ...rest } = props;
  return (
    <button
      {...rest}
<<<<<<< HEAD
      className={`border-2 border-ink bg-clay px-4 py-2 text-sm font-medium text-paper shadow-[2px_2px_0_0_#211D16] transition hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none disabled:opacity-60 ${className ?? ""}`}
=======
      className={`rounded-xl bg-clay px-4 py-2.5 text-sm font-medium text-paper shadow-card transition-all duration-200 ease-smooth hover:-translate-y-0.5 hover:shadow-lift active:translate-y-0 active:shadow-card disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-card ${className ?? ""}`}
>>>>>>> master
    >
      {children}
    </button>
  );
}
