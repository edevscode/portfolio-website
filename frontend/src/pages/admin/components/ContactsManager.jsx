import React, { useEffect, useState } from 'react'
import { Mail, MailOpen, Trash2, X, MessageSquare } from 'lucide-react'
import { apiService } from '../../../services/apiService'
import SocialLinksManager from './SocialLinksManager'
import './Manager.css'

function formatDate(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function MessageModal({ contact, onClose, onMarkRead }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 560 }}>
        <div className="modal-header">
          <div>
            <h2 style={{ marginBottom: 2 }}>{contact.subject || '(no subject)'}</h2>
            <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>
              {contact.name} &nbsp;·&nbsp; <a href={`mailto:${contact.email}`} style={{ color: '#6366f1' }}>{contact.email}</a>
              &nbsp;·&nbsp; {formatDate(contact.created_at)}
            </p>
          </div>
          <button className="close-modal" onClick={onClose} aria-label="Close">×</button>
        </div>
        <div style={{ padding: '20px 24px 28px', fontSize: 14, color: '#374151', lineHeight: 1.7, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
          {contact.message}
        </div>
        {!contact.is_read && (
          <div style={{ padding: '0 24px 20px', borderTop: '1px solid #f1f5f9', paddingTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn-primary" onClick={() => { onMarkRead(contact.id); onClose() }}>
              <MailOpen size={15} /> Mark as Read
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ContactsManager() {
  const [activeTab, setActiveTab] = useState('inbox')
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewing, setViewing] = useState(null)

  useEffect(() => { loadContacts() }, [])

  const loadContacts = async () => {
    try {
      setLoading(true)
      const res = await apiService.getContacts()
      setContacts(res.data)
    } catch {
      // silently ignore
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (id) => {
    try {
      await apiService.markContactAsRead(id)
      setContacts(prev => prev.map(c => c.id === id ? { ...c, is_read: true } : c))
    } catch {
      alert('Failed to mark as read.')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this message?')) return
    try {
      await apiService.deleteContact(id)
      setContacts(prev => prev.filter(c => c.id !== id))
    } catch {
      alert('Failed to delete message.')
    }
  }

  const unread = contacts.filter(c => !c.is_read).length

  return (
    <div className="manager">
      <div className="manager-header">
        <div className="manager-header-left">
          <MessageSquare size={22} color="#6366f1" />
          <h2>Contact</h2>
          {unread > 0 && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              minWidth: 20, height: 20, padding: '0 6px',
              background: '#ef4444', color: '#fff',
              fontSize: 11, fontWeight: 800, borderRadius: 999,
            }}>{unread}</span>
          )}
          <div className="manager-tabs" role="tablist">
            <button type="button" className={`manager-tab${activeTab === 'inbox' ? ' active' : ''}`} onClick={() => setActiveTab('inbox')}>
              Inbox
            </button>
            <button type="button" className={`manager-tab${activeTab === 'social' ? ' active' : ''}`} onClick={() => setActiveTab('social')}>
              Social Links
            </button>
          </div>
        </div>
      </div>

      <div className="manager-section">
        {activeTab === 'social' ? (
          <SocialLinksManager />
        ) : loading ? (
          <div className="loading">Loading…</div>
        ) : contacts.length === 0 ? (
          <div className="no-data">No messages yet.</div>
        ) : (
          <div className="inbox-list">
            {contacts.map(c => (
              <div
                key={c.id}
                className={`inbox-row${c.is_read ? '' : ' inbox-row--unread'}`}
                onClick={() => { setViewing(c); if (!c.is_read) markAsRead(c.id) }}
              >
                <span className="inbox-icon">
                  {c.is_read
                    ? <MailOpen size={16} color="#94a3b8" />
                    : <Mail size={16} color="#6366f1" />}
                </span>
                <div className="inbox-main">
                  <div className="inbox-top">
                    <span className="inbox-name">{c.name}</span>
                    <span className="inbox-date">{formatDate(c.created_at)}</span>
                  </div>
                  <div className="inbox-subject">{c.subject || '(no subject)'}</div>
                  <div className="inbox-preview">{c.message}</div>
                </div>
                <button
                  className="inbox-delete"
                  title="Delete"
                  onClick={e => { e.stopPropagation(); handleDelete(c.id) }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {viewing && (
        <MessageModal
          contact={viewing}
          onClose={() => setViewing(null)}
          onMarkRead={markAsRead}
        />
      )}
    </div>
  )
}
