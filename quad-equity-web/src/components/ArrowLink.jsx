import { Link } from 'react-router-dom';

export function ArrowLinkIcon() {
  return (
    <svg className="arrow-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 30" fill="currentColor">
      <path d="M4.234,16,19.288,28.47,18,30,0,14.958,18,0l1.29,1.528L4.232,14H48v2Z" transform="translate(48 30) rotate(-180)" />
    </svg>
  );
}

export function ArrowLink({ to, children, className = 'border-hover' }) {
  return (
    <Link to={to} className={className}>
      <p className="m-0 d-flex justify-content-between align-items-center">
        {children}
        <ArrowLinkIcon />
      </p>
    </Link>
  );
}
