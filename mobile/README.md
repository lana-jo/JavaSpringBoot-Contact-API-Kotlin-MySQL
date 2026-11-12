# Contact Mobile (Flutter)

Klien mobile untuk Contact API (Spring Boot backend).

## Menjalankan

1. Jalankan backend di `http://localhost:8081`.
2. `flutter pub get`
3. `flutter run` (Linux desktop) atau `flutter run -d <device>`.

Override base URL:
```
flutter run --dart-define=API_BASE_URL=http://10.0.2.2:8081/api
```

## Struktur

- `lib/config` – konfigurasi base URL.
- `lib/models` – model data.
- `lib/services` – akses API.
- `lib/state` – state auth.
- `lib/screens` – layar UI.