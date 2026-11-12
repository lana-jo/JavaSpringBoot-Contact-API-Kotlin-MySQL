import 'package:contact_mobile/services/api_client.dart';
import 'package:contact_mobile/services/token_storage.dart';
import 'package:contact_mobile/state/auth_controller.dart';
import 'package:contact_mobile/state/auth_scope.dart';
import 'package:material_ui/material_ui.dart';

import 'app.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  final api = ApiClient();
  final storage = TokenStorage();
  final auth = AuthController(apiClient: api, tokenStorage: storage);
  await auth.restore();
  runApp(AuthScope(controller: auth, child: const ContactApp()));
}