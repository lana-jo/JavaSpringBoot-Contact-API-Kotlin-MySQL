import 'package:contact_mobile/models/models.dart';
import 'package:contact_mobile/services/api_client.dart';

class AddressService {
  AddressService(this._api);
  final ApiClient _api;

  Future<AddressResponse> create(String contactId, {String? street, String? city, String? province, required String country, String? postalCode}) async {
    final env = await _api.request('/contacts/$contactId/addresses', method: 'POST', body: {
      'street': street,
      'city': city,
      'province': province,
      'country': country,
      'postalCode': postalCode,
    });
    return AddressResponse.fromJson(env['data'] as Map<String, dynamic>);
  }

  Future<AddressResponse> get(String contactId, String addressId) async {
    final env = await _api.request('/contacts/$contactId/addresses/$addressId');
    return AddressResponse.fromJson(env['data'] as Map<String, dynamic>);
  }

  Future<AddressResponse> update(String contactId, String addressId, {String? street, String? city, String? province, required String country, String? postalCode}) async {
    final env = await _api.request('/contacts/$contactId/addresses/$addressId', method: 'PUT', body: {
      'street': street,
      'city': city,
      'province': province,
      'country': country,
      'postalCode': postalCode,
    });
    return AddressResponse.fromJson(env['data'] as Map<String, dynamic>);
  }

  Future<void> remove(String contactId, String addressId) async {
    await _api.request('/contacts/$contactId/addresses/$addressId', method: 'DELETE');
  }

  Future<List<AddressResponse>> list(String contactId) async {
    final env = await _api.request('/contacts/$contactId/addresses');
    final data = env['data'] as List<dynamic>? ?? [];
    return data.map((e) => AddressResponse.fromJson(e as Map<String, dynamic>)).toList();
  }
}