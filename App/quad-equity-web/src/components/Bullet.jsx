const CircleCheck = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

/** Simple bullet line (About / Approach pages). */
export function Bullet({ children }) {
  return (
    <div className="d-flex align-items-center gap-2">
      <div>
        <CircleCheck />
      </div>
      <div>
        <p className="mb-0" style={{ fontSize: '14px' }}>
          {children}
        </p>
      </div>
    </div>
  );
}

/** Bullet with bold title line + description. */
export function BulletLead({ title, children }) {
  return (
    <div className="d-flex align-items-center gap-2">
      <div>
        <CircleCheck />
      </div>
      <div>
        <h6 className="m-0">{title}</h6>
        <p className="mb-0" style={{ fontSize: '14px' }}>
          {children}
        </p>
      </div>
    </div>
  );
}
