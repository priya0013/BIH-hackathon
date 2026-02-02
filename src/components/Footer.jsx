import React from 'react'

export default function Footer(){
  return (
    <footer className="footer">
      <div className="container">
        <div className="text-center text-gray-500">© {new Date().getFullYear()} Book Mates — Built for campus students</div>
      </div>
    </footer>
  )
}
