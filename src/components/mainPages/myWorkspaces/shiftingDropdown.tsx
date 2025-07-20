import { ReactNode, useEffect, useState } from "react";
import {
  ArrowDown,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface DropDownProps {
  trigger: ReactNode;
  items: {
    title: string;
    onClick?: () => void;
  }[];
  className?: string;
}

export const ShiftingDropDown = ({ trigger, items, className }: DropDownProps) => {
  const [selected, setSelected] = useState<number | null>(null);
  const [dir, setDir] = useState<null | "l" | "r">(null);

  const handleSetSelected = (val: number | null) => {
    if (typeof selected === "number" && typeof val === "number") {
      setDir(selected > val ? "r" : "l");
    } else if (val === null) {
      setDir(null);
    }
    setSelected(val);
  };

  return (
    <div
      onMouseLeave={() => handleSetSelected(null)}
      className={`relative flex h-fit gap-2 ${className || ''}`}
    >
      <button
        onMouseEnter={() => handleSetSelected(1)}
        onClick={() => handleSetSelected(1)}
        className="flex items-center gap-1 rounded-[10px] px-4 py-1.5 text-sm transition-colors bg-[#80A5E4] text-white hover:bg-[#6b94d6]"
      >
        {trigger}
        <ArrowDown
          className={`w-[16px] h-[16px] transition-transform ${selected === 1 ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {selected && (
          <motion.div
            id="overlay-content"
            initial={{
              opacity: 0,
              y: 8,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              y: 8,
            }}
            className="absolute left-0 top-[calc(100%_+_8px)] w-[130px] rounded-lg border border-neutral-200 bg-white p-2 shadow-lg z-50"
          >
            <Bridge />
            <Nub selected={selected} />

            <div className="overflow-hidden">
              <motion.div
                initial={{
                  opacity: 0,
                  x: dir === "l" ? 100 : dir === "r" ? -100 : 0,
                }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
              >
                {items.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      item.onClick?.();
                      handleSetSelected(null);
                    }}
                    className="w-full rounded-md px-2 py-1.5 text-left text-sm text-gray-700 hover:bg-gray-100"
                  >
                    {item.title}
                  </button>
                ))}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Bridge = () => (
  <div className="absolute -top-[24px] left-0 right-0 h-[24px] " />
);

const Nub = ({ selected }: { selected: number | null }) => {
  const [left, setLeft] = useState(0);

  useEffect(() => {
    moveNub();
  }, [selected]);

  const moveNub = () => {
    if (selected) {
      const hoveredTab = document.querySelector('button');
      const overlayContent = document.getElementById("overlay-content");

      if (!hoveredTab || !overlayContent) return;

      const tabRect = hoveredTab.getBoundingClientRect();
      const { left: contentLeft } = overlayContent.getBoundingClientRect();

      const tabCenter = tabRect.left + tabRect.width / 2 - contentLeft;

      setLeft(tabCenter);
    }
  };

  return (
    <motion.span
      style={{
        clipPath: "polygon(0 0, 100% 0, 50% 50%, 0% 100%)",
      }}
      animate={{ left }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="absolute left-1/2 top-0 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-tl"
    />
  );
};