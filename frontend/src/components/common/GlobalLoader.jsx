import { useSelector } from "react-redux";

const GlobalLoader = () => {
  const loadingCount = useSelector((state) => state.ui.globalLoadingCount);

  if (!loadingCount) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[100]">
      <div className="h-1 w-full overflow-hidden bg-slate-200">
        <div className="h-full w-1/3 animate-[pulse_1s_ease-in-out_infinite] bg-rose-600" />
      </div>
    </div>
  );
};

export default GlobalLoader;
