import 'package:flutter/foundation.dart';

/// Base URL backend. Android emulator pakai 10.0.2.2 (host loopback).
/// Override via dart-define: --dart-define=API_BASE_URL=https://...
/// Produksi wajib https; http hanya diizinkan untuk localhost/emulator dev.
class ApiConfig {
  static String get baseUrl {
    const env = String.fromEnvironment('API_BASE_URL');
    if (env.isNotEmpty) {
      final parsed = Uri.tryParse(env);
      if (parsed == null || !parsed.hasScheme || parsed.host.isEmpty) {
        throw ArgumentError('API_BASE_URL tidak valid: $env');
      }
      if (parsed.scheme != 'https' && !_isLocalHost(parsed.host)) {
        throw ArgumentError(
          'API_BASE_URL harus https:// untuk host non-localhost: $env',
        );
      }
      return env;
    }
    if (!kIsWeb && defaultTargetPlatform == TargetPlatform.android) {
      return 'http://10.0.2.2:8081/api';
    }
    return 'http://localhost:8081/api';
  }

  static bool _isLocalHost(String url) {
    final host = Uri.tryParse(url)?.host ?? '';
    return host == 'localhost' || host == '10.0.2.2' || host == '127.0.0.1';
  }
}
