import { useEffect, useState } from 'react';
import { submitContactForm } from '../api/contact';

export default function ContactPage() {
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/assets/css/contact.css';
    document.head.appendChild(link);
    return () => link.remove();
  }, []);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    setStatus('loading');
    setError('');
    try {
      await submitContactForm({ name, phone, email, message });
      setStatus('success');
      setName('');
      setPhone('');
      setEmail('');
      setMessage('');
    } catch (err) {
      setStatus('idle');
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    }
  }

  return (
    <>
      <section className="contact-hero">
        <div className="container">
          <div className="hero-wrap">
            <div className="hero-left">
              <h1>Partner With Quad Equities</h1>
              <p>
                Structured finance solutions for modern schools.
                Let&apos;s build clarity, control, and growth together.
              </p>

              <div className="contact-info">
                <p>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7" />
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                  </svg>{' '}
                  gab@quadequities.com.au
                </p>
                <p>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384" />
                  </svg>{' '}
                  +61 402 888087
                </p>
                <p>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>{' '}
                  Berwick, Victoria
                </p>
              </div>
            </div>

            <div className="hero-right">
              <div className="form-card">
                <h3>Get In Touch</h3>

                <form onSubmit={onSubmit}>
                  <div className="input-box">
                    <input type="text" required value={name} onChange={(e) => setName(e.target.value)} />
                    <label>Name</label>
                  </div>

                  <div className="input-box">
                    <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} />
                    <label>Phone Number</label>
                  </div>

                  <div className="input-box">
                    <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                    <label>Email Address</label>
                  </div>

                  <div className="input-box">
                    <textarea required value={message} onChange={(e) => setMessage(e.target.value)} />
                    <label>Message</label>
                  </div>

                  {error ? <p className="text-danger small mb-2">{error}</p> : null}
                  {status === 'success' ? (
                    <p className="small mb-2" role="status">
                      Thanks — we&apos;ll be in touch shortly.
                    </p>
                  ) : null}

                  <button className="btn-submit" type="submit" disabled={status === 'loading'}>
                    {status === 'loading' ? 'Sending…' : 'Submit'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
