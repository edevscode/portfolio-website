import React, { useState, useEffect, useRef } from 'react'
import { User, FileText, Globe, Save, Upload, ExternalLink, Check } from 'lucide-react'
import { apiService } from '../../../services/apiService'
import RichTextEditor from '../../../components/RichTextEditor'
import './Manager.css'
import './AboutManager.css'

const EMPTY = {
  title: 'Profile',
  hero_name: '', hero_role: '', hero_tagline: '',
  hero_heading: '', hero_subheading: '',
  hero_cta_primary_text: '', hero_cta_primary_link: '',
  hero_cta_secondary_text: '', hero_cta_secondary_link: '',
  about_intro: '', about_background: '', about_specialization: '', about_text: '',
  email: '', phone: '', location: '',
  profile_image: null, resume_file: null,
}

function SectionCard({ title, icon: Icon, children }) {
  return (
    <div className="about-card">
      <div className="about-card-header">
        <Icon size={16} color="#6366f1" />
        <span>{title}</span>
      </div>
      <div className="about-card-body">{children}</div>
    </div>
  )
}

function Field({ label, name, type = 'text', value, onChange, placeholder, hint, rows }) {
  return (
    <div className="about-field">
      <label className="about-label">
        {label}
        {hint && <span className="about-hint">{hint}</span>}
      </label>
      {type === 'markdown' ? (
        <RichTextEditor
          value={value || ''}
          onChange={onChange}
          placeholder={placeholder}
          minHeight={(rows || 4) * 26}
        />
      ) : type === 'textarea' ? (
        <textarea
          name={name}
          value={value || ''}
          onChange={onChange}
          placeholder={placeholder}
          rows={rows || 3}
          className="about-input about-textarea"
        />
      ) : (
        <input
          type={type}
          name={name}
          value={value || ''}
          onChange={onChange}
          placeholder={placeholder}
          className="about-input"
        />
      )}
    </div>
  )
}

function Row({ children }) {
  return <div className="about-row">{children}</div>
}

export default function AboutManager() {
  const [about, setAbout] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [profilePreview, setProfilePreview] = useState('')
  const [resumeName, setResumeName] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const photoInputRef = useRef(null)
  const resumeInputRef = useRef(null)

  useEffect(() => { load() }, [])

  const load = async () => {
    try {
      const res = await apiService.getAbout()
      if (res.data?.length > 0) {
        const data = res.data[0]
        setAbout(data)
        setForm(data)
        if (data.profile_image) setProfilePreview(data.profile_image)
        if (data.resume_file) setResumeName('Current CV on file')
      }
    } catch {
      // silently ignore
    }
  }

  const set = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handlePhoto = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setForm(prev => ({ ...prev, profile_image: file }))
    setProfilePreview(URL.createObjectURL(file))
  }

  const handleResume = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setForm(prev => ({ ...prev, resume_file: file }))
    setResumeName(file.name)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const fd = new FormData()
      fd.append('title', form.title || about?.title || 'Profile')
      const textFields = [
        'hero_name','hero_role','hero_tagline','hero_heading','hero_subheading',
        'hero_cta_primary_text','hero_cta_primary_link',
        'hero_cta_secondary_text','hero_cta_secondary_link',
        'about_intro','about_background','about_specialization','about_text',
      ]
      textFields.forEach(k => fd.append(k, form[k] || ''))
      if (form.profile_image instanceof File) fd.append('profile_image', form.profile_image)
      if (form.resume_file instanceof File) fd.append('resume_file', form.resume_file)

      if (about) {
        await apiService.updateAbout(about.id, fd)
      } else {
        await apiService.createAbout(fd)
        await load()
      }
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to save.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className="about-manager" onSubmit={handleSubmit}>

      {/* Sticky save bar */}
      <div className="about-topbar">
        <div className="about-topbar-left">
          <User size={20} color="#6366f1" />
          <h2>Hero &amp; About</h2>
        </div>
        <div className="about-topbar-right">
          {error && <span className="about-err">{error}</span>}
          <button type="submit" className="btn-primary" disabled={saving}>
            {saved
              ? <><Check size={15} /> Saved</>
              : saving
                ? <><span className="btn-spinner" /> Saving…</>
                : <><Save size={15} /> Save Changes</>}
          </button>
        </div>
      </div>

      <div className="about-layout">

        {/* ── Left column ── */}
        <div className="about-col-left">

          {/* Profile photo card */}
          <div className="about-card">
            <div className="about-card-header">
              <User size={16} color="#6366f1" />
              <span>Profile Photo</span>
            </div>
            <div className="about-card-body" style={{ alignItems: 'center', textAlign: 'center' }}>
              <button
                type="button"
                className="about-photo-upload"
                onClick={() => photoInputRef.current?.click()}
                title="Click to change photo"
              >
                {profilePreview
                  ? <img src={profilePreview} alt="Profile" className="about-photo-img" />
                  : <div className="about-photo-placeholder"><Upload size={24} color="#94a3b8" /></div>}
                <div className="about-photo-overlay">
                  <Upload size={18} color="#fff" />
                  <span>Upload</span>
                </div>
              </button>
              <input ref={photoInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhoto} />
              <p className="about-photo-hint">JPG, PNG or WebP · Max 5 MB</p>
            </div>
          </div>

          {/* Resume card */}
          <div className="about-card">
            <div className="about-card-header">
              <FileText size={16} color="#6366f1" />
              <span>Resume / CV</span>
            </div>
            <div className="about-card-body">
              {(resumeName || about?.resume_file) && (
                <div className="about-resume-current">
                  <FileText size={14} color="#6366f1" />
                  <span>{resumeName || 'Current CV on file'}</span>
                  {about?.resume_file && typeof about.resume_file === 'string' && (
                    <a href={about.resume_file} target="_blank" rel="noreferrer" className="about-resume-link">
                      <ExternalLink size={13} />
                    </a>
                  )}
                </div>
              )}
              <button
                type="button"
                className="about-upload-btn"
                onClick={() => resumeInputRef.current?.click()}
              >
                <Upload size={14} /> {about?.resume_file ? 'Replace CV' : 'Upload CV'}
              </button>
              <input ref={resumeInputRef} type="file" accept=".pdf,.doc,.docx" style={{ display: 'none' }} onChange={handleResume} />
              <p className="about-photo-hint">PDF, DOC or DOCX</p>
            </div>
          </div>

        </div>

        {/* ── Right column ── */}
        <div className="about-col-right">

          <SectionCard title="Identity" icon={User}>
            <Row>
              <Field label="Full Name" name="hero_name" value={form.hero_name} onChange={set} placeholder="Your name" />
              <Field label="Role / Title" name="hero_role" value={form.hero_role} onChange={set} placeholder="e.g. Full-Stack Developer" />
            </Row>
            <Field label="Tagline" name="hero_tagline" value={form.hero_tagline} onChange={set} placeholder="A short punchy tagline" />
          </SectionCard>

          <SectionCard title="Hero Section" icon={Globe}>
            <Row>
              <Field label="Heading" name="hero_heading" value={form.hero_heading} onChange={set} placeholder="Main headline" />
              <Field label="Subheading" name="hero_subheading" value={form.hero_subheading} onChange={set} placeholder="Supporting text" />
            </Row>
            <Row>
              <Field label="Primary Button Text" name="hero_cta_primary_text" value={form.hero_cta_primary_text} onChange={set} placeholder="View My Work" />
              <Field label="Primary Button URL" name="hero_cta_primary_link" value={form.hero_cta_primary_link} onChange={set} placeholder="#projects" />
            </Row>
            <Row>
              <Field label="Secondary Button Text" name="hero_cta_secondary_text" value={form.hero_cta_secondary_text} onChange={set} placeholder="Contact Me" />
              <Field label="Secondary Button URL" name="hero_cta_secondary_link" value={form.hero_cta_secondary_link} onChange={set} placeholder="#contact" />
            </Row>
          </SectionCard>

          <SectionCard title="About Section" icon={FileText}>
            <Field label="Intro" name="about_intro" type="markdown" value={form.about_intro} onChange={set} placeholder="Opening line of your about section…" rows={3} />
            <Field label="Background" name="about_background" type="markdown" value={form.about_background} onChange={set} placeholder="Your background and experience…" rows={5} />
            <Field label="Specialization" name="about_specialization" type="markdown" value={form.about_specialization} onChange={set} placeholder="What you specialize in…" rows={4} />
            <Field label="General Bio" name="about_text" type="markdown" value={form.about_text} onChange={set} placeholder="Full bio text used across the site…" rows={5}
              hint="(fallback / general purpose)" />
          </SectionCard>

        </div>
      </div>
    </form>
  )
}
