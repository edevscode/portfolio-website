import React, { useState, useEffect } from 'react'
import { CheckCircle, AlertCircle, ChevronRight } from 'lucide-react'
import { apiService } from '../../../services/apiService'
import './SetupWizard.css'

export default function SetupWizard() {
  const [setupSteps, setSetupSteps] = useState([
    { id: 1, title: 'Hero & About', completed: false, icon: '👤' },
    { id: 2, title: 'Projects', completed: false, icon: '💼' },
    { id: 3, title: 'Skills', completed: false, icon: '🎯' },
    { id: 4, title: 'Experience', completed: false, icon: '📋' },
    { id: 5, title: 'Contact', completed: false, icon: '✉️' },
  ])
  const [completion, setCompletion] = useState(0)

  useEffect(() => {
    checkCompletion()
  }, [])

  const checkCompletion = async () => {
    try {
      const about = await apiService.getAbout()
      const projects = await apiService.getProjects()
      const skills = await apiService.getSkills()
      const experiences = await apiService.getExperiences()
      const contacts = await apiService.getContacts()

      const completed = [
        about?.data?.length > 0,
        projects?.data?.length > 0,
        skills?.data?.length > 0,
        experiences?.data?.length > 0,
        contacts?.data?.length > 0,
      ]

      setSetupSteps(prev => prev.map((step, idx) => ({
        ...step,
        completed: completed[idx]
      })))

      const percent = (completed.filter(Boolean).length / 5) * 100
      setCompletion(percent)
    } catch (err) {
      console.log('Setup check:', err)
    }
  }

  return (
    <div className="setup-wizard">
      <div className="wizard-header">
        <h2>🚀 Setup Your Portfolio</h2>
        <p>Complete these steps to fully customize your portfolio</p>
      </div>

      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${completion}%` }}></div>
      </div>
      <p className="progress-text">{Math.round(completion)}% Complete</p>

      <div className="setup-grid">
        {setupSteps.map((step) => (
          <div key={step.id} className={`setup-card ${step.completed ? 'completed' : ''}`}>
            <div className="card-icon">{step.icon}</div>
            <h3>{step.title}</h3>
            <div className="card-status">
              {step.completed ? (
                <>
                  <CheckCircle size={20} style={{ color: '#4caf50' }} />
                  <span>Complete</span>
                </>
              ) : (
                <>
                  <AlertCircle size={20} style={{ color: '#ff9800' }} />
                  <span>Pending</span>
                </>
              )}
            </div>
            <ChevronRight size={20} className="card-arrow" />
          </div>
        ))}
      </div>

      <div className="setup-tips">
        <h3>💡 Quick Tips</h3>
        <ul>
          <li>Start with your <strong>Hero &amp; About</strong> to introduce yourself</li>
          <li>Add 3-5 <strong>Projects</strong> to showcase your work</li>
          <li>List your <strong>Skills</strong> with proficiency levels</li>
          <li>Add <strong>Experience</strong> with dates and results</li>
          <li>Keep <strong>Contact</strong> up to date (links + inbox)</li>
        </ul>
      </div>
    </div>
  )
}
