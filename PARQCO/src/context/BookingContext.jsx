import { createContext, useState } from "react";
import { mockBookings } from "../data/mockData";

// FRONTEND-ONLY STATE (development). Bookings live in memory and reset on refresh.
// Replace with bookingService calls to the Node.js API; the backend must validate and store bookings.
export const BookingContext = createContext(null);

export function BookingProvider({ children }) {
  const [bookings, setBookings] = useState(mockBookings);

  const addBooking = (booking) =>
    setBookings((current) => [{ ...booking, _id: `local-${Date.now()}`, status: "confirmed" }, ...current]);

  const cancelBooking = (id) =>
    setBookings((current) => current.map((b) => (b._id === id ? { ...b, status: "cancelled" } : b)));

  return (
    <BookingContext.Provider value={{ bookings, addBooking, cancelBooking }}>
      {children}
    </BookingContext.Provider>
  );
}
