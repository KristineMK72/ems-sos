// src/api.js
// API_BASE must match the port your backend Docker container is exposing
export const API_BASE = "http://localhost:5000";

export async function post(path, body, token) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify(body)
  });
  
  // Attempt to parse JSON response for error messages or data
  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return res.json();
  }
  
  // If no JSON, return a generic error or the response object
  return res.statusText || res;
}