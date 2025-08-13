"use client"

import { useState } from "react"
import { FormBuilder } from "@/components/form-builder"
import type { Question } from "@/lib/types"

export default function BuilderPage() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    questions: [] as Question[],
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <FormBuilder initialData={formData} onSave={setFormData} isEditing={false} />
    </div>
  )
}
