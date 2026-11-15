import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getAuthUser } from "@/lib/auth";
import { getDatabase } from "@/lib/mongodb";

export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { list_id, title } = body;

    if (!list_id || !title?.trim()) {
      return NextResponse.json(
        { message: "List id and card title are required" },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const cardsCollection = db.collection("cards");
    const count = await cardsCollection.countDocuments({ list_id });

    const now = Date.now().toString();
    const result = await cardsCollection.insertOne({
      list_id: list_id,
      title: title.trim(),
      position: count,
      created_at: now,
      updated_at: now,
    });

    return NextResponse.json({
      success: true,
      card: {
        id: result.insertedId.toString(),
        list_id: list_id,
        title: title.trim(),
      },
    });
  } catch (error) {
    console.error("Add card error:", error);
    return NextResponse.json(
      { message: "Failed to create card" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, title, list_id } = body;

    if (!id) {
      return NextResponse.json(
        { message: "Card id is required" },
        { status: 400 }
      );
    }

    const updateFields: { [key: string]: unknown } = {
      updated_at: Date.now().toString(),
    };

    if (title !== undefined && title.trim()) {
      updateFields.title = title.trim();
    }

    if (list_id !== undefined) {
      updateFields.list_id = list_id;
    }

    const db = await getDatabase();
    const cardsCollection = db.collection("cards");

    await cardsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateFields }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Edit card error:", error);
    return NextResponse.json(
      { message: "Failed to update card" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { message: "Card id is required" },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const cardsCollection = db.collection("cards");

    await cardsCollection.deleteOne({
      _id: new ObjectId(id),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete card error:", error);
    return NextResponse.json(
      { message: "Failed to delete card" },
      { status: 500 }
    );
  }
}
