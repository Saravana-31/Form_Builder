import type { Form } from "@/lib/types";
import clientPromise from "@/lib/mongodb";
import { FormDisplay } from "@/components/form-display";
import { notFound } from "next/navigation";
import { ObjectId } from "mongodb";

interface FormPageProps {
  params: { id: string };
}

export default async function FormPage({ params }: FormPageProps) {
  const client = await clientPromise;
  const db = client.db();

  let mongoForm = await db.collection("forms").findOne({ id: params.id });
  if (!mongoForm) {
    try {
      mongoForm = await db.collection("forms").findOne({ _id: new ObjectId(params.id) });
    } catch {
      // ignore invalid ObjectId
    }
  }

  if (!mongoForm) {
    notFound();
    return null;
  }

  const form: Form = {
    id: mongoForm.id || mongoForm._id.toString(),
    title: mongoForm.title,
    description: mongoForm.description,
    questions: mongoForm.questions,
    created_at: mongoForm.created_at?.toString() || "",
    updated_at: mongoForm.updated_at?.toString() || "",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <FormDisplay form={form} />
    </div>
  );
}
