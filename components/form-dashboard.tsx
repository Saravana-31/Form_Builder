"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Eye, Trash2, Copy, Plus } from "lucide-react"
import Link from "next/link"
import type { Form } from "@/lib/types"

interface FormDashboardProps {
  forms: Form[]
}

export function FormDashboard({ forms }: FormDashboardProps) {
  const [formList, setFormList] = useState(forms)

  const handleDelete = async (formId: string) => {
    if (!confirm("Are you sure you want to delete this form?")) return

    try {
      const response = await fetch(`/api/forms/${formId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setFormList(formList.filter((form) => form.id !== formId))
      }
    } catch (error) {
      console.error("Error deleting form:", error)
    }
  }

  const handleDuplicate = async (form: Form) => {
    try {
      const response = await fetch("/api/forms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: `${form.title} (Copy)`,
          description: form.description,
          questions: form.questions,
        }),
      })

      if (response.ok) {
        const { form: newForm } = await response.json()
        setFormList([newForm, ...formList])
      }
    } catch (error) {
      console.error("Error duplicating form:", error)
    }
  }

  if (formList.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Plus className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No forms yet</h3>
          <p className="text-gray-600 mb-6">Get started by creating your first custom form</p>
          <Link href="/builder">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Form
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Your Forms</h2>
          <p className="text-gray-600">Manage and edit your custom forms. (Note: For Editing already created forms, click edit and make changes and during save Use a new form name.)</p>
        </div>
        <Badge variant="secondary">{formList.length} forms</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {formList.map((form) => (
          <Card key={form.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">{form.title}</CardTitle>
              <CardDescription className="line-clamp-2">{form.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <Badge variant="outline">{form.questions.length} questions</Badge>
                <span className="text-sm text-gray-500">{new Date(form.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex gap-2">
                <Link href={`/builder/${form.id}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full bg-transparent">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </Link>
                <Link href={`/form/${form.id}`}>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                </Link>
                <Button variant="outline" size="sm" onClick={() => handleDuplicate(form)}>
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(form.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
