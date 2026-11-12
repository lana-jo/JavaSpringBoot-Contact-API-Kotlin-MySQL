import 'package:contact_mobile/models/models.dart';
import 'package:contact_mobile/screens/address_form_screen.dart';
import 'package:contact_mobile/screens/contact_form_screen.dart';
import 'package:contact_mobile/services/address_service.dart';
import 'package:contact_mobile/services/contact_service.dart';
import 'package:contact_mobile/state/auth_scope.dart';
import 'package:contact_mobile/ux/ux.dart';
import 'package:material_ui/material_ui.dart';

class ContactDetailScreen extends StatefulWidget {
  const ContactDetailScreen({super.key, required this.contactId});
  final String contactId;

  @override
  State<ContactDetailScreen> createState() => _ContactDetailScreenState();
}

class _ContactDetailScreenState extends State<ContactDetailScreen> {
  late final ContactService _contactService;
  late final AddressService _addressService;
  ContactResponse? _contact;
  List<AddressResponse> _addresses = [];
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    final api = AuthScope.of(context).apiClient;
    _contactService = ContactService(api);
    _addressService = AddressService(api);
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final c = await _contactService.get(widget.contactId);
      final a = await _addressService.list(widget.contactId);
      if (!mounted) return;
      setState(() {
        _contact = c;
        _addresses = a;
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

  Future<void> _editContact() async {
    final updated = await Navigator.push<bool>(
      context,
      MaterialPageRoute(builder: (_) => ContactFormScreen(contactId: widget.contactId, initial: _contact)),
    );
    if (updated == true) _load();
  }

  Future<void> _confirmDeleteContact() async {
    final ok = await showConfirmDialog(
      context,
      title: 'Hapus kontak?',
      message: 'Kontak "${_contact?.displayName}" akan dihapus permanen.',
      confirmLabel: 'Hapus',
    );
    if (ok != true) return;
    try {
      await _contactService.remove(widget.contactId);
      if (!mounted) return;
      showAppSnackBar(context, 'Kontak "${_contact?.displayName}" dihapus', type: SnackBarType.success);
      if (mounted) Navigator.pop(context, true);
    } catch (e) {
      if (mounted) showAppSnackBar(context, e.toString(), type: SnackBarType.error);
    }
  }

  Future<void> _confirmDeleteAddress(AddressResponse a) async {
    final ok = await showConfirmDialog(
      context,
      title: 'Hapus alamat?',
      message: 'Alamat "${a.oneLine}" akan dihapus permanen.',
      confirmLabel: 'Hapus',
    );
    if (ok != true) return;
    try {
      await _addressService.remove(widget.contactId, a.id!);
      if (!mounted) return;
      showAppSnackBar(context, 'Alamat dihapus', type: SnackBarType.success);
      await _load();
    } catch (e) {
      if (mounted) showAppSnackBar(context, e.toString(), type: SnackBarType.error);
    }
  }

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    final textTheme = Theme.of(context).textTheme;
    return Scaffold(
      appBar: AppBar(
        title: const Text('Detail Kontak'),
        actions: [
          if (_contact != null) ...[
            IconButton(
              icon: const Icon(Icons.edit_outlined),
              tooltip: 'Ubah kontak',
              onPressed: _editContact,
            ),
            IconButton(
              icon: const Icon(Icons.delete_outline),
              tooltip: 'Hapus kontak',
              onPressed: _confirmDeleteContact,
            ),
          ],
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error != null ? _NotFoundView(
                  message: _error,
                  onRetry: _load,
                )
              : RefreshIndicator(
                  onRefresh: _load,
                  child: ListView(
                    padding: const EdgeInsets.all(16),
                    children: [
                      Row(
                        children: [
                          CircleAvatar(
                            radius: 32,
                            backgroundColor: colorScheme.primaryContainer,
                            foregroundColor: colorScheme.onPrimaryContainer,
                            child: Text(
                              initialOf(_contact?.displayName),
                              style: textTheme.headlineMedium,
                            ),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: Text(
                              _contact?.displayName ?? '',
                              style: textTheme.headlineSmall,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      if (_contact?.email != null && _contact!.email!.isNotEmpty)
                        Card(
                          child: ListTile(
                            leading: const Icon(Icons.email_outlined),
                            title: const Text('Email'),
                            subtitle: Text(_contact!.email!),
                          ),
                        ),
                      if (_contact?.phone != null && _contact!.phone!.isNotEmpty)
                        Card(
                          child: ListTile(
                            leading: const Icon(Icons.phone_outlined),
                            title: const Text('Telepon'),
                            subtitle: Text(_contact!.phone!),
                          ),
                        ),
                      const SizedBox(height: 16),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text('Alamat', style: textTheme.titleMedium),
                          TextButton.icon(
                            onPressed: () async {
                              final ok = await Navigator.push<bool>(
                                context,
                                MaterialPageRoute(
                                  builder: (_) => AddressFormScreen(contactId: widget.contactId),
                                ),
                              );
                              if (ok == true) _load();
                            },
                            icon: const Icon(Icons.add),
                            label: const Text('Tambah'),
                          ),
                        ],
                      ),
                      if (_addresses.isEmpty)
                        Padding(
                          padding: const EdgeInsets.symmetric(vertical: 8),
                          child: Text(
                            'Belum ada alamat',
                            style: textTheme.bodyMedium?.copyWith(color: colorScheme.onSurfaceVariant),
                          ),
                        )
                      else
                        for (final a in _addresses)
                          Card(
                            child: ListTile(
                              title: Text(a.oneLine),
                              trailing: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  IconButton(
                                    icon: const Icon(Icons.edit_outlined),
                                    tooltip: 'Ubah alamat',
                                    onPressed: () async {
                                      final ok = await Navigator.push<bool>(
                                        context,
                                        MaterialPageRoute(
                                          builder: (_) => AddressFormScreen(contactId: widget.contactId, initial: a),
                                        ),
                                      );
                                      if (ok == true) _load();
                                    },
                                  ),
                                  IconButton(
                                    icon: const Icon(Icons.delete_outline),
                                    tooltip: 'Hapus alamat',
                                    onPressed: () => _confirmDeleteAddress(a),
                                  ),
                                ],
                              ),
                            ),
                          ),
                    ],
                  ),
                ),
    );
  }
}

class _NotFoundView extends StatelessWidget {
  const _NotFoundView({this.message, required this.onRetry});

  final String? message;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    final textTheme = Theme.of(context).textTheme;
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.person_off_outlined, size: 72, color: colorScheme.onSurfaceVariant),
            const SizedBox(height: 16),
            Text(
              'Kontak tidak ditemukan',
              style: textTheme.titleMedium,
            ),
            const SizedBox(height: 8),
            Text(
              message ?? 'Kontak ini mungkin sudah dihapus atau terjadi kesalahan.',
              textAlign: TextAlign.center,
              style: textTheme.bodyMedium?.copyWith(color: colorScheme.onSurfaceVariant),
            ),
            const SizedBox(height: 16),
            if (message != null)
              OutlinedButton.icon(
                onPressed: onRetry,
                icon: const Icon(Icons.refresh),
                label: const Text('Coba Lagi'),
              ),
            const SizedBox(height: 8),
            FilledButton.icon(
              onPressed: () => Navigator.pop(context),
              icon: const Icon(Icons.arrow_back),
              label: const Text('Kembali'),
            ),
          ],
        ),
      ),
    );
  }
}
