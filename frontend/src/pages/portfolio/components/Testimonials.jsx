import React from 'react'
import './Testimonials.css'

export default function Testimonials({ testimonials }) {
  const visible = Array.isArray(testimonials) ? testimonials : []

  return (
    <section className="testimonials" id="testimonials">
      <div className="container">
        <h2>Testimonials</h2>

        {visible.length === 0 ? (
          <p className="empty">No testimonials yet.</p>
        ) : (
          <div className="testimonials-grid">
            {visible.map((t) => (
              <div key={t.id} className="testimonial-card">
                <div className="testimonial-header">
                  <div className="client">
                    {t.client_photo ? (
                      <img className="client-photo" src={t.client_photo} alt={t.client_name} />
                    ) : (
                      <div className="client-photo placeholder" />
                    )}
                    <div>
                      <div className="client-name">{t.client_name}</div>
                      {t.rating ? (
                        <div className="rating">{'★'.repeat(t.rating)}</div>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="quote">“{t.quote}”</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
