import 'package:contact_mobile/screens/home_screen.dart';
import 'package:contact_mobile/screens/login_screen.dart';
import 'package:contact_mobile/state/auth_scope.dart';
import 'package:material_ui/material_ui.dart';

class ContactApp extends StatelessWidget {
  const ContactApp({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = AuthScope.of(context);
    return AnimatedBuilder(
      animation: auth,
      builder: (context, _) {
        return MaterialApp(
          title: 'Kontak',
          debugShowCheckedModeBanner: false,
          theme: ThemeData(
            colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF2563EB)),
            useMaterial3: true,
            inputDecorationTheme: const InputDecorationTheme(
              border: OutlineInputBorder(),
              filled: true,
            ),
            snackBarTheme: const SnackBarThemeData(
              behavior: SnackBarBehavior.floating,
            ),
          ),
          home: auth.isLoggedIn ? const HomeScreen() : const LoginScreen(),
        );
      },
    );
  }
}
