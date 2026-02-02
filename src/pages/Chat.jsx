import React, { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import ChatBubble from '../components/ChatBubble'
import ReportModal from '../components/ReportModal'
import { supabase } from '../lib/supabaseClient'

export default function Chat(){
  const nav = useNavigate()
  const { search } = useLocation()
  const params = new URLSearchParams(search)
  const otherId = params.get('otherId') // seller or buyer id
  const bookId = params.get('bookId')

  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [otherUser, setOtherUser] = useState(null)
  const [conversations, setConversations] = useState([])
  const [showReportModal, setShowReportModal] = useState(false)
  const mountedRef = useRef(true)

  useEffect(()=>{ return ()=>{ mountedRef.current = false }} , [])

  const currentUser = typeof window !== 'undefined' && localStorage.getItem('currentUser') ? JSON.parse(localStorage.getItem('currentUser')) : null
  useEffect(()=>{
    if(!currentUser) {
      alert('Please login to chat')
      nav('/login')
      return
    }

    async function fetchConversation(){
      if(otherId){
        // load single conversation
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .or(
            `and(senderId.eq.${currentUser.id},receiverId.eq.${otherId}),and(senderId.eq.${otherId},receiverId.eq.${currentUser.id})`
          )
          .order('created_at', { ascending: true })

        if(error){
          console.error('fetchMessages error', error)
        } else if(mountedRef.current){
          setMessages(data || [])
        }

        // mark unread messages (where current user is receiver) as read
        await supabase
          .from('messages')
          .update({ read: true })
          .eq('receiverId', currentUser.id)
          .eq('senderId', otherId)
          .eq('read', false)
        return
      }

      // No otherId provided: show inbox (list of conversations)
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`senderId.eq.${currentUser.id},receiverId.eq.${currentUser.id}`)
        .order('created_at', { ascending: false })

      if(error){
        console.error('fetch conversations error', error)
        return
      }

      // Reduce to last message per partner
      const convMap = new Map()
      data.forEach(msg => {
        const partner = msg.senderId === currentUser.id ? msg.receiverId : msg.senderId
        if(!convMap.has(partner)) convMap.set(partner, msg)
      })

      const partnerIds = Array.from(convMap.keys())
      let usersById = {}
      if(partnerIds.length>0){
        const { data: usersData } = await supabase
          .from('users')
          .select('id,username')
          .in('id', partnerIds)

        usersById = (usersData || []).reduce((acc,u)=>{ acc[u.id]=u; return acc }, {})
      }

      const convs = partnerIds.map(pid => ({
        partnerId: pid,
        username: usersById[pid]?.username || 'User',
        lastMessage: convMap.get(pid).content,
        lastAt: convMap.get(pid).created_at,
        bookId: convMap.get(pid).bookId
      }))

      if(mountedRef.current) setMessages([])
      if(mountedRef.current) setOtherUser(null)
      if(mountedRef.current) setConversations?.(convs)

      // realtime subscription for new messages (Supabase JS v2)
    }

    fetchConversation()

    const channel = supabase
      .channel('public:messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        const msg = payload.new
        const isRelevant = msg.senderId === currentUser.id || msg.receiverId === currentUser.id
        if(isRelevant){
          // refresh inbox or append to current open convo
          if(otherId){
            setMessages(prev => [...prev, msg])
          } else {
            // simple approach: re-fetch conversations
            // we won't fetch here to keep code small; user can refresh when they open chat
          }
        }
      })
      .subscribe()

    return ()=>{
      try { channel.unsubscribe() } catch(e){ /* ignore */ }
    }
  }, [otherId])

  async function send(){
    if(!input.trim()) return
    if(!currentUser) return

    const payload = {
      bookId: bookId || null,
      senderId: currentUser.id,
      receiverId: otherId,
      content: input
    }

    const { data, error } = await supabase
      .from('messages')
      .insert([payload])
      .select()

    if(error){
      console.error('send message error', error)
      return
    }

    setInput('')
  }

  async function blockUser() {
    if (!currentUser) return
    if (!confirm(`Are you sure you want to block this user? You won't be able to message them.`)) return

    const { error } = await supabase
      .from('blocked_users')
      .insert([{
        blocker_id: currentUser.id,
        blocked_id: otherId,
        reason: 'Manual block'
      }])

    if (error) {
      if (error.message.includes('unique')) {
        alert('User already blocked')
      } else {
        alert('Error blocking user: ' + error.message)
      }
    } else {
      alert('User blocked successfully')
      nav('/chat')
    }
  }

  return (
    <div className="container mt-6">
      <div className="card">
        <div className="flex items-center gap-4">
          <div>
            <div className="font-semibold">Chat</div>
            <div className="text-sm text-gray-500">Conversation</div>
          </div>
        </div>

        {otherId ? (
          <>
            <div className="mt-4 flex justify-between items-center mb-2">
              <div></div>
              <div className="flex gap-2">
                <button className="text-red-600 text-sm hover:underline" onClick={blockUser}>Block User</button>
                <button className="text-orange-600 text-sm hover:underline" onClick={()=>setShowReportModal(true)}>Report User</button>
              </div>
            </div>
            <div className="mt-2 h-64 overflow-auto bg-gray-50 p-4 rounded-md">
              {messages.map(m => (
                <ChatBubble key={m.id} text={m.content} time={new Date(m.created_at).toLocaleTimeString()} isSender={m.senderId===currentUser.id} seen={m.read} />
              ))}
            </div>

            <div className="mt-4 flex gap-2">
              <input value={input} onChange={e=>setInput(e.target.value)} className="flex-1 border rounded-md p-2" placeholder="Type a message" />
              <button className="btn" onClick={send}>Send</button>
            </div>
          </>
        ) : (
          <div className="mt-4">
            {conversations.length === 0 ? (
              <div className="text-gray-600">No conversations yet. Message a seller from a book details page to start.</div>
            ) : (
              <ul className="space-y-2">
                {conversations.map(c => (
                  <li key={c.partnerId} className="p-3 bg-white rounded-md shadow-sm flex items-center justify-between">
                    <div>
                      <div className="font-semibold">{c.username}</div>
                      <div className="text-sm text-gray-600">{c.lastMessage}</div>
                    </div>
                    <div>
                      <button onClick={()=>nav(`/chat?otherId=${c.partnerId}&bookId=${c.bookId || ''}`)} className="btn">Open</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
      {showReportModal && otherId && (
        <ReportModal
          bookId={bookId}
          userId={otherId}
          userName="User"
          onClose={() => setShowReportModal(false)}
        />
      )}
    </div>
  )
}
