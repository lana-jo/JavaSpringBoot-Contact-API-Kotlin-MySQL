import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { ProtectedRoute } from './components/layout/ProtectedRoute'
import { LoginPage } from './features/auth/LoginPage'
import { RegisterPage } from './features/auth/RegisterPage'
import { ContactDetailPage } from './features/contacts/ContactDetailPage'
import { ContactFormPage } from './features/contacts/ContactFormPage'
import { ContactListPage } from './features/contacts/ContactListPage'
import { ProfilePage } from './features/user/ProfilePage'

export default function App() {
  return (
    <Routes>
      {/* Publik */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Terproteksi (butuh token) */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/contacts" replace />} />
          <Route path="/contacts" element={<ContactListPage />} />
          <Route path="/contacts/new" element={<ContactFormPage />} />
          <Route path="/contacts/:contactId" element={<ContactDetailPage />} />
          <Route path="/contacts/:contactId/edit" element={<ContactFormPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/contacts" replace />} />
    </Routes>
  )
}
