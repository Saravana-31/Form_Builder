"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Users, TrendingUp, Clock, Download, Eye } from "lucide-react"
import Link from "next/link"
import type { Form, FormResponse } from "@/lib/types"

interface FormResultsProps {
  form: Form
  responses: FormResponse[]
}

export function FormResults({ form, responses }: FormResultsProps) {
  const [selectedResponse, setSelectedResponse] = useState<FormResponse | null>(null)

  // Calculate statistics
  const totalResponses = responses.length
  const averageScore =
    totalResponses > 0
      ? responses.reduce((sum, response) => sum + (response.answers.score || 0), 0) / totalResponses
      : 0
  const averageTime =
    totalResponses > 0
      ? responses.reduce((sum, response) => sum + (response.answers.timeSpent || 0), 0) / totalResponses
      : 0

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  const exportResults = () => {
    const csvContent = [
      ["Submission Date", "Score", "Max Score", "Percentage", "Time Spent"],
      ...responses.map((response) => [
        new Date(response.submitted_at).toLocaleString(),
        response.answers.score || 0,
        response.answers.maxScore || 0,
        response.answers.maxScore > 0 ? Math.round((response.answers.score / response.answers.maxScore) * 100) : 0,
        formatTime(response.answers.timeSpent || 0),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${form.title}-results.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{form.title} - Results</h1>
            <p className="text-gray-600">{form.description}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/form/${form.id}`}>
            <Button variant="outline">
              <Eye className="h-4 w-4 mr-2" />
              View Form
            </Button>
          </Link>
          <Button onClick={exportResults} disabled={totalResponses === 0}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">{totalResponses}</p>
                <p className="text-gray-600">Total Responses</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">{Math.round(averageScore)}</p>
                <p className="text-gray-600">Average Score</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">{formatTime(Math.round(averageTime))}</p>
                <p className="text-gray-600">Average Time</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">
                  {responses.length > 0 && responses[0].answers.maxScore
                    ? Math.round((averageScore / responses[0].answers.maxScore) * 100)
                    : 0}
                  %
                </p>
                <p className="text-gray-600">Average %</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Results Content */}
      <Tabs defaultValue="responses" className="space-y-4">
        <TabsList>
          <TabsTrigger value="responses">Individual Responses</TabsTrigger>
          <TabsTrigger value="analytics">Question Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="responses" className="space-y-4">
          {totalResponses === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-gray-600">No responses yet. Share your form to start collecting responses!</p>
                <div className="mt-4">
                  <Link href={`/form/${form.id}`}>
                    <Button>View Form</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Response List */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Responses</CardTitle>
                  <CardDescription>Click on a response to view details</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {responses.map((response, index) => (
                      <div
                        key={response.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedResponse?.id === response.id ? "bg-blue-50 border-blue-200" : "hover:bg-gray-50"
                        }`}
                        onClick={() => setSelectedResponse(response)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Response #{index + 1}</p>
                            <p className="text-sm text-gray-600">{new Date(response.submitted_at).toLocaleString()}</p>
                          </div>
                          <div className="text-right">
                            <Badge variant="outline">
                              {response.answers.score || 0}/{response.answers.maxScore || 0}
                            </Badge>
                            <p className="text-sm text-gray-600 mt-1">{formatTime(response.answers.timeSpent || 0)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Response Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Response Details</CardTitle>
                  <CardDescription>
                    {selectedResponse ? "Detailed view of selected response" : "Select a response to view details"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedResponse ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-sm text-gray-600">Score</p>
                          <p className="text-lg font-bold">
                            {selectedResponse.answers.score || 0}/{selectedResponse.answers.maxScore || 0}
                          </p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-sm text-gray-600">Time Spent</p>
                          <p className="text-lg font-bold">{formatTime(selectedResponse.answers.timeSpent || 0)}</p>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Answers:</h4>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {Object.entries(selectedResponse.answers.responses || {}).map(([questionId, answer]) => {
                            const question = form.questions.find((q) => q.id === questionId)
                            return (
                              <div key={questionId} className="border rounded p-2">
                                <p className="text-sm font-medium">{question?.question || "Unknown Question"}</p>
                                <p className="text-sm text-gray-600 mt-1">
                                  {typeof answer === "object" ? JSON.stringify(answer) : String(answer)}
                                </p>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      <p>Select a response from the list to view details</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Question Performance</CardTitle>
              <CardDescription>Analysis of how respondents performed on each question</CardDescription>
            </CardHeader>
            <CardContent>
              {form.questions.map((question, index) => (
                <div key={question.id} className="border-b pb-4 mb-4 last:border-b-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium">
                        Question {index + 1}: {question.question}
                      </h4>
                      <Badge variant="secondary" className="mt-1">
                        {question.type}
                      </Badge>
                    </div>
                    <Badge variant="outline">{question.points} pts</Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    {totalResponses} responses • Average performance data would be calculated here
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
