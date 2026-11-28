import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import {
  Mail, MailOpen, Trash2, Plus, Phone, MapPin, Save, Check,
  Search, X, Reply, Copy, Inbox,
} from 'lucide-react'
import { apiService } from '../../../services/apiService'
import { AdminToast, ConfirmDialog } from './Form'
import SocialLinksManager from './SocialLinksManager'
import './Manager.css'

function formatDate(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function buildReplyHref(contact) {
  const subject = contact.subject ? `Re: ${contact.subject}` : 'Re: Portfolio Inquiry'
  return `mailto:${contact.email}?subject=${encodeURIComponent(subject)}`
}

function MessageModal({ contact, onClose, onDelete, onCopyEmail, copiedEmail }) {
  const titleId = useId()

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content msg-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <h2 id={titleId} className="msg-modal__title">{contact.subject || '(no subject)'}</h2>
            <p className="msg-modal__meta">
              <strong>{contact.name}</strong> &nbsp;·&nbsp; <a href={`mailto:${contact.email}`}>{contact.email}</a>
              &nbsp;·&nbsp; {formatDate(contact.created_at)}
            </p>
          </div>
          <button type="button" className="close-modal" onClick={onClose} aria-label="Close">×</button>
        </div>
        <div className="msg-modal__body">
          {contact.message}
        </div>
        <div className="msg-modal__footer">
          <button
            type="button"
            className="btn-danger"
            onClick={() => { onClose(); onDelete(contact.id) }}
          >
            <Trash2 size={14} /> Delete
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => onCopyEmail(contact.email)}
          >
            {copiedEmail ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy Email</>}
          </button>
          <a href={buildReplyHref(contact)} className="btn-primary">
            <Reply size={14} /> Reply
          </a>
        </div>
      </div>
    </div>
  )
}

function CIField({ icon, label, name, type = 'text', value, onChange, placeholder }) {
  const Icon = icon
  const fieldId = useId()
  return (
    <div className="ci-field">
      <label className="ci-label" htmlFor={fieldId}>{label}</label>
      <div className="ci-input-wrap">
        <Icon size={15} className="ci-input-icon" aria-hidden="true" />
        <input
          id={fieldId}
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="ci-input"
        />
      </div>
    </div>
  )
}

export default function ContactsManager() {
  const [activeTab, setActiveTab] = useState('inbox')

  // Inbox state
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState(null)
  const [mobileViewing, setMobileViewing] = useState(null)
  const [inboxSearch, setInboxSearch] = useState('')
  const [inboxFilter, setInboxFilter] = useState('all')
  const [copiedEmail, setCopiedEmail] = useState(false)
  const [deleteTargetId, setDeleteTargetId] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [toast, setToast] = useState(null)
  const socialRef = useRef(null)
  const toastTimer = useRef(null)
  const copyTimer = useRef(null)

  // Contact Info state
  const [aboutId, setAboutId] = useState(null)
  const [ciForm, setCiForm] = useState({ email: '', phone: '', location: '' })
  const [ciSavedSnapshot, setCiSavedSnapshot] = useState('{"email":"","phone":"","location":""}')
  const [ciSaving, setCiSaving] = useState(false)
  const [ciSaved, setCiSaved] = useState(false)
  const [ciError, setCiError] = useState('')

  const showToast = useCallback((message, type = 'success') => {
    clearTimeout(toastTimer.current)
    setToast({ message, type })
    toastTimer.current = setTimeout(() => setToast(null), 3200)
  }, [])

  const loadContacts = useCallback(async () => {
    try {
      setLoading(true)
      const res = await apiService.getContacts()
      const list = res.data || []
      setContacts(list)
      setSelectedId((prev) => (prev && list.some((c) => c.id === prev) ? prev : (list[0]?.id ?? null)))
    } catch {
      showToast('Failed to load messages.', 'error')
    } finally {
      setLoading(false)
    }
  }, [showToast])

  const loadAbout = useCallback(async () => {
    try {
      const res = await apiService.getAbout()
      if (res.data?.length > 0) {
        const data = res.data[0]
        const next = { email: data.email || '', phone: data.phone || '', location: data.location || '' }
        setAboutId(data.id)
        setCiForm(next)
        setCiSavedSnapshot(JSON.stringify(next))
      }
    } catch {
      // silently ignore
    }
  }, [])

  useEffect(() => {
    loadContacts()
    loadAbout()
    return () => {
      clearTimeout(toastTimer.current)
      clearTimeout(copyTimer.current)
    }
  }, [loadContacts, loadAbout])

  const notifyShellMeta = () => {
    window.dispatchEvent(new CustomEvent('admin:meta-updated'))
  }

  const markAsRead = async (id) => {
    try {
      await apiService.markContactAsRead(id)
      setContacts(prev => prev.map(c => c.id === id ? { ...c, is_read: true } : c))
      notifyShellMeta()
    } catch {
      showToast('Failed to mark message as read.', 'error')
    }
  }

  const confirmDelete = async () => {
    if (!deleteTargetId) return
    setDeleting(true)
    try {
      await apiService.deleteContact(deleteTargetId)
      setContacts((prev) => {
        const remaining = prev.filter((c) => c.id !== deleteTargetId)
        if (selectedId === deleteTargetId) {
          setSelectedId(remaining[0]?.id ?? null)
        }
        return remaining
      })
      if (mobileViewing?.id === deleteTargetId) setMobileViewing(null)
      setDeleteTargetId(null)
      notifyShellMeta()
      showToast('Message deleted')
    } catch {
      showToast('Failed to delete message.', 'error')
    } finally {
      setDeleting(false)
    }
  }

  const handleCopyEmail = async (email) => {
    if (!email) return
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(email)
      }
      clearTimeout(copyTimer.current)
      setCopiedEmail(true)
      copyTimer.current = setTimeout(() => setCopiedEmail(false), 2000)
    } catch {
      showToast('Could not copy email', 'error')
    }
  }

  const handleCiChange = (e) => {
    const { name, value } = e.target
    setCiForm(prev => ({ ...prev, [name]: value }))
  }

  const ciDirty = JSON.stringify(ciForm) !== ciSavedSnapshot

  const handleCiSave = async (e) => {
    e.preventDefault()
    if (!aboutId || !ciDirty || ciSaving) return
    setCiSaving(true)
    setCiError('')
    try {
      const fd = new FormData()
      fd.append('email', ciForm.email)
      fd.append('phone', ciForm.phone)
      fd.append('location', ciForm.location)
      await apiService.updateAbout(aboutId, fd)
      setCiSavedSnapshot(JSON.stringify(ciForm))
      setCiSaved(true)
      setTimeout(() => setCiSaved(false), 2500)
    } catch (err) {
      setCiError(err.response?.data?.detail || err.message || 'Failed to save.')
    } finally {
      setCiSaving(false)
    }
  }

  const unread = contacts.filter(c => !c.is_read).length
  const deleteTarget = contacts.find(c => c.id === deleteTargetId)

  const filteredContacts = useMemo(() => {
    const q = inboxSearch.trim().toLowerCase()
    return contacts.filter((c) => {
      if (inboxFilter === 'unread' && c.is_read) return false
      if (q) {
        const hay = `${c.name || ''} ${c.email || ''} ${c.subject || ''} ${c.message || ''}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
  }, [contacts, inboxSearch, inboxFilter])

  const selectedContact = useMemo(() => {
    const match = filteredContacts.find((c) => c.id === selectedId)
    return match || filteredContacts[0] || null
  }, [filteredContacts, selectedId])

  const openMessage = (contact) => {
    setSelectedId(contact.id)
    if (window.innerWidth <= 900) {
      setMobileViewing(contact)
    }
    if (!contact.is_read) markAsRead(contact.id)
  }

  const isInboxFiltered = Boolean(inboxSearch.trim() || inboxFilter !== 'all')

  return (
    <div className="manager">
      <div className="manager-header">
        <div className="manager-header-left">
          <div className="manager-tabs" role="tablist" aria-label="Contact sections">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'inbox'}
              className={`manager-tab${activeTab === 'inbox' ? ' active' : ''}`}
              onClick={() => setActiveTab('inbox')}
            >
              Inbox {unread > 0 && <span className="unread-count-badge" style={{ marginLeft: 6 }}>{unread}</span>}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'social'}
              className={`manager-tab${activeTab === 'social' ? ' active' : ''}`}
              onClick={() => setActiveTab('social')}
            >
              Social Links
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'info'}
              className={`manager-tab${activeTab === 'info' ? ' active' : ''}`}
              onClick={() => setActiveTab('info')}
            >
              Contact Info
            </button>
          </div>
          {activeTab === 'info' && ciDirty && (
            <span className="dirty-pill" role="status">
              <span className="dirty-pill__dot" aria-hidden="true" />
              Unsaved changes
            </span>
          )}
        </div>
        {activeTab === 'social' && (
          <button type="button" className="btn-primary" onClick={() => socialRef.current?.openAdd()}>
            <Plus size={16} /> Add Link
          </button>
        )}
        {activeTab === 'info' && (
          <button type="button" className="btn-primary" onClick={handleCiSave} disabled={ciSaving || !aboutId || (!ciDirty && !ciSaved)}>
            {ciSaved
              ? <><Check size={15} /> Saved</>
              : ciSaving
                ? <><span className="btn-spinner" /> Saving…</>
                : <><Save size={15} /> Save</>}
          </button>
        )}
      </div>

      {activeTab === 'social' ? (
        <SocialLinksManager ref={socialRef} embedded />
      ) : activeTab === 'info' ? (
        <div className="manager-section">
          <form className="ci-form" onSubmit={handleCiSave}>
            {ciError && <p className="ci-alert" role="alert">{ciError}</p>}
            <p className="ci-desc">This information appears in the Contact section of your portfolio.</p>
            <CIField icon={Mail}    label="Email"    name="email"    type="email" value={ciForm.email}    onChange={handleCiChange} placeholder="you@example.com" />
            <CIField icon={Phone}   label="Phone"    name="phone"    value={ciForm.phone}    onChange={handleCiChange} placeholder="+1 (555) 000-0000" />
            <CIField icon={MapPin}  label="Location" name="location" value={ciForm.location} onChange={handleCiChange} placeholder="City, Country" />
          </form>
        </div>
      ) : (
        <>
          <div className="manager-toolbar">
            <div className="manager-toolbar-left">
              <div className="manager-search">
                <Search size={14} className="manager-search__icon" aria-hidden="true" />
                <input
                  type="search"
                  className="manager-search__input"
                  value={inboxSearch}
                  onChange={(e) => setInboxSearch(e.target.value)}
                  placeholder="Search messages…"
                  aria-label="Search messages"
                />
                {inboxSearch && (
                  <button
                    type="button"
                    className="manager-search__clear"
                    onClick={() => setInboxSearch('')}
                    aria-label="Clear search"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              <div className="manager-filter-pills" role="group" aria-label="Filter messages">
                <button
                  type="button"
                  className={`manager-filter-pill${inboxFilter === 'all' ? ' is-active' : ''}`}
                  aria-pressed={inboxFilter === 'all'}
                  onClick={() => setInboxFilter('all')}
                >
                  All
                </button>
                <button
                  type="button"
                  className={`manager-filter-pill${inboxFilter === 'unread' ? ' is-active' : ''}`}
                  aria-pressed={inboxFilter === 'unread'}
                  onClick={() => setInboxFilter('unread')}
                >
                  Unread {unread > 0 ? `(${unread})` : ''}
                </button>
              </div>

              {!loading && contacts.length > 0 && (
                <span className="manager-result-meta">
                  {isInboxFiltered ? `${filteredContacts.length} of ${contacts.length}` : `${contacts.length} total`}
                </span>
              )}
            </div>
          </div>

          {loading ? (
            <div className="table-skeleton" aria-busy="true" aria-label="Loading messages">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="table-skeleton__row">
                  <div className="table-skeleton__bar" style={{ width: 20 }} />
                  <div className="table-skeleton__bar" style={{ flex: 1 }} />
                  <div className="table-skeleton__bar" style={{ width: 72 }} />
                </div>
              ))}
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="table-empty">
              <div className="table-empty__icon" aria-hidden="true">
                <Inbox size={22} />
              </div>
              <p className="table-empty__title">{isInboxFiltered ? 'No matching messages' : 'Inbox is empty'}</p>
              <p className="table-empty__desc">
                {isInboxFiltered
                  ? 'No messages match your search or unread filter.'
                  : 'Messages submitted from your portfolio contact form will appear here.'}
              </p>
              {isInboxFiltered && (
                <button
                  type="button"
                  className="btn-primary table-empty__cta"
                  onClick={() => { setInboxSearch(''); setInboxFilter('all') }}
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="inbox-split">
              <div className="inbox-pane-list" role="list">
                {filteredContacts.map(c => {
                  const isSelected = selectedContact?.id === c.id
                  return (
                    <div
                      key={c.id}
                      role="listitem"
                      className={`inbox-row${c.is_read ? '' : ' inbox-row--unread'}${isSelected ? ' inbox-row--selected' : ''}`}
                      onClick={() => openMessage(c)}
                    >
                      <span className="inbox-icon" aria-hidden="true">
                        {c.is_read
                          ? <MailOpen size={15} color="#94a3b8" />
                          : <Mail size={15} className="manager-header-icon" />}
                      </span>
                      <div
                        className="inbox-main"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            openMessage(c)
                          }
                        }}
                      >
                        <div className="inbox-top">
                          <span className="inbox-name">{c.name}</span>
                          <span className="inbox-date">{formatDate(c.created_at)}</span>
                        </div>
                        <div className="inbox-subject">{c.subject || '(no subject)'}</div>
                        <div className="inbox-preview">{c.message}</div>
                      </div>
                      <button
                        type="button"
                        className="inbox-delete"
                        title="Delete"
                        aria-label={`Delete message from ${c.name}`}
                        onClick={e => { e.stopPropagation(); setDeleteTargetId(c.id) }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )
                })}
              </div>

              <div className="inbox-pane-reader">
                {selectedContact ? (
                  <>
                    <div className="inbox-reader-head">
                      <div>
                        <h3 className="inbox-reader-subject">{selectedContact.subject || '(no subject)'}</h3>
                        <div className="inbox-reader-meta">
                          <strong>{selectedContact.name}</strong>
                          <span>·</span>
                          <a href={`mailto:${selectedContact.email}`}>{selectedContact.email}</a>
                        </div>
                      </div>
                      <span className="inbox-reader-date">{formatDate(selectedContact.created_at)}</span>
                    </div>
                    <div className="inbox-reader-body">
                      {selectedContact.message}
                    </div>
                    <div className="inbox-reader-footer">
                      <div className="inbox-reader-actions">
                        <a href={buildReplyHref(selectedContact)} className="btn-primary">
                          <Reply size={14} /> Reply via Email
                        </a>
                        <button
                          type="button"
                          className="btn-secondary"
                          onClick={() => handleCopyEmail(selectedContact.email)}
                        >
                          {copiedEmail ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy Email</>}
                        </button>
                      </div>
                      <button
                        type="button"
                        className="btn-danger"
                        onClick={() => setDeleteTargetId(selectedContact.id)}
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="inbox-reader-empty">
                    <MailOpen size={24} />
                    <span>Select a message to read</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {mobileViewing && (
        <MessageModal
          contact={mobileViewing}
          onClose={() => setMobileViewing(null)}
          onDelete={setDeleteTargetId}
          onCopyEmail={handleCopyEmail}
          copiedEmail={copiedEmail}
        />
      )}

      <ConfirmDialog
        open={!!deleteTargetId}
        title="Delete message?"
        message={deleteTarget ? `Permanently delete the message from "${deleteTarget.name}"?` : ''}
        confirmText="Delete"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTargetId(null)}
      />

      <AdminToast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  )
}
