import {
  type ChangeEvent,
  type SubmitEvent,
  useState,
} from "react";

import {
  registerStudent,
  type RegisterData,
} from "../services/auth.service";

const initialFormData: RegisterData = {
  name: "",
  email: "",
  mobile: "",
  qualification: "",
  emergencyContact: "",
  address: "",
};

export default function Register() {
  const [formData, setFormData] =
    useState<RegisterData>(initialFormData);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  };

  const handleSubmit = async (
    event: SubmitEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const result = await registerStudent(formData);

      setSuccess(result.message);
      setFormData(initialFormData);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Something went wrong.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main>
      <h1>Student Registration</h1>

      {error && <p>{error}</p>}
      {success && <p>{success}</p>}

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">Name</label>
          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label htmlFor="mobile">Mobile</label>
          <input
            id="mobile"
            name="mobile"
            type="tel"
            value={formData.mobile}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label htmlFor="qualification">Qualification</label>
          <input
            id="qualification"
            name="qualification"
            type="text"
            value={formData.qualification}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label htmlFor="emergencyContact">
            Emergency contact
          </label>
          <input
            id="emergencyContact"
            name="emergencyContact"
            type="tel"
            value={formData.emergencyContact}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label htmlFor="address">Address</label>
          <textarea
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </button>
      </form>
    </main>
  );
}