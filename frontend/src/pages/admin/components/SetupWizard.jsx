import React, { useState, useEffect } from 'react'
import { CheckCircle, AlertCircle, ChevronRight, FileText, Briefcase, Users, Award, Mail, Zap } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { apiService } from '../../../services/apiService'
import './SetupWizard.css'

const STEPS = [
  { id: 1, title: 'Hero & About',   icon: FileText,  path: '/admin/about',        tip: 'Introduce yourself with a strong bio and profile photo.' },
  { id: 2, title: 'Projects',       icon: Briefcase, path: '/admin/projects',      tip: 'Showcase 3–5 of your best projects with descriptions.' },
  { id: 3, title: 'Skills',         icon: Zap,       path: '/admin/skills',        tip: 'List the technologies and tools you work with.' },
  { id: 4, title: 'Experience',     icon: Users,     path: '/admin/experience',    tip: 'Add your work history with roles and outcomes.' },
  { id: 5, title: 'Certificates',   icon: Award,     path: '/admin/certificates',  tip: 'Upload certificates to validate your skills.' },
  { id: 6, title: 'Contact & Links', icon: Mail,     path: '/admin/messages',      tip: 'Add social links so visitors can reach you.' },
]

export default function SetupWizard() {
  const navigate = useNavigate()
  const [completed, setCompleted] = useState(Array(STEPS.length).fill(false))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    check()
  }, [])

  const check = async () => {
    try {
      const [about, projects, skills, experiences, certificates, socialLinks] = await Promise.all([
        apiService.getAbout(),
        apiService.getProjects(),
        apiService.getSkills(),
        apiService.getExperiences(),
        apiService.getCertificates(),
        apiService.getSocialLinks(),
      ])

      setCompleted([
        about?.data?.length > 0,
        projects?.data?.length > 0,
        skills?.data?.length > 0,
        experiences?.data?.length > 0,
        certificates?.data?.length > 0,
        socialLinks?.data?.length > 0,
      ])
    } catch {
      // silently ignore
    } finally {
      setLoading(false)
    }
  }

  const doneCount = completed.filter(Boolean).length
  const pct = Math.round((doneCount / STEPS.length) * 100)

  return (
    <div className="setup-wizard">
      <div className="wizard-header">
        <h2>Portfolio Setup</h2>
        <p>Complete each section to build out your portfolio.</p>
      </div>

      <div className="wizard-progress">
        <div className="wizard-progress-bar">
          <div className="progress-fill" style={{ width: loading ? '0%' : `${pct}%` }} />
        </div>
        <span className="wizard-progress-label">{loading ? '…' : `${doneCount} of ${STEPS.length} complete`}</span>
      </div>

      <div className="setup-grid">
        {STEPS.map((step, i) => {
          const done = completed[i]
          const Icon = step.icon
          return (
            <button
              key={step.id}
              className={`setup-card${done ? ' setup-card--done' : ''}`}
              onClick={() => navigate(step.path)}
            >
              <div className={`setup-card-icon${done ? ' setup-card-icon--done' : ''}`}>
                <Icon size={20} />
              </div>
              <div className="setup-card-body">
                <div className="setup-card-top">
                  <span className="setup-card-title">{step.title}</span>
                  {done
                    ? <CheckCircle size={15} className="setup-card-check" />
                    : <AlertCircle size={15} className="setup-card-pending" />}
                </div>
                <p className="setup-card-tip">{step.tip}</p>
              </div>
              <ChevronRight size={16} className="setup-card-arrow" />
            </button>
          )
        })}
      </div>
    </div>
  )
}
