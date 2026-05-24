const Button = ({ children, loading, ...props }) => {
  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className="inline-flex w-full items-center justify-center rounded-xl bg-rose-600 px-4 py-3.5 text-sm font-bold tracking-wide text-white shadow-[0_12px_24px_-10px_rgba(225,29,72,0.55)] transition duration-200 hover:bg-rose-700 hover:shadow-[0_16px_28px_-12px_rgba(190,18,60,0.65)] disabled:cursor-not-allowed disabled:opacity-70"
    >
      {loading ? "Please wait..." : children}
    </button>
  );
};

export default Button;
