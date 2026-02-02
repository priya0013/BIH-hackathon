import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import ReportModal from '../components/ReportModal'
import books from '../data/books'

export default function BookDetails(){
  const { id } = useParams()
  const nav = useNavigate()
  const [book, setBook] = useState(null)
  const [isOwner, setIsOwner] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)

  useEffect(() => {
    // Try to fetch from Supabase first, fall back to mock data
    async function fetchBook() {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .eq('id', id)
        .single()

      if (error || !data) {
        // Fall back to mock data
        const mockBook = books.find(b => b.id === id)
        setBook(mockBook || null)
      } else {
        setBook(data)
      }

      // Check if current user is owner
      const currentUser = localStorage.getItem('currentUser')
      if (currentUser) {
        const user = JSON.parse(currentUser)
        setIsOwner(data?.userId === user.id || mockBook?.sellerName === user.username)
      }
    }
    fetchBook()
  }, [id])

  async function updateStatus(newStatus) {
    setLoading(true)
    const { error } = await supabase
      .from('books')
      .update({ status: newStatus })
      .eq('id', id)

    if (error) {
      alert('Error updating status: ' + error.message)
    } else {
      setBook({ ...book, status: newStatus })
      alert('Status updated to: ' + newStatus)
    }
    setLoading(false)
  }

  if(!book) return <div className="container mt-6"><h2>Book not found</h2></div>

  return (
    <div className="container mt-6">
      <button className="outline" onClick={()=>nav(-1)}>Back</button>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <img src={book.image} alt={book.title} className="w-full h-96 object-cover rounded-md" />
        </div>
        <div className="md:col-span-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{book.title}</h1>
            {book.isbn_verified && <div className="text-sm text-green-600 font-medium">Verified</div>}
            <div className={`text-sm font-medium px-2 py-1 rounded ${
              book.status === 'available' ? 'bg-green-100 text-green-700' :
              book.status === 'reserved' ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }`}>
              {(book.status || 'available').charAt(0).toUpperCase() + (book.status || 'available').slice(1)}
            </div>
          </div>

          <div className="text-gray-600 mt-2">{book.authors.join(', ')}</div>

          <div className="mt-4 flex items-baseline gap-4">
            <div className="text-3xl font-bold">₹{book.price}</div>
            <div className="text-sm text-gray-500 line-through">₹{book.oldPrice}</div>
            <div className="ml-4 text-yellow-500">{'★'.repeat(Math.round(book.rating))}</div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-gray-700">
            <div><strong>ISBN-10:</strong> {book.isbn10}</div>
            <div><strong>ISBN-13:</strong> {book.isbn13}</div>
            <div><strong>Category:</strong> {book.category}</div>
            <div><strong>Condition:</strong> {book.condition}</div>
            <div><strong>Posted:</strong> {book.postedDate}</div>
            <div><strong>College:</strong> {book.college}</div>
          </div>

          <div className="mt-6 border-t pt-4">
            <div className="text-sm text-gray-600">Seller</div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">{book.sellerName}</div>
                <div className="text-sm text-gray-500">{book.sellerEmail}</div>
              </div>
              <div className="flex gap-2">
                <button className="btn" onClick={()=>nav(`/chat?otherId=${book.userId}`)}>Message</button>
                {isOwner && (
                  <select onChange={(e)=>updateStatus(e.target.value)} disabled={loading} value={book.status || 'available'} className="border rounded-md p-2">
                    <option value="available">Available</option>
                    <option value="reserved">Reserved</option>
                    <option value="sold">Sold</option>
                  </select>
                )}
                {!isOwner && (
                  <button className="text-red-600 text-sm hover:underline" onClick={()=>setShowReportModal(true)}>Report</button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {showReportModal && (
        <ReportModal
          bookId={id}
          userId={book.userId}
          userName={book.sellerName}
          onClose={() => setShowReportModal(false)}
        />
      )}
    </div>
  )
}
