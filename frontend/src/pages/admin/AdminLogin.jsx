import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { apiService } from '../../services/apiService'
import './AdminLogin.css'

export default function AdminLogin({ setIsAdmin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await apiService.login(username, password)
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
          <div className="login-icon-wrap" aria-hidden="true">
            <Lock size={22} />
          </div>
          <h1>Admin Portal</h1>
          <p className="login-subtext">Sign in to manage portfolio content</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Email</label>
            <input
              type="email"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your admin email"
              autoComplete="email"
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-input-wrap">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                disabled={loading}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                disabled={loading}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="error-message" role="alert">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="login-footer">
          <Link to="/" className="login-back-link">
            <ArrowLeft size={14} />
            <span>Back to Portfolio</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
