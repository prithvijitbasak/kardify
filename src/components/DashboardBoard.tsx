"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { List } from "@/types";
import Header from "./Header";
import Column from "./Column";
import AddColumn from "./AddColumn";
import { useWebSocket } from "@/hooks/useWebSocket";

interface DashboardBoardProps {
  initialLists: List[];
  userEmail: string;
}

export default function DashboardBoard({
  initialLists,
  userEmail,
}: DashboardBoardProps) {
  const router = useRouter();
  const [lists, setLists] = useState<List[]>(initialLists);
  const [draggedCard, setDraggedCard] = useState<{ cardId: string; colId: string } | null>(null);

  // Connect to the WebSocket server and listen for changes from other users
  const { isConnected, sendMessage } = useWebSocket((message) => {
    const { action, payload } = message;

    if (action === "ADD_LIST") {
      setLists((prev) => [...prev, payload.list]);
    } else if (action === "EDIT_LIST") {
      setLists((prev) =>
        prev.map((list) =>
          list.id === payload.id ? { ...list, title: payload.title } : list
        )
      );
    } else if (action === "DELETE_LIST") {
      setLists((prev) => prev.filter((list) => list.id !== payload.id));
    } else if (action === "ADD_CARD") {
      setLists((prev) =>
        prev.map((list) =>
          list.id === payload.listId
            ? { ...list, cards: [...list.cards, payload.card] }
            : list
        )
      );
    } else if (action === "EDIT_CARD") {
      setLists((prev) =>
        prev.map((list) => ({
          ...list,
          cards: list.cards.map((c) =>
            c.id === payload.id ? { ...c, title: payload.title } : c
          ),
        }))
      );
    } else if (action === "DELETE_CARD") {
      setLists((prev) =>
        prev.map((list) =>
          list.id === payload.listId
            ? { ...list, cards: list.cards.filter((c) => c.id !== payload.cardId) }
            : list
        )
      );
    } else if (action === "MOVE_CARD") {
      setLists((prev) => {
        const sourceList = prev.find((l) => l.id === payload.sourceListId);
        const targetList = prev.find((l) => l.id === payload.targetListId);
        if (!sourceList || !targetList) return prev;

        const cardToMove = sourceList.cards.find((c) => c.id === payload.cardId);
        if (!cardToMove) return prev;

        const updatedCard = { ...cardToMove, list_id: payload.targetListId };

        return prev.map((list) => {
          if (list.id === payload.sourceListId) {
            return {
              ...list,
              cards: list.cards.filter((c) => c.id !== payload.cardId),
            };
          }
          if (list.id === payload.targetListId) {
            return {
              ...list,
              cards: [...list.cards, updatedCard],
            };
          }
          return list;
        });
      });
    }
  });

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  async function handleAddList(title: string) {
    try {
      const res = await fetch("/api/lists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });

      const data = await res.json();
      if (res.ok && data.list) {
        setLists((prev) => [...prev, data.list]);
        // Notify other users via WebSocket
        sendMessage("ADD_LIST", { list: data.list });
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleEditList(listId: string, title: string) {
    try {
      const res = await fetch("/api/lists", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: listId, title }),
      });

      if (res.ok) {
        setLists((prev) =>
          prev.map((list) =>
            list.id === listId ? { ...list, title } : list
          )
        );
        // Notify other users via WebSocket
        sendMessage("EDIT_LIST", { id: listId, title });
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDeleteList(listId: string) {
    try {
      const res = await fetch(`/api/lists?id=${listId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setLists((prev) => prev.filter((list) => list.id !== listId));
        // Notify other users via WebSocket
        sendMessage("DELETE_LIST", { id: listId });
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleAddCard(listId: string, title: string) {
    try {
      const res = await fetch("/api/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ list_id: listId, title }),
      });

      const data = await res.json();
      if (res.ok && data.card) {
        setLists((prev) =>
          prev.map((list) => {
            if (list.id === listId) {
              return {
                ...list,
                cards: [...list.cards, data.card],
              };
            }
            return list;
          })
        );
        // Notify other users via WebSocket
        sendMessage("ADD_CARD", { listId, card: data.card });
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleEditCard(cardId: string, title: string) {
    try {
      const res = await fetch("/api/cards", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: cardId, title }),
      });

      if (res.ok) {
        setLists((prev) =>
          prev.map((list) => ({
            ...list,
            cards: list.cards.map((c) =>
              c.id === cardId ? { ...c, title } : c
            ),
          }))
        );
        // Notify other users via WebSocket
        sendMessage("EDIT_CARD", { id: cardId, title });
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDeleteCard(listId: string, cardId: string) {
    try {
      const res = await fetch(`/api/cards?id=${cardId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setLists((prev) =>
          prev.map((list) => {
            if (list.id === listId) {
              return {
                ...list,
                cards: list.cards.filter((c) => c.id !== cardId),
              };
            }
            return list;
          })
        );
        // Notify other users via WebSocket
        sendMessage("DELETE_CARD", { listId, cardId });
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleMoveCard(
    cardId: string,
    sourceListId: string,
    direction: "left" | "right"
  ) {
    const sourceIndex = lists.findIndex((l) => l.id === sourceListId);
    const targetIndex = direction === "left" ? sourceIndex - 1 : sourceIndex + 1;

    if (targetIndex < 0 || targetIndex >= lists.length) return;

    const sourceList = lists[sourceIndex];
    const targetList = lists[targetIndex];
    const cardToMove = sourceList.cards.find((c) => c.id === cardId);

    if (!cardToMove) return;

    const updatedCard = { ...cardToMove, list_id: targetList.id };

    setLists((prev) =>
      prev.map((list) => {
        if (list.id === sourceList.id) {
          return {
            ...list,
            cards: list.cards.filter((c) => c.id !== cardId),
          };
        }
        if (list.id === targetList.id) {
          return {
            ...list,
            cards: [...list.cards, updatedCard],
          };
        }
        return list;
      })
    );

    // Notify other users via WebSocket
    sendMessage("MOVE_CARD", {
      cardId,
      sourceListId: sourceList.id,
      targetListId: targetList.id,
    });

    try {
      await fetch("/api/cards", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: cardId, list_id: targetList.id }),
      });
    } catch (err) {
      console.error(err);
    }
  }

  function handleDragStart(cardId: string, colId: string) {
    setDraggedCard({ cardId, colId });
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
  }

  async function handleDrop(targetListId: string) {
    if (!draggedCard) return;

    const { cardId, colId: sourceListId } = draggedCard;
    if (sourceListId === targetListId) {
      setDraggedCard(null);
      return;
    }

    const sourceList = lists.find((l) => l.id === sourceListId);
    const targetList = lists.find((l) => l.id === targetListId);
    if (!sourceList || !targetList) {
      setDraggedCard(null);
      return;
    }

    const cardToMove = sourceList.cards.find((c) => c.id === cardId);
    if (!cardToMove) {
      setDraggedCard(null);
      return;
    }

    const updatedCard = { ...cardToMove, list_id: targetListId };

    setLists((prev) =>
      prev.map((list) => {
        if (list.id === sourceListId) {
          return {
            ...list,
            cards: list.cards.filter((c) => c.id !== cardId),
          };
        }
        if (list.id === targetListId) {
          return {
            ...list,
            cards: [...list.cards, updatedCard],
          };
        }
        return list;
      })
    );

    setDraggedCard(null);

    // Notify other users via WebSocket
    sendMessage("MOVE_CARD", {
      cardId,
      sourceListId,
      targetListId,
    });

    try {
      await fetch("/api/cards", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: cardId, list_id: targetListId }),
      });
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-700 via-indigo-800 to-slate-900 text-slate-800">
      <Header
        userEmail={userEmail}
        onOpenLogin={() => {}}
        onLogout={handleLogout}
        showHomeLink={true}
      />

      {/* Real-time connection badge */}
      <div className="px-6 pt-3 flex items-center gap-2">
        <span
          className={`inline-block w-2.5 h-2.5 rounded-full ${
            isConnected ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" : "bg-amber-400"
          }`}
        />
        <span className="text-xs font-medium text-white/80">
          {isConnected ? "Live Sync Active" : "Connecting to Live Sync..."}
        </span>
      </div>

      <main className="flex-1 p-6 overflow-x-auto flex items-start gap-5">
        {lists.map((list, colIndex) => (
          <Column
            key={list.id}
            column={list}
            columnIndex={colIndex}
            totalColumns={lists.length}
            onDeleteColumn={handleDeleteList}
            onEditColumn={handleEditList}
            onAddCard={handleAddCard}
            onDeleteCard={handleDeleteCard}
            onEditCard={handleEditCard}
            onMoveCard={handleMoveCard}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          />
        ))}

        <AddColumn onAddColumn={handleAddList} />
      </main>
    </div>
  );
}
