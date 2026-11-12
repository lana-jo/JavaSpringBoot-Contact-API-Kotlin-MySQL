import 'package:contact_mobile/state/auth_scope.dart';
import 'package:contact_mobile/ux/ux.dart';
import 'package:material_ui/material_ui.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  final _nameCtrl = TextEditingController();
  final _passCtrl = TextEditingController();
  bool _saving = false;
  bool _obscure = true;

  @override
  void initState() {
    super.initState();
    final u = AuthScope.of(context).currentUser;
    _nameCtrl.text = u?.name ?? '';
  }

  @override
  void dispose() {
    _nameCtrl.dispose();
    _passCtrl.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    FocusScope.of(context).unfocus();
    if (_saving) return;
    if (_nameCtrl.text.trim().isEmpty && _passCtrl.text.isEmpty) {
      showAppSnackBar(context, 'Tidak ada perubahan untuk disimpan', type: SnackBarType.info);
      return;
    }
    if (_passCtrl.text.isNotEmpty && _passCtrl.text.length < 8) {
      showAppSnackBar(context, 'Password baru minimal 8 karakter', type: SnackBarType.error);
      return;
    }

    final auth = AuthScope.of(context);
    setState(() => _saving = true);
    final ok = await auth.updateProfile(
      name: _nameCtrl.text.trim().isEmpty ? null : _nameCtrl.text.trim(),
      password: _passCtrl.text.isEmpty ? null : _passCtrl.text,
    );
    if (!mounted) return;
    setState(() => _saving = false);
    if (ok) {
      showAppSnackBar(context, 'Profil diperbarui', type: SnackBarType.success);
      _passCtrl.clear();
    } else {
      showAppSnackBar(context, auth.error ?? 'Gagal memperbarui', type: SnackBarType.error);
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = AuthScope.of(context);
    final u = auth.currentUser;
    final colorScheme = Theme.of(context).colorScheme;
    final textTheme = Theme.of(context).textTheme;
    return Scaffold(
      appBar: AppBar(title: const Text('Profil')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Center(
              child: CircleAvatar(
                radius: 40,
                backgroundColor: colorScheme.primaryContainer,
                foregroundColor: colorScheme.onPrimaryContainer,
                child: Text(
                  initialOf(u?.name ?? u?.username),
                  style: textTheme.headlineMedium,
                ),
              ),
            ),
            const SizedBox(height: 16),
            ListTile(
              leading: const Icon(Icons.person_outline),
              title: const Text('Username'),
              subtitle: Text(u?.username ?? '-'),
              contentPadding: EdgeInsets.zero,
            ),
            const Divider(),
            const SizedBox(height: 8),
            TextField(
              controller: _nameCtrl,
              textCapitalization: TextCapitalization.words,
              textInputAction: TextInputAction.next,
              decoration: const InputDecoration(
                labelText: 'Nama',
                prefixIcon: Icon(Icons.badge_outlined),
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _passCtrl,
              obscureText: _obscure,
              textInputAction: TextInputAction.done,
              onSubmitted: (_) => _save(),
              decoration: InputDecoration(
                labelText: 'Password baru (opsional)',
                helperText: 'Minimal 8 karakter',
                prefixIcon: const Icon(Icons.lock_outline),
                border: const OutlineInputBorder(),
                suffixIcon: IconButton(
                  icon: Icon(_obscure ? Icons.visibility : Icons.visibility_off),
                  tooltip: _obscure ? 'Tampilkan password' : 'Sembunyikan password',
                  onPressed: () => setState(() => _obscure = !_obscure),
                ),
              ),
            ),
            const SizedBox(height: 24),
            FilledButton(
              onPressed: _saving ? null : _save,
              child: _saving
                  ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2))
                  : const Text('Simpan'),
            ),
            const SizedBox(height: 12),
            OutlinedButton.icon(
              onPressed: _saving ? null : () => auth.logout(),
              icon: const Icon(Icons.logout),
              label: const Text('Keluar'),
            ),
          ],
        ),
      ),
    );
  }
}
