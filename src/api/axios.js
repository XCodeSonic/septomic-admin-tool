import axios from 'axios'

const api = axios.create({
  baseURL: 'http://154.7.228.161/septomic-api',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export default api