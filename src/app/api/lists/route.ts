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
    const title = body.title?.trim();

    if (!title) {
      return NextResponse.json(
        { message: "List title is required" },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const listsCollection = db.collection("lists");
    const count = await listsCollection.countDocuments({});

    const now = Date.now().toString();
    const result = await listsCollection.insertOne({
      title: title,
      position: count,
      created_at: now,
      updated_at: now,
    });

    return NextResponse.json({
      success: true,
      list: {
        id: result.insertedId.toString(),
        title: title,
        cards: [],
      },
    });
  } catch (error) {
    console.error("Add list error:", error);
    return NextResponse.json(
      { message: "Failed to create list" },
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
    const { id, title } = body;

    if (!id || !title?.trim()) {
      return NextResponse.json(
        { message: "List id and title are required" },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const listsCollection = db.collection("lists");

    await listsCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          title: title.trim(),
          updated_at: Date.now().toString(),
        },
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Edit list error:", error);
    return NextResponse.json(
      { message: "Failed to update list" },
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
        { message: "List id is required" },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const listsCollection = db.collection("lists");
    const cardsCollection = db.collection("cards");

    await listsCollection.deleteOne({
      _id: new ObjectId(id),
    });

    await cardsCollection.deleteMany({
      list_id: id,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete list error:", error);
    return NextResponse.json(
      { message: "Failed to delete list" },
      { status: 500 }
    );
  }
}
