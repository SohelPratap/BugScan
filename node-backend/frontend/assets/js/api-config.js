// API Configuration
const API_BASE_URL = "http://localhost:5001";

class APIError extends Error {
    constructor(message, status) {
        super(message);
        this.status = status;
    }
}

function getAPIErrorMessage(error) {
    if (error instanceof APIError) {
        return error.message;
    }
    return "Could not connect to the server. Please try again later.";
}

const API = {
    login: async (email, password) => {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();
        if (!response.ok) {
            throw new APIError(data.error || "Login failed.", response.status);
        }
        return data;
    },

    register: async (name, email, password) => {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password })
        });
        const data = await response.json();
        if (!response.ok) {
            throw new APIError(data.error || "Registration failed.", response.status);
        }
        return data;
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