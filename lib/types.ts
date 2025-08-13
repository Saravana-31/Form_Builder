export interface Question {
  id: string
  type: "categorize" | "cloze" | "comprehension"
  question: string
  image?: string
  options?: string[]
  categories?: string[]
  items?: string[]
  correctAnswer?: string | string[]
  points: number
}

export interface Form {
  id: string
  title: string
  description: string
  questions: Question[]
  created_at: string
  updated_at: string
}

export interface FormResponse {
  id: string
  form_id: string
  answers: Record<string, any>
  submitted_at: string
}

export interface CategorizeQuestion extends Question {
  type: "categorize"
  categories: string[]
  items: string[]
}

export interface ClozeQuestion extends Question {
  type: "cloze"
  correctAnswer: string[]
}

export interface ComprehensionQuestion extends Question {
  type: "comprehension"
  options: string[]
  correctAnswer: string
}
