import React from "react";
import { Button } from "./button";
import { X } from "lucide-react";

interface TabProps {
  title: string;
  tabId: string;
  isActive: boolean;
  onClose: () => void;
  onClick: () => void;
  onDragStart: (e: React.DragEvent, tabId: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent, tabId: string) => void;
}

export const Tab: React.FC<TabProps> = ({
  title,
  tabId,
  isActive,
  onClose,
  onClick,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop
}) => {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, tabId)}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={(e) => onDrop(e, tabId)}
      className={`flex items-center h-8 px-4 border-r border-[#e2e2e2] cursor-pointer ${isActive ? "bg-white" : "bg-[#f5f5f5]"
        } ${Number(tabId) === 1 ? "rounded-[8px_8px_0px_0px]" : "rounded-[8px_8px_0px_0px]"}`}
      onClick={onClick}
    >
      <span className="font-normal text-[13px] text-black font-['Inter',Helvetica] whitespace-nowrap overflow-hidden text-ellipsis">
        {title}
      </span>
      <Button
        variant="ghost"
        size="icon"
        className="ml-2 p-0 h-7"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
      >
        <X />
      </Button>
    </div>
  );
};