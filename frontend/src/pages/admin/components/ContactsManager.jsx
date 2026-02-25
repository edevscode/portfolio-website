import React, { useEffect, useState } from 'react'
import { apiService } from '../../../services/apiService'
import { Table } from './Form'
import SocialLinksManager from './SocialLinksManager'
import './Manager.css'

export default function ContactsManager() {
  const [activeTab, setActiveTab] = useState('inbox')
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadContacts()
  }, [])

  const loadContacts = async () => {
    try {
      setLoading(true)
      const response = await apiService.getContacts()
      setContacts(response.data)
    } catch (error) {
      console.error('Failed to load contacts:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (id) => {
    try {
      await apiService.markContactAsRead(id)
      setContacts((prev) => prev.map((c) => (c.id === id ? { ...c, is_read: true } : c)))
    } catch (error) {
      console.error('Failed to mark as read:', error)
      alert('Failed to mark as read')
    }
  }

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'subject', label: 'Subject' },
    { key: 'created_at', label: 'Date' },
    { key: 'is_read', label: 'Read', render: (val) => (val ? '✓' : '✗') },
    {
      key: 'id',
      label: 'Action',
      render: (val, row) => (
        <button
          className="btn-edit"
          disabled={row.is_read}
          onClick={() => markAsRead(row.id)}
        >
          {row.is_read ? 'Read' : 'Mark as read'}
        </button>
      ),
    },
  ]

  return (
    <div className="manager">
      <div className="manager-header">
        <div className="manager-header-left">
          <h2>Contact</h2>
          <div className="manager-tabs" role="tablist" aria-label="Contact tabs">
            <button
              type="button"
              className={`manager-tab ${activeTab === 'inbox' ? 'active' : ''}`}
              onClick={() => setActiveTab('inbox')}
              role="tab"
              aria-selected={activeTab === 'inbox'}
            >
              Inbox
            </button>
            <button
              type="button"
              className={`manager-tab ${activeTab === 'social' ? 'active' : ''}`}
              onClick={() => setActiveTab('social')}
              role="tab"
              aria-selected={activeTab === 'social'}
            >
              Social Links
            </button>
          </div>
        </div>
      </div>

      <div className="manager-section">
        {activeTab === 'inbox' ? (
          <Table columns={columns} data={contacts} loading={loading} />
        ) : (
          <SocialLinksManager />
        )}
      </div>
    </div>
  )
}
