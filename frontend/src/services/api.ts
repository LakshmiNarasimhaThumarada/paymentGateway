import axios from 'axios'

const api = axios.create({
  baseURL: '', // The Vite proxy will route anything starting with /api to the backend
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request Interceptor to add JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response Interceptor to handle session expiration (401 / 403)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status
      if (status === 401) {
        // Token expired or invalid
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        // We can reload or let the AuthContext handle state change
        window.dispatchEvent(new Event('auth-logout'))
      }
    }
    return Promise.reject(error)
  }
)

export default api
