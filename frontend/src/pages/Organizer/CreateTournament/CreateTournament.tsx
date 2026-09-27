import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CreateTournament.css";

type Category = {
  name: string;
  gender: string;
  ageGroup: string;
  eligibility: string;
  capacity: string;
  fee: string;
};

const emptyCategory: Category = {
  name: "",
  gender: "",
  ageGroup: "",
  eligibility: "",
  capacity: "",
  fee: "",
};

const CreateTournament = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    sport: "",
    description: "",
    venue: "",
    location: "",
    startDate: "",
    endDate: "",
    registrationOpen: "",
    registrationClose: "",
    capacity: "",
    rules: "",
    contactInformation: "",
    banner: "",
  });

  const [categories, setCategories] = useState<Category[]>([
    { ...emptyCategory },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCategoryChange = (
    index: number,
    field: keyof Category,
    value: string
  ) => {
    setCategories((prev) =>
      prev.map((category, i) =>
        i === index
          ? {
              ...category,
              [field]: value,
            }
          : category
      )
    );
  };

  const addCategory = () => {
    setCategories((prev) => [...prev, { ...emptyCategory }]);
  };

  const removeCategory = (index: number) => {
    if (categories.length === 1) return;

    setCategories((prev) => prev.filter((_, i) => i !== index));
  };

  const createSlug = (value: string) => {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleNameChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      name: value,
      slug: createSlug(value),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Please login again");
      }

      const response = await fetch(
        "http://localhost:5001/api/tournaments",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: formData.name,
            slug: formData.slug,
            sport: formData.sport,
            venue: formData.venue || undefined,
            location: formData.location || undefined,
            startDate: formData.startDate,
            endDate: formData.endDate,
            registrationOpen:
              formData.registrationOpen || undefined,
            registrationClose:
              formData.registrationClose || undefined,
            description: formData.description || undefined,
            rules: formData.rules || undefined,
            capacity: formData.capacity
              ? Number(formData.capacity)
              : undefined,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to create tournament"
        );
      }

      const tournamentId = data.data.id;

      for (const category of categories) {
        if (!category.name.trim()) continue;

        const categoryResponse = await fetch(
          `http://localhost:5001/api/categories/${tournamentId}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              name: category.name,
              gender: category.gender || undefined,
              ageGroup: category.ageGroup || undefined,
              eligibility:
                category.eligibility || undefined,
              capacity: category.capacity
                ? Number(category.capacity)
                : undefined,
              fee: category.fee
                ? Number(category.fee)
                : 0,
            }),
          }
        );

        const categoryData = await categoryResponse.json();

        if (!categoryResponse.ok) {
          throw new Error(
            categoryData.message ||
              "Tournament created but category creation failed"
          );
        }
      }

      navigate(`/tournaments/${data.data.slug}`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="create-tournament-page">
      <div className="create-tournament-header">
        <div>
          <span className="create-tournament-eyebrow">
            Organizer Panel
          </span>

          <h1>Create Tournament</h1>

          <p>
            Set up your tournament details, categories and
            registration configuration.
          </p>
        </div>

        <button
          type="button"
          className="create-back-button"
          onClick={() => navigate("/organizer/tournaments")}
        >
          ← Back
        </button>
      </div>

      <form
        className="create-tournament-form"
        onSubmit={handleSubmit}
      >
        <div className="form-section">
          <div className="form-section-heading">
            <span>01</span>

            <div>
              <h2>Basic Information</h2>
              <p>Enter the main details of your tournament.</p>
            </div>
          </div>

          <div className="form-grid">
            <div className="form-field form-field-full">
              <label htmlFor="name">Tournament Name *</label>

              <input
                id="name"
                name="name"
                type="text"
                placeholder="e.g. AETHENIX Series 01"
                value={formData.name}
                onChange={(e) =>
                  handleNameChange(e.target.value)
                }
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="slug">Slug *</label>

              <input
                id="slug"
                name="slug"
                type="text"
                placeholder="aethenix-series-01"
                value={formData.slug}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="sport">Sport *</label>

              <input
                id="sport"
                name="sport"
                type="text"
                placeholder="e.g. Badminton"
                value={formData.sport}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="venue">Venue</label>

              <input
                id="venue"
                name="venue"
                type="text"
                placeholder="e.g. Test Arena"
                value={formData.venue}
                onChange={handleChange}
              />
            </div>

            <div className="form-field">
              <label htmlFor="location">Location</label>

              <input
                id="location"
                name="location"
                type="text"
                placeholder="e.g. Delhi"
                value={formData.location}
                onChange={handleChange}
              />
            </div>

            <div className="form-field form-field-full">
              <label htmlFor="description">
                Description
              </label>

              <textarea
                id="description"
                name="description"
                rows={5}
                placeholder="Describe the tournament..."
                value={formData.description}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <div className="form-section-heading">
            <span>02</span>

            <div>
              <h2>Schedule & Registration</h2>
              <p>Define the tournament and registration window.</p>
            </div>
          </div>

          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="startDate">Start Date *</label>

              <input
                id="startDate"
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="endDate">End Date *</label>

              <input
                id="endDate"
                name="endDate"
                type="date"
                value={formData.endDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="registrationOpen">
                Registration Opens
              </label>

              <input
                id="registrationOpen"
                name="registrationOpen"
                type="date"
                value={formData.registrationOpen}
                onChange={handleChange}
              />
            </div>

            <div className="form-field">
              <label htmlFor="registrationClose">
                Registration Closes
              </label>

              <input
                id="registrationClose"
                name="registrationClose"
                type="date"
                value={formData.registrationClose}
                onChange={handleChange}
              />
            </div>

            <div className="form-field">
              <label htmlFor="capacity">
                Overall Capacity
              </label>

              <input
                id="capacity"
                name="capacity"
                type="number"
                min="1"
                placeholder="e.g. 100"
                value={formData.capacity}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <div className="form-section-heading">
            <span>03</span>

            <div>
              <h2>Categories</h2>
              <p>
                Configure the categories athletes can register for.
              </p>
            </div>
          </div>

          <div className="categories-list">
            {categories.map((category, index) => (
              <div className="category-card" key={index}>
                <div className="category-card-header">
                  <div>
                    <span>Category {index + 1}</span>
                    <h3>Competition Category</h3>
                  </div>

                  {categories.length > 1 && (
                    <button
                      type="button"
                      className="remove-category"
                      onClick={() => removeCategory(index)}
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="form-grid">
                  <div className="form-field form-field-full">
                    <label>Category Name *</label>

                    <input
                      type="text"
                      placeholder="e.g. Men's Singles"
                      value={category.name}
                      onChange={(e) =>
                        handleCategoryChange(
                          index,
                          "name",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div className="form-field">
                    <label>Gender</label>

                    <select
                      value={category.gender}
                      onChange={(e) =>
                        handleCategoryChange(
                          index,
                          "gender",
                          e.target.value
                        )
                      }
                    >
                      <option value="">Select Gender</option>
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="MIXED">Mixed</option>
                    </select>
                  </div>

                  <div className="form-field">
                    <label>Age Group</label>

                    <input
                      type="text"
                      placeholder="e.g. Open / U-19"
                      value={category.ageGroup}
                      onChange={(e) =>
                        handleCategoryChange(
                          index,
                          "ageGroup",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div className="form-field">
                    <label>Capacity</label>

                    <input
                      type="number"
                      min="1"
                      placeholder="e.g. 32"
                      value={category.capacity}
                      onChange={(e) =>
                        handleCategoryChange(
                          index,
                          "capacity",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div className="form-field">
                    <label>Registration Fee</label>

                    <input
                      type="number"
                      min="0"
                      placeholder="e.g. 500"
                      value={category.fee}
                      onChange={(e) =>
                        handleCategoryChange(
                          index,
                          "fee",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div className="form-field form-field-full">
                    <label>Eligibility</label>

                    <input
                      type="text"
                      placeholder="e.g. Open to eligible athletes"
                      value={category.eligibility}
                      onChange={(e) =>
                        handleCategoryChange(
                          index,
                          "eligibility",
                          e.target.value
                        )
                      }
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            className="add-category-button"
            onClick={addCategory}
          >
            + Add Another Category
          </button>
        </div>

        <div className="form-section">
          <div className="form-section-heading">
            <span>04</span>

            <div>
              <h2>Rules & Contact</h2>
              <p>Add important tournament information.</p>
            </div>
          </div>

          <div className="form-grid">
            <div className="form-field form-field-full">
              <label htmlFor="rules">Rules</label>

              <textarea
                id="rules"
                name="rules"
                rows={6}
                placeholder="Enter tournament rules and regulations..."
                value={formData.rules}
                onChange={handleChange}
              />
            </div>

            <div className="form-field form-field-full">
              <label htmlFor="contactInformation">
                Contact Information
              </label>

              <textarea
                id="contactInformation"
                name="contactInformation"
                rows={4}
                placeholder="Organizer contact details..."
                value={formData.contactInformation}
                onChange={handleChange}
              />
            </div>

            <div className="form-field form-field-full">
              <label htmlFor="banner">
                Tournament Image / Banner
              </label>

              <input
                id="banner"
                name="banner"
                type="text"
                placeholder="Banner image URL"
                value={formData.banner}
                onChange={handleChange}
              />

              <small>
                Image upload/storage will be connected separately.
              </small>
            </div>
          </div>
        </div>

        {error && (
          <div className="create-form-error">
            {error}
          </div>
        )}

        <div className="create-form-actions">
          <button
            type="button"
            className="cancel-button"
            onClick={() =>
              navigate("/organizer/tournaments")
            }
          >
            Cancel
          </button>

          <button
            type="submit"
            className="submit-tournament-button"
            disabled={loading}
          >
            {loading
              ? "Creating Tournament..."
              : "Create Tournament"}
          </button>
        </div>
      </form>
    </section>
  );
};

export default CreateTournament;