import 'package:contact_mobile/models/models.dart';
import 'package:contact_mobile/services/address_service.dart';
import 'package:contact_mobile/state/auth_scope.dart';
import 'package:contact_mobile/ux/ux.dart';
import 'package:material_ui/material_ui.dart';

class AddressFormScreen extends StatefulWidget {
  const AddressFormScreen({super.key, required this.contactId, this.initial});
  final String contactId;
  final AddressResponse? initial;

  @override
  State<AddressFormScreen> createState() => _AddressFormScreenState();
}

class _AddressFormScreenState extends State<AddressFormScreen> {
  late final AddressService _service;
  final _formKey = GlobalKey<FormState>();
  final _streetCtrl = TextEditingController();
  final _cityCtrl = TextEditingController();
  final _provinceCtrl = TextEditingController();
  final _countryCtrl = TextEditingController();
  final _postalCtrl = TextEditingController();
  bool _saving = false;

  bool get _isEdit => widget.initial != null;

  @override
  void initState() {
    super.initState();
    _service = AddressService(AuthScope.of(context).apiClient);
    final i = widget.initial;
    if (i != null) {
      _streetCtrl.text = i.street ?? '';
      _cityCtrl.text = i.city ?? '';
      _provinceCtrl.text = i.province ?? '';
      _countryCtrl.text = i.country ?? '';
      _postalCtrl.text = i.postalCode ?? '';
    }
  }

  @override
  void dispose() {
    _streetCtrl.dispose();
    _cityCtrl.dispose();
    _provinceCtrl.dispose();
    _countryCtrl.dispose();
    _postalCtrl.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    FocusScope.of(context).unfocus();
    if (_saving) return;
    final valid = _formKey.currentState?.validate() ?? false;
    if (!valid) return;

    final street = _streetCtrl.text.trim().isEmpty ? null : _streetCtrl.text.trim();
    final city = _cityCtrl.text.trim().isEmpty ? null : _cityCtrl.text.trim();
    final province = _provinceCtrl.text.trim().isEmpty ? null : _provinceCtrl.text.trim();
    final country = _countryCtrl.text.trim();
    final postal = _postalCtrl.text.trim().isEmpty ? null : _postalCtrl.text.trim();

    setState(() => _saving = true);
    try {
      if (_isEdit) {
        await _service.update(widget.contactId, widget.initial!.id!,
            street: street, city: city, province: province, country: country, postalCode: postal);
      } else {
        await _service.create(widget.contactId,
            street: street, city: city, province: province, country: country, postalCode: postal);
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
      appBar: AppBar(title: Text(_isEdit ? 'Ubah Alamat' : 'Alamat Baru')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          autovalidateMode: AutovalidateMode.onUserInteraction,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              TextFormField(
                controller: _streetCtrl,
                textCapitalization: TextCapitalization.sentences,
                textInputAction: TextInputAction.next,
                decoration: const InputDecoration(
                  labelText: 'Jalan',
                  prefixIcon: Icon(Icons.signpost_outlined),
                  border: OutlineInputBorder(),
                ),
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _cityCtrl,
                textCapitalization: TextCapitalization.words,
                textInputAction: TextInputAction.next,
                decoration: const InputDecoration(
                  labelText: 'Kota',
                  prefixIcon: Icon(Icons.location_city_outlined),
                  border: OutlineInputBorder(),
                ),
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _provinceCtrl,
                textCapitalization: TextCapitalization.words,
                textInputAction: TextInputAction.next,
                decoration: const InputDecoration(
                  labelText: 'Provinsi',
                  prefixIcon: Icon(Icons.map_outlined),
                  border: OutlineInputBorder(),
                ),
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _countryCtrl,
                textCapitalization: TextCapitalization.words,
                textInputAction: TextInputAction.next,
                decoration: const InputDecoration(
                  labelText: 'Negara *',
                  prefixIcon: Icon(Icons.public_outlined),
                  border: OutlineInputBorder(),
                ),
                validator: (v) {
                  if ((v ?? '').trim().isEmpty) return 'Negara wajib diisi';
                  return null;
                },
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _postalCtrl,
                keyboardType: TextInputType.number,
                textInputAction: TextInputAction.done,
                onFieldSubmitted: (_) => _save(),
                decoration: const InputDecoration(
                  labelText: 'Kode pos',
                  prefixIcon: Icon(Icons.markunread_mailbox_outlined),
                  border: OutlineInputBorder(),
                ),
                validator: (v) {
                  final t = (v ?? '').trim();
                  if (t.isEmpty) return null;
                  if (!RegExp(r'^[0-9]{4,10}$').hasMatch(t)) return 'Kode pos hanya berisi angka (4-10 digit)';
                  return null;
                },
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
