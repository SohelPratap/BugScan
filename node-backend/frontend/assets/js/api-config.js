// API Configuration
const API_BASE_URL = "http://localhost:5001";

const API = {
    login: async (email, password) => {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });
        return await response.json();
    },

    register: async (name, email, password) => {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password })
        });
        return await response.json();
    },

    verify: async (token) => {
        const response = await fetch(`${API_BASE_URL}/auth/verify`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        return await response.json();
    },

    logout: () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userName");
        localStorage.removeItem("userEmail");
        localStorage.removeItem("userId");
        localStorage.removeItem("loggedIn");
    }
};