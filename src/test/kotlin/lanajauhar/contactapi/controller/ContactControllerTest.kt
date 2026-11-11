package lanajauhar.contactapi.controller

import tools.jackson.core.type.TypeReference
import tools.jackson.databind.ObjectMapper
import lanajauhar.contactapi.entity.Contact
import lanajauhar.contactapi.entity.User
import lanajauhar.contactapi.model.ContactResponse
import lanajauhar.contactapi.model.CreateContactRequest
import lanajauhar.contactapi.model.UpdateContactRequest
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
import java.util.UUID

@SpringBootTest
@ActiveProfiles("test")
class ContactControllerTest {
    @Autowired
    private lateinit var webApplicationContext: WebApplicationContext

    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    @Autowired
    private lateinit var contactRepository: ContactRepository

    @Autowired
    private lateinit var userRepository: UserRepository

    @Autowired
    private lateinit var addressRepository: AddressRepository

    @Test
    fun createCotactFailed() {
        val req = CreateContactRequest().apply {
            firstName = ""
            lastName = "Salah"
        }
        mockMvc.perform(
            post("/api/contacts/create")
                .accept(MediaType.APPLICATION_JSON)
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .content(objectMapper.writeValueAsBytes(req))
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
    }

    @Test
    fun createCotactSucces() {
        val req = CreateContactRequest().apply {
            firstName = "lana"
            lastName = "jauhar"
            email = "lanajauhar@example.com"
            phone = "123456789"
        }
        mockMvc.perform(
            post("/api/contacts/create")
                .accept(MediaType.APPLICATION_JSON)
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .content(objectMapper.writeValueAsBytes(req))
                .header("X-API-TOKEN", "test")
        ).andExpectAll(
            status().isOk
        ).andDo { result ->
            val response = objectMapper.readValue(result.response.contentAsString, object : TypeReference<WebResponse<ContactResponse>>() {})
            org.junit.jupiter.api.Assertions.assertNull(response.errorMessage)
            org.junit.jupiter.api.Assertions.assertEquals("lana", response.data?.firstName)
            org.junit.jupiter.api.Assertions.assertEquals("jauhar", response.data?.lastName)
            org.junit.jupiter.api.Assertions.assertEquals("lanajauhar@example.com", response.data?.email)
            org.junit.jupiter.api.Assertions.assertEquals("123456789", response.data?.phone)
            org.junit.jupiter.api.Assertions.assertTrue(contactRepository.existsById(response.data?.id!!))
        }
    }

    @Test
    fun getCotactFailed() {
        mockMvc.perform(
            get("/api/contacts/122222")
                .accept(MediaType.APPLICATION_JSON)
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .header("X-API-TOKEN", "test")
        ).andExpectAll(
            status().isNotFound
        ).andDo { result ->
            val response = objectMapper.readValue(result.response.contentAsString, object : TypeReference<WebResponse<String>>() {})
            org.junit.jupiter.api.Assertions.assertNotNull(response.errorMessage)
        }
    }

    @Test
    fun getCotactSucces() {
        val user = userRepository.findById("test").orElseThrow()
        val contact = Contact().apply {
            id = UUID.randomUUID().toString()
            firstName = "Lana"
            lastName = "Jauhar"
            email = "lanajauhar@example.com"
            phone = "123456789"
            this.user = user
        }
        contactRepository.save(contact)

        mockMvc.perform(
            get("/api/contacts/" + contact.id)
                .accept(MediaType.APPLICATION_JSON)
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .header("X-API-TOKEN", "test")
        ).andExpectAll(
            status().isOk
        ).andDo { result ->
            val response = objectMapper.readValue(result.response.contentAsString, object : TypeReference<WebResponse<ContactResponse>>() {})
            org.junit.jupiter.api.Assertions.assertNull(response.errorMessage)
            org.junit.jupiter.api.Assertions.assertEquals(contact.id, response.data?.id)
            org.junit.jupiter.api.Assertions.assertEquals(contact.firstName, response.data?.firstName)
            org.junit.jupiter.api.Assertions.assertEquals(contact.lastName, response.data?.lastName)
            org.junit.jupiter.api.Assertions.assertEquals(contact.email, response.data?.email)
            org.junit.jupiter.api.Assertions.assertEquals(contact.phone, response.data?.phone)
            org.junit.jupiter.api.Assertions.assertTrue(contactRepository.existsById(response.data?.id!!))
        }
    }

    @Test
    fun updateCotactFailed() {
        val req = UpdateContactRequest().apply {
            firstName = ""
            lastName = "Salah"
        }
        mockMvc.perform(
            put("/api/contacts/1234")
                .accept(MediaType.APPLICATION_JSON)
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .content(objectMapper.writeValueAsBytes(req) as ByteArray)
                .header("X-API-TOKEN", "test")
        ).andExpectAll(
            status().isBadRequest
        ).andDo { result ->
            val response = objectMapper.readValue(result.response.contentAsString, object : TypeReference<WebResponse<String>>() {})
            org.junit.jupiter.api.Assertions.assertNotNull(response.errorMessage)
        }
    }

    @Test
    fun updateCotactSucces() {
        val user = userRepository.findById("test").orElseThrow()
        val contact = Contact().apply {
            this.user = user
            id = UUID.randomUUID().toString()
            firstName = "Lana"
            lastName = "Jauhar"
            email = "lanajauhar@example.com"
            phone = "123456789"
        }
        contactRepository.save(contact)

        val req = CreateContactRequest().apply {
            firstName = "berubah lana"
            lastName = "berubah jauhar"
            email = "lanajauhar@berubah.com"
            phone = "987654321"
        }
        mockMvc.perform(
            put("/api/contacts/" + contact.id)
                .accept(MediaType.APPLICATION_JSON)
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .content(objectMapper.writeValueAsBytes(req))
                .header("X-API-TOKEN", "test")
        ).andExpectAll(
            status().isOk
        ).andDo { result ->
            val response = objectMapper.readValue(result.response.contentAsString, object : TypeReference<WebResponse<ContactResponse>>() {})
            org.junit.jupiter.api.Assertions.assertNull(response.errorMessage)
            org.junit.jupiter.api.Assertions.assertEquals(req.firstName, response.data?.firstName)
            org.junit.jupiter.api.Assertions.assertEquals(req.lastName, response.data?.lastName)
            org.junit.jupiter.api.Assertions.assertEquals(req.email, response.data?.email)
            org.junit.jupiter.api.Assertions.assertEquals(req.phone, response.data?.phone)
            org.junit.jupiter.api.Assertions.assertTrue(contactRepository.existsById(response.data?.id!!))
        }
    }

}
