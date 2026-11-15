import { useState } from "react";
import { Card } from "@/types";

interface CardItemProps {
  card: Card;
  columnId: string;
  columnIndex: number;
  totalColumns: number;
  onDelete: (columnId: string, cardId: string) => void;
  onEdit: (cardId: string, newTitle: string) => void;
  onMove: (cardId: string, sourceColId: string, direction: "left" | "right") => void;
  onDragStart: (cardId: string, colId: string) => void;
}

export default function CardItem({
  card,
  columnId,
  columnIndex,
  totalColumns,
  onDelete,
  onEdit,
  onMove,
  onDragStart,
}: CardItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(card.title);

  function handleSaveEdit() {
    const trimmed = title.trim();
    if (!trimmed) return;
    onEdit(card.id, trimmed);
    setIsEditing(false);
  }

  return (
    <div
      draggable={!isEditing}
      onDragStart={() => onDragStart(card.id, columnId)}
      className="bg-white p-3 rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing flex flex-col gap-2"
    >
      {isEditing ? (
        <div className="flex flex-col gap-2">
          <input
            autoFocus
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSaveEdit();
              if (e.key === "Escape") {
                setTitle(card.title);
                setIsEditing(false);
              }
            }}
            className="w-full text-sm p-1.5 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveEdit}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-2.5 py-1 rounded"
            >
              Save
            </button>
            <button
              onClick={() => {
                setTitle(card.title);
                setIsEditing(false);
              }}
              className="text-slate-500 hover:text-slate-700 text-xs px-2 py-1"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm text-slate-700 leading-snug break-words flex-1">
              {card.title}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsEditing(true)}
                className="text-slate-400 hover:text-blue-600 text-xs px-1"
                title="Edit card"
              >
                ✏️
              </button>
              <button
                onClick={() => onDelete(columnId, card.id)}
                className="text-slate-400 hover:text-red-500 text-xs font-bold px-1"
                title="Delete card"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-slate-400 text-xs">
            <button
              disabled={columnIndex === 0}
              onClick={() => onMove(card.id, columnId, "left")}
              className="hover:text-blue-600 disabled:opacity-20 disabled:hover:text-slate-400 px-1 font-bold"
              title="Move Left"
            >
              ←
            </button>
            <span className="text-[10px] text-slate-400 select-none">
              drag or shift
            </span>
            <button
              disabled={columnIndex === totalColumns - 1}
              onClick={() => onMove(card.id, columnId, "right")}
              className="hover:text-blue-600 disabled:opacity-20 disabled:hover:text-slate-400 px-1 font-bold"
              title="Move Right"
            >
              →
            </button>
          </div>
        </>
      )}
    </div>
  );
}
