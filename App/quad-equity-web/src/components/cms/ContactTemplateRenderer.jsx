import { useEffect, useState } from 'react';
import { submitContactForm } from '../../api/contact';
import { pickLang, stripCmsInlineStyles } from '../../utils/cmsText';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[0-9]{8,15}$/;
const ALLOWED_PHONE_KEYS = new Set([
  'Backspace',
  'Delete',
  'ArrowLeft',
  'ArrowRight',
  'Tab',
  'Home',
  'End',
]);

function sanitizePhone(value) {
  return String(value).replace(/\D/g, '').slice(0, 15);
}

/** @param {{ page: Record<string, unknown> }} props */
export default function ContactTemplateRenderer({ page }) {
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
  const [fieldErrors, setFieldErrors] = useState({ email: '', phone: '' });

  const descriptionHtml = pickLang(page.description);
  const heroTitle = pickLang(page.mediaTitle) || pickLang(page.title);
  const heroLead =
    pickLang(page.mediaDescription) ||
    pickLang(page.feedbackDescription) ||
    pickLang(page.customerSupportDescription);
  const normalizedHeroHtml = normalizeContactHeroHtml(descriptionHtml, heroTitle, heroLead);
  const emailStr = typeof page.email === 'string' ? page.email : '';
  const phoneStr = typeof page.phone === 'string' ? page.phone : '';
  const addressStr = pickLang(page.address);
  const formHeading = pickLang(page.formTitle) || 'Get In Touch';
  const submitLabel = pickLang(page.submitButtonText) || 'Submit';
  const showName = page.showFirstName !== false || page.showLastName !== false;
  const showPhoneNumber = page.showPhoneNumber !== false;
  const showEmailAddress = page.showEmail !== false;
  const showMessage = page.showComments !== false;

  function validateForm() {
    const nextErrors = { email: '', phone: '' };

    if (showEmailAddress && !EMAIL_REGEX.test(email.trim())) {
      nextErrors.email = 'Please enter a valid email address.';
    }

    if (showPhoneNumber && !PHONE_REGEX.test(phone.trim())) {
      nextErrors.phone = 'Please enter a valid phone number.';
    }

    setFieldErrors(nextErrors);
    return !nextErrors.email && !nextErrors.phone;
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (!validateForm()) {
      setStatus('idle');
      return;
    }
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
    <section className="contact-hero">
      <div className="container">
        <div className="hero-wrap">
          <div className="hero-left">
            <div dangerouslySetInnerHTML={{ __html: normalizedHeroHtml }} />

            <div className="contact-info">
              {emailStr ? (
                <p>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7" />
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                  </svg>{' '}
                  <span>{emailStr}</span>
                </p>
              ) : null}
              {phoneStr ? (
                <p>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384" />
                  </svg>{' '}
                  <span>{phoneStr}</span>
                </p>
              ) : null}
              {addressStr ? (
                <p>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>{' '}
                  <span dangerouslySetInnerHTML={{ __html: addressStr }} />
                </p>
              ) : null}
            </div>
          </div>

          <div className="hero-right">
            <div className="form-card">
              <h3 dangerouslySetInnerHTML={{ __html: formHeading }} />

              <form onSubmit={onSubmit}>
                {showName ? (
                  <div className="input-box">
                    <input type="text" placeholder=" " required value={name} onChange={(e) => setName(e.target.value)} />
                    <label>Name</label>
                  </div>
                ) : null}

                {showPhoneNumber ? (
                  <div className="input-box">
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={15}
                      placeholder=" "
                      required
                      value={phone}
                      onBeforeInput={(e) => {
                        if (e.data && /\D/.test(e.data)) {
                          e.preventDefault();
                        }
                      }}
                      onKeyDown={(e) => {
                        if (ALLOWED_PHONE_KEYS.has(e.key)) return;
                        if (!/^\d$/.test(e.key)) {
                          e.preventDefault();
                        }
                      }}
                      onPaste={(e) => {
                        const pastedText = e.clipboardData.getData('text');
                        if (!/^\d+$/.test(pastedText)) {
                          e.preventDefault();
                        }
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                      }}
                      onChange={(e) => {
                        setPhone(sanitizePhone(e.target.value));
                        if (fieldErrors.phone) {
                          setFieldErrors((prev) => ({ ...prev, phone: '' }));
                        }
                      }}
                    />
                    <label>Phone Number</label>
                  </div>
                ) : null}
                {fieldErrors.phone ? <p className="text-danger small mb-2">{fieldErrors.phone}</p> : null}

                {showEmailAddress ? (
                  <div className="input-box">
                    <input
                      type="email"
                      placeholder=" "
                      required
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (fieldErrors.email) {
                          setFieldErrors((prev) => ({ ...prev, email: '' }));
                        }
                      }}
                    />
                    <label>Email Address</label>
                  </div>
                ) : null}
                {fieldErrors.email ? <p className="text-danger small mb-2">{fieldErrors.email}</p> : null}

                {showMessage ? (
                  <div className="input-box">
                    <textarea placeholder=" " required value={message} onChange={(e) => setMessage(e.target.value)} />
                    <label>Message</label>
                  </div>
                ) : null}

                {error ? <p className="text-danger small mb-2">{error}</p> : null}
                {status === 'success' ? (
                  <p className="small mb-2" role="status">
                    Thanks — we&apos;ll be in touch shortly.
                  </p>
                ) : null}

                <button className="btn-submit" type="submit" disabled={status === 'loading'}>
                  {status === 'loading' ? 'Sending…' : submitLabel}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function normalizeContactHeroHtml(descriptionHtml, fallbackTitle, fallbackLead) {
  const title = (fallbackTitle || 'Partner With Quad Equities').trim();
  const lead = (fallbackLead || '').trim();
  const raw = String(descriptionHtml || '').trim();

  // No description: use fallback title + lead.
  if (!raw) {
    return `${title ? `<h1>${title}</h1>` : ''}${lead ? `<p>${lead}</p>` : ''}`;
  }

  // If HTML exists, strip inline styles so contact.css controls typography/colors.
  if (/<\/?[a-z][\s\S]*>/i.test(raw)) {
    const cleaned = stripCmsInlineStyles(raw)
      .replace(/<span[^>]*>/gi, '')
      .replace(/<\/span>/gi, '')
      .replace(/\u200B/g, '')
      .trim();

    // If no heading tag exists, prepend the title to keep expected contact hero look.
    if (!/<h[1-3]\b/i.test(cleaned) && title) {
      return `<h1>${title}</h1>${cleaned}`;
    }
    return cleaned;
  }

  // Plain text: first line as heading, rest as lead paragraphs.
  const lines = raw.split(/\r?\n+/).map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) {
    return `${title ? `<h1>${title}</h1>` : ''}${lead ? `<p>${lead}</p>` : ''}`;
  }
  const heading = lines[0] || title;
  const body = lines.slice(1).join(' ');
  return `${heading ? `<h1>${heading}</h1>` : ''}${body ? `<p>${body}</p>` : lead ? `<p>${lead}</p>` : ''}`;
}
