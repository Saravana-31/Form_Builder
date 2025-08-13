import clientPromise from "@/lib/mongodb";
import type { Form } from "@/lib/types";
import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";

/**
 * Helper: Find form by `id` or `_id`
 */
async function findForm(db: any, id: string) {
  let form = await db.collection("forms").findOne({ id });
  if (!form) {
    try {
      form = await db.collection("forms").findOne({ _id: new ObjectId(id) });
    } catch {
      // ignore invalid ObjectId
    }
  }
  return form;
}

/**
 * GET - Fetch one form
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const client = await clientPromise;
    const db = client.db();

    const doc = await findForm(db, params.id);

    if (!doc) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    const form: Form = {
      id: doc.id || doc._id.toString(),
      title: doc.title,
      description: doc.description || "",
      questions: doc.questions || [],
      created_at: doc.created_at?.toString() || "",
      updated_at: doc.updated_at?.toString() || "",
    };

    return NextResponse.json(form);
  } catch (err: any) {
    console.error("GET /api/forms/[id] error:", err);
    return NextResponse.json(
      { error: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * PUT - Update an existing form
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { title, description, questions } = await req.json();
    const updated_at = new Date().toISOString();

    const client = await clientPromise;
    const db = client.db();

    let result = await db.collection("forms").findOneAndUpdate(
      { id: params.id },
      { $set: { title, description, questions, updated_at } },
      { returnDocument: "after" }
    );

    if (!result.value) {
      try {
        result = await db.collection("forms").findOneAndUpdate(
          { _id: new ObjectId(params.id) },
          { $set: { title, description, questions, updated_at } },
          { returnDocument: "after" }
        );
      } catch {}
    }

    if (!result.value) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    const doc = result.value;
    const form: Form = {
      id: doc.id || doc._id.toString(),
      title: doc.title,
      description: doc.description || "",
      questions: doc.questions || [],
      created_at: doc.created_at?.toString() || "",
      updated_at: doc.updated_at?.toString() || "",
    };

    return NextResponse.json(form);
  } catch (err: any) {
    console.error("PUT /api/forms/[id] error:", err);
    return NextResponse.json(
      { error: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Remove a form
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const client = await clientPromise;
    const db = client.db();

    let result = await db.collection("forms").deleteOne({ id: params.id });

    if (result.deletedCount === 0) {
      try {
        result = await db
          .collection("forms")
          .deleteOne({ _id: new ObjectId(params.id) });
      } catch {}
    }

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Form deleted successfully" });
  } catch (err: any) {
    console.error("DELETE /api/forms/[id] error:", err);
    return NextResponse.json(
      { error: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
