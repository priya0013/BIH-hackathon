import React, {useState} from 'react'
import booksData from '../data/books'
import BookCard from '../components/BookCard'
import FilterBar from '../components/FilterBar'

export default function Books(){
  const [filters,setFilters] = useState({subject:'All',condition:'All',maxPrice:''})

  const handleFilterChange = (f) => setFilters(f)

  const filtered = booksData.filter(b => {
    if(filters.subject !== 'All' && b.subject !== filters.subject) return false
    if(filters.condition !== 'All' && b.condition !== filters.condition) return false
    if(filters.maxPrice && Number(filters.maxPrice) > 0 && b.price > Number(filters.maxPrice)) return false
    return true
  })

  return (
    <div>
      <h1>Books</h1>
      <FilterBar books={booksData} onChange={handleFilterChange} />
      <div className="book-grid">
        {filtered.map(b => (
          <div key={b.id} className="book-card">
            <BookCard book={b} />
          </div>
        ))}
      </div>
      {filtered.length === 0 && <p className="muted">No books match your filters.</p>}
    </div>
  )
}
