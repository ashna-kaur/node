const API_URL = 'http://localhost:5000/api';

export const login = async (email, password) => {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return res.json();
};

export const getEvents = async () => {
  const res = await fetch(`${API_URL}/events`);
  return res.json();
};

export const createEvent = async (eventData, token) => {
  const res = await fetch(`${API_URL}/events`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'x-auth-token': token 
    },
    body: JSON.stringify(eventData)
  });
  return res.json();
};
