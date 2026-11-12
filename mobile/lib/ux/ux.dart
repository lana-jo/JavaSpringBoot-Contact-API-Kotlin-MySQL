/// Helper UX konsisten di semua layar (Material 3 + praktik NN/g).
library;

import 'package:material_ui/material_ui.dart';

enum SnackBarType { info, error, success }

/// SnackBar singkat lewat [ScaffoldMessenger], aman dipanggil meski
/// [context] sudah tidak punya Scaffold di atasnya.
void showAppSnackBar(BuildContext context, String message, {SnackBarType type = SnackBarType.info}) {
  final messenger = ScaffoldMessenger.maybeOf(context);
  if (messenger == null) return;
  final colorScheme = Theme.of(context).colorScheme;
  final icon = switch (type) {
    SnackBarType.error => Icons.error_outline,
    SnackBarType.success => Icons.check_circle_outline,
    SnackBarType.info => Icons.info_outline,
  };
  final background = switch (type) {
    SnackBarType.error => colorScheme.errorContainer,
    SnackBarType.success || SnackBarType.info => colorScheme.inverseSurface,
  };
  final foreground = switch (type) {
    SnackBarType.error => colorScheme.onErrorContainer,
    SnackBarType.success || SnackBarType.info => colorScheme.onInverseSurface,
  };
  messenger
    ..clearSnackBars()
    ..showSnackBar(
      SnackBar(
        backgroundColor: background,
        behavior: SnackBarBehavior.floating,
        duration: const Duration(seconds: 3),
        content: Row(
          children: [
            Icon(icon, color: foreground),
            const SizedBox(width: 12),
            Expanded(child: Text(message, style: TextStyle(color: foreground))),
          ],
        ),
      ),
    );
}

/// Dialog konfirmasi standar untuk aksi destruktif.
/// Mengembalikan true bila pengguna memilih tombol konfirmasi.
Future<bool> showConfirmDialog(
  BuildContext context, {
  required String title,
  required String message,
  required String confirmLabel,
  bool destructive = true,
}) async {
  final result = await showDialog<bool>(
    context: context,
    builder: (dialogContext) => AlertDialog(
      title: Text(title),
      content: Text(message),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(dialogContext, false),
          child: const Text('Batal'),
        ),
        FilledButton(
          style: destructive
              ? FilledButton.styleFrom(backgroundColor: Theme.of(dialogContext).colorScheme.error)
              : null,
          onPressed: () => Navigator.pop(dialogContext, true),
          child: Text(confirmLabel),
        ),
      ],
    ),
  );
  return result ?? false;
}

/// Inisial untuk avatar kontak, mis. 'Budi Santoso' -> 'B'.
String initialOf(String? name) {
  final trimmed = name?.trim() ?? '';
  if (trimmed.isEmpty) return '?';
  return trimmed.characters.first.toUpperCase();
}
