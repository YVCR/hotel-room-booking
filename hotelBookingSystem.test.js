const request = require("supertest");
const app = require("./hotelBookingSystem");

describe("Hotel Room Booking System", () => {
  it("should book a room successfully", async () => {
    const res = await request(app)
      .post("/book")
      .send({
        name: "Alice",
        email: "alice@example.com",
        phone: "1234567890",
        checkIn: "2025-04-01",
        checkOut: "2025-04-03"
      });
    expect(res.statusCode).toBe(200);
    expect(res.body.booking).toHaveProperty("roomNo");
  });

  it("should return user bookings", async () => {
    const res = await request(app).get("/booking?email=alice@example.com");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("should return all guests currently staying", async () => {
    const res = await request(app).get("/guests");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
