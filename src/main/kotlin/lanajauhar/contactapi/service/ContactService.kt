package lanajauhar.contactapi.service

import jakarta.persistence.criteria.Predicate
import lanajauhar.contactapi.entity.Contact
import lanajauhar.contactapi.entity.User
import lanajauhar.contactapi.model.ContactResponse
import lanajauhar.contactapi.model.CreateContactRequest
import lanajauhar.contactapi.model.SearchContactRequest
import lanajauhar.contactapi.model.UpdateContactRequest
import lanajauhar.contactapi.repository.ContactRepository
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageImpl
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.domain.Specification
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException
import java.util.UUID

@Service
class ContactService(
    private val contactRepository: ContactRepository,
    private val validationService: ValidationService
) {
    @Transactional
    fun create(user: User, req: CreateContactRequest): ContactResponse {
        validationService.validate(req)
        val contact = Contact().apply {
            id = UUID.randomUUID().toString()
            firstName = req.firstName
            lastName = req.lastName
            email = req.email
            phone = req.phone
            this.user = user
        }
        contactRepository.save(contact)
        return toContactResponse(contact)
    }

    @Transactional(readOnly = true)
    fun get(user: User, id: String): ContactResponse {
        val contact = contactRepository.findFirstByUserAndId(user, id)
            ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "Kontak Tidak Ditemukan")
        return toContactResponse(contact)
    }

    @Transactional
    fun update(user: User, req: UpdateContactRequest): ContactResponse {
        validationService.validate(req)
        val contact = contactRepository.findFirstByUserAndId(user, req.id)
            ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "Kontak Tidak Ditemukan")
        contact.firstName = req.firstName
        contact.lastName = req.lastName
        contact.email = req.email
        contact.phone = req.phone
        contactRepository.save(contact)
        return toContactResponse(contact)
    }

    @Transactional
    fun delete(user: User, id: String) {
        val contact = contactRepository.findFirstByUserAndId(user, id)
            ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "Kontak Tidak Ditemukan")
        contactRepository.delete(contact)
    }

    @Transactional(readOnly = true)
    fun search(user: User, req: SearchContactRequest): Page<ContactResponse> {
        val specification = Specification<Contact> { root, criteriaQuery, cb ->
            val predicates = mutableListOf<Predicate>()
            predicates.add(cb.equal(root.get<Any>("user"), user))
            if (req.name != null) {
                predicates.add(
                    cb.or(
                        cb.like(root.get("firstName"), "%" + req.name + "%"),
                        cb.like(root.get("lastName"), "%" + req.name + "%")
                    )
                )
            }
            if (req.phone != null) {
                predicates.add(cb.like(root.get("phone"), "%" + req.phone + "%"))
            }
            if (req.email != null) {
                predicates.add(cb.like(root.get("email"), "%" + req.email + "%"))
            }
            criteriaQuery.where(*predicates.toTypedArray()).restriction
        }
        val pageable: Pageable = PageRequest.of(req.page ?: 0, req.size ?: 10)
        val searchContact = contactRepository.findAll(specification, pageable)
        val contactResponses = searchContact.content.map(::toContactResponse)
        return PageImpl(contactResponses, pageable, searchContact.totalElements)
    }

    fun toContactResponse(contact: Contact): ContactResponse {
        return ContactResponse().apply {
            id = contact.id
            firstName = contact.firstName
            lastName = contact.lastName
            email = contact.email
            phone = contact.phone
        }
    }
}
