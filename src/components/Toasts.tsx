import { useApp } from "../store/store";
import { IconCheck, IconClose } from "./Icons";

export function Toasts() {
  const { toasts, dismissToast } = useApp();
  if (!toasts.length) return null;
  return (
    <div className="fixed top-24 right-4 z-[60] space-y-2 max-w-sm w-[calc(100%-2rem)] sm:w-auto">
      {toasts.map((t) => {
        const tone =
          t.type === "success"
            ? "bg-emerald-600"
            : t.type === "error"
            ? "bg-red-600"
            : "bg-[#4A0E16]";
        return (
          <div
            key={t.id}
            className={`${tone} text-white rounded-2xl px-4 py-3 shadow-2xl flex items-center gap-3 animate-fade-up`}
          >
            <div className="bg-white/20 rounded-full p-1">
              <IconCheck size={16} />
            </div>
            <div className="flex-1 text-sm font-medium">{t.message}</div>
            <button onClick={() => dismissToast(t.id)} className="opacity-80 hover:opacity-100">
              <IconClose size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
