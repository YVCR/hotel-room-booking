// hotelBookingSystem.js

const express = require("express");
const app = express();
app.use(express.json());

const PORT = 3000;
const TOTAL_ROOMS = 10;
let rooms = Array.from({ length: TOTAL_ROOMS }, (_, i) => ({ roomNo: i + 1, isBooked: false }));
let bookings = [];

function getAvailableRoom() {
  return rooms.find(room => !room.isBooked);
}

function isRoomOccupiedDuringDates(roomNo, checkIn, checkOut) {
  return bookings.some(booking => {
    return (
      booking.roomNo === roomNo &&
      ((checkIn >= booking.checkIn && checkIn < booking.checkOut) ||
       (checkOut > booking.checkIn && checkOut <= booking.checkOut) ||
       (checkIn <= booking.checkIn && checkOut >= booking.checkOut))
    );
  });
}

// Root welcome route
app.get("/", (req, res) => {
  res.send("🏨 Hotel Room Booking API is running.");
});

// 1. Book a room
app.post("/book", (req, res) => {
  const { name, email, phone, checkIn, checkOut } = req.body;
  const parsedCheckIn = new Date(checkIn);
  const parsedCheckOut = new Date(checkOut);

  for (let room of rooms) {
    if (!isRoomOccupiedDuringDates(room.roomNo, parsedCheckIn, parsedCheckOut)) {
      const booking = {
        id: bookings.length + 1,
        roomNo: room.roomNo,
        name,
        email,
        phone,
        checkIn: parsedCheckIn,
        checkOut: parsedCheckOut,
      };
      bookings.push(booking);
      room.isBooked = true;
      return res.json({ message: "Room booked successfully", booking });
    }
  }

  return res.status(400).json({ message: "No rooms available for selected dates" });
});

// 2. View booking details by email
app.get("/booking", (req, res) => {
  const { email } = req.query;
  const userBookings = bookings.filter(b => b.email === email);
  if (!userBookings.length) return res.status(404).json({ message: "No bookings found" });
  res.json(userBookings);
});

// 3. View all guests currently staying
app.get("/guests", (req, res) => {
  const now = new Date();
  const guests = bookings.filter(b => now >= b.checkIn && now <= b.checkOut);
  res.json(guests.map(g => ({ name: g.name, roomNo: g.roomNo })));
});

// 4. Cancel booking
app.delete("/cancel", (req, res) => {
  const { email, roomNo } = req.body;
  const index = bookings.findIndex(b => b.email === email && b.roomNo === roomNo);
  if (index === -1) return res.status(404).json({ message: "Booking not found" });

  rooms.find(r => r.roomNo === roomNo).isBooked = false;
  bookings.splice(index, 1);
  res.json({ message: "Booking cancelled successfully" });
});

// 5. Modify booking
app.put("/modify", (req, res) => {
  const { email, roomNo, newCheckIn, newCheckOut } = req.body;
  const booking = bookings.find(b => b.email === email && b.roomNo === roomNo);
  if (!booking) return res.status(404).json({ message: "Booking not found" });

  const parsedCheckIn = new Date(newCheckIn);
  const parsedCheckOut = new Date(newCheckOut);

  // Check if the new dates cause conflicts
  if (isRoomOccupiedDuringDates(roomNo, parsedCheckIn, parsedCheckOut)) {
    return res.status(400).json({ message: "Room not available for new dates" });
  }

  booking.checkIn = parsedCheckIn;
  booking.checkOut = parsedCheckOut;
  res.json({ message: "Booking modified successfully", booking });
});

// Export app for testing
module.exports = app;

if (require.main === module) {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}
