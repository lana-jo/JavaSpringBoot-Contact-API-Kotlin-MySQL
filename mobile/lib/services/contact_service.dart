import 'package:contact_mobile/models/models.dart';
import 'package:contact_mobile/services/api_client.dart';

class ContactService {
  ContactService(this._api);
  final ApiClient _api;

  Future<ContactResponse> create(String firstName, {String? lastName, String? email, String? phone}) async {
    final env = await _api.request('/contacts/create', method: 'POST', body: {
      'firstName': firstName,
      'lastName': lastName,
      'email': email,
      'phone': phone,
    });
    return ContactResponse.fromJson(env['data'] as Map<String, dynamic>);
  }

  Future<ContactResponse> get(String id) async {
    final env = await _api.request('/contacts/$id');
    return ContactResponse.fromJson(env['data'] as Map<String, dynamic>);
  }

  Future<ContactResponse> update(String id, {required String firstName, String? lastName, String? email, String? phone}) async {
    final env = await _api.request('/contacts/$id', method: 'PUT', body: {
      'firstName': firstName,
      'lastName': lastName,
      'email': email,
      'phone': phone,
    });
    return ContactResponse.fromJson(env['data'] as Map<String, dynamic>);
  }

  Future<void> remove(String id) async {
    await _api.request('/contacts/$id', method: 'DELETE');
  }

  Future<({List<ContactResponse> items, PagingResponse? paging})> search({
    String? query,
    String? name,
    String? email,
    String? phone,
    int page = 0,
    int size = 10,
  }) async {
    final params = <String, String>{'page': '$page', 'size': '$size'};
    if (query != null && query.isNotEmpty) params['query'] = query;
    if (name != null && name.isNotEmpty) params['name'] = name;
    if (email != null && email.isNotEmpty) params['email'] = email;
    if (phone != null && phone.isNotEmpty) params['phone'] = phone;
    final qs = params.entries.map((e) => '${e.key}=${Uri.encodeComponent(e.value)}').join('&');
    final env = await _api.request('/contacts?$qs');
    final list = (env['data'] as List<dynamic>? ?? [])
        .map((e) => ContactResponse.fromJson(e as Map<String, dynamic>))
        .toList();
    final paging = env['paging'] == null ? null : PagingResponse.fromJson(env['paging'] as Map<String, dynamic>);
    return (items: list, paging: paging);
  }
}