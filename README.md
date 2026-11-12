# Contact API

REST API untuk manajemen kontak (user, contact, address) dibangun dengan **Spring Boot 4 + Kotlin**, database **MySQL**, plus dua client:

| Bagian | Teknologi | Lokasi |
| --- | --- | --- |
| Backend API | Spring Boot 4, Kotlin, JPA/Hibernate, MySQL | `src/` |
| Frontend web | React 19, TypeScript, Vite, Zustand, Tailwind | `frontend/` |
| Mobile | Flutter | `mobile/` |

## Fitur

- **Auth**: register, login, logout (token via header `X-API-TOKEN`)
- **User**: get & update current user
- **Contact**: CRUD + search dengan paging
- **Address**: CRUD per contact

## Prasyarat

- JDK 25
- MySQL berjalan di `localhost:3306`
- (Opsional, untuk client) Node.js dan Flutter SDK

## Setup Database

Import salah satu schema ke MySQL:

```bash
mysql -u root -p < contact_api.sql
```

Atur kredensial di `src/main/resources/application.properties` (saat ini: database `contact_api`, user `root`).

## Menjalankan Backend

```bash
./mvnw spring-boot:run
```

API berjalan di `http://localhost:8081`. Skema tabel otomatis di-update oleh Hibernate (`ddl-auto=update`).

### Via Docker

```bash
docker build -t contact-api .
docker run -p 8081:8081 contact-api
```

## Menjalankan Frontend

```bash
cd frontend
npm install
npm run dev
```

Buka `http://localhost:5173`. Request `/api` otomatis di-proxy ke `http://localhost:8081`.

## Menjalankan Mobile

```bash
cd mobile
flutter run
```

## API Endpoints

Semua response dibungkus envelope `WebResponse { errors, data }`. Endpoint selain register/login menerima header `X-API-TOKEN`.

| Method | Path | Deskripsi |
| --- | --- | --- |
| POST | `/api/register` | Registrasi user baru |
| POST | `/api/auth/login` | Login, mengembalikan token |
| DELETE | `/api/auth/logout` | Logout (invalidasi token) |
| GET | `/api/currentUser` | Detail user yang login |
| PATCH | `/api/currentUser` | Update nama/password user |
| POST | `/api/contacts/create` | Buat contact baru |
| GET | `/api/contacts/{contactId}` | Detail contact |
| PUT | `/api/contacts/{contactId}` | Update contact |
| DELETE | `/api/contacts/{contactId}` | Hapus contact |
| GET | `/api/contacts` | Search contacts (paging + filter) |
| POST | `/api/contacts/{contactId}/addresses` | Buat address baru |
| GET | `/api/contacts/{contactId}/addresses` | List semua address |
| GET | `/api/contacts/{contactId}/addresses/{addressId}` | Detail address |
| PUT | `/api/contacts/{contactId}/addresses/{addressId}` | Update address |
| DELETE | `/api/contacts/{contactId}/addresses/{addressId}` | Hapus address |

Contoh request lengkap tersedia di [ManualTest.http](ManualTest.http).

## Testing

```bash
./mvnw test
```

Test controller berjalan dengan H2 in-memory (profile test).
