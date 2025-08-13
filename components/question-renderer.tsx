"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import type { Question, CategorizeQuestion, ClozeQuestion, ComprehensionQuestion } from "@/lib/types"

interface QuestionRendererProps {
  question: Question
  questionNumber: number
  answer?: any
  onAnswerChange: (answer: any) => void
  isPreview?: boolean
}

export function QuestionRenderer({
  question,
  questionNumber,
  answer,
  onAnswerChange,
  isPreview = false,
}: QuestionRendererProps) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">
            Question {questionNumber}: {question.question}
          </CardTitle>
          <div className="flex gap-2">
            <Badge variant="secondary">{question.type}</Badge>
            <Badge variant="outline">{question.points} pts</Badge>
          </div>
        </div>
        {question.image && (
          <div className="mt-4">
            <img
              src={question.image || "/placeholder.svg"}
              alt="Question"
              className="max-w-full max-h-64 rounded-lg border"
            />
          </div>
        )}
      </CardHeader>
      <CardContent>
        {question.type === "categorize" && (
          <CategorizeRenderer
            question={question as CategorizeQuestion}
            answer={answer}
            onAnswerChange={onAnswerChange}
            isPreview={isPreview}
          />
        )}
        {question.type === "cloze" && (
          <ClozeRenderer
            question={question as ClozeQuestion}
            answer={answer}
            onAnswerChange={onAnswerChange}
            isPreview={isPreview}
          />
        )}
        {question.type === "comprehension" && (
          <ComprehensionRenderer
            question={question as ComprehensionQuestion}
            answer={answer}
            onAnswerChange={onAnswerChange}
            isPreview={isPreview}
          />
        )}
      </CardContent>
    </Card>
  )
}

function CategorizeRenderer({
  question,
  answer,
  onAnswerChange,
  isPreview,
}: {
  question: CategorizeQuestion
  answer?: Record<string, string[]>
  onAnswerChange: (answer: Record<string, string[]>) => void
  isPreview?: boolean
}) {
  const [draggedItem, setDraggedItem] = useState<string | null>(null)
  const [currentAnswer, setCurrentAnswer] = useState<Record<string, string[]>>(
    answer || question.categories?.reduce((acc, cat) => ({ ...acc, [cat]: [] }), {}) || {},
  )

  const handleDragStart = (item: string) => {
    setDraggedItem(item)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (category: string) => {
    if (!draggedItem) return

    const newAnswer = { ...currentAnswer }

    // Remove item from all categories
    Object.keys(newAnswer).forEach((cat) => {
      newAnswer[cat] = newAnswer[cat].filter((item) => item !== draggedItem)
    })

    // Add item to target category
    if (!newAnswer[category]) newAnswer[category] = []
    newAnswer[category].push(draggedItem)

    setCurrentAnswer(newAnswer)
    onAnswerChange(newAnswer)
    setDraggedItem(null)
  }

  const unassignedItems =
    question.items?.filter(
      (item) => !Object.values(currentAnswer).some((categoryItems) => categoryItems.includes(item)),
    ) || []

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {question.categories?.map((category) => (
          <div
            key={category}
            className="border-2 border-dashed border-gray-300 rounded-lg p-4 min-h-32"
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(category)}
          >
            <h4 className="font-medium mb-2">{category}</h4>
            <div className="space-y-2">
              {currentAnswer[category]?.map((item) => (
                <div
                  key={item}
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm cursor-move"
                  draggable
                  onDragStart={() => handleDragStart(item)}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div>
        <h4 className="font-medium mb-2">Items to Categorize:</h4>
        <div className="flex flex-wrap gap-2">
          {unassignedItems.map((item) => (
            <div
              key={item}
              className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm cursor-move hover:bg-gray-200"
              draggable
              onDragStart={() => handleDragStart(item)}
            >
              {item}
            </div>
          ))}
        </div>
      </div>

      {isPreview && (
        <div className="text-sm text-gray-600 mt-4">
          <strong>Preview Mode:</strong> Drag items from the bottom to the appropriate categories above.
        </div>
      )}
    </div>
  )
}

function ClozeRenderer({
  question,
  answer,
  onAnswerChange,
  isPreview,
}: {
  question: ClozeQuestion
  answer?: string[]
  onAnswerChange: (answer: string[]) => void
  isPreview?: boolean
}) {
  const [currentAnswer, setCurrentAnswer] = useState<string[]>(answer || [])

  const questionParts = question.question.split("_____")
  const blanksCount = questionParts.length - 1

  const handleInputChange = (index: number, value: string) => {
    const newAnswer = [...currentAnswer]
    newAnswer[index] = value
    setCurrentAnswer(newAnswer)
    onAnswerChange(newAnswer)
  }

  return (
    <div className="space-y-4">
      <div className="text-lg leading-relaxed">
        {questionParts.map((part, index) => (
          <span key={index}>
            {part}
            {index < blanksCount && (
              <Input
                className="inline-block w-32 mx-2"
                value={currentAnswer[index] || ""}
                onChange={(e) => handleInputChange(index, e.target.value)}
                placeholder={`Blank ${index + 1}`}
              />
            )}
          </span>
        ))}
      </div>

      {isPreview && (
        <div className="text-sm text-gray-600 mt-4">
          <strong>Preview Mode:</strong> Fill in the blanks with appropriate words or phrases.
        </div>
      )}
    </div>
  )
}

function ComprehensionRenderer({
  question,
  answer,
  onAnswerChange,
  isPreview,
}: {
  question: ComprehensionQuestion
  answer?: string
  onAnswerChange: (answer: string) => void
  isPreview?: boolean
}) {
  const [currentAnswer, setCurrentAnswer] = useState<string>(answer || "")

  const handleOptionSelect = (option: string) => {
    setCurrentAnswer(option)
    onAnswerChange(option)
  }

  return (
    <div className="space-y-3">
      {question.options?.map((option, index) => (
        <label key={index} className="flex items-center space-x-3 cursor-pointer">
          <input
            type="radio"
            name={`question-${question.id}`}
            value={option}
            checked={currentAnswer === option}
            onChange={() => handleOptionSelect(option)}
            className="w-4 h-4 text-blue-600"
          />
          <span className="text-sm">{option}</span>
        </label>
      ))}

      {isPreview && (
        <div className="text-sm text-gray-600 mt-4">
          <strong>Preview Mode:</strong> Select the best answer from the options above.
        </div>
      )}
    </div>
  )
}
