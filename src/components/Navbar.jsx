import React, { useState, useEffect } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

export default function Navbar(){
  const [currentUser, setCurrentUser] = useState(null)
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    const user = localStorage.getItem('currentUser')
    if(user) setCurrentUser(JSON.parse(user))
  }, [])

  useEffect(()=>{
    if(!currentUser) return

    let mounted = true
    async function fetchUnread(){
      const { data, error, count } = await supabase
        .from('messages')
        .select('*', { count: 'exact' })
        .eq('receiverId', currentUser.id)
        .eq('read', false)

      if(error) return console.error(error)
      if(mounted) setUnread((data && data.length) ? data.length : 0)
    }

    fetchUnread()

    const channel = supabase
      .channel('public:messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
        const msg = payload.new
        if(msg.receiverId === currentUser.id){
          setUnread(n => n + 1)
        }
      })
      .subscribe()

    return ()=>{
      mounted = false
      try{ channel.unsubscribe() }catch(e){}
    }
  }, [currentUser])

  function handleLogout(){
    localStorage.removeItem('currentUser')
    setCurrentUser(null)
    alert('Logged out successfully')
  }

  return (
    <header className="bg-white shadow-sm">
      <div className="container flex items-center justify-between py-3">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-teal-600 text-white rounded-full flex items-center justify-center">BM</div>
            <div>
              <div className="font-bold">BookMates</div>
              <div className="text-xs text-gray-500">Campus Marketplace</div>
            </div>
          </Link>
        </div>

        <nav className="flex items-center gap-4">
          <NavLink to="/" end className={({isActive})=>isActive?'text-teal-600 font-medium':'text-gray-700'}>Home</NavLink>
          <NavLink to="/books" className={({isActive})=>isActive?'text-teal-600 font-medium':'text-gray-700'}>Browse Books</NavLink>
          <NavLink to="/sell" className={({isActive})=>isActive?'text-teal-600 font-medium':'text-gray-700'}>List Book</NavLink>
          <NavLink to="/my-listings" className={({isActive})=>isActive?'text-teal-600 font-medium':'text-gray-700'}>My Listings</NavLink>
          <NavLink to="/chat" className={({isActive})=>isActive?'text-teal-600 font-medium':'text-gray-700'}>
            Chat
            {unread>0 && <span className="ml-1 inline-block bg-red-500 text-white text-xs rounded-full px-2">{unread}</span>}
          </NavLink>

          <div className="relative">
            <button className="p-2 rounded-full hover:bg-gray-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 2a6 6 0 00-6 6v3H3a1 1 0 000 2h14a1 1 0 000-2h-1V8a6 6 0 00-6-6z" />
              </svg>
            </button>
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1">3</span>
          </div>

          {currentUser ? (
            <div className="flex items-center gap-2">
              <div className="text-sm">Hi, <span className="font-semibold">{currentUser.username}</span></div>
              <button onClick={handleLogout} className="ml-2 text-sm text-gray-600 hover:text-red-600">Logout</button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="text-sm text-teal-600 hover:underline">Login</Link>
              <span className="text-gray-400">|</span>
              <Link to="/signup" className="text-sm text-teal-600 hover:underline">Sign Up</Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}
