const STYLES = {
  pending: { label: 'Pending payment', bg: '#fef3c7', fg: '#92400e' },
  paid: { label: 'Paid', bg: '#dbeafe', fg: '#1e40af' },
  confirmed: { label: 'Confirmed', bg: '#dcfce7', fg: '#166534' },
  expired: { label: 'Expired', bg: '#f3f4f6', fg: '#4b5563' },
  cancelled: { label: 'Cancelled', bg: '#fee2e2', fg: '#991b1b' },
};

export default function StatusBadge({ status }) {
  const s = STYLES[status] ?? { label: status, bg: '#f3f4f6', fg: '#374151' };
  return (
    <span
      style={{
        background: s.bg,
        color: s.fg,
        padding: '2px 10px',
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 600,
        whiteSpace: 'nowrap',
      }}
    >
      {s.label}
    </span>
  );
}
