import { useState } from "react";
import { List } from "@/types";
import CardItem from "./CardItem";

interface ColumnProps {
  column: List;
  columnIndex: number;
  totalColumns: number;
  onDeleteColumn: (columnId: string) => void;
  onEditColumn: (columnId: string, newTitle: string) => void;
  onAddCard: (columnId: string, title: string) => void;
  onDeleteCard: (columnId: string, cardId: string) => void;
  onEditCard: (cardId: string, newTitle: string) => void;
  onMoveCard: (cardId: string, sourceColId: string, direction: "left" | "right") => void;
  onDragStart: (cardId: string, colId: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (targetColId: string) => void;
}

export default function Column({
  column,
  columnIndex,
  totalColumns,
  onDeleteColumn,
  onEditColumn,
  onAddCard,
  onDeleteCard,
  onEditCard,
  onMoveCard,
  onDragStart,
  onDragOver,
  onDrop,
}: ColumnProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [cardText, setCardText] = useState("");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleText, setTitleText] = useState(column.title);

  function handleAddCardSubmit() {
    const text = cardText.trim();
    if (!text) return;
    onAddCard(column.id, text);
    setCardText("");
    setIsAdding(false);
  }

  function handleSaveTitle() {
    const trimmed = titleText.trim();
    if (!trimmed) return;
    onEditColumn(column.id, trimmed);
    setIsEditingTitle(false);
  }

  return (
    <div
      onDragOver={onDragOver}
      onDrop={() => onDrop(column.id)}
      className="w-72 flex-shrink-0 bg-slate-100 rounded-xl shadow-md border border-slate-200 flex flex-col max-h-[calc(100vh-120px)]"
    >
      <div className="flex items-center justify-between p-3 border-b border-slate-200">
        {isEditingTitle ? (
          <div className="flex items-center gap-1.5 flex-1">
            <input
              autoFocus
              type="text"
              value={titleText}
              onChange={(e) => setTitleText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveTitle();
                if (e.key === "Escape") {
                  setTitleText(column.title);
                  setIsEditingTitle(false);
                }
              }}
              className="text-sm font-semibold p-1 border border-slate-300 rounded bg-white w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSaveTitle}
              className="bg-blue-600 text-white text-xs px-2 py-1 rounded"
            >
              Save
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 flex-1">
            <h2
              onClick={() => setIsEditingTitle(true)}
              className="font-semibold text-slate-800 text-sm cursor-pointer hover:text-blue-600"
              title="Click to rename list"
            >
              {column.title}
            </h2>
            <span className="text-xs bg-slate-200 text-slate-600 rounded-full px-2 py-0.5 font-medium">
              {column.cards.length}
            </span>
          </div>
        )}

        <div className="flex items-center gap-1">
          {!isEditingTitle && (
            <button
              onClick={() => setIsEditingTitle(true)}
              className="text-slate-400 hover:text-blue-600 text-xs p-1"
              title="Rename list"
            >
              ✏️
            </button>
          )}
          <button
            onClick={() => onDeleteColumn(column.id)}
            className="text-slate-400 hover:text-red-600 hover:bg-red-50 rounded p-1 transition-colors text-xs font-bold"
            title="Delete List"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="p-3 flex-1 overflow-y-auto flex flex-col gap-2">
        {column.cards.map((card) => (
          <CardItem
            key={card.id}
            card={card}
            columnId={column.id}
            columnIndex={columnIndex}
            totalColumns={totalColumns}
            onDelete={onDeleteCard}
            onEdit={onEditCard}
            onMove={onMoveCard}
            onDragStart={onDragStart}
          />
        ))}

        {column.cards.length === 0 && (
          <div className="p-4 border-2 border-dashed border-slate-300 rounded-lg text-center text-xs text-slate-400">
            Drop cards here
          </div>
        )}
      </div>

      <div className="p-3 pt-0">
        {isAdding ? (
          <div className="flex flex-col gap-2 bg-white p-2 rounded-lg border border-slate-300 shadow-sm">
            <textarea
              autoFocus
              rows={2}
              placeholder="Enter card title..."
              value={cardText}
              onChange={(e) => setCardText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleAddCardSubmit();
                }
              }}
              className="w-full text-sm p-1.5 border border-slate-200 rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex items-center gap-2">
              <button
                onClick={handleAddCardSubmit}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded transition-colors"
              >
                Add Card
              </button>
              <button
                onClick={() => {
                  setIsAdding(false);
                  setCardText("");
                }}
                className="text-slate-500 hover:text-slate-700 text-xs px-2 py-1.5"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="w-full py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors flex items-center justify-center gap-1"
          >
            <span className="text-sm font-bold">+</span> Add a card
          </button>
        )}
      </div>
    </div>
  );
}
