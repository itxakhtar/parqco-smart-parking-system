const TYPE_LABELS = { parking: "Parking", booking: "Booking", system: "System" };

function NotificationItem({ notification }) {
  return (
    <div className={`notification ${notification.read ? "" : "unread"}`.trim()}>
      <div>
        <span className="badge badge-neutral">{TYPE_LABELS[notification.type]}</span>
        <p>{notification.message}</p>
        <p className="muted">{notification.time}</p>
      </div>
      {!notification.read && <span className="unread-label">New</span>}
    </div>
  );
}

export default NotificationItem;
