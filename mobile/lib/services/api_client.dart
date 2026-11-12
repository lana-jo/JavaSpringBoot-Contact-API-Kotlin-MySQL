import 'dart:convert';

import 'package:http/http.dart' as http;

import '../config/api_config.dart';

class ApiException implements Exception {
  ApiException(this.message, this.status);
  final String message;
  final int status;
  @override
  String toString() => message;
}

class ApiClient {
  ApiClient({http.Client? client}) : _client = client ?? http.Client();

  final http.Client _client;
  String? token;

  Future<Map<String, dynamic>> request(
    String path, {
    String method = 'GET',
    Object? body,
    bool auth = true,
  }) async {
    final headers = <String, String>{'Accept': 'application/json'};
    if (body != null) headers['Content-Type'] = 'application/json';
    if (auth) {
      if (token == null || token!.isEmpty) {
        throw ApiException('Belum masuk. Silakan login terlebih dahulu.', 401);
      }
      headers['X-API-TOKEN'] = token!;
    }

    final uri = Uri.parse('${ApiConfig.baseUrl}$path');
    http.Response res;
    try {
      switch (method) {
        case 'POST':
          res = await _client.post(uri, headers: headers, body: body == null ? null : jsonEncode(body));
          break;
        case 'PUT':
          res = await _client.put(uri, headers: headers, body: body == null ? null : jsonEncode(body));
          break;
        case 'PATCH':
          res = await _client.patch(uri, headers: headers, body: body == null ? null : jsonEncode(body));
          break;
        case 'DELETE':
          res = await _client.delete(uri, headers: headers, body: body == null ? null : jsonEncode(body));
          break;
        default:
          res = await _client.get(uri, headers: headers);
      }
    } catch (_) {
      throw ApiException('Tidak dapat terhubung ke server. Pastikan backend berjalan di port 8081.', 0);
    }

    Map<String, dynamic>? envelope;
    try {
      envelope = jsonDecode(res.body) as Map<String, dynamic>;
    } catch (_) {
      envelope = null;
    }

    if (res.statusCode == 401) {
      // biarkan pemanggil handle; token clearing di auth controller
    }

    if (res.statusCode < 200 || res.statusCode >= 300) {
      throw ApiException(
        envelope?['errorMessage']?.toString() ?? 'Terjadi kesalahan pada server (HTTP ${res.statusCode}).',
        res.statusCode,
      );
    }
    if (envelope?['errorMessage'] != null) {
      throw ApiException(envelope!['errorMessage'].toString(), res.statusCode);
    }
    return envelope ?? <String, dynamic>{};
  }
}