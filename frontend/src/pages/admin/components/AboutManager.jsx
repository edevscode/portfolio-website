import React, { useState, useEffect } from 'react'
import { Edit2, Save, X } from 'lucide-react'
import { apiService } from '../../../services/apiService'
import { FormField } from './Form'
import './Manager.css'

export default function AboutManager() {
  const [about, setAbout] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    hero_name: '',
    hero_role: '',
    hero_tagline: '',
    about_text: '',
    email: '',
    phone: '',
    location: '',
    profile_image: null,
    resume_file: null,
  })
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const [profilePreviewUrl, setProfilePreviewUrl] = useState('')
  const [resumePreviewUrl, setResumePreviewUrl] = useState('')

  useEffect(() => {
    fetchAbout()
  }, [])

  const fetchAbout = async () => {
    try {
      const response = await apiService.getAbout()
      if (response.data && response.data.length > 0) {
        setAbout(response.data[0])
        setFormData(response.data[0])
      }
    } catch (err) {
      console.log('Error fetching about:', err)
    }
  }

  useEffect(() => {
    // Keep previews in sync with form values
    if (formData.profile_image) {
      if (typeof formData.profile_image === 'string') {
        setProfilePreviewUrl(formData.profile_image)
      } else {
        const url = URL.createObjectURL(formData.profile_image)
        setProfilePreviewUrl(url)
        return () => URL.revokeObjectURL(url)
      }
    } else {
      setProfilePreviewUrl('')
    }
  }, [formData.profile_image])

  useEffect(() => {
    if (formData.resume_file) {
      if (typeof formData.resume_file === 'string') {
        setResumePreviewUrl(formData.resume_file)
      } else {
        const url = URL.createObjectURL(formData.resume_file)
        setResumePreviewUrl(url)
        return () => URL.revokeObjectURL(url)
      }
    } else {
      setResumePreviewUrl('')
    }
  }, [formData.resume_file])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleFileChange = (e) => {
    const { name, files } = e.target
    if (files && files[0]) {
      setFormData(prev => ({
        ...prev,
        [name]: files[0]
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const formDataToSend = new FormData()
      // title still exists on the backend model; keep it set to something stable
      formDataToSend.append('title', formData.title || about?.title || 'Profile')
      formDataToSend.append('hero_name', formData.hero_name || '')
      formDataToSend.append('hero_role', formData.hero_role || '')
      formDataToSend.append('hero_tagline', formData.hero_tagline || '')
      formDataToSend.append('about_text', formData.about_text || '')
      formDataToSend.append('email', formData.email || '')
      formDataToSend.append('phone', formData.phone || '')
      formDataToSend.append('location', formData.location || '')
      
      if (formData.profile_image && typeof formData.profile_image !== 'string') {
        formDataToSend.append('profile_image', formData.profile_image)
      }
      if (formData.resume_file && typeof formData.resume_file !== 'string') {
        formDataToSend.append('resume_file', formData.resume_file)
      }

      if (about) {
        await apiService.updateAbout(about.id, formDataToSend)
        setMessage('About updated successfully!')
      } else {
        await apiService.createAbout(formDataToSend)
        setMessage('About created successfully!')
        await fetchAbout()
      }

      setEditing(false)
    } catch (err) {
      setMessage('Error saving about: ' + (err.response?.data?.detail || err.message))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="manager">
      <div className="manager-header">
        <h2>About Profile</h2>
        {!editing && (
          <button 
            className="btn btn-primary"
            onClick={() => setEditing(true)}
          >
            <Edit2 size={18} />
            Edit
          </button>
        )}
      </div>

      {message && (
        <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      {editing ? (
        <form onSubmit={handleSubmit} className="form">
          <FormField
            label="Hero Name"
            name="hero_name"
            value={formData.hero_name || ''}
            onChange={handleInputChange}
            placeholder="e.g., Juan Dela Cruz"
          />

          <FormField
            label="Hero Role"
            name="hero_role"
            value={formData.hero_role || ''}
            onChange={handleInputChange}
            placeholder="e.g., Full-Stack Developer"
          />

          <FormField
            label="Hero Tagline"
            name="hero_tagline"
            type="textarea"
            value={formData.hero_tagline || ''}
            onChange={handleInputChange}
            placeholder="Short tagline"
          />

          <FormField
            label="About Text"
            name="about_text"
            type="textarea"
            value={formData.about_text || ''}
            onChange={handleInputChange}
            placeholder="Write a short about text..."
          />

          <FormField
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="your.email@example.com"
          />

          <FormField
            label="Phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="+1 (555) 000-0000"
          />

          <FormField
            label="Location"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            placeholder="City, Country"
          />

          <FormField
            label="Profile Image"
            name="profile_image"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
          />

          {profilePreviewUrl && (
            <div className="about-item">
              <label>Profile Preview:</label>
              <div>
                <img
                  src={profilePreviewUrl}
                  alt="Profile preview"
                  style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 12 }}
                />
              </div>
            </div>
          )}

          <FormField
            label="Resume/CV"
            name="resume_file"
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFileChange}
          />

          {resumePreviewUrl && (
            <div className="about-item">
              <label>CV Preview:</label>
              <div>
                <a href={resumePreviewUrl} target="_blank" rel="noreferrer">
                  {typeof formData.resume_file === 'string'
                    ? 'Open current CV'
                    : `Open selected file: ${formData.resume_file?.name || 'CV'}`}
                </a>
              </div>
            </div>
          )}

          <div className="form-actions">
            <button type="submit" className="btn btn-success" disabled={loading}>
              <Save size={18} />
              {loading ? 'Saving...' : 'Save'}
            </button>
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={() => {
                setEditing(false)
                fetchAbout()
              }}
            >
              <X size={18} />
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="about-display">
          {about ? (
            <>
              <div className="about-item">
                <label>Hero:</label>
                <p>{[about.hero_name, about.hero_role, about.hero_tagline].filter(Boolean).join(' — ')}</p>
              </div>

              {about.about_text && (
                <div className="about-item">
                  <label>About Text:</label>
                  <p>{about.about_text}</p>
                </div>
              )}

              {about.profile_image && (
                <div className="about-item">
                  <label>Profile:</label>
                  <div>
                    <img
                      src={about.profile_image}
                      alt="Profile"
                      style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 12 }}
                    />
                  </div>
                </div>
              )}

              {about.resume_file && (
                <div className="about-item">
                  <label>CV:</label>
                  <p>
                    <a href={about.resume_file} target="_blank" rel="noreferrer">
                      Open CV
                    </a>
                  </p>
                </div>
              )}
              {about.email && (
                <div className="about-item">
                  <label>Email:</label>
                  <p>{about.email}</p>
                </div>
              )}
              {about.phone && (
                <div className="about-item">
                  <label>Phone:</label>
                  <p>{about.phone}</p>
                </div>
              )}
              {about.location && (
                <div className="about-item">
                  <label>Location:</label>
                  <p>{about.location}</p>
                </div>
              )}
            </>
          ) : (
            <p style={{ color: '#999' }}>No about information yet. Click Edit to add one.</p>
          )}
        </div>
      )}
    </div>
  )
}
