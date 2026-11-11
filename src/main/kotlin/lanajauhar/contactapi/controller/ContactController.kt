package lanajauhar.contactapi.controller

import lanajauhar.contactapi.entity.User
import lanajauhar.contactapi.model.ContactResponse
import lanajauhar.contactapi.model.CreateContactRequest
import lanajauhar.contactapi.model.PagingResponse
import lanajauhar.contactapi.model.SearchContactRequest
import lanajauhar.contactapi.model.UpdateContactRequest
import lanajauhar.contactapi.model.WebResponse
import lanajauhar.contactapi.service.ContactService
import org.springframework.data.domain.Page
import org.springframework.http.MediaType
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PatchMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
class ContactController(
    private val contactService: ContactService
) {
    @PostMapping(path = ["/api/contacts/create"], consumes = [MediaType.APPLICATION_JSON_VALUE], produces = [MediaType.APPLICATION_JSON_VALUE])
    fun create(user: User, @RequestBody req: CreateContactRequest): WebResponse<ContactResponse> {
        val contactResponse = contactService.create(user, req)
        return WebResponse<ContactResponse>().apply { data = contactResponse }
    }

    @GetMapping(path = ["/api/contacts/{contactId}"], produces = [MediaType.APPLICATION_JSON_VALUE])
    fun get(user: User, @PathVariable("contactId") contactId: String): WebResponse<ContactResponse> {
        val contactResponse = contactService.get(user, contactId)
        return WebResponse<ContactResponse>().apply { data = contactResponse }
    }

    @PutMapping(path = ["/api/contacts/{contactId}"], consumes = [MediaType.APPLICATION_JSON_VALUE], produces = [MediaType.APPLICATION_JSON_VALUE])
    fun update(user: User, @RequestBody req: UpdateContactRequest, @PathVariable("contactId") contactId: String): WebResponse<ContactResponse> {
        req.id = contactId
        val contactResponse = contactService.update(user, req)
        return WebResponse<ContactResponse>().apply { data = contactResponse }
    }

    @DeleteMapping(path = ["/api/contacts/{contactId}"], produces = [MediaType.APPLICATION_JSON_VALUE])
    fun delete(user: User, @PathVariable("contactId") contactId: String): WebResponse<String> {
        contactService.delete(user, contactId)
        return WebResponse<String>().apply { data = "OK" }
    }

    @GetMapping(path = ["/api/contacts"], produces = [MediaType.APPLICATION_JSON_VALUE])
    fun search(
        user: User,
        @RequestParam(value = "name", required = false) name: String?,
        @RequestParam(value = "email", required = false) email: String?,
        @RequestParam(value = "phone", required = false) phone: String?,
        @RequestParam(value = "page", required = false, defaultValue = "0") page: Int,
        @RequestParam(value = "size", required = false, defaultValue = "10") size: Int
    ): WebResponse<List<ContactResponse>> {
        val req = SearchContactRequest().apply {
            this.name = name
            this.email = email
            this.phone = phone
            this.page = page
            this.size = size
        }
        val search: Page<ContactResponse> = contactService.search(user, req)
        return WebResponse<List<ContactResponse>>().apply {
            data = search.content
            paging = PagingResponse().apply {
                currentPage = search.number
                totalPage = search.totalPages
                this.size = search.size
            }
        }
    }
}
