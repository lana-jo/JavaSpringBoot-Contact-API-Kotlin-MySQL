# Contact API - Modular Frontend

Frontend SPA modular untuk Contact API (Spring Boot Kotlin).

## Tech Stack
- **Framework:** React 19 + TypeScript + Vite
- **Router:** React Router v7
- **State & Auth:** Zustand + LocalStorage
- **Styling:** Tailwind CSS v4

## Struktur Modular (`src/`)
```
src/
├── types/api.ts          # Contract DTOs & envelope WebResponse<T>
├── lib/
│   ├── api.ts            # Fetch wrapper + auth injection + envelope parser
│   └── token.ts          # Storage & unauthorized observer
├── stores/authStore.ts   # Auth state (token, expiredAt, user)
├── services/             # Pure API service functions
│   ├── auth.service.ts
│   ├── user.service.ts
│   ├── contact.service.ts
│   └── address.service.ts
├── hooks/                # Feature custom hooks
│   ├── useContacts.ts
│   ├── useAddresses.ts
│   └── useProfile.ts
├── components/
│   ├── ui/               # Reusable primitives (Button, Input, Modal, Alert, etc.)
│   └── layout/           # AppLayout, Navbar, ProtectedRoute
├── features/             # Feature views & forms
│   ├── auth/             # LoginPage, RegisterPage
│   ├── contacts/         # ContactListPage, ContactFormPage, ContactDetailPage
│   ├── addresses/        # AddressCard, AddressFormModal
│   └── user/             # ProfilePage
├── App.tsx               # Routes definition
└── main.tsx
```

## Menjalankan Frontend
```bash
cd frontend
npm install
npm run dev
```
Akses di: `http://localhost:5173`
Semua request `/api` otomatis diproxy ke `http://localhost:8081` (atau via CORS langsung).
