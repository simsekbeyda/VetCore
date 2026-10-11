import api from './api'

export const ownerService = {
  getProfile: () => api.get('/owner/profile').then(r => r.data),
  updateProfile: (data: object) => api.put('/owner/profile', data).then(r => r.data),

  getPets: () => api.get('/owner/pets').then(r => r.data),
  createPet: (data: object) => api.post('/owner/pets', data).then(r => r.data),
  updatePet: (id: number, data: object) => api.put(`/owner/pets/${id}`, data).then(r => r.data),
  deletePet: (id: number) => api.delete(`/owner/pets/${id}`),

  getVisits: (petId: number) => api.get(`/owner/pets/${petId}/visits`).then(r => r.data),
  addVisit: (petId: number, data: object) => api.post(`/owner/pets/${petId}/visits`, data).then(r => r.data),
  deleteVisit: (petId: number, visitId: number) => api.delete(`/owner/pets/${petId}/visits/${visitId}`),

  getMedications: (petId: number) => api.get(`/owner/pets/${petId}/medications`).then(r => r.data),
  addMedication: (petId: number, data: object) => api.post(`/owner/pets/${petId}/medications`, data).then(r => r.data),
  deleteMedication: (petId: number, medId: number) => api.delete(`/owner/pets/${petId}/medications/${medId}`),

  getSchedules: (petId: number) => api.get(`/owner/pets/${petId}/schedules`).then(r => r.data),
  addSchedule: (petId: number, data: object) => api.post(`/owner/pets/${petId}/schedules`, data).then(r => r.data),
  toggleSchedule: (petId: number, schId: number) => api.put(`/owner/pets/${petId}/schedules/${schId}/toggle`).then(r => r.data),
  deleteSchedule: (petId: number, schId: number) => api.delete(`/owner/pets/${petId}/schedules/${schId}`),

  listDrugs: (params?: object) => api.get('/owner/drugs', { params }).then(r => r.data),
  searchDrugs: (search: string) => api.get('/owner/drugs/search', { params: { search } }).then(r => r.data),
  getDrug: (id: number) => api.get(`/owner/drugs/${id}`).then(r => r.data),
}
