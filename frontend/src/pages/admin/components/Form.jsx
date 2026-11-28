import React, { useEffect, useId } from 'react'
import { Pencil, Trash2, AlertTriangle, CheckCircle2, Info, X, ChevronUp, ChevronDown } from 'lucide-react'
import SimpleRichArea from '../../../components/SimpleRichArea'
import './Form.css'

export function FormField({
  id,
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  required,
  disabled,
  error,
  rows,
  accept,
  multiple,
  options,
  min,
  max,
  step,
  autoFocus,
}) {
  const autoId = useId()
  const fieldId = id || (name ? `field-${name}-${autoId}` : autoId)

  return (
    <div className="form-field">
      {label && (
        <label htmlFor={type === 'markdown' ? undefined : fieldId}>
          {label}
          {required && <span className="required">*</span>}
        </label>
      )}
      {type === 'markdown' ? (
        <SimpleRichArea
          name={name}
          value={value || ''}
          onChange={onChange}
          placeholder={placeholder}
          rows={rows || 4}
        />
      ) : type === 'textarea' ? (
        <textarea
          id={fieldId}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          rows={rows || 4}
        />
      ) : type === 'select' ? (
        <select
          id={fieldId}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
        >
          {Array.isArray(options) &&
            options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
        </select>
      ) : type === 'file' ? (
        <input
          id={fieldId}
          name={name}
          type="file"
          onChange={onChange}
          required={required}
          disabled={disabled}
          accept={accept}
          multiple={multiple}
        />
      ) : (
        <input
          id={fieldId}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          min={min}
          max={max}
          step={step}
          autoFocus={autoFocus}
        />
      )}
      {error && <span className="error">{error}</span>}
    </div>
  )
}

export function ModalForm({ title, onSubmit, onClose, children, submitText = 'Save', submitting = false }) {
  const titleId = useId()

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !submitting) {
        onClose()
      }
    }
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose, submitting])

  return (
    <div className="modal-overlay" onClick={!submitting ? onClose : undefined}>
      <div
        className="modal-content"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 id={titleId}>{title}</h2>
          <button
            type="button"
            className="close-modal"
            onClick={onClose}
            aria-label="Close"
            disabled={submitting}
          >
            ×
          </button>
        </div>
        <form onSubmit={onSubmit} className="modal-form">
          {children}
          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose} disabled={submitting}>Cancel</button>
            <button type="submit" className="btn-submit" disabled={submitting}>
              {submitting ? (
                <><span className="btn-spinner" /> Saving…</>
              ) : submitText}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export function ConfirmDialog({
  open,
  title = 'Confirm deletion',
  message,
  confirmText = 'Delete',
  cancelText = 'Cancel',
  danger = true,
  loading = false,
  onConfirm,
  onCancel,
}) {
  const titleId = useId()

  useEffect(() => {
    if (!open) return undefined
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !loading) {
        onCancel()
      }
    }
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, loading, onCancel])

  if (!open) return null

  return (
    <div className="modal-overlay" onClick={!loading ? onCancel : undefined}>
      <div
        className="confirm-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="confirm-dialog__head">
          <div className={`confirm-dialog__icon${danger ? ' confirm-dialog__icon--danger' : ''}`} aria-hidden="true">
            <AlertTriangle size={18} />
          </div>
          <div className="confirm-dialog__text">
            <h2 id={titleId}>{title}</h2>
            {message && <p>{message}</p>}
          </div>
        </div>
        <div className="confirm-dialog__actions">
          <button type="button" className="btn-cancel" onClick={onCancel} disabled={loading}>
            {cancelText}
          </button>
          <button
            type="button"
            className={danger ? 'btn-danger-solid' : 'btn-submit'}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? (
              <><span className="btn-spinner" /> Working…</>
            ) : confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

export function AdminToast({ toast, onDismiss }) {
  if (!toast?.message) return null
  const type = toast.type || 'success'
  const Icon = type === 'error' ? AlertTriangle : type === 'info' ? Info : CheckCircle2

  return (
    <div
      className={`admin-toast admin-toast--${type}`}
      role={type === 'error' ? 'alert' : 'status'}
      aria-live="polite"
    >
      <Icon size={16} className="admin-toast__icon" />
      <span className="admin-toast__msg">{toast.message}</span>
      {onDismiss && (
        <button
          type="button"
          className="admin-toast__close"
          onClick={onDismiss}
          aria-label="Dismiss notification"
        >
          <X size={14} />
        </button>
      )}
    </div>
  )
}

export function Table({
  columns,
  data,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
  reordering = false,
  loading,
  emptyText = 'No items yet',
  emptyIcon,
  emptyDescription,
  emptyAction,
}) {
  if (loading) {
    const colCount = Math.max(3, columns.length + (onEdit || onDelete ? 1 : 0))
    return (
      <div className="table-skeleton" aria-busy="true" aria-label="Loading items">
        {Array.from({ length: 4 }).map((_, rowIdx) => (
          <div key={rowIdx} className="table-skeleton__row">
            {Array.from({ length: colCount }).map((__, cellIdx) => (
              <div
                key={cellIdx}
                className="table-skeleton__bar"
                style={{
                  width: cellIdx === 0 ? '48px' : cellIdx === 1 ? '40%' : '18%',
                  flex: cellIdx === 1 ? 1 : 'none',
                }}
              />
            ))}
          </div>
        ))}
      </div>
    )
  }

  if (data.length === 0) {
    const EmptyIcon = emptyIcon
    return (
      <div className="table-empty">
        {EmptyIcon && (
          <div className="table-empty__icon" aria-hidden="true">
            <EmptyIcon size={22} />
          </div>
        )}
        <p className="table-empty__title">{emptyText}</p>
        {emptyDescription && <p className="table-empty__desc">{emptyDescription}</p>}
        {emptyAction && (
          <button
            type="button"
            className="btn-primary table-empty__cta"
            onClick={emptyAction.onClick}
          >
            {emptyAction.label}
          </button>
        )}
      </div>
    )
  }

  const hasActions = Boolean(onEdit || onDelete || onMoveUp || onMoveDown)

  return (
    <div className="table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((col, colIdx) => (
              <th key={`${col.key}-${colIdx}`}>{col.label}</th>
            ))}
            {hasActions && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={row.id || idx}>
              {columns.map((col, colIdx) => (
                <td key={`${col.key}-${colIdx}`}>
                  {col.render ? col.render(row[col.key], row, idx) : row[col.key]}
                </td>
              ))}
              {hasActions && (
                <td className="table-actions">
                  {(onMoveUp || onMoveDown) && (
                    <div className="table-reorder-group">
                      {onMoveUp && (
                        <button
                          type="button"
                          className="btn-icon btn-icon--move"
                          onClick={() => onMoveUp(idx)}
                          disabled={reordering || idx === 0}
                          title="Move up"
                          aria-label="Move item up"
                        >
                          <ChevronUp size={14} />
                        </button>
                      )}
                      {onMoveDown && (
                        <button
                          type="button"
                          className="btn-icon btn-icon--move"
                          onClick={() => onMoveDown(idx)}
                          disabled={reordering || idx === data.length - 1}
                          title="Move down"
                          aria-label="Move item down"
                        >
                          <ChevronDown size={14} />
                        </button>
                      )}
                    </div>
                  )}
                  {onEdit && (
                    <button
                      type="button"
                      className="btn-icon btn-icon--edit"
                      onClick={() => onEdit(row)}
                      title="Edit"
                      aria-label="Edit item"
                    >
                      <Pencil size={14} />
                    </button>
                  )}
                  {onDelete && (
                    <button
                      type="button"
                      className="btn-icon btn-icon--delete"
                      onClick={() => onDelete(row.id)}
                      title="Delete"
                      aria-label="Delete item"
                    >
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
