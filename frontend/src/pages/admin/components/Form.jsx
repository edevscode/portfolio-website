import React from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import './Form.css'

export function FormField({ label, name, type = 'text', value, onChange, placeholder, required, error, rows, accept, multiple, options }) {
  return (
    <div className="form-field">
      {label && (
        <label>
          {label}
          {required && <span className="required">*</span>}
        </label>
      )}
      {type === 'textarea' ? (
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          rows={rows || 4}
        />
      ) : type === 'select' ? (
        <select name={name} value={value} onChange={onChange} required={required}>
          {Array.isArray(options) &&
            options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
        </select>
      ) : type === 'file' ? (
        <input
          name={name}
          type="file"
          onChange={onChange}
          required={required}
          accept={accept}
          multiple={multiple}
        />
      ) : (
        <input
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
        />
      )}
      {error && <span className="error">{error}</span>}
    </div>
  )
}

export function ModalForm({ title, onSubmit, onClose, children, submitText = 'Save' }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="close-modal" onClick={onClose} aria-label="Close">×</button>
        </div>
        <form onSubmit={onSubmit} className="modal-form">
          {children}
          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-submit">{submitText}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export function Table({ columns, data, onEdit, onDelete, loading }) {
  if (loading) {
    return <div className="loading">Loading…</div>
  }

  if (data.length === 0) {
    return <div className="no-data">No items yet</div>
  }

  return (
    <div className="table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>{col.label}</th>
            ))}
            {(onEdit || onDelete) && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={row.id || idx}>
              {columns.map((col) => (
                <td key={col.key}>
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
              {(onEdit || onDelete) && (
                <td className="table-actions">
                  {onEdit && (
                    <button className="btn-icon btn-icon--edit" onClick={() => onEdit(row)} title="Edit">
                      <Pencil size={14} />
                    </button>
                  )}
                  {onDelete && (
                    <button className="btn-icon btn-icon--delete" onClick={() => onDelete(row.id)} title="Delete">
                      <Trash2 size={14} />
                    </button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
