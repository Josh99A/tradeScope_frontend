import api from "@/lib/axios";

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
  } catch (_e) {
    throw new Error("Registration failed!");
  }
};

export const loginUser = async (email, password) => {
  try {
    const response = await api.post("/login/", { email, password });
    return response.data;
  } catch (_e) {
    throw new Error("Login failed!");
  }
};

export const logoutUser = async () => {
  try {
    const response = await api.post("/logout/", null);
    return response.data;
  } catch (_e) {
    throw new Error("Logout failed!");
  }
};

export const getUserInfo = async () => {
  try {
    const response = await api.get("/me");
    return response.data;
  } catch (_e) {
    throw new Error("Getting user failed!");
  }
};

export const refreshToken = async () => {
  try {
    const response = await api.post("/refresh/", null);
    return response.data;
  } catch (_e) {
    throw new Error("Refreshing token failed!");
  }
};
