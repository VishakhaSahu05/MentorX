import { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../utils/constant";

export default function MentorCalendar() {
  const [events, setEvents] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState(60);

  useEffect(() => {
  fetchEvents();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

  const fetchEvents = async () => {
    const res = await axios.get(BASE_URL + "/calendar/event", {
      withCredentials: true,
    });
    setEvents(res.data);
  };
  

  const handleAdd = async () => {
    if (!title || !date || !time) return;

    const startAt = new Date(`${date}T${time}`);
    const endAt = new Date(startAt.getTime() + duration * 60000);

    const res = await axios.post(
      BASE_URL + "/calendar/event",
      { title, startAt, endAt },
      { withCredentials: true }
    );

    setEvents((prev) => [...prev, res.data]);
    setShowForm(false);
    setTitle("");
    setDate("");
    setTime("");
    setDuration(60);
  };

  const handleDelete = async (id) => {
    await axios.delete(BASE_URL + "/calendar/event/" + id, {
      withCredentials: true,
    });
    setEvents((prev) => prev.filter((e) => e._id !== id));
  };

  // 🔹 Group events by date
  const groupedEvents = events.reduce((acc, event) => {
    const d = new Date(event.startAt).toDateString();
    acc[d] = acc[d] || [];
    acc[d].push(event);
    return acc;
  }, {});

  return (
    <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">📅 My Calendar</h2>
        <button
          onClick={() => setShowForm((p) => !p)}
          className="bg-emerald-600 text-white px-4 py-2 rounded-full text-sm hover:bg-emerald-700"
        >
          + Add Event
        </button>
      </div>

      {/* ADD EVENT (smooth reveal) */}
      {showForm && (
        <div className="mb-6 bg-emerald-50 p-4 rounded-xl space-y-3">
          <input
            placeholder="Event title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
          />

          <div className="flex gap-3">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border rounded-lg px-3 py-2"
            />
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="border rounded-lg px-3 py-2"
            />
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(+e.target.value)}
              className="border rounded-lg px-3 py-2 w-24"
            />
          </div>

          <button
            onClick={handleAdd}
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg"
          >
            Save
          </button>
        </div>
      )}

      {/* EVENTS */}
      {Object.keys(groupedEvents).length === 0 ? (
        <p className="text-gray-500 text-center py-10">
          No events scheduled ✨
        </p>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedEvents).map(([date, items]) => (
            <div key={date}>
              <p className="text-sm font-semibold text-gray-600 mb-3">
                {date}
              </p>

              <div className="space-y-2">
                {items.map((event) => (
                  <div
                    key={event._id}
                    className="flex items-center justify-between bg-emerald-50 border-l-4 border-emerald-500 rounded-lg px-4 py-3 hover:bg-emerald-100 transition"
                  >
                    <div>
                      <p className="font-medium">{event.title}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(event.startAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>

                    <button
                      onClick={() => handleDelete(event._id)}
                      className="text-xs text-red-500 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
