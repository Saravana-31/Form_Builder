
import type { Form } from "@/lib/types";
import clientPromise from "@/lib/mongodb";
import { FormDashboard } from "@/components/form-dashboard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default async function HomePage() {
  const client = await clientPromise;
  const db = client.db();
  const mongoForms = await db.collection("forms").find({}).sort({ created_at: -1 }).toArray();
  const forms: Form[] = mongoForms.map((mongoForm: any) => ({
    id: mongoForm.id || mongoForm._id?.toString() || "",
    title: mongoForm.title,
    description: mongoForm.description,
    questions: mongoForm.questions,
    created_at: mongoForm.created_at?.toString() || "",
    updated_at: mongoForm.updated_at?.toString() || "",
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Form Builder</h1>
              <p className="text-sm text-gray-600">Create and manage custom forms</p>
            </div>
            <Link href="/builder">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Create New Form
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <FormDashboard forms={forms} />
      </main>
    </div>
  );
}
