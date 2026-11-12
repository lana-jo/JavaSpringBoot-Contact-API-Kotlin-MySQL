import 'dart:async';

import 'package:contact_mobile/models/models.dart';
import 'package:contact_mobile/screens/contact_detail_screen.dart';
import 'package:contact_mobile/screens/contact_form_screen.dart';
import 'package:contact_mobile/screens/profile_screen.dart';
import 'package:contact_mobile/services/contact_service.dart';
import 'package:contact_mobile/state/auth_scope.dart';
import 'package:contact_mobile/ux/ux.dart';
import 'package:material_ui/material_ui.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  late final ContactService _contacts;
  final _searchCtrl = TextEditingController();
  Timer? _searchDebounce;
  List<ContactResponse> _items = [];
  int _page = 0;
  int _totalPages = 1;
  bool _loading = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _contacts = ContactService(AuthScope.of(context).apiClient);
    _load();
  }

  @override
  void dispose() {
    _searchDebounce?.cancel();
    _searchCtrl.dispose();
    super.dispose();
  }

  Future<void> _load({int page = 0}) async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final res = await _contacts.search(query: _searchCtrl.text.trim(), page: page, size: 10);
      if (!mounted) return;
      setState(() {
        _items = res.items;
        _page = res.paging?.currentPage ?? page;
        _totalPages = res.paging?.totalPage ?? 1;
        _loading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = e.toString();
        _loading = false;
      });
    }
  }

  void _onSearchChanged(String _) {
    setState(() {});
    _searchDebounce?.cancel();
    _searchDebounce = Timer(const Duration(milliseconds: 400), _load);
  }

  Future<void> _confirmDelete(ContactResponse c) async {
    final ok = await showConfirmDialog(
      context,
      title: 'Hapus kontak?',
      message: 'Kontak "${c.displayName}" akan dihapus permanen.',
      confirmLabel: 'Hapus',
    );
    if (ok != true) return;
    try {
      await _contacts.remove(c.id!);
      if (!mounted) return;
      showAppSnackBar(context, 'Kontak "${c.displayName}" dihapus', type: SnackBarType.success);
      await _load(page: _page);
    } catch (e) {
      if (mounted) showAppSnackBar(context, e.toString(), type: SnackBarType.error);
    }
  }

  Future<void> _openForm({ContactResponse? contact}) async {
    final saved = await Navigator.push<bool>(
      context,
      MaterialPageRoute(builder: (_) => ContactFormScreen(contactId: contact?.id, initial: contact)),
    );
    if (saved == true) _load(page: _page);
  }

  void _clearSearch() {
    _searchDebounce?.cancel();
    _searchCtrl.clear();
    _load();
  }

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    final auth = AuthScope.of(context);
    return Scaffold(
      appBar: AppBar(
        title: const Text('Kontak'),
        actions: [
          IconButton(
            icon: const Icon(Icons.person),
            tooltip: 'Profil',
            onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const ProfileScreen())),
          ),
          IconButton(
            icon: const Icon(Icons.logout),
            tooltip: 'Keluar',
            onPressed: () => auth.logout(),
          ),
        ],
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(12),
            child: TextField(
              controller: _searchCtrl,
              decoration: InputDecoration(
                labelText: 'Cari kontak',
                hintText: 'Nama, email, atau telepon',
                prefixIcon: const Icon(Icons.search),
                border: const OutlineInputBorder(),
                suffixIcon: _searchCtrl.text.isEmpty
                    ? null
                    : IconButton(
                        icon: const Icon(Icons.clear),
                        tooltip: 'Hapus pencarian',
                        onPressed: _clearSearch,
                      ),
              ),
              textInputAction: TextInputAction.search,
              onSubmitted: (_) => _load(),
              onChanged: _onSearchChanged,
            ),
          ),
          Expanded(
            child: _loading
                ? const Center(child: CircularProgressIndicator())
                : _error != null
                    ? _ErrorView(message: _error!, onRetry: () => _load(page: _page))
                    : RefreshIndicator(
                        onRefresh: () => _load(page: _page),
                        child: _items.isEmpty
                            ? ListView(
                                children: [
                                  SizedBox(
                                    height: 400,
                                    child: _EmptyState(
                                      searching: _searchCtrl.text.trim().isNotEmpty,
                                      onAdd: () => _openForm(),
                                    ),
                                  ),
                                ],
                              )
                            : ListView.builder(
                                itemCount: _items.length,
                                itemBuilder: (ctx, i) {
                                  final c = _items[i];
                                  final subtitle =
                                      [c.email, c.phone].where((e) => e != null && e.isNotEmpty).join(' · ');
                                  return ListTile(
                                    title: Text(c.displayName),
                                    subtitle: subtitle.isEmpty ? null : Text(subtitle),
                                    leading: CircleAvatar(
                                      backgroundColor: colorScheme.primaryContainer,
                                      foregroundColor: colorScheme.onPrimaryContainer,
                                      child: Text(initialOf(c.displayName)),
                                    ),
                                    onTap: () async {
                                      final changed = await Navigator.push<bool>(
                                        ctx,
                                        MaterialPageRoute(builder: (_) => ContactDetailScreen(contactId: c.id!)),
                                      );
                                      if (changed == true && mounted) _load(page: _page);
                                    },
                                    trailing: Row(
                                      mainAxisSize: MainAxisSize.min,
                                      children: [
                                        IconButton(
                                          icon: const Icon(Icons.edit_outlined),
                                          tooltip: 'Ubah',
                                          onPressed: () => _openForm(contact: c),
                                        ),
                                        IconButton(
                                          icon: const Icon(Icons.delete_outline),
                                          tooltip: 'Hapus',
                                          onPressed: () => _confirmDelete(c),
                                        ),
                                      ],
                                    ),
                                  );
                                },
                              ),
                      ),
          ),
          if (_totalPages > 1)
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 8),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  IconButton(
                    onPressed: _page > 0 ? () => _load(page: _page - 1) : null,
                    icon: const Icon(Icons.chevron_left),
                    tooltip: 'Halaman sebelumnya',
                  ),
                  Text('${_page + 1} / $_totalPages'),
                  IconButton(
                    onPressed: _page + 1 < _totalPages ? () => _load(page: _page + 1) : null,
                    icon: const Icon(Icons.chevron_right),
                    tooltip: 'Halaman berikutnya',
                  ),
                ],
              ),
            ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _openForm(),
        tooltip: 'Tambah kontak',
        child: const Icon(Icons.add),
      ),
    );
  }
}

class _EmptyState extends StatelessWidget {
  const _EmptyState({required this.searching, required this.onAdd});

  final bool searching;
  final VoidCallback onAdd;

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    final textTheme = Theme.of(context).textTheme;
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              searching ? Icons.search_off : Icons.people_outline,
              size: 72,
              color: colorScheme.onSurfaceVariant,
            ),
            const SizedBox(height: 16),
            Text(
              searching ? 'Tidak ada kontak yang cocok' : 'Belum ada kontak',
              textAlign: TextAlign.center,
              style: textTheme.titleMedium,
            ),
            const SizedBox(height: 8),
            Text(
              searching
                  ? 'Coba kata kunci lain atau tambah kontak baru.'
                  : 'Mulai dengan menambahkan kontak pertamamu.',
              textAlign: TextAlign.center,
              style: textTheme.bodyMedium?.copyWith(color: colorScheme.onSurfaceVariant),
            ),
            if (!searching) ...[
              const SizedBox(height: 20),
              FilledButton.icon(
                onPressed: onAdd,
                icon: const Icon(Icons.person_add_alt),
                label: const Text('Tambah Kontak'),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _ErrorView extends StatelessWidget {
  const _ErrorView({required this.message, required this.onRetry});

  final String message;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.cloud_off, size: 72, color: colorScheme.error),
            const SizedBox(height: 16),
            Text(message, textAlign: TextAlign.center),
            const SizedBox(height: 16),
            FilledButton.icon(
              onPressed: onRetry,
              icon: const Icon(Icons.refresh),
              label: const Text('Coba Lagi'),
            ),
          ],
        ),
      ),
    );
  }
}
