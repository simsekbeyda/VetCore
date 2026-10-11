import api from './api'

export const vetService = {
  searchDrugs: (params: object) => api.get('/vet/drugs', { params }).then(r => r.data),
  getDrug: (id: number) => api.get(`/vet/drugs/${id}`).then(r => r.data),

  getSpecies: () => api.get('/vet/filters/species').then(r => r.data),
  getIndications: () => api.get('/vet/filters/indications').then(r => r.data),
  getTherapeuticGroups: () => api.get('/vet/filters/therapeutic-groups').then(r => r.data),

  getFavorites: () => api.get('/vet/favorites').then(r => r.data),
  addFavorite: (id: number) => api.post(`/vet/favorites/${id}`).then(r => r.data),
  removeFavorite: (id: number) => api.delete(`/vet/favorites/${id}`),
}
