import api from "@/lib/axios";

const buildErrorMessage = (error, fallback) => {
  const data = error?.response?.data;
  if (!data) return fallback;

  if (typeof data === "string") return data;
  if (typeof data?.detail === "string") return data.detail;

  if (typeof data === "object") {
    const parts = Object.entries(data)
      .map(([field, value]) => {
        if (Array.isArray(value)) {
          return `${field}: ${value.join(" ")}`;
        }
        if (typeof value === "string") {
          return `${field}: ${value}`;
        }
        return null;
      })
      .filter(Boolean);

    if (parts.length) return parts.join(" | ");
  }

  return fallback;
};

export const registerUser = async ({
  email,
  username,
  password,
  profilePhoto,
}) => {
  try {
    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);
    const trimmedUsername =
      typeof username === "string" ? username.trim() : "";
    if (trimmedUsername) {
      formData.append("username", trimmedUsername);
    }

    if (profilePhoto) {
      formData.append("profile_photo", profilePhoto);
    }

    const response = await api.post("/register/", formData);
    return response.data;
  } catch (error) {
    throw new Error(
      buildErrorMessage(
        error,
        "Registration failed. Please check your details and try again."
      )
    );
  }
};

export const loginUser = async (email, password) => {
  try {
    const response = await api.post("/login/", { email, password });
    return response.data;
  } catch (error) {
    throw new Error(
      buildErrorMessage(
        error,
        "Login failed. Please check your credentials and try again."
      )
    );
  }
};

export const logoutUser = async () => {
  try {
    const response = await api.post("/logout/", null);
    return response.data;
  } catch (error) {
    throw new Error(buildErrorMessage(error, "Logout failed."));
  }
};

export const getUserInfo = async () => {
  try {
    const response = await api.get("/me");
    return response.data;
  } catch (error) {
    throw new Error(buildErrorMessage(error, "Unable to load your profile."));
  }
};

export const refreshToken = async () => {
  try {
    const response = await api.post("/refresh/", null);
    return response.data;
  } catch (error) {
    throw new Error(buildErrorMessage(error, "Session refresh failed."));
  }
};
