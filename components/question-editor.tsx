"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trash2, Plus, X, GripVertical } from "lucide-react"
import { ImageUpload } from "@/components/image-upload"
import type { Question, CategorizeQuestion, ClozeQuestion, ComprehensionQuestion } from "@/lib/types"
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

interface QuestionEditorProps {
  question: Question
  onUpdate: (question: Question) => void
  onDelete: () => void
}

function SortableItem({
  id,
  value,
  placeholder,
  onChange,
  onRemove,
}: {
  id: string
  value: string
  placeholder: string
  onChange: (value: string) => void
  onRemove: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex gap-2 items-center p-3 bg-white rounded-lg border transition-all ${
        isDragging ? "shadow-lg scale-105 z-50" : "hover:shadow-sm"
      }`}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-gray-100 transition-colors"
        title="Drag to reorder"
      >
        <GripVertical className="h-4 w-4 text-gray-400" />
      </div>
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="flex-1" />
      <Button
        variant="outline"
        size="sm"
        onClick={onRemove}
        className="hover:bg-red-50 hover:border-red-200 bg-transparent"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
}

export function QuestionEditor({ question, onUpdate, onDelete }: QuestionEditorProps) {
  const updateBasicInfo = (field: keyof Question, value: any) => {
    onUpdate({ ...question, [field]: value })
  }

  const handleImageChange = (url: string) => {
    onUpdate({ ...question, image: url })
  }

  const handleImageRemove = () => {
    onUpdate({ ...question, image: undefined })
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <Card className="shadow-lg border-0 bg-white">
        <CardHeader className="border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CardTitle className="text-xl font-semibold text-gray-900">Edit Question</CardTitle>
              <Badge variant="secondary" className="px-3 py-1">
                {question.type}
              </Badge>
            </div>
            <Button variant="destructive" size="sm" onClick={onDelete} className="hover:bg-red-600">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Question
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-8 space-y-8">
          <div className="space-y-6">
            <div>
              <Label htmlFor="question" className="text-sm font-semibold text-gray-900 mb-2 block">
                Question Text
              </Label>
              <Textarea
                id="question"
                placeholder="Enter your question here..."
                value={question.question}
                onChange={(e) => updateBasicInfo("question", e.target.value)}
                rows={4}
                className="text-lg font-medium resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <Label htmlFor="points" className="text-sm font-semibold text-gray-900 mb-2 block">
                  Points
                </Label>
                <Input
                  id="points"
                  type="number"
                  min="1"
                  value={question.points}
                  onChange={(e) => updateBasicInfo("points", Number.parseInt(e.target.value) || 1)}
                  className="text-lg"
                />
              </div>
            </div>

            <div>
              <Label className="text-sm font-semibold text-gray-900 mb-2 block">Question Image (Optional)</Label>
              <div className="mt-2">
                <ImageUpload value={question.image} onChange={handleImageChange} onRemove={handleImageRemove} />
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-8">
            {question.type === "categorize" && (
              <CategorizeEditor question={question as CategorizeQuestion} onUpdate={onUpdate} />
            )}
            {question.type === "cloze" && <ClozeEditor question={question as ClozeQuestion} onUpdate={onUpdate} />}
            {question.type === "comprehension" && (
              <ComprehensionEditor question={question as ComprehensionQuestion} onUpdate={onUpdate} />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function CategorizeEditor({
  question,
  onUpdate,
}: {
  question: CategorizeQuestion
  onUpdate: (question: Question) => void
}) {
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

  const addCategory = () => {
    const newCategories = [...(question.categories || []), `Category ${question.categories?.length + 1 || 1}`]
    onUpdate({ ...question, categories: newCategories })
  }

  const updateCategory = (index: number, value: string) => {
    const newCategories = [...(question.categories || [])]
    newCategories[index] = value
    onUpdate({ ...question, categories: newCategories })
  }

  const removeCategory = (index: number) => {
    const newCategories = question.categories?.filter((_, i) => i !== index) || []
    onUpdate({ ...question, categories: newCategories })
  }

  const handleCategoryDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = question.categories?.findIndex((_, i) => `category-${i}` === active.id) ?? -1
      const newIndex = question.categories?.findIndex((_, i) => `category-${i}` === over.id) ?? -1

      if (oldIndex !== -1 && newIndex !== -1) {
        const newCategories = arrayMove(question.categories || [], oldIndex, newIndex)
        onUpdate({ ...question, categories: newCategories })
      }
    }
  }

  const addItem = () => {
    const newItems = [...(question.items || []), `Item ${question.items?.length + 1 || 1}`]
    onUpdate({ ...question, items: newItems })
  }

  const updateItem = (index: number, value: string) => {
    const newItems = [...(question.items || [])]
    newItems[index] = value
    onUpdate({ ...question, items: newItems })
  }

  const removeItem = (index: number) => {
    const newItems = question.items?.filter((_, i) => i !== index) || []
    onUpdate({ ...question, items: newItems })
  }

  const handleItemDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = question.items?.findIndex((_, i) => `item-${i}` === active.id) ?? -1
      const newIndex = question.items?.findIndex((_, i) => `item-${i}` === over.id) ?? -1

      if (oldIndex !== -1 && newIndex !== -1) {
        const newItems = arrayMove(question.items || [], oldIndex, newIndex)
        onUpdate({ ...question, items: newItems })
      }
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center justify-between mb-4">
          <Label className="text-lg font-semibold text-gray-900">Categories</Label>
          <Button variant="outline" size="sm" onClick={addCategory} className="hover:bg-blue-50 bg-transparent">
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </div>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleCategoryDragEnd}>
          <SortableContext
            items={question.categories?.map((_, i) => `category-${i}`) || []}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {question.categories?.map((category, index) => (
                <SortableItem
                  key={`category-${index}`}
                  id={`category-${index}`}
                  value={category}
                  placeholder={`Category ${index + 1}`}
                  onChange={(value) => updateCategory(index, value)}
                  onRemove={() => removeCategory(index)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <Label className="text-lg font-semibold text-gray-900">Items to Categorize</Label>
          <Button variant="outline" size="sm" onClick={addItem} className="hover:bg-green-50 bg-transparent">
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleItemDragEnd}>
          <SortableContext
            items={question.items?.map((_, i) => `item-${i}`) || []}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {question.items?.map((item, index) => (
                <SortableItem
                  key={`item-${index}`}
                  id={`item-${index}`}
                  value={item}
                  placeholder={`Item ${index + 1}`}
                  onChange={(value) => updateItem(index, value)}
                  onRemove={() => removeItem(index)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  )
}

function ClozeEditor({ question, onUpdate }: { question: ClozeQuestion; onUpdate: (question: Question) => void }) {
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

  const updateAnswer = (index: number, value: string) => {
    const newAnswers = [...(question.correctAnswer || [])]
    newAnswers[index] = value
    onUpdate({ ...question, correctAnswer: newAnswers })
  }

  const addBlank = () => {
    const newAnswers = [...(question.correctAnswer || []), ""]
    onUpdate({ ...question, correctAnswer: newAnswers })
  }

  const removeBlank = (index: number) => {
    const newAnswers = question.correctAnswer?.filter((_, i) => i !== index) || []
    onUpdate({ ...question, correctAnswer: newAnswers })
  }

  const handleAnswerDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = question.correctAnswer?.findIndex((_, i) => `answer-${i}` === active.id) ?? -1
      const newIndex = question.correctAnswer?.findIndex((_, i) => `answer-${i}` === over.id) ?? -1

      if (oldIndex !== -1 && newIndex !== -1) {
        const newAnswers = arrayMove(question.correctAnswer || [], oldIndex, newIndex)
        onUpdate({ ...question, correctAnswer: newAnswers })
      }
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-4">
          <Label className="text-lg font-semibold text-gray-900">Correct Answers for Blanks</Label>
          <Button variant="outline" size="sm" onClick={addBlank} className="hover:bg-green-50 bg-transparent">
            <Plus className="h-4 w-4 mr-2" />
            Add Blank
          </Button>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-blue-800">
            <strong>Tip:</strong> Use _____ (5 underscores) in your question text to create blanks. Add the correct
            answers below in the order they appear.
          </p>
        </div>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleAnswerDragEnd}>
          <SortableContext
            items={question.correctAnswer?.map((_, i) => `answer-${i}`) || []}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {question.correctAnswer?.map((answer, index) => (
                <SortableItem
                  key={`answer-${index}`}
                  id={`answer-${index}`}
                  value={answer}
                  placeholder={`Answer for blank ${index + 1}`}
                  onChange={(value) => updateAnswer(index, value)}
                  onRemove={() => removeBlank(index)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  )
}

function ComprehensionEditor({
  question,
  onUpdate,
}: {
  question: ComprehensionQuestion
  onUpdate: (question: Question) => void
}) {
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

  const updateOption = (index: number, value: string) => {
    const newOptions = [...(question.options || [])]
    newOptions[index] = value
    onUpdate({ ...question, options: newOptions })
  }

  const addOption = () => {
    const newOptions = [...(question.options || []), `Option ${question.options?.length + 1 || 1}`]
    onUpdate({ ...question, options: newOptions })
  }

  const removeOption = (index: number) => {
    const newOptions = question.options?.filter((_, i) => i !== index) || []
    onUpdate({ ...question, options: newOptions })
  }

  const handleOptionDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = question.options?.findIndex((_, i) => `option-${i}` === active.id) ?? -1
      const newIndex = question.options?.findIndex((_, i) => `option-${i}` === over.id) ?? -1

      if (oldIndex !== -1 && newIndex !== -1) {
        const newOptions = arrayMove(question.options || [], oldIndex, newIndex)
        onUpdate({ ...question, options: newOptions })
      }
    }
  }

  const setCorrectAnswer = (value: string) => {
    onUpdate({ ...question, correctAnswer: value })
  }

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center justify-between mb-4">
          <Label className="text-lg font-semibold text-gray-900">Answer Options</Label>
          <Button variant="outline" size="sm" onClick={addOption} className="hover:bg-purple-50 bg-transparent">
            <Plus className="h-4 w-4 mr-2" />
            Add Option
          </Button>
        </div>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleOptionDragEnd}>
          <SortableContext
            items={question.options?.map((_, i) => `option-${i}`) || []}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {question.options?.map((option, index) => (
                <SortableItem
                  key={`option-${index}`}
                  id={`option-${index}`}
                  value={option}
                  placeholder={`Option ${index + 1}`}
                  onChange={(value) => updateOption(index, value)}
                  onRemove={() => removeOption(index)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      <div>
        <Label className="text-lg font-semibold text-gray-900 mb-3 block">Correct Answer</Label>
        <div className="bg-white border border-gray-200 rounded-lg p-1">
          <select
            value={question.correctAnswer || ""}
            onChange={(e) => setCorrectAnswer(e.target.value)}
            className="w-full p-3 border-0 rounded-md text-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="">Select the correct answer...</option>
            {question.options?.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}
