export const validators = {
  message: (text) => {
    if (!text?.trim()) throw new Error('Message cannot be empty');
    if (text.length > 2000) throw new Error('Message too long');
    return text.trim();
  },

  email: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) throw new Error('Invalid email format');
    return email.toLowerCase();
  },

  password: (password) => {
    if (password.length < 8) throw new Error('Password too short');
    if (!/[A-Z]/.test(password)) throw new Error('Password must contain uppercase letter');
    if (!/[0-9]/.test(password)) throw new Error('Password must contain number');
    return password;
  }
};