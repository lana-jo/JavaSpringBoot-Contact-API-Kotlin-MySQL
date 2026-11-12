import 'package:contact_mobile/models/models.dart';
import 'package:contact_mobile/services/api_client.dart';
import 'package:contact_mobile/services/auth_service.dart';
import 'package:contact_mobile/services/token_storage.dart';
import 'package:contact_mobile/services/user_service.dart';
import 'package:flutter/foundation.dart';

class AuthController extends ChangeNotifier {
  AuthController({
    required ApiClient apiClient,
    required TokenStorage tokenStorage,
    AuthService? authService,
    UserService? userService,
  })  : _api = apiClient,
        _storage = tokenStorage,
        _auth = authService ?? AuthService(apiClient),
        _user = userService ?? UserService(apiClient);

  final ApiClient _api;
  ApiClient get apiClient => _api;
  final TokenStorage _storage;
  final AuthService _auth;
  final UserService _user;

  bool _loading = false;
  bool get loading => _loading;
  String? _error;
  String? get error => _error;
  UserResponse? currentUser;
  bool get isLoggedIn => _api.token != null && _api.token!.isNotEmpty;

  Future<void> restore() async {
    final token = await _storage.getToken();
    final expired = await _storage.getExpired();
    if (token != null && (expired == null || expired > DateTime.now().millisecondsSinceEpoch)) {
      _api.token = token;
      try {
        currentUser = await _user.current();
      } catch (_) {
        await _storage.clear();
        _api.token = null;
      }
    } else {
      await _storage.clear();
      _api.token = null;
    }
    notifyListeners();
  }

  Future<bool> login(String username, String password) async {
    _loading = true;
    _error = null;
    notifyListeners();
    try {
      final t = await _auth.login(username, password);
      _api.token = t.token;
      await _storage.set(t.token, t.expiredAt);
      currentUser = await _user.current();
      _loading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _loading = false;
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }

  Future<bool> register(String username, String password, String name) async {
    _loading = true;
    _error = null;
    notifyListeners();
    try {
      await _auth.register(username, password, name);
      _loading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _loading = false;
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }

  Future<void> logout() async {
    try {
      await _auth.logout();
    } catch (_) {}
    await _storage.clear();
    _api.token = null;
    currentUser = null;
    notifyListeners();
  }

  Future<void> refreshProfile() async {
    try {
      currentUser = await _user.current();
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      notifyListeners();
    }
  }

  Future<bool> updateProfile({String? name, String? password}) async {
    _loading = true;
    _error = null;
    notifyListeners();
    try {
      currentUser = await _user.update(name: name, password: password);
      _loading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _loading = false;
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }
}