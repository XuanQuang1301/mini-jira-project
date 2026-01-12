import api from "./api";

export const login = async (credentials: any) => {
  const response = await api.post("/users/login", credentials);
  if (response.data.token) {
    // Lưu Token và thông tin User để dùng cho toàn bộ ứng dụng
    localStorage.setItem("token", response.data.token);
    localStorage.setItem("user", JSON.stringify(response.data.user));
  }
  return response.data;
};