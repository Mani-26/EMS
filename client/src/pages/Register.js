import { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

export default function Register() {
  const [email, setEmail] = useState("");
  const [availableSeats, setAvailableSeats] = useState(null);
  const { eventId } = useParams();

  // Fetch event details (including available seats)
  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/events/${eventId}`);
        setAvailableSeats(res.data.seatLimit - res.data.registeredUsers);
      } catch (error) {
        console.error("Error fetching event details:", error);
      }
    };
    fetchEventDetails();
  }, [eventId]);

  // Handle registration
  const handleRegister = async () => {
    if (!email) {
      alert("Please enter your email.");
      return;
    }

    try {
      await axios.post("http://localhost:5000/api/register", { email, eventId });
      alert("✅ Registration successful! Check your email.");
      setAvailableSeats((prevSeats) => prevSeats - 1); // Reduce seat count
    } catch (error) {
      console.error("Registration error:", error);
      alert("❌ Registration failed. Try again later.");
    }
  };

  return (
    <div className="register-container">
      <h1>Register for Event</h1>
      {availableSeats !== null ? (
        <p className="seat-info">🎟 Available Tickets: {availableSeats}</p>
      ) : (
        <p>Loading available seats...</p>
      )}
      <input
        type="email"
        placeholder="Your Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="input-field"
      />
      <button onClick={handleRegister} disabled={availableSeats === 0} className="register-button">
        {availableSeats === 0 ? "Sold Out" : "Register"}
      </button>
    </div>
  );
}
