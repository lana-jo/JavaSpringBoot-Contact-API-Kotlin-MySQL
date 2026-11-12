import 'package:flutter_secure_storage/flutter_secure_storage.dart';

/// Penyimpanan token aman: Keystore di Android, Keychain di iOS.
/// Tidak lagi memakai SharedPreferences (plaintext di disk).
class TokenStorage {
  TokenStorage({this._storage = const FlutterSecureStorage(
    aOptions: AndroidOptions(encryptedSharedPreferences: true),
    iOptions: IOSOptions(accessibility: KeychainAccessibility.first_unlock),
  )});

  static const _tokenKey = 'contact_api_token';
  static const _expiredKey = 'contact_api_token_expired';

  final FlutterSecureStorage _storage;

  Future<String?> getToken() => _storage.read(key: _tokenKey);

  Future<int?> getExpired() async {
    final v = await _storage.read(key: _expiredKey);
    if (v == null) return null;
    return int.tryParse(v);
  }

  Future<void> set(String token, int expiredAt) async {
    await _storage.write(key: _tokenKey, value: token);
    await _storage.write(key: _expiredKey, value: expiredAt.toString());
  }

  Future<void> clear() async {
    await _storage.delete(key: _tokenKey);
    await _storage.delete(key: _expiredKey);
  }
}
