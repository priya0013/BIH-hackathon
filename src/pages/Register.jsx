import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

export default function Signup(){
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [idCardFile, setIdCardFile] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const nav = useNavigate()

  function handleFileChange(e){
    const file = e.target.files[0]
    if(file){
      setIdCardFile(file)
    }
  }

  function handleSubmit(e){
    e.preventDefault()
    setError('')

    // Validation: all fields required
    if(!username.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()){
      setError('All fields are required')
      return
    }

    // Password match check
    if(password !== confirmPassword){
      setError('Passwords do not match')
      return
    }

    // Student ID card must be uploaded
    if(!idCardFile){
      setError('Please upload your Student ID card')
      return
    }

    setLoading(true)

    // Convert image to Base64
    const reader = new FileReader()
    reader.onload = async () => {
      try {
        const base64Image = reader.result

        // Insert user into Supabase (use lowercase column name to match DB)
        const { data, error: insertError } = await supabase
          .from('users')
          .insert([{
            username,
            email,
            password, // Note: In production, use bcrypt hash!
            idcardimage: base64Image
          }])
          .select()

        if(insertError){
          if(insertError.message.includes('unique constraint')) {
            setError('Email or username already registered')
          } else {
            setError(insertError.message)
          }
          setLoading(false)
          return
        }

        alert('Signup successful! Please login.')
        nav('/login')
      } catch(err) {
        setError(err.message)
        setLoading(false)
      }
    }
    reader.readAsDataURL(idCardFile)
  }

  return (
    <div className="container mt-8 flex justify-center">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center mb-6">Create Your BookMates Account</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Username</label>
            <input 
              type="text" 
              value={username} 
              onChange={e=>setUsername(e.target.value)} 
              className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Choose a username"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">College Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={e=>setEmail(e.target.value)} 
              className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="your.email@college.edu"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={e=>setPassword(e.target.value)} 
              className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Create a strong password"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Confirm Password</label>
            <input 
              type="password" 
              value={confirmPassword} 
              onChange={e=>setConfirmPassword(e.target.value)} 
              className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Confirm your password"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Student ID Card Photo</label>
            <div className="border-2 border-dashed border-blue-300 rounded-lg p-4 text-center bg-blue-50 cursor-pointer hover:border-blue-500 transition">
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleFileChange}
                className="hidden"
                id="idCardInput"
              />
              <label htmlFor="idCardInput" className="cursor-pointer">
                <div className="text-blue-600 font-semibold">Click to upload</div>
                <div className="text-sm text-gray-600">or drag and drop</div>
                <div className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</div>
              </label>
            </div>
            {idCardFile && <div className="text-sm text-green-600 mt-2">✓ {idCardFile.name} uploaded</div>}
          </div>

          {error && <div className="bg-red-100 text-red-700 p-3 rounded-md text-sm">{error}</div>}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-md font-semibold hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <span className="text-gray-600">Already have an account? </span>
          <Link to="/login" className="text-blue-600 font-semibold hover:underline">Login</Link>
        </div>
      </div>
    </div>
  )
}
