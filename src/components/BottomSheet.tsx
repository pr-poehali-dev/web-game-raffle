import { useEffect } from "react";
import Icon from "@/components/ui/icon";

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const BottomSheet = ({ open, onClose, title, children }: BottomSheetProps) => {
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Sheet */}
      <div
        className="relative w-full max-w-md flex flex-col animate-scale-in"
        style={{ maxHeight: "90vh" }}
      >
        <div
          className="rounded-t-2xl flex flex-col overflow-hidden"
          style={{
            background: "linear-gradient(135deg, hsl(214,60%,52%) 0%, hsl(218,65%,44%) 100%)",
            border: "1.5px solid hsl(210,65%,65%)",
            borderBottom: "none",
            maxHeight: "90vh",
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3.5 shrink-0 border-b border-white/15">
            <div className="w-10 h-1 bg-white/30 rounded-full mx-auto absolute left-1/2 -translate-x-1/2 top-2" />
            <span className="font-display font-black text-white text-[15px]">{title}</span>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center active:scale-90 transition-transform"
            >
              <Icon name="X" size={16} className="text-white" />
            </button>
          </div>
          {/* Scrollable content */}
          <div className="overflow-y-auto overscroll-contain px-4 pb-6 pt-3 flex-1">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BottomSheet;
