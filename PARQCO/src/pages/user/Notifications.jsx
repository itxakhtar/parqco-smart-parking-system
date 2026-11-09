import { useState } from "react";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import NotificationItem from "../../components/user/NotificationItem";
import { mockNotifications } from "../../data/mockData";

// TODO: load from a notification service once the backend exists.
function Notifications() {
  const [items, setItems] = useState(mockNotifications);
  const unreadCount = items.filter((n) => !n.read).length;
  const markAllRead = () => setItems((current) => current.map((n) => ({ ...n, read: true })));

  return (
    <div>
      <div className="page-header">
        <h1>Notifications</h1>
        <p className="muted">Development data. Read status resets on refresh: backend integration pending.</p>
      </div>
      <Card
        title={`${unreadCount} unread`}
        actions={<Button size="sm" variant="secondary" disabled={unreadCount === 0} onClick={markAllRead}>Mark all as read</Button>}
      >
        {items.length === 0 ? <p>No notifications yet.</p> : items.map((n) => <NotificationItem key={n._id} notification={n} />)}
      </Card>
    </div>
  );
}

export default Notifications;
