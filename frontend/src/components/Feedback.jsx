import { AlertCircle, CheckCircle2, Inbox } from 'lucide-react';

export function Alert({ type = 'error', children }) {
  if (!children) return null;
  const Icon = type === 'success' ? CheckCircle2 : AlertCircle;
  return (
    <div className={`alert alert--${type}`} role={type === 'error' ? 'alert' : 'status'}>
      <Icon size={18} />
      <span>{children}</span>
    </div>
  );
}

export function EmptyState({ title, message, action }) {
  return (
    <div className="empty">
      <Inbox size={28} />
      <h3>{title}</h3>
      {message && <p>{message}</p>}
      {action}
    </div>
  );
}

export function Loading({ label = 'Loading…' }) {
  return <div className="page-loading">{label}</div>;
}
