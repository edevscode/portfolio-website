import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { apiService } from '../../services/apiService'
import './AdminLogin.css'

export default function AdminLogin({ setIsAdmin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { theme } = useTheme()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await apiService.login(username, password)

      // Store token
      localStorage.setItem('adminToken', response.data.token)
      setIsAdmin(true)
      navigate('/admin')
    } catch (err) {
      const status = err?.response?.status
      const data = err?.response?.data

      const message =
        (data && (data.error || data.detail)) ||
        (typeof data === 'string' ? data : '') ||
        err?.message ||
        'Login failed'

      setError(status ? `${message} (HTTP ${status})` : message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <Lock size={40} style={{ color: theme?.primary_color || '#000' }} />
          <h1>Admin Portal</h1>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              disabled={loading}
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button 
            type="submit" 
            className="login-button"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="login-footer">
          Portfolio Admin Dashboard
        </p>
      </div>
    </div>
  )
}
