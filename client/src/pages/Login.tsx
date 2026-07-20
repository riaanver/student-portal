import { useState, type ChangeEvent, type SubmitEvent } from "react";

import { loginStudent, type LoginData } from "../services/auth.service";

const initialFormData: LoginData = {
  email: "",
  password: "",
};

export default function Login() {
  const [formData, setFormData] = useState<LoginData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
  event.preventDefault();

  setError("");
  setSuccess("");
  setLoading(true);

  try {
    const result = await loginStudent(formData);

    localStorage.setItem("token", result.token);

    if (result.student?.passwordChanged === false) {
      // Redirect to change-password next.
    } else {
      // Redirect to dashboard next.
    }

    setSuccess(result.message || "Login successful!");
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
      <h1>Student Login</h1>

      {error && <p role="alert">{error}</p>}
      {success && <p>{success}</p>}

      <form onSubmit={handleSubmit}>
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
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </main>
  );
}

// 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdHVkZW50SWQiOjMsImVtYWlsIjoicnYyNDY5QG55dS5lZHUiLCJwYXNzd29yZENoYW5nZWQiOmZhbHNlLCJpYXQiOjE3ODQ1ODY3OTAsImV4cCI6MTc4NDU5MDM5MH0.fv6PypH4hWEL-qntgAjNbwYrYA1hsOZcnImTLElkbmo'