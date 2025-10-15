// Validation helpers for auth

export function validateSignup({ name, username, email, password }) {
  if (!name || !username || !email || !password) {
    return 'Name, username, email, and password are required.';
  }
  // Simple email format check
  const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
  if (!emailRegex.test(email)) {
    return 'Invalid email format.';
  }
  // Username length
  if (username.length < 3) {
    return 'Username must be at least 3 characters.';
  }
  // Password length
  if (password.length < 4) {
    return 'Password must be at least 4 characters.';
  }
  return null;
}

export function validateLogin({ username, password }) {
  if (!username || !password) {
    return 'Username and password are required.';
  }
  return null;
}
