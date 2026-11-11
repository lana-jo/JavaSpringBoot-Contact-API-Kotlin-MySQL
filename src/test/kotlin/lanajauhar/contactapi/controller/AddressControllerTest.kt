package lanajauhar.contactapi.controller

import tools.jackson.core.type.TypeReference
import tools.jackson.databind.ObjectMapper
import lanajauhar.contactapi.entity.Address
import lanajauhar.contactapi.entity.Contact
import lanajauhar.contactapi.entity.User
import lanajauhar.contactapi.model.AddressResponse
import lanajauhar.contactapi.model.CreateAddresRequest
import lanajauhar.contactapi.model.WebResponse
import lanajauhar.contactapi.repository.AddressRepository
import lanajauhar.contactapi.repository.ContactRepository
import lanajauhar.contactapi.repository.UserRepository
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ActiveProfiles
import org.springframework.http.MediaType
import org.springframework.security.crypto.bcrypt.BCrypt
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.setup.MockMvcBuilders
import org.springframework.web.context.WebApplicationContext
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status

@SpringBootTest
@ActiveProfiles("test")
class AddressControllerTest {
    @Autowired
    private lateinit var userRepository: UserRepository

    @Autowired
    private lateinit var addressRepository: AddressRepository

    @Autowired
    private lateinit var contactRepository: ContactRepository

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    @Autowired
    private lateinit var webApplicationContext: WebApplicationContext

    private lateinit var mockMvc: MockMvc

    @Test
    fun createAddressBadReq() {
        val req = CreateAddresRequest().apply {
            country = ""
        }
        mockMvc.perform(
            post("/api/contacts/test/addresses")
                .accept(MediaType.APPLICATION_JSON)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req))
                .header("X-API-TOKEN", "test")
        ).andExpectAll(
            status().isBadRequest
        ).andDo { result ->
            val response = objectMapper.readValue(result.response.contentAsString, object : TypeReference<WebResponse<String>>() {})
            org.junit.jupiter.api.Assertions.assertNotNull(response.errorMessage)
        }
    }

    @BeforeEach
    fun setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build()
        addressRepository.deleteAll()
        contactRepository.deleteAll()
        userRepository.deleteAll()

        val user = User().apply {
            username = "test"
            name = "test"
            password = BCrypt.hashpw("test", BCrypt.gensalt())
            token = "test"
            tokenExpiredAt = System.currentTimeMillis() * 1000000L
        }
        userRepository.save(user)

        val contact = Contact().apply {
            id = "test"
            firstName = "Lana"
            lastName = "Jauhar"
            email = "lanajauhar@example.com"
            phone = "123456789"
            this.user = user
        }
        contactRepository.save(contact)
    }

    @Test
    fun createAddressSucces() {
        val req = CreateAddresRequest().apply {
            street = "Jalan"
            city = "Semarang"
            province = "Jawa Tengah"
            country = "Indonesia"
            postalCode = "51000"
        }
        mockMvc.perform(
            post("/api/contacts/test/addresses")
                .accept(MediaType.APPLICATION_JSON)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req))
                .header("X-API-TOKEN", "test")
        ).andExpectAll(
            status().isOk
        ).andDo { result ->
            val response = objectMapper.readValue(result.response.contentAsString, object : TypeReference<WebResponse<AddressResponse>>() {})
            org.junit.jupiter.api.Assertions.assertNull(response.errorMessage)
            org.junit.jupiter.api.Assertions.assertEquals(req.street, response.data?.street)
            org.junit.jupiter.api.Assertions.assertEquals(req.city, response.data?.city)
            org.junit.jupiter.api.Assertions.assertEquals(req.province, response.data?.province)
            org.junit.jupiter.api.Assertions.assertEquals(req.country, response.data?.country)
            org.junit.jupiter.api.Assertions.assertEquals(req.postalCode, response.data?.postalCode)
            org.junit.jupiter.api.Assertions.assertTrue(addressRepository.existsById(response.data?.id!!))
        }
    }

    @Test
    fun getAddressNotFound() {
        mockMvc.perform(
            get("/api/contacts/test/addresses/test")
                .accept(MediaType.APPLICATION_JSON)
                .contentType(MediaType.APPLICATION_JSON)
                .header("X-API-TOKEN", "test")
        ).andExpectAll(
            status().isNotFound
        ).andDo { result ->
            val response = objectMapper.readValue(result.response.contentAsString, object : TypeReference<WebResponse<String>>() {})
            org.junit.jupiter.api.Assertions.assertNotNull(response.errorMessage)
        }
    }

    @Test
    fun getAddressSucces() {
        val contact = contactRepository.findById("test").orElseThrow()
        val address = Address().apply {
            id = "test"
            street = "jalan"
            city = "Semarang"
            province = "Jawa Tengah"
            country = "Indonesia"
            postalCode = "51000"
            this.contact = contact
        }
        addressRepository.save(address)

        mockMvc.perform(
            get("/api/contacts/test/addresses/test")
                .accept(MediaType.APPLICATION_JSON)
                .contentType(MediaType.APPLICATION_JSON)
                .header("X-API-TOKEN", "test")
        ).andExpectAll(
            status().isOk
        ).andDo { result ->
            val response = objectMapper.readValue(result.response.contentAsString, object : TypeReference<WebResponse<AddressResponse>>() {})
            org.junit.jupiter.api.Assertions.assertNull(response.errorMessage)
            org.junit.jupiter.api.Assertions.assertEquals(address.street, response.data?.street)
            org.junit.jupiter.api.Assertions.assertEquals(address.city, response.data?.city)
            org.junit.jupiter.api.Assertions.assertEquals(address.province, response.data?.province)
            org.junit.jupiter.api.Assertions.assertEquals(address.country, response.data?.country)
            org.junit.jupiter.api.Assertions.assertEquals(address.postalCode, response.data?.postalCode)
        }
    }

}
