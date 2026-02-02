import React from 'react'
import { Link } from 'react-router-dom'

// BookCard: displays brief book info for browse grid
export default function BookCard({ book }) {
  return (
    <div className="card">
      <img className="book-card-img" src={book.image} alt={book.title} />
      <div className="mt-3">
        <Link to={`/books/${book.id}`} className="text-lg font-semibold hover:underline">{book.title}</Link>
        <div className="text-sm text-gray-600">{book.authors.join(', ')}</div>
        <div className="mt-2 flex items-center justify-between">
          <div>
            <div className="text-xl font-bold">₹{book.price}</div>
            <div className="text-sm text-gray-500 line-through">₹{book.oldPrice}</div>
          </div>
          <div className="text-right text-sm text-gray-500">
            <div>{book.college}</div>
            <div className="mt-1">{book.condition}</div>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <div className="text-xs text-gray-500">ISBN: {book.isbn13}</div>
          <Link to={`/books/${book.id}`} className="text-sm text-teal-600">View More</Link>
        </div>
      </div>
    </div>
  )
}

/* Comments: This component is intentionally minimal and uses Tailwind utility classes.
   Enhancements: add wishlist, quick-buy, or badge (e.g., Verified) as needed. */
