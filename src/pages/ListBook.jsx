import React, {useState} from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import booksData from '../data/books'

export default function ListBook(){
  const [title,setTitle] = useState('')
  const [authors,setAuthors] = useState('')
  const [isbn10,setIsbn10] = useState('')
  const [isbn13,setIsbn13] = useState('')
  const [price,setPrice] = useState('')
  const [condition,setCondition] = useState('Good')
  const [category,setCategory] = useState('Computer Science')
  const [image,setImage] = useState(null)
  const [isbnVerified, setIsbnVerified] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [verifyError, setVerifyError] = useState('')
  const [loading, setLoading] = useState(false)
  const nav = useNavigate()

  // Verify ISBN using Google Books API
  async function verifyISBN(isbn) {
    if (!isbn.trim()) return
    
    setVerifying(true)
    setVerifyError('')
    
    try {
      const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`)
      const data = await response.json()
      
      if (data.items && data.items.length > 0) {
        const book = data.items[0].volumeInfo
        setTitle(book.title || title)
        setAuthors(book.authors?.join(', ') || authors)
        setCategory(book.categories?.[0] || category)
        setIsbnVerified(true)
        setVerifyError('')
      } else {
        setVerifyError('ISBN not found in Google Books. Please verify details manually.')
        setIsbnVerified(false)
      }
    } catch (err) {
      setVerifyError('Error verifying ISBN. Please try again.')
      console.error(err)
      setIsbnVerified(false)
    } finally {
      setVerifying(false)
    }
  }

  function handleImage(e){
    const f = e.target.files[0]
    if(f) setImage(URL.createObjectURL(f))
  }

  async function handleSubmit(e){
    e.preventDefault()
    
    const currentUser = localStorage.getItem('currentUser')
    if (!currentUser) {
      alert('Please login to list a book')
      nav('/login')
      return
    }

    const user = JSON.parse(currentUser)
    setLoading(true)

    // Convert image to Base64
    let base64Image = null
    if (image) {
      const response = await fetch(image)
      const blob = await response.blob()
      base64Image = await new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.readAsDataURL(blob)
      })
    }

    try {
      const { data, error } = await supabase
        .from('books')
        .insert([{
          title,
          authors: authors.split(',').map(a => a.trim()),
          isbn10,
          isbn13,
          price: Number(price),
          condition,
          category,
          college: 'Your College',
          sellerName: user.username,
          rating: 5.0,
          image: base64Image,
          userId: user.id,
          isbn_verified: isbnVerified,
          status: 'available'
        }])

      if (error) {
        alert('Error creating listing: ' + error.message)
      } else {
        alert('Book listed successfully!')
        setTitle('');setAuthors('');setIsbn10('');setIsbn13('');setPrice('');setCondition('Good');setCategory('Computer Science');setImage(null);setIsbnVerified(false)
        nav('/my-listings')
      }
    } catch (err) {
      alert('Error: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mt-6">
      <h1 className="text-2xl font-semibold">List a Book</h1>
      <form onSubmit={handleSubmit} className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Title</label>
          <input value={title} onChange={e=>setTitle(e.target.value)} required className="mt-1 block w-full border rounded-md p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">Authors (comma separated)</label>
          <input value={authors} onChange={e=>setAuthors(e.target.value)} required className="mt-1 block w-full border rounded-md p-2" />
        </div>

        <div>
          <label className="block text-sm font-medium">ISBN-10</label>
          <input value={isbn10} onChange={e=>setIsbn10(e.target.value)} className="mt-1 block w-full border rounded-md p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">ISBN-13</label>
          <input value={isbn13} onChange={e=>setIsbn13(e.target.value)} className="mt-1 block w-full border rounded-md p-2" />
          <button type="button" onClick={()=>verifyISBN(isbn13 || isbn10)} disabled={verifying} className="mt-2 text-sm text-blue-600 hover:underline">
            {verifying ? 'Verifying...' : '🔍 Verify ISBN'}
          </button>
          {verifyError && <p className="text-red-600 text-sm mt-1">{verifyError}</p>}
          {isbnVerified && <p className="text-green-600 text-sm mt-1">✓ ISBN Verified</p>}
        </div>

        <div>
          <label className="block text-sm font-medium">Price (₹)</label>
          <input value={price} onChange={e=>setPrice(e.target.value)} required className="mt-1 block w-full border rounded-md p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">Condition</label>
          <select value={condition} onChange={e=>setCondition(e.target.value)} className="mt-1 block w-full border rounded-md p-2">
            <option>Like New</option>
            <option>Good</option>
            <option>Used</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Category</label>
          <input value={category} onChange={e=>setCategory(e.target.value)} className="mt-1 block w-full border rounded-md p-2" />
        </div>

        <div>
          <label className="block text-sm font-medium">Image</label>
          <input type="file" accept="image/*" onChange={handleImage} className="mt-1 block w-full" />
          {image && <img src={image} alt="preview" className="mt-2 w-40 h-40 object-cover rounded-md" />}
        </div>

        <div className="md:col-span-2">
          <button className="btn" type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Listing'}
          </button>
        </div>
      </form>
    </div>
  )
}
