import api from './api'

export const adminService = {
  // Dashboard
  getDashboard: () => api.get('/admin/dashboard').then(r => r.data),

  // Drugs
  getDrugs: (params?: object) => api.get('/admin/drugs', { params }).then(r => r.data),
  getDrug: (id: number) => api.get(`/admin/drugs/${id}`).then(r => r.data),
  createDrug: (data: object) => api.post('/admin/drugs', data).then(r => r.data),
  updateDrug: (id: number, data: object) => api.put(`/admin/drugs/${id}`, data).then(r => r.data),
  deleteDrug: (id: number) => api.delete(`/admin/drugs/${id}`),
  getMissingDrugs: () => api.get('/admin/drugs/missing').then(r => r.data),

  // Species
  getSpecies: () => api.get('/admin/species').then(r => r.data),
  createSpecies: (name: string) => api.post('/admin/species', { name }).then(r => r.data),
  deleteSpecies: (id: number) => api.delete(`/admin/species/${id}`),

  // Indications
  getIndications: () => api.get('/admin/indications').then(r => r.data),
  createIndication: (name: string) => api.post('/admin/indications', { name }).then(r => r.data),
  deleteIndication: (id: number) => api.delete(`/admin/indications/${id}`),

  // Ingredients
  getIngredients: (search?: string) => api.get('/admin/ingredients', { params: { search } }).then(r => r.data),
  createIngredient: (name: string) => api.post('/admin/ingredients', { name }).then(r => r.data),
  deleteIngredient: (id: number) => api.delete(`/admin/ingredients/${id}`),

  // Sources
  getSources: () => api.get('/admin/sources').then(r => r.data),
  createSource: (data: object) => api.post('/admin/sources', data).then(r => r.data),
  deleteSource: (id: number) => api.delete(`/admin/sources/${id}`),

  // Import
  importExcel: (file: File) => {
    const form = new FormData()
    form.append('file', file)
    return api.post('/admin/import/excel', form, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data)
  },

  // Users
  getUsers: () => api.get('/admin/users').then(r => r.data),
  updateUserRole: (id: number, data: object) => api.put(`/admin/users/${id}/role`, data).then(r => r.data),

  // Audit Logs
  getAuditLogs: (params?: object) => api.get('/admin/audit-logs', { params }).then(r => r.data),

  // Chatbot Logs
  getChatbotLogs: (params?: object) => api.get('/admin/chatbot-logs', { params }).then(r => r.data),

  // Therapeutic Groups
  getTherapeuticGroups: () => api.get('/admin/therapeutic-groups').then(r => r.data),
  getTherapeuticGroup: (id: number) => api.get(`/admin/therapeutic-groups/${id}`).then(r => r.data),
  createTherapeuticGroup: (data: object) => api.post('/admin/therapeutic-groups', data).then(r => r.data),
  updateTherapeuticGroup: (id: number, data: object) => api.put(`/admin/therapeutic-groups/${id}`, data).then(r => r.data),
  deleteTherapeuticGroup: (id: number) => api.delete(`/admin/therapeutic-groups/${id}`),
  addDrugToGroup: (groupId: number, drugId: number) => api.post(`/admin/therapeutic-groups/${groupId}/drugs/${drugId}`).then(r => r.data),
  removeDrugFromGroup: (groupId: number, drugId: number) => api.delete(`/admin/therapeutic-groups/${groupId}/drugs/${drugId}`),
}
