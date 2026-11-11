package lanajauhar.contactapi.repository

import lanajauhar.contactapi.entity.Contact
import lanajauhar.contactapi.entity.User
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.JpaSpecificationExecutor

interface ContactRepository : JpaRepository<Contact, String>, JpaSpecificationExecutor<Contact> {
    fun findFirstByUserAndId(user: User, id: String): Contact?
}
