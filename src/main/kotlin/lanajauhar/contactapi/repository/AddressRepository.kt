package lanajauhar.contactapi.repository

import lanajauhar.contactapi.entity.Address
import lanajauhar.contactapi.entity.Contact
import org.springframework.data.jpa.repository.JpaRepository

interface AddressRepository : JpaRepository<Address, String> {
    fun findFirstByContactAndId(contact: Contact, id: String): Address?
    fun findAllByContact(contact: Contact): List<Address>
}
