
import clientPromise from "@/lib/mongodb";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { form_id, answers } = await request.json();
    const client = await clientPromise;
    const db = client.db();
    const responseDoc = {
      form_id,
      answers,
      submitted_at: new Date(),
    };
    const result = await db.collection("responses").insertOne(responseDoc);
    const response = await db.collection("responses").findOne({ _id: result.insertedId });
    return NextResponse.json({ response }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const formId = searchParams.get("form_id");
  try {
    const client = await clientPromise;
    const db = client.db();
    let query = formId ? { form_id: formId } : {};
    const responses = await db.collection("responses").find(query).sort({ submitted_at: -1 }).toArray();
    return NextResponse.json({ responses });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
