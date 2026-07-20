export type RegisterData = {
  name: string;
  email: string;
  mobile: string;
  qualification: string;
  emergencyContact: string;
  address: string;
};

type RegisterResponse = {
  message: string;
  student?: {
    id: number;
    name: string;
    email: string;
    passwordChanged: boolean;
  };
};

const API_URL = "http://localhost:3000/api/auth";

export async function registerStudent(
  data: RegisterData
): Promise<RegisterResponse> {
  const response = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || result.error || "Registration failed.");
  }

  return result;
}