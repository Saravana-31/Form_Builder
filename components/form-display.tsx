"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, FileText } from "lucide-react"
import { QuestionRenderer } from "@/components/question-renderer"
import type { Form } from "@/lib/types"

interface FormDisplayProps {
  form: Form
}

export function FormDisplay({ form }: FormDisplayProps) {
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [startTime] = useState(new Date())

  const handleAnswerChange = (questionId: string, answer: any) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }))
  }

  const calculateScore = () => {
    let totalScore = 0
    let maxScore = 0

    form.questions.forEach((question) => {
      maxScore += question.points
      const userAnswer = answers[question.id]

      if (!userAnswer) return

      if (question.type === "comprehension") {
        if (userAnswer === question.correctAnswer) {
          totalScore += question.points
        }
      } else if (question.type === "cloze") {
        const correctAnswers = question.correctAnswer as string[]
        const userAnswers = userAnswer as string[]
        let correctCount = 0

        correctAnswers.forEach((correct, index) => {
          if (userAnswers[index]?.toLowerCase().trim() === correct.toLowerCase().trim()) {
            correctCount++
          }
        })

        totalScore += (correctCount / correctAnswers.length) * question.points
      } else if (question.type === "categorize") {
        // For categorize questions, we'd need to define correct categorization
        // For now, award full points if any categorization is made
        const hasAnswers = Object.values(userAnswer as Record<string, string[]>).some((items) => items.length > 0)
        if (hasAnswers) {
          totalScore += question.points
        }
      }
    })

    return { totalScore: Math.round(totalScore), maxScore }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)

    try {
      const endTime = new Date()
      const timeSpent = Math.round((endTime.getTime() - startTime.getTime()) / 1000) // seconds

      const { totalScore, maxScore } = calculateScore()

      const submissionData = {
        form_id: form.id,
        answers: {
          responses: answers,
          score: totalScore,
          maxScore,
          timeSpent,
          submittedAt: endTime.toISOString(),
        },
      }

      const response = await fetch("/api/responses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submissionData),
      })

      if (response.ok) {
        setIsSubmitted(true)
      } else {
        alert("Error submitting form. Please try again.")
      }
    } catch (error) {
      console.error("Error submitting form:", error)
      alert("Error submitting form. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const answeredQuestions = Object.keys(answers).length
  const totalQuestions = form.questions.length
  const completionPercentage = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0

  if (isSubmitted) {
    const { totalScore, maxScore } = calculateScore()
    const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0

    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Form Submitted Successfully!</CardTitle>
            <CardDescription>Thank you for completing the form</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-600">{totalScore}</div>
                <div className="text-sm text-gray-600">Points Earned</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-600">{percentage}%</div>
                <div className="text-sm text-gray-600">Score</div>
              </div>
            </div>
            <p className="text-gray-600">
              You scored {totalScore} out of {maxScore} points ({percentage}%)
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Form Header */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl mb-2">{form.title}</CardTitle>
              <CardDescription className="text-base">{form.description}</CardDescription>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline">
                <FileText className="h-4 w-4 mr-1" />
                {totalQuestions} Questions
              </Badge>
              <Badge variant="outline">
                <Clock className="h-4 w-4 mr-1" />
                {form.questions.reduce((sum, q) => sum + q.points, 0)} Points
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Progress Bar */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progress</span>
            <span className="text-sm text-gray-600">
              {answeredQuestions} of {totalQuestions} questions
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Questions */}
      <div className="space-y-6">
        {form.questions.map((question, index) => (
          <QuestionRenderer
            key={question.id}
            question={question}
            questionNumber={index + 1}
            answer={answers[question.id]}
            onAnswerChange={(answer) => handleAnswerChange(question.id, answer)}
          />
        ))}
      </div>

      {/* Submit Button */}
      <Card className="mt-8">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {answeredQuestions === totalQuestions
                ? "All questions answered. Ready to submit!"
                : `${totalQuestions - answeredQuestions} questions remaining`}
            </div>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || answeredQuestions === 0}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? "Submitting..." : "Submit Form"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
