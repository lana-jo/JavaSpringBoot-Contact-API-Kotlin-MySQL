package lanajauhar.contactapi.controller

import lanajauhar.contactapi.entity.User
import lanajauhar.contactapi.model.AddressResponse
import lanajauhar.contactapi.model.CreateAddresRequest
import lanajauhar.contactapi.model.UpdateAddresRequest
import lanajauhar.contactapi.model.WebResponse
import lanajauhar.contactapi.service.AddressService
import org.springframework.http.MediaType
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RestController

@RestController
class AddressController(
    private val addressService: AddressService
) {
    @PostMapping(
        path = ["/api/contacts/{contactId}/addresses"],
        produces = [MediaType.APPLICATION_JSON_VALUE],
        consumes = [MediaType.APPLICATION_JSON_VALUE]
    )
    fun createAdress(user: User, @RequestBody req: CreateAddresRequest, @PathVariable("contactId") contactId: String): WebResponse<AddressResponse> {
        req.contactId = contactId
        val respons = addressService.create(user, req)
        return WebResponse<AddressResponse>().apply { data = respons }
    }

    @GetMapping(path = ["/api/contacts/{contactId}/addresses/{addressId}"], produces = [MediaType.APPLICATION_JSON_VALUE])
    fun getAdress(user: User, @PathVariable("contactId") contactId: String, @PathVariable("addressId") addressId: String): WebResponse<AddressResponse> {
        val response = addressService.thisAddress(user, contactId, addressId)
        return WebResponse<AddressResponse>().apply { data = response }
    }

    @PutMapping(path = ["/api/contacts/{contactId}/addresses/{addressId}"], produces = [MediaType.APPLICATION_JSON_VALUE])
    fun updateAdress(user: User, @RequestBody req: UpdateAddresRequest, @PathVariable("contactId") contactId: String, @PathVariable("addressId") addressId: String): WebResponse<AddressResponse> {
        req.contactId = contactId
        req.addressId = addressId
        val response = addressService.updateAddress(user, req)
        return WebResponse<AddressResponse>().apply { data = response }
    }

    @DeleteMapping(path = ["/api/contacts/{contactId}/addresses/{addressId}"], produces = [MediaType.APPLICATION_JSON_VALUE])
    fun deleteAddress(user: User, @PathVariable("contactId") contactId: String, @PathVariable("addressId") addressId: String): WebResponse<String> {
        addressService.deleteAddress(user, contactId, addressId)
        return WebResponse<String>().apply { data = "OK" }
    }

    @GetMapping(path = ["/api/contacts/{contactId}/addresses"], produces = [MediaType.APPLICATION_JSON_VALUE])
    fun listAddresses(user: User, @PathVariable("contactId") contactId: String): WebResponse<List<AddressResponse>> {
        val responses = addressService.list(user, contactId)
        return WebResponse<List<AddressResponse>>().apply { data = responses }
    }
}
