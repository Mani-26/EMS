import { useState, useEffect } from "react";
import axios from "axios";

export default function Admin() {
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [seatLimit, setSeatLimit] = useState("");
  const [events, setEvents] = useState([]);
  const [editingEvent, setEditingEvent] = useState(null);
  const [showForm, setShowForm] = useState(false); // Toggle form visibility

  // Fetch all events
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/events");
      setEvents(res.data);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  // Create or Update an event
  const handleSaveEvent = async () => {
    if (!name || !date || !description || !seatLimit) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      if (editingEvent) {
        // Update existing event
        await axios.put(`http://localhost:5000/api/events/${editingEvent._id}`, {
          name, date, description, seatLimit,
        });
        alert("✅ Event updated successfully!");
      } else {
        // Create new event
        await axios.post("http://localhost:5000/api/events", {
          name, date, description, seatLimit,
        });
        alert("✅ Event created successfully!");
      }

      setName(""); setDate(""); setDescription(""); setSeatLimit(""); 
      setEditingEvent(null);
      setShowForm(false); // Hide form after saving
      fetchEvents();
    } catch (error) {
      console.error("Error saving event:", error);
      alert("Failed to save event.");
    }
  };

  // Delete an event
  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/events/${eventId}`);
      alert("❌ Event deleted successfully!");
      fetchEvents();
    } catch (error) {
      console.error("Error deleting event:", error);
      alert("Failed to delete event.");
    }
  };

  // Load event data into form for editing
  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setName(event.name);
    setDate(event.date);
    setDescription(event.description);
    setSeatLimit(event.seatLimit);
    setShowForm(true);
  };

  // Show form for new event
  const handleShowCreateForm = () => {
    setEditingEvent(null);
    setName(""); setDate(""); setDescription(""); setSeatLimit("");
    setShowForm(true);
  };

  return (
    <div className="admin-container">
      <h1>🎯 Admin - Manage Events</h1>

      {showForm && (
        <div className="event-form">
          <h2>{editingEvent ? "✏️ Edit Event" : "➕ Create Event"}</h2>
          <input type="text" placeholder="Event Name" value={name} onChange={(e) => setName(e.target.value)} />
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <textarea placeholder="Event Description" value={description} onChange={(e) => setDescription(e.target.value)} />
          <input type="number" placeholder="Seat Limit" value={seatLimit} onChange={(e) => setSeatLimit(e.target.value)} />
          <button onClick={handleSaveEvent}>{editingEvent ? "Update Event" : "Create Event"}</button>
        </div>
      )}

      <h2>📌 All Events</h2>
      <div className="event-list">
        {events.map(event => (
          <div key={event._id} className="event-card">
            <h3>{event.name}</h3>
            <p>📅 {event.date}</p>
            <p>{event.description}</p>
            <p>🎟 Seats: {event.seatLimit}</p>
            <button className="edit-button" onClick={() => handleEditEvent(event)}>✏️ Edit</button>
            <button className="delete-button" onClick={() => handleDeleteEvent(event._id)}>❌ Delete</button>
          </div>
        ))}
      </div>

      {/* Floating "+" Button */}
      <button className="floating-button" onClick={handleShowCreateForm}>+</button>
    </div>
  );
}
