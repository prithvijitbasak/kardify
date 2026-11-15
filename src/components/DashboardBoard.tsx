"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { List } from "@/types";
import Header from "./Header";
import Column from "./Column";
import AddColumn from "./AddColumn";

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
        setLists([...lists, data.list]);
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
        setLists(
          lists.map((list) =>
            list.id === listId ? { ...list, title } : list
          )
        );
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
        setLists(lists.filter((list) => list.id !== listId));
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
        setLists(
          lists.map((list) => {
            if (list.id === listId) {
              return {
                ...list,
                cards: [...list.cards, data.card],
              };
            }
            return list;
          })
        );
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
        setLists(
          lists.map((list) => ({
            ...list,
            cards: list.cards.map((c) =>
              c.id === cardId ? { ...c, title } : c
            ),
          }))
        );
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
        setLists(
          lists.map((list) => {
            if (list.id === listId) {
              return {
                ...list,
                cards: list.cards.filter((c) => c.id !== cardId),
              };
            }
            return list;
          })
        );
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

    setLists(
      lists.map((list) => {
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

    setLists(
      lists.map((list) => {
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
