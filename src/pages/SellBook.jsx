import React, {useState} from 'react'

export default function SellBook(){
  const [title,setTitle] = useState('')
  const [author,setAuthor] = useState('')
  const [price,setPrice] = useState('')
  const [condition,setCondition] = useState('Good')
  const [image,setImage] = useState(null)

  function handleImage(e){
    const file = e.target.files[0]
    if(file) setImage(URL.createObjectURL(file))
  }

  function handleSubmit(e){
    e.preventDefault()
    // Mock submit — Copilot: generate a POST later if backend added
    alert('Book submitted:\n' + JSON.stringify({title,author,price,condition}))
    setTitle('');setAuthor('');setPrice('');setCondition('Good');setImage(null)
  }

  return (
    <div>
      <h1>Sell a Book</h1>
      <form onSubmit={handleSubmit} style={{maxWidth:640}}>
        <label>Title</label>
        <input value={title} onChange={e=>setTitle(e.target.value)} required />

        <label>Author</label>
        <input value={author} onChange={e=>setAuthor(e.target.value)} required />

        <div className="row">
          <div style={{flex:1}}>
            <label>Price (USD)</label>
            <input value={price} onChange={e=>setPrice(e.target.value)} required />
          </div>
          <div style={{flex:1}}>
            <label>Condition</label>
            <select value={condition} onChange={e=>setCondition(e.target.value)}>
              <option>Like New</option>
              <option>Good</option>
              <option>Used</option>
            </select>
          </div>
        </div>

        <label>Image</label>
        <input type="file" accept="image/*" onChange={handleImage} />
        {image && <img src={image} alt="preview" style={{width:120,marginTop:8,borderRadius:6}} />}

        <div style={{marginTop:12}}>
          <button className="btn" type="submit">Submit</button>
        </div>
      </form>
    </div>
  )
}
