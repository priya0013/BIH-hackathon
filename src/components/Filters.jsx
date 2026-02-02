import React, { useState, useEffect } from 'react'

export default function Filters({ books, onChange }){
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [condition, setCondition] = useState('All')
  const [maxPrice, setMaxPrice] = useState(2000)
  const [sort, setSort] = useState('none')

  useEffect(()=>{
    onChange({search,category,condition,maxPrice,sort})
  },[search,category,condition,maxPrice,sort])

  const categories = ['All', ...Array.from(new Set(books.map(b=>b.category)))]

  return (
    <div className="p-4 bg-white rounded-md shadow-sm">
      <div>
        <label className="block text-sm font-medium">Search</label>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Title or author" className="mt-1 block w-full border rounded-md p-2" />
      </div>

      <div className="mt-3">
        <label className="block text-sm font-medium">Category</label>
        <select value={category} onChange={e=>setCategory(e.target.value)} className="mt-1 block w-full border rounded-md p-2">
          {categories.map(c=> <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="mt-3">
        <label className="block text-sm font-medium">Condition</label>
        <select value={condition} onChange={e=>setCondition(e.target.value)} className="mt-1 block w-full border rounded-md p-2">
          <option>All</option>
          <option>Like New</option>
          <option>Good</option>
          <option>Used</option>
        </select>
      </div>

      <div className="mt-3">
        <label className="block text-sm font-medium">Max Price: ₹{maxPrice}</label>
        <input type="range" min="0" max="2000" value={maxPrice} onChange={e=>setMaxPrice(e.target.value)} className="w-full" />
      </div>

      <div className="mt-3">
        <label className="block text-sm font-medium">Sort</label>
        <select value={sort} onChange={e=>setSort(e.target.value)} className="mt-1 block w-full border rounded-md p-2">
          <option value="none">None</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
        </select>
      </div>
    </div>
  )
}

/* Comments: Filters component lifts filter state up via onChange callback. */
