import React, { useState } from 'react'
import { apiService } from '../../../services/apiService'
import { useSeasonContext } from '../../../context/useSeasonContext'
import { useTheme } from '../../../context/ThemeContext'
import './Contact.css'

export default function Contact({ about, socialLinks }) {
  const { config: seasonConfig } = useSeasonContext()
  const { theme } = useTheme()
  
  const colors = theme ? {
    primary: theme.primary_color || seasonConfig?.colors?.primary || '#1a472a',
    background: theme.background_color || seasonConfig?.colors?.background || 'white',
    text: theme.text_color || seasonConfig?.colors?.text || 'black',
    secondary: theme.secondary_color || seasonConfig?.colors?.secondary || '#e8f4f8',
    accent: theme.accent_color || seasonConfig?.colors?.accent || '#4da6ff'
  } : {
    primary: seasonConfig?.colors?.primary || '#1a472a',
    background: seasonConfig?.colors?.background || 'white',
    text: seasonConfig?.colors?.text || 'black',
    secondary: seasonConfig?.colors?.secondary || '#e8f4f8',
    accent: seasonConfig?.colors?.accent || '#4da6ff'
  }

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await apiService.createContact(formData)
      setSubmitted(true)
      setFormData({ name: '', email: '', subject: '', message: '' })
      setTimeout(() => setSubmitted(false), 5000)
    } catch (error) {
      console.error('Failed to send message:', error)
      alert('Failed to send message. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="contact" id="contact" style={{
      backgroundColor: colors.background
    }}>
      <div className="container">
        <h2 style={{ color: colors.primary }}>Get In Touch</h2>
        <p style={{ color: colors.text }}>Have a project or question? Feel free to reach out!</p>

        <div className="contact-layout">
          {(about?.email || (socialLinks && socialLinks.length > 0)) && (
            <div className="contact-links">
              {about?.email && (
                <p style={{ color: colors.text }}>
                  <strong>Email:</strong> <a href={`mailto:${about.email}`} style={{
                    color: colors.accent
                  }}>{about.email}</a>
                </p>
              )}
              {socialLinks && socialLinks.length > 0 && (
                <p style={{ color: colors.text }}>
                  <strong>Social:</strong>{' '}
                  {socialLinks.map((link, idx) => (
                    <span key={link.id}>
                      <a href={link.url} target="_blank" rel="noopener noreferrer" style={{
                        color: colors.accent
                      }}>{link.platform}</a>
                      {idx < socialLinks.length - 1 ? ' · ' : ''}
                    </span>
                  ))}
                </p>
              )}
            </div>
          )}

          <div className="contact-form-area">
            {submitted && <div className="success-message" style={{
              backgroundColor: colors.accent,
              color: colors.background
            }}>✓ Message sent successfully!</div>}

            <form className="contact-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              name="name"
              placeholder="Your Name"
              value={formData.name}
              onChange={handleChange}
              required
              style={{
                borderColor: colors.accent,
                backgroundColor: colors.secondary,
                color: colors.text
              }}
            />
          </div>

          <div className="form-group">
            <input
              type="email"
              name="email"
              placeholder="Your Email"
              value={formData.email}
              onChange={handleChange}
              required
              style={{
                borderColor: colors.accent,
                backgroundColor: colors.secondary,
                color: colors.text
              }}
            />
          </div>

          <div className="form-group">
            <input
              type="text"
              name="subject"
              placeholder="Subject"
              value={formData.subject}
              onChange={handleChange}
              required
              style={{
                borderColor: colors.accent,
                backgroundColor: colors.secondary,
                color: colors.text
              }}
            />
          </div>

          <div className="form-group">
            <textarea
              name="message"
              placeholder="Your Message"
              rows="5"
              value={formData.message}
              onChange={handleChange}
              required
              style={{
                borderColor: colors.accent,
                backgroundColor: colors.secondary,
                color: colors.text
              }}
            ></textarea>
          </div>

          <button type="submit" className="submit-btn" disabled={loading} style={{
            backgroundColor: colors.primary,
            borderColor: colors.accent,
            color: colors.background
          }}>
            {loading ? 'Sending...' : 'Send Message'}
          </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}
