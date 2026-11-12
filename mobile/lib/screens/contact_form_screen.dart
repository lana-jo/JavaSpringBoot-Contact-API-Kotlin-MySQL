import 'package:contact_mobile/models/models.dart';
import 'package:contact_mobile/services/contact_service.dart';
import 'package:contact_mobile/state/auth_scope.dart';
import 'package:contact_mobile/ux/ux.dart';
import 'package:material_ui/material_ui.dart';

class ContactFormScreen extends StatefulWidget {
  const ContactFormScreen({super.key, this.contactId, this.initial});
  final String? contactId;
  final ContactResponse? initial;

  @override
  State<ContactFormScreen> createState() => _ContactFormScreenState();
}

class _ContactFormScreenState extends State<ContactFormScreen> {
  late final ContactService _service;
  final _formKey = GlobalKey<FormState>();
  final _firstCtrl = TextEditingController();
  final _lastCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  final _phoneCtrl = TextEditingController();
  bool _saving = false;

  bool get _isEdit => widget.contactId != null;

  @override
  void initState() {
    super.initState();
    _service = ContactService(AuthScope.of(context).apiClient);
    final i = widget.initial;
    if (i != null) {
      _firstCtrl.text = i.firstName ?? '';
      _lastCtrl.text = i.lastName ?? '';
      _emailCtrl.text = i.email ?? '';
      _phoneCtrl.text = i.phone ?? '';
    }
  }

  @override
  void dispose() {
    _firstCtrl.dispose();
    _lastCtrl.dispose();
    _emailCtrl.dispose();
    _phoneCtrl.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    FocusScope.of(context).unfocus();
    if (_saving) return;
    final valid = _formKey.currentState?.validate() ?? false;
    if (!valid) return;

    final first = _firstCtrl.text.trim();
    final last = _lastCtrl.text.trim().isEmpty ? null : _lastCtrl.text.trim();
    final email = _emailCtrl.text.trim().isEmpty ? null : _emailCtrl.text.trim();
    final phone = _phoneCtrl.text.trim().isEmpty ? null : _phoneCtrl.text.trim();

    setState(() => _saving = true);
    try {
      if (_isEdit) {
        await _service.update(widget.contactId!, firstName: first, lastName: last, email: email, phone: phone);
      } else {
        await _service.create(first, lastName: last, email: email, phone: phone);
      }
      if (mounted) Navigator.pop(context, true);
    } catch (e) {
      if (mounted) showAppSnackBar(context, e.toString(), type: SnackBarType.error);
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(_isEdit ? 'Ubah Kontak' : 'Kontak Baru')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          autovalidateMode: AutovalidateMode.onUserInteraction,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              TextFormField(
                controller: _firstCtrl,
                textCapitalization: TextCapitalization.words,
                textInputAction: TextInputAction.next,
                decoration: const InputDecoration(
                  labelText: 'Nama depan',
                  prefixIcon: Icon(Icons.person_outline),
                  border: OutlineInputBorder(),
                ),
                validator: (v) {
                  if ((v ?? '').trim().isEmpty) return 'Nama depan wajib diisi';
                  return null;
                },
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _lastCtrl,
                textCapitalization: TextCapitalization.words,
                textInputAction: TextInputAction.next,
                decoration: const InputDecoration(
                  labelText: 'Nama belakang',
                  prefixIcon: Icon(Icons.person_outline),
                  border: OutlineInputBorder(),
                ),
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _emailCtrl,
                keyboardType: TextInputType.emailAddress,
                textInputAction: TextInputAction.next,
                decoration: const InputDecoration(
                  labelText: 'Email',
                  prefixIcon: Icon(Icons.email_outlined),
                  border: OutlineInputBorder(),
                ),
                validator: (v) {
                  final t = (v ?? '').trim();
                  if (t.isEmpty) return null;
                  final okEmail = RegExp(r'^[^@\s]+@[^@\s]+\.[^@\s]+$').hasMatch(t);
                  if (!okEmail) return 'Format email tidak valid';
                  return null;
                },
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _phoneCtrl,
                keyboardType: TextInputType.phone,
                textInputAction: TextInputAction.done,
                onFieldSubmitted: (_) => _save(),
                decoration: const InputDecoration(
                  labelText: 'Telepon',
                  prefixIcon: Icon(Icons.phone_outlined),
                  border: OutlineInputBorder(),
                ),
              ),
              const SizedBox(height: 24),
              FilledButton(
                onPressed: _saving ? null : _save,
                child: _saving
                    ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2))
                    : const Text('Simpan'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
