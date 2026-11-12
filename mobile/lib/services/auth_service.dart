import 'package:contact_mobile/models/models.dart';
import 'package:contact_mobile/services/api_client.dart';

class AuthService {
  AuthService(this._api);
  final ApiClient _api;

  Future<TokenResponse> login(String username, String password) async {
    final env = await _api.request('/auth/login', method: 'POST', body: {
      'username': username,
      'password': password,
    }, auth: false);
    return TokenResponse.fromJson(env['data'] as Map<String, dynamic>);
  }

  Future<void> register(String username, String password, String name) async {
    await _api.request('/register', method: 'POST', body: {
      'username': username,
      'password': password,
      'name': name,
    }, auth: false);
  }

  Future<void> logout() async {
    await _api.request('/auth/logout', method: 'DELETE');
  }
}