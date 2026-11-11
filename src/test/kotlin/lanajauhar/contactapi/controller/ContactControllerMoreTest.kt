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
class ContactControllerMoreTest {
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
    fun deleteCotactFailed() {
        mockMvc.perform(
            delete("/api/contacts/122222")
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
    fun deleteCotactSucces() {
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
            delete("/api/contacts/" + contact.id)
                .accept(MediaType.APPLICATION_JSON)
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .header("X-API-TOKEN", "test")
        ).andExpectAll(
            status().isOk
        ).andDo { result ->
            val response = objectMapper.readValue(result.response.contentAsString, object : TypeReference<WebResponse<String>>() {})
            org.junit.jupiter.api.Assertions.assertNull(response.errorMessage)
            org.junit.jupiter.api.Assertions.assertEquals("OK", response.data)
        }
    }

    @Test
    fun searchCotactFailed() {
        mockMvc.perform(
            get("/api/contacts")
                .accept(MediaType.APPLICATION_JSON)
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .header("X-API-TOKEN", "test")
        ).andExpectAll(
            status().isOk
        ).andDo { result ->
            val response = objectMapper.readValue(result.response.contentAsString, object : TypeReference<WebResponse<List<ContactResponse>>>() {})
            org.junit.jupiter.api.Assertions.assertNull(response.errorMessage)
            org.junit.jupiter.api.Assertions.assertEquals(0, response.data?.size)
            org.junit.jupiter.api.Assertions.assertEquals(0, response.paging?.currentPage)
            org.junit.jupiter.api.Assertions.assertEquals(0, response.paging?.totalPage)
            org.junit.jupiter.api.Assertions.assertEquals(10, response.paging?.size)
        }
    }

    @Test
    fun searchContactSucces() {
        val user = userRepository.findById("test").orElseThrow()
        for (i in 0 until 100) {
            val contact = Contact().apply {
                id = UUID.randomUUID().toString()
                firstName = "Lana$i"
                lastName = "Jauhar"
                email = "lanajauhar@example.com"
                phone = "123456789"
                this.user = user
            }
            contactRepository.save(contact)
        }

        mockMvc.perform(
            get("/api/contacts")
                .queryParam("name", "Lana")
                .accept(MediaType.APPLICATION_JSON)
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .header("X-API-TOKEN", "test")
        ).andExpectAll(
            status().isOk
        ).andDo { result ->
            val response = objectMapper.readValue(result.response.contentAsString, object : TypeReference<WebResponse<List<ContactResponse>>>() {})
            org.junit.jupiter.api.Assertions.assertNull(response.errorMessage)
            org.junit.jupiter.api.Assertions.assertEquals(10, response.data?.size)
            org.junit.jupiter.api.Assertions.assertEquals(0, response.paging?.currentPage)
            org.junit.jupiter.api.Assertions.assertEquals(10, response.paging?.totalPage)
            org.junit.jupiter.api.Assertions.assertEquals(10, response.paging?.size)
        }

        mockMvc.perform(
            get("/api/contacts")
                .queryParam("name", "Jauhar")
                .accept(MediaType.APPLICATION_JSON)
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .header("X-API-TOKEN", "test")
        ).andExpectAll(
            status().isOk
        ).andDo { result ->
            val response = objectMapper.readValue(result.response.contentAsString, object : TypeReference<WebResponse<List<ContactResponse>>>() {})
            org.junit.jupiter.api.Assertions.assertNull(response.errorMessage)
            org.junit.jupiter.api.Assertions.assertEquals(10, response.data?.size)
            org.junit.jupiter.api.Assertions.assertEquals(0, response.paging?.currentPage)
            org.junit.jupiter.api.Assertions.assertEquals(10, response.paging?.totalPage)
            org.junit.jupiter.api.Assertions.assertEquals(10, response.paging?.size)
        }

        mockMvc.perform(
            get("/api/contacts")
                .queryParam("email", "example.com")
                .accept(MediaType.APPLICATION_JSON)
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .header("X-API-TOKEN", "test")
        ).andExpectAll(
            status().isOk
        ).andDo { result ->
            val response = objectMapper.readValue(result.response.contentAsString, object : TypeReference<WebResponse<List<ContactResponse>>>() {})
            org.junit.jupiter.api.Assertions.assertNull(response.errorMessage)
            org.junit.jupiter.api.Assertions.assertEquals(10, response.data?.size)
            org.junit.jupiter.api.Assertions.assertEquals(0, response.paging?.currentPage)
            org.junit.jupiter.api.Assertions.assertEquals(10, response.paging?.totalPage)
            org.junit.jupiter.api.Assertions.assertEquals(10, response.paging?.size)
        }

        mockMvc.perform(
            get("/api/contacts")
                .queryParam("phone", "123456")
                .queryParam("page", "1000")
                .accept(MediaType.APPLICATION_JSON)
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .header("X-API-TOKEN", "test")
        ).andExpectAll(
            status().isOk
        ).andDo { result ->
            val response = objectMapper.readValue(result.response.contentAsString, object : TypeReference<WebResponse<List<ContactResponse>>>() {})
            org.junit.jupiter.api.Assertions.assertNull(response.errorMessage)
            org.junit.jupiter.api.Assertions.assertEquals(0, response.data?.size)
            org.junit.jupiter.api.Assertions.assertEquals(1000, response.paging?.currentPage)
            org.junit.jupiter.api.Assertions.assertEquals(10, response.paging?.totalPage)
            org.junit.jupiter.api.Assertions.assertEquals(10, response.paging?.size)
        }
    }
}

