class PagingResponse {
  PagingResponse({required this.currentPage, required this.totalPage, required this.size});
  final int currentPage;
  final int totalPage;
  final int size;
  factory PagingResponse.fromJson(Map<String, dynamic> j) => PagingResponse(
        currentPage: (j['currentPage'] as num?)?.toInt() ?? 0,
        totalPage: (j['totalPage'] as num?)?.toInt() ?? 0,
        size: (j['size'] as num?)?.toInt() ?? 0,
      );
}

class TokenResponse {
  TokenResponse({required this.token, required this.expiredAt});
  final String token;
  final int expiredAt;
  factory TokenResponse.fromJson(Map<String, dynamic> j) =>
      TokenResponse(token: j['token'] as String, expiredAt: (j['expired_at'] as num).toInt());
}

class UserResponse {
  UserResponse({this.username, this.name});
  final String? username;
  final String? name;
  factory UserResponse.fromJson(Map<String, dynamic> j) =>
      UserResponse(username: j['username'] as String?, name: j['name'] as String?);
}

class ContactResponse {
  ContactResponse({this.id, this.firstName, this.lastName, this.email, this.phone});
  final String? id;
  final String? firstName;
  final String? lastName;
  final String? email;
  final String? phone;
  factory ContactResponse.fromJson(Map<String, dynamic> j) => ContactResponse(
        id: j['id'] as String?,
        firstName: j['firstName'] as String?,
        lastName: j['lastName'] as String?,
        email: j['email'] as String?,
        phone: j['phone'] as String?,
      );
  String get displayName {
    final parts = [firstName, lastName].where((e) => e != null && e.isNotEmpty).toList();
    return parts.isEmpty ? '(tanpa nama)' : parts.join(' ');
  }
}

class AddressResponse {
  AddressResponse({this.id, this.street, this.city, this.province, this.country, this.postalCode});
  final String? id;
  final String? street;
  final String? city;
  final String? province;
  final String? country;
  final String? postalCode;
  factory AddressResponse.fromJson(Map<String, dynamic> j) => AddressResponse(
        id: j['id'] as String?,
        street: j['street'] as String?,
        city: j['city'] as String?,
        province: j['province'] as String?,
        country: j['country'] as String?,
        postalCode: j['postalCode'] as String?,
      );
  String get oneLine {
    final parts = [street, city, province, country, postalCode].where((e) => e != null && e.isNotEmpty).toList();
    return parts.join(', ');
  }
}