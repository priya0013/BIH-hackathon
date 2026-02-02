import React, { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function ReportModal({ bookId, userId, userName, onClose }) {
  const [reason, setReason] = useState('fake_listing')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)

    const currentUser = localStorage.getItem('currentUser')
    if (!currentUser) {
      alert('Please login to report')
      setLoading(false)
      return
    }

    const user = JSON.parse(currentUser)

    const { error } = await supabase
      .from('reports')
      .insert([{
        reporterId: user.id,
        reportedUserId: userId,
        bookId: bookId,
        reason: reason,
        description: description,
        status: 'pending'
      }])

    setLoading(false)

    if (error) {
      alert('Error submitting report: ' + error.message)
    } else {
      setSubmitted(true)
      setTimeout(() => {
        onClose()
      }, 2000)
    }
  }

  if (submitted) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="text-green-600 text-4xl mb-2">✓</div>
            <h2 className="text-xl font-semibold">Report Submitted</h2>
            <p className="text-gray-600 mt-2">Our team will review this report shortly.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-semibold mb-4">Report {userName}</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Reason for report</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full border rounded-md p-2"
            >
              <option value="fake_listing">Fake listing</option>
              <option value="inappropriate_content">Inappropriate content</option>
              <option value="spam">Spam</option>
              <option value="unsafe_behavior">Unsafe behavior</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Additional details</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please describe the issue..."
              className="w-full border rounded-md p-2 h-24"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="outline flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn flex-1"
            >
              {loading ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
