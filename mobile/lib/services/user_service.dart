import 'package:contact_mobile/models/models.dart';
import 'package:contact_mobile/services/api_client.dart';

class UserService {
  UserService(this._api);
  final ApiClient _api;

  Future<UserResponse> current() async {
    final env = await _api.request('/currentUser');
    return UserResponse.fromJson(env['data'] as Map<String, dynamic>);
  }

  Future<UserResponse> update({String? name, String? password}) async {
    final body = <String, dynamic>{};
    if (name != null) body['name'] = name;
    if (password != null && password.isNotEmpty) body['password'] = password;
    final env = await _api.request('/currentUser', method: 'PATCH', body: body);
    return UserResponse.fromJson(env['data'] as Map<String, dynamic>);
  }
}