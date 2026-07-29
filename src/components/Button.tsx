import { ButtonHTMLAttributes } from "react";

export default function Button(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  const { className, children, ...rest } = props;
  return (
    <button
      {...rest}
      className={`rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-card transition-all duration-200 ease-smooth hover:-translate-y-0.5 hover:bg-primary-dark hover:shadow-lift active:translate-y-0 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-card ${className ?? ""}`}
    >
      {children}
    </button>
  );
}
