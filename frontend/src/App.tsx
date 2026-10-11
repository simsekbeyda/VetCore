import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { authService } from '@/services/authService'
import ProtectedRoute from '@/components/common/ProtectedRoute'

import LoginPage from '@/pages/auth/LoginPage'
import RegisterPage from '@/pages/auth/RegisterPage'

import AdminLayout from '@/components/layout/AdminLayout'
import VetLayout from '@/components/layout/VetLayout'
import DrugSearchPage from '@/pages/vet/DrugSearchPage'
import DrugDetailPage from '@/pages/vet/DrugDetailPage'
import FavoritesPage from '@/pages/vet/FavoritesPage'
import AnamnezPage from '@/pages/vet/AnamnezPage'
import ChatbotPage from '@/pages/vet/ChatbotPage'
import OwnerLayout from '@/components/layout/OwnerLayout'
import PetsPage from '@/pages/owner/PetsPage'
import PetDetailPage from '@/pages/owner/PetDetailPage'
import DrugSearchSimplePage from '@/pages/owner/DrugSearchSimplePage'
import ProfilePage from '@/pages/owner/ProfilePage'
import ChatbotOwnerPage from '@/pages/owner/ChatbotOwnerPage'
import DashboardPage from '@/pages/admin/DashboardPage'
import DrugsPage from '@/pages/admin/DrugsPage'
import SimpleListPage from '@/pages/admin/SimpleListPage'
import SourcesPage from '@/pages/admin/SourcesPage'
import ImportPage from '@/pages/admin/ImportPage'
import MissingDataPage from '@/pages/admin/MissingDataPage'
import UsersPage from '@/pages/admin/UsersPage'
import AuditLogPage from '@/pages/admin/AuditLogPage'
import ChatbotLogsPage from '@/pages/admin/ChatbotLogsPage'
import TherapeuticGroupsPage from '@/pages/admin/TherapeuticGroupsPage'
import { adminService } from '@/services/adminService'

function App() {
  const setUser = useAuthStore((s) => s.setUser)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (token) authService.me().then(setUser).catch(() => localStorage.clear())
  }, [setUser])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Admin */}
        <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout /></ProtectedRoute>}>
          <Route index element={<DashboardPage />} />
          <Route path="drugs" element={<DrugsPage />} />
          <Route path="species" element={
            <SimpleListPage title="Hayvan Türleri" queryKey="species"
              fetchFn={adminService.getSpecies} createFn={adminService.createSpecies} deleteFn={adminService.deleteSpecies}
              placeholder="ör. kedi, köpek, sığır..." />
          } />
          <Route path="indications" element={
            <SimpleListPage title="Endikasyonlar" queryKey="indications"
              fetchFn={adminService.getIndications} createFn={adminService.createIndication} deleteFn={adminService.deleteIndication}
              placeholder="ör. Enfeksiyon, Parazit, Ağrı..." />
          } />
          <Route path="ingredients" element={
            <SimpleListPage title="Etken Maddeler" queryKey="ingredients"
              fetchFn={() => adminService.getIngredients()} createFn={adminService.createIngredient} deleteFn={adminService.deleteIngredient}
              placeholder="ör. Amoksisilin, İvermektin..." />
          } />
          <Route path="sources" element={<SourcesPage />} />
          <Route path="import" element={<ImportPage />} />
          <Route path="missing" element={<MissingDataPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="audit-logs" element={<AuditLogPage />} />
          <Route path="chatbot-logs" element={<ChatbotLogsPage />} />
          <Route path="therapeutic-groups" element={<TherapeuticGroupsPage />} />
        </Route>

        {/* Veteriner */}
        <Route path="/vet" element={<ProtectedRoute allowedRoles={['vet', 'admin']}><VetLayout /></ProtectedRoute>}>
          <Route index element={<DrugSearchPage />} />
          <Route path="drugs/:id" element={<DrugDetailPage />} />
          <Route path="anamnez" element={<AnamnezPage />} />
          <Route path="favorites" element={<FavoritesPage />} />
          <Route path="chatbot" element={<ChatbotPage />} />
        </Route>

        {/* Hayvan Sahibi */}
        <Route path="/owner" element={<ProtectedRoute allowedRoles={['owner', 'vet', 'admin']}><OwnerLayout /></ProtectedRoute>}>
          <Route index element={<PetsPage />} />
          <Route path="pets/:id" element={<PetDetailPage />} />
          <Route path="drugs" element={<DrugSearchSimplePage />} />
          <Route path="chatbot" element={<ChatbotOwnerPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        <Route path="/unauthorized" element={<div className="p-8 text-center text-red-500">Yetkisiz erişim.</div>} />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
