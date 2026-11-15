import { useState } from "react";

interface AddColumnProps {
  onAddColumn: (title: string) => void;
}

export default function AddColumn({ onAddColumn }: AddColumnProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState("");

  function handleSubmit() {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;
    onAddColumn(trimmedTitle);
    setTitle("");
    setIsAdding(false);
  }

  return (
    <div className="w-72 flex-shrink-0">
      {isAdding ? (
        <div className="bg-slate-100 p-3 rounded-xl shadow-md border border-slate-200 flex flex-col gap-2">
          <input
            autoFocus
            type="text"
            placeholder="Enter list title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSubmit();
              }
            }}
            className="w-full text-sm p-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex items-center gap-2">
            <button
              onClick={handleSubmit}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
            >
              Add List
            </button>
            <button
              onClick={() => {
                setIsAdding(false);
                setTitle("");
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
          className="w-full py-2.5 px-4 bg-white/20 hover:bg-white/30 text-white text-sm font-semibold rounded-xl border border-white/20 backdrop-blur-sm transition-colors flex items-center gap-2"
        >
          <span className="text-base font-bold">+</span> Add another list
        </button>
      )}
    </div>
  );
}
