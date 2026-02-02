import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import booksData from '../data/books'
import Filters from '../components/Filters'
import BookCard from '../components/BookCard'

export default function BrowseBooks(){
  const [filters, setFilters] = useState({})
  const [blockedUserIds, setBlockedUserIds] = useState([])

  // Fetch blocked users on mount
  useEffect(() => {
    async function fetchBlockedUsers() {
      const currentUser = localStorage.getItem('currentUser')
      if (!currentUser) return

      const user = JSON.parse(currentUser)
      const { data, error } = await supabase
        .from('blocked_users')
        .select('blocked_id')
        .eq('blocker_id', user.id)

      if (!error && data) {
        setBlockedUserIds(data.map(b => b.blocked_id))
      }
    }

    fetchBlockedUsers()
  }, [])

  function handleFilters(f){
    setFilters(f)
  }

  let results = booksData.filter(b=>{
    // Hide listings from blocked users
    if (blockedUserIds.includes(b.userId)) return false

    const { search=' ', category='All', condition='All', maxPrice=2000 } = filters
    if(category !== 'All' && b.category !== category) return false
    if(condition !== 'All' && b.condition !== condition) return false
    if(b.price > Number(maxPrice)) return false
    if(search && search.trim()){
      const q = search.toLowerCase()
      if(!b.title.toLowerCase().includes(q) && !b.authors.join(' ').toLowerCase().includes(q)) return false
    }
    return true
  })

  if(filters.sort === 'price-asc') results = results.sort((a,b)=>a.price-b.price)
  if(filters.sort === 'price-desc') results = results.sort((a,b)=>b.price-a.price)

  return (
    <div className="container mt-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <Filters books={booksData} onChange={handleFilters} />
        </div>
        <div className="md:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">Browse Books</h2>
            <div className="text-gray-600">{results.length} results</div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.map(b=> <BookCard key={b.id} book={b} />)}
          </div>
        </div>
      </div>
    </div>
  )
}
