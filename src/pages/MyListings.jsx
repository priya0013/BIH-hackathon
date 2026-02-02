import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import booksData from '../data/books'

export default function MyListings(){
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(false)
  const nav = useNavigate()

  useEffect(() => {
    async function fetchListings() {
      const currentUser = localStorage.getItem('currentUser')
      if (!currentUser) {
        nav('/login')
        return
      }

      const user = JSON.parse(currentUser)
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .eq('userId', user.id)

      if (error) {
        console.error('Error fetching listings:', error)
        // Fall back to mock data
        setListings(booksData.map(b => ({ ...b, status: 'available' })))
      } else {
        setListings(data || [])
      }
    }

    fetchListings()
  }, [])

  async function editPrice(id, currentPrice) {
    const p = prompt('Enter new price (₹)', currentPrice)
    if (!p) return

    setLoading(true)
    const { error } = await supabase
      .from('books')
      .update({ price: Number(p) })
      .eq('id', id)

    if (error) {
      alert('Error updating price: ' + error.message)
    } else {
      setListings(ls => ls.map(l => l.id === id ? { ...l, price: Number(p) } : l))
    }
    setLoading(false)
  }

  async function remove(id) {
    if (!confirm('Delete this listing?')) return

    setLoading(true)
    const { error } = await supabase
      .from('books')
      .delete()
      .eq('id', id)

    if (error) {
      alert('Error deleting listing: ' + error.message)
    } else {
      setListings(ls => ls.filter(l => l.id !== id))
    }
    setLoading(false)
  }

  async function updateStatus(id, newStatus) {
    setLoading(true)
    const { error } = await supabase
      .from('books')
      .update({ status: newStatus })
      .eq('id', id)

    if (error) {
      alert('Error updating status: ' + error.message)
    } else {
      setListings(ls => ls.map(l => l.id === id ? { ...l, status: newStatus } : l))
    }
    setLoading(false)
  }

  return (
    <div className="container mt-6">
      <h1 className="text-2xl font-semibold">My Listings</h1>
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {listings.map(l => (
          <div key={l.id} className="card">
            <img src={l.image} alt={l.title} className="book-card-img" />
            <div className="mt-2">
              <div className="font-semibold">{l.title}</div>
              <div className="text-sm text-gray-500">₹{l.price} • {(l.status || 'available').charAt(0).toUpperCase() + (l.status || 'available').slice(1)}</div>
              <div className="mt-2 flex gap-2 flex-wrap">
                <button className="text-sm text-teal-600 hover:underline" onClick={() => editPrice(l.id, l.price)} disabled={loading}>Edit Price</button>
                <button className="text-sm text-red-600 hover:underline" onClick={() => remove(l.id)} disabled={loading}>Delete</button>
                <select onChange={(e) => updateStatus(l.id, e.target.value)} value={l.status || 'available'} disabled={loading} className="text-sm border rounded p-1">
                  <option value="available">Available</option>
                  <option value="reserved">Reserved</option>
                  <option value="sold">Sold</option>
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

