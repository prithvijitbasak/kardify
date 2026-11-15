import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { getDatabase } from "@/lib/mongodb";

export async function GET() {
  const user = await getAuthUser();

  if (!user) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const db = await getDatabase();
    const listsCollection = db.collection("lists");
    const cardsCollection = db.collection("cards");

    let allLists = await listsCollection
      .find({})
      .sort({ position: 1 })
      .toArray();

    if (allLists.length === 0) {
      const defaultListTitles = ["To Do", "In Progress", "Done"];
      const now = Date.now().toString();

      for (let i = 0; i < defaultListTitles.length; i++) {
        const insertListResult = await listsCollection.insertOne({
          title: defaultListTitles[i],
          position: i,
          created_at: now,
          updated_at: now,
        });

        const listId = insertListResult.insertedId.toString();

        if (i === 0) {
          await cardsCollection.insertOne({
            list_id: listId,
            title: "Welcome to your Kardify board!",
            position: 0,
            created_at: now,
            updated_at: now,
          });
          await cardsCollection.insertOne({
            list_id: listId,
            title: "Add your own lists and cards",
            position: 1,
            created_at: now,
            updated_at: now,
          });
        } else if (i === 1) {
          await cardsCollection.insertOne({
            list_id: listId,
            title: "Drag and drop cards across lists",
            position: 0,
            created_at: now,
            updated_at: now,
          });
        }
      }

      allLists = await listsCollection
        .find({})
        .sort({ position: 1 })
        .toArray();
    }

    const listIds = allLists.map((l) => l._id.toString());
    const allCards = await cardsCollection
      .find({ list_id: { $in: listIds } })
      .sort({ position: 1 })
      .toArray();

    const formattedLists = allLists.map((list) => {
      const listIdStr = list._id.toString();
      const matchingCards = allCards
        .filter((card) => card.list_id === listIdStr)
        .map((card) => ({
          id: card._id.toString(),
          list_id: card.list_id,
          title: card.title,
          created_at: card.created_at,
          updated_at: card.updated_at,
        }));

      return {
        id: listIdStr,
        title: list.title,
        cards: matchingCards,
        created_at: list.created_at,
        updated_at: list.updated_at,
      };
    });

    return NextResponse.json({
      user: { email: user.email },
      lists: formattedLists,
    });
  } catch (error) {
    console.error("Dashboard SSR error:", error);
    return NextResponse.json(
      { message: "Failed to load dashboard data" },
      { status: 500 }
    );
  }
}
