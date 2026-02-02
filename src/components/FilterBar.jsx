import React, {useState, useEffect} from 'react'

export default function FilterBar({books, onChange}){
  const [subject, setSubject] = useState('All')
  const [condition, setCondition] = useState('All')
  const [maxPrice, setMaxPrice] = useState('')

  useEffect(()=>{
    onChange({subject,condition,maxPrice})
  },[subject,condition,maxPrice])

  const subjects = ['All', ...Array.from(new Set(books.map(b=>b.subject)))]

  return (
    <div style={{display:'flex',gap:12,flexWrap:'wrap',marginBottom:12}}>
      <div>
        <label>Subject</label>
        <select value={subject} onChange={e=>setSubject(e.target.value)}>
          {subjects.map(s=> <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div>
        <label>Condition</label>
        <select value={condition} onChange={e=>setCondition(e.target.value)}>
          <option>All</option>
          <option>Like New</option>
          <option>Good</option>
          <option>Used</option>
        </select>
      </div>

      <div>
        <label>Max Price</label>
        <input type="text" placeholder="e.g. 30" value={maxPrice} onChange={e=>setMaxPrice(e.target.value)} />
      </div>

      <div style={{alignSelf:'end'}}>
        <button className="btn" onClick={()=>{setSubject('All');setCondition('All');setMaxPrice('')}}>Reset</button>
      </div>
    </div>
  )
}

/* Copilot: Consider adding sorting options */
