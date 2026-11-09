import { Link } from "react-router-dom";
import Card from "../../components/common/Card";
import BookingCard from "../../components/user/BookingCard";
import { useBookings } from "../../hooks/useBookings";
import { ROUTES } from "../../utils/constants";

function MyBookings() {
  const { bookings, cancelBooking } = useBookings();
  const upcoming = bookings.filter((b) => b.status === "confirmed");
  const previous = bookings.filter((b) => b.status !== "confirmed");

  return (
    <div>
      <div className="page-header">
        <h1>My bookings</h1>
        <p className="muted">Development data kept in memory. Cancelling only changes this screen: backend integration pending.</p>
      </div>
      <Card title="Upcoming">
        {upcoming.length === 0 ? (
          <p>No upcoming bookings. <Link to={ROUTES.USER.BOOK}>Book a slot</Link></p>
        ) : (
          upcoming.map((b) => <BookingCard key={b._id} booking={b} onCancel={cancelBooking} />)
        )}
      </Card>
      <Card title="Previous" className="section">
        {previous.length === 0 ? <p>No previous bookings.</p> : previous.map((b) => <BookingCard key={b._id} booking={b} />)}
      </Card>
    </div>
  );
}

export default MyBookings;
