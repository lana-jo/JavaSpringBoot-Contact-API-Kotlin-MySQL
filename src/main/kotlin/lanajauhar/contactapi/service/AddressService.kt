package lanajauhar.contactapi.service

import lanajauhar.contactapi.entity.Address
import lanajauhar.contactapi.entity.Contact
import lanajauhar.contactapi.entity.User
import lanajauhar.contactapi.model.AddressResponse
import lanajauhar.contactapi.model.CreateAddresRequest
import lanajauhar.contactapi.model.UpdateAddresRequest
import lanajauhar.contactapi.repository.AddressRepository
import lanajauhar.contactapi.repository.ContactRepository
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException
import java.util.UUID

@Service
class AddressService(
    private val validationService: ValidationService,
    private val contactRepository: ContactRepository,
    private val addressRepository: AddressRepository
) {
    @Transactional
    fun create(user: User, req: CreateAddresRequest): AddressResponse {
        validationService.validate(req)
        val contact = contactRepository.findFirstByUserAndId(user, req.contactId)
            ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "Kontak Tidak Ditemukan")
        val address = Address().apply {
            id = UUID.randomUUID().toString()
            this.contact = contact
            street = req.street
            city = req.city
            province = req.province
            country = req.country
            postalCode = req.postalCode
        }
        addressRepository.save(address)
        return toAddressResponse(address)
    }

    @Transactional(readOnly = true)
    fun thisAddress(user: User, contactId: String, addressId: String): AddressResponse {
        val contact = contactRepository.findFirstByUserAndId(user, contactId)
            ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "Kontak Tidak Ditemukan")
        val address = addressRepository.findFirstByContactAndId(contact, addressId)
            ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "Alamat Tidak Ditemukan")
        return toAddressResponse(address)
    }

    @Transactional
    fun updateAddress(user: User, req: UpdateAddresRequest): AddressResponse {
        validationService.validate(req)
        val contact = contactRepository.findFirstByUserAndId(user, req.contactId)
            ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "Kontak Tidak Ditemukan")
        val address = addressRepository.findFirstByContactAndId(contact, req.addressId)
            ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "Alamat Tidak Ditemukan")
        address.street = req.street
        address.city = req.city
        address.province = req.province
        address.country = req.country
        address.postalCode = req.postalCode
        addressRepository.save(address)
        return toAddressResponse(address)
    }

    @Transactional
    fun deleteAddress(user: User, contactId: String, addressId: String) {
        val contact = contactRepository.findFirstByUserAndId(user, contactId)
            ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "Kontak Tidak Ditemukan")
        val address = addressRepository.findFirstByContactAndId(contact, addressId)
            ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "Alamat Tidak Ditemukan")
        addressRepository.delete(address)
    }

    @Transactional(readOnly = true)
    fun list(user: User, contactId: String): List<AddressResponse> {
        val contact = contactRepository.findFirstByUserAndId(user, contactId)
            ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "Kontak Tidak Ditemukan")
        return addressRepository.findAllByContact(contact).map(::toAddressResponse)
    }

    private fun toAddressResponse(address: Address): AddressResponse {
        return AddressResponse().apply {
            id = address.id
            street = address.street
            city = address.city
            country = address.country
            province = address.province
            postalCode = address.postalCode
        }
    }
}
