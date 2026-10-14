import axios from "axios";

const api = axios.create({
  baseURL: `${process.env.REACT_APP_BACKEND_URL}/api`,
  withCredentials: true,
});

export function formatApiError(e, fallback = "Coś poszło nie tak. Spróbuj ponownie.") {
  const d = e?.response?.data?.detail;
  if (typeof d === "string") return d;
  if (Array.isArray(d)) return d.map((x) => x?.msg || "").filter(Boolean).join(", ") || fallback;
  if (d?.msg) return d.msg;
  return fallback;
}

export default api;
