// UserService: handles user-related API calls (SRP)

const API_URL = 'http://localhost:5000/api/auth';

class UserService {
  static async login(username, password) {
    const res = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    return res.json();
  }

  static async signup({ name, username, email, password }) {
    const res = await fetch(`${API_URL}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, username, email, password })
    });
    return res.json();
  }

  static async getProfile(token) {
    const res = await fetch(`${API_URL}/profile`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  }
}

export default UserService;
