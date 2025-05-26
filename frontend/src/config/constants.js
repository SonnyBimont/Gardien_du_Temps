// src/config/constants.js
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
export const API_ENDPOINTS = {
  AUTH: '/api/auth',
  USERS: '/api/users',
  PROJECTS: '/api/projects',
  STRUCTURES: '/api/structures',
  TIME: '/api/time'
};