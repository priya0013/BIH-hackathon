import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function Home() {
  const nav = useNavigate()

  return (
    <div className="container mt-8">
      <section className="hero">
        <h1 className="text-3xl font-bold">
          Buy and Sell Textbooks on Campus
        </h1>

        <p className="text-gray-600 mt-2">
          BookMates makes it easy for students to find affordable textbooks from classmates.
        </p>

        <div className="mt-4 flex gap-3">
          <button className="btn" onClick={() => nav('/books')}>
            Browse Books
          </button>

          <button className="outline" onClick={() => nav('/sell')}>
            List a Book
          </button>
        </div>
      </section>
    </div>
  )
}
