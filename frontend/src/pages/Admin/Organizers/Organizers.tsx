import { useState } from "react";
import "./Organizers.css";

const Organizers = () => {

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:5001/api/users/organizers",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(form),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to create organizer"
        );
      }

      setMessage("Organizer created successfully.");

      setForm({
        name: "",
        email: "",
        phone: "",
        password: "",
      });
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="organizers-page">
      <div className="organizers-header">
        <div>
          <span>ADMINISTRATION</span>
          <h1>Organizers</h1>
          <p>
            Create and manage tournament organizers.
          </p>
        </div>
      </div>

      <div className="organizer-form-card">
        <h2>Create Organizer</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-field">
              <label>Name</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Organizer name"
                required
              />
            </div>

            <div className="form-field">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="organizer@example.com"
                required
              />
            </div>

            <div className="form-field">
              <label>Phone</label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="Phone number"
              />
            </div>

            <div className="form-field">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Temporary password"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Organizer"}
          </button>
        </form>

        {message && (
          <p className="organizer-message">
            {message}
          </p>
        )}
      </div>
    </section>
  );
};

export default Organizers;