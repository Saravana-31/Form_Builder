import clientPromise from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import type { Form } from "@/lib/types";

/**
 * GET - Get all forms
 */
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();

    const forms = await db.collection("forms").find({}).toArray();

    const result: Form[] = forms.map((doc: any) => ({
      id: doc.id || doc._id.toString(),
      title: doc.title,
      description: doc.description || "",
      questions: doc.questions || [],
      created_at: doc.created_at?.toString() || "",
      updated_at: doc.updated_at?.toString() || "",
    }));

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("GET /api/forms error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * POST - Create a new form
 */
export async function POST(req: NextRequest) {
  try {
    const { title, description, questions } = await req.json();

    if (!title || typeof title !== "string") {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const now = new Date().toISOString();

    // Insert into `forms` collection
    const result = await db.collection("forms").insertOne({
      title,
      description: description || "",
      questions: Array.isArray(questions) ? questions : [],
      created_at: now,
      updated_at: now,
    });

    // Create response object with top-level `id`
    const form: Form = {
      id: result.insertedId.toString(),
      title,
      description: description || "",
      questions: Array.isArray(questions) ? questions : [],
      created_at: now,
      updated_at: now,
    };

    return NextResponse.json(form, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/forms error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
