import React from 'react'

export default function ChatBubble({text, time, isSender, seen}){
  return (
    <div className={`max-w-xl my-2 ${isSender ? 'ml-auto text-right' : 'mr-auto text-left'}`}>
      <div className={`${isSender ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'} inline-block p-3 rounded-lg`}> 
        {text}
      </div>
      <div className="text-xs text-gray-400 mt-1">
        {time} {isSender && seen ? '• seen' : ''}
      </div>
    </div>
  )
}

/* Comments: ChatBubble supports left/right alignment and shows time/seen */
