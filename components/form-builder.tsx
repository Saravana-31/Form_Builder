"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Save, Eye, Plus, GripVertical } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { Question } from "@/lib/types"
import { QuestionEditor } from "@/components/question-editor"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

interface FormBuilderProps {
  initialData: {
    title: string
    description: string
    questions: Question[]
  }
  formId?: string
  isEditing: boolean
  onSave?: (data: any) => void
}

function SortableQuestionCard({
  question,
  index,
  isSelected,
  onClick,
}: {
  question: Question
  index: number
  isSelected: boolean
  onClick: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: question.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
        isSelected ? "ring-2 ring-blue-500 shadow-lg" : ""
      } ${isDragging ? "shadow-xl scale-105 z-50" : ""}`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-gray-100 transition-colors"
            title="Drag to reorder"
          >
            <GripVertical className="h-4 w-4 text-gray-400" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="text-xs">
                {question.type}
              </Badge>
              <span className="text-xs text-gray-500">{question.points}pt</span>
            </div>
            <p className="text-sm font-medium truncate text-gray-900">{question.question || "Untitled Question"}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function FormBuilder({ initialData, formId, isEditing, onSave }: FormBuilderProps) {
  const router = useRouter()
  const [formData, setFormData] = useState(initialData)
  const [isSaving, setIsSaving] = useState(false)
  const [selectedQuestion, setSelectedQuestion] = useState<number | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )
const handleSave = async () => {
  if (!formData.title.trim()) {
    alert("Please enter a form title");
    return;
  }

  setIsSaving(true);
  try {
    const url = isEditing ? `/api/forms/${formId}` : "/api/forms";
    const method = isEditing ? "PUT" : "POST";

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      console.error("API error:", response.status, response.statusText);
      alert("Error saving form");
      return;
    }

    const data = await response.json();
    console.log("RAW API response JSON:", data);

    const id =
      data.id ||
      data._id ||
      (data.form && (data.form.id || data.form._id));

    if (!id) {
      console.error("MISSING ID in API response!!!");
      alert("Form saved but no ID returned!\n" + JSON.stringify(data, null, 2));
      return;
    }

    if (onSave) onSave(formData);

    console.log("Redirecting to:", `/builder/${id}`);
    if (!isEditing) {
      router.push(`/builder/${id}`);
    } else {
      alert("Form saved successfully!");
    }
  } catch (error) {
    console.error("Error saving form:", error);
    alert("Error saving form");
  } finally {
    setIsSaving(false);
  }
};

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = formData.questions.findIndex((q) => q.id === active.id)
      const newIndex = formData.questions.findIndex((q) => q.id === over.id)

      const newQuestions = arrayMove(formData.questions, oldIndex, newIndex)
      setFormData({ ...formData, questions: newQuestions })

      // Update selected question index if needed
      if (selectedQuestion === oldIndex) {
        setSelectedQuestion(newIndex)
      } else if (selectedQuestion !== null) {
        if (oldIndex < selectedQuestion && newIndex >= selectedQuestion) {
          setSelectedQuestion(selectedQuestion - 1)
        } else if (oldIndex > selectedQuestion && newIndex <= selectedQuestion) {
          setSelectedQuestion(selectedQuestion + 1)
        }
      }
    }
  }

  const addQuestion = (type: Question["type"]) => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      type,
      question: "",
      points: 1,
    }

    if (type === "categorize") {
      newQuestion.categories = ["Category 1", "Category 2"]
      newQuestion.items = ["Item 1", "Item 2"]
    } else if (type === "cloze") {
      newQuestion.correctAnswer = [""]
    } else if (type === "comprehension") {
      newQuestion.options = ["Option 1", "Option 2", "Option 3", "Option 4"]
      newQuestion.correctAnswer = ""
    }

    setFormData({
      ...formData,
      questions: [...formData.questions, newQuestion],
    })
    setSelectedQuestion(formData.questions.length)
  }

  const updateQuestion = (index: number, updatedQuestion: Question) => {
    const newQuestions = [...formData.questions]
    newQuestions[index] = updatedQuestion
    setFormData({ ...formData, questions: newQuestions })
  }

  const deleteQuestion = (index: number) => {
    const newQuestions = formData.questions.filter((_, i) => i !== index)
    setFormData({ ...formData, questions: newQuestions })
    setSelectedQuestion(null)
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-40 px-6 py-3">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-xl font-semibold text-gray-900">Form Builder</h1>
            <Badge variant="outline" className="text-xs">
              {formData.questions.length} questions
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={handleSave} disabled={isSaving} size="sm">
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Saving..." : "Save"}
            </Button>
            {isEditing && (
              <Link href={`/form/${formId}`}>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="flex w-full pt-16">
        {/* Left Sidebar - Enhanced Design */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col shadow-sm">
          <div className="p-6 border-b border-gray-100">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Form Title</label>
                <Input
                  placeholder="Enter form title..."
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="font-medium text-lg"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Description</label>
                <Textarea
                  placeholder="Describe your form..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="resize-none"
                />
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Add Questions</h3>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addQuestion("categorize")}
                  className="w-full justify-start hover:bg-blue-50 hover:border-blue-200"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Categorize (Drag & Drop)
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addQuestion("cloze")}
                  className="w-full justify-start hover:bg-green-50 hover:border-green-200"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Cloze (Fill in Blanks)
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addQuestion("comprehension")}
                  className="w-full justify-start hover:bg-purple-50 hover:border-purple-200"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Multiple Choice
                </Button>
              </div>
            </div>

            <div className="p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Questions ({formData.questions.length})</h3>

              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={formData.questions.map((q) => q.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-3">
                    {formData.questions.map((question, index) => (
                      <SortableQuestionCard
                        key={question.id}
                        question={question}
                        index={index}
                        isSelected={selectedQuestion === index}
                        onClick={() => setSelectedQuestion(index)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>

              {formData.questions.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm">No questions yet</p>
                  <p className="text-xs mt-1">Add your first question above</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content - Enhanced Question Editor */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          {selectedQuestion !== null && formData.questions[selectedQuestion] ? (
            <QuestionEditor
              question={formData.questions[selectedQuestion]}
              onUpdate={(updatedQuestion) => updateQuestion(selectedQuestion, updatedQuestion)}
              onDelete={() => deleteQuestion(selectedQuestion)}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-md">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to build your form?</h3>
                <p className="text-gray-600 mb-4">
                  Select a question from the sidebar to edit it, or add a new question to get started.
                </p>
                <div className="flex gap-2 justify-center">
                  <Button size="sm" onClick={() => addQuestion("comprehension")}>
                    Add Question
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
