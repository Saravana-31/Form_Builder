# Custom Form Builder Application

## 📌 Overview

This project is a custom **Form Builder** application built with the MERN stack (MongoDB, Express, React, Node.js) along with Tailwind CSS.  
It allows users to create, edit, save, preview, and fill forms dynamically with three unique types of questions: **Categorize, Cloze, and Comprehension**.

The app includes:

- A user-friendly **form editor** to design and customize forms with the ability to add header images and per-question images.
- A **preview/fill** feature where users can answer the created forms, with responses saved in the backend.
- Proper MongoDB schemas for forms and responses.
- An innovative UI inspired by popular form builders (like Typeform and Paperform), but with unique layouts and styling.
- Fully integrated backend using Next.js API routes and MongoDB.
- Responsive Tailwind CSS design for a sleek UX.

---

## ✨ Features

- **Add/Edit Forms:** Create and manage forms with rich question types.
- **Question Types:** Supports Categorize, Cloze, and Comprehension.
- **Image Upload:** Add header images and question-level images.
- **Preview & Fill:** Share form link for others to fill.
- **MongoDB Storage:** Secure, schema-driven storage.
- **Dynamic Routing:** Next.js App Router with robust ID handling.
- **Error Handling:** User-friendly alerts and fallbacks.

---

## 🛠 Tech Stack

- **Frontend:** React, Next.js 13 (App Router), Tailwind CSS
- **Backend:** Node.js, Next.js API Routes
- **Database:** MongoDB (Atlas or Local)
- **Hosting:** Vercel

---

## 📂 Project Structure

```
app/api/forms/      → API routes for form CRUD
app/builder/[id]/   → Form editor page
app/form/[id]/      → Form preview & fill page
components/         → UI components (FormBuilder, FormDisplay, etc.)
lib/                → Utilities, MongoDB connection
styles/             → Tailwind global styles
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18 or later
- **MongoDB** (Atlas or local)
- **GitHub** account
- **Vercel** account

---

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/custom-form-builder.git
   cd custom-form-builder
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**

   Create `.env.local`:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📖 Usage

1. Go to the **builder** page to create/edit forms.
2. Add questions, images, and details.
3. Click **Save** to store in MongoDB.
4. Use **Preview** to view the fillable version.
5. Responses get saved automatically.

---

## 🗄 Database Schema

### Form
```json
{
  "id": "string", 
  "title": "string",
  "description": "string",
  "questions": [],
  "created_at": "date",
  "updated_at": "date"
}
```

### Response
```json
{
  "form_id": "string",
  "answers": [],
  "submitted_at": "date"
}
```


## 🏆 Credits

Developed as part of an assignment using the **MERN stack** + TailwindCSS.  
UI inspired by Typeform, Paperform, and AutoProctor.

---
