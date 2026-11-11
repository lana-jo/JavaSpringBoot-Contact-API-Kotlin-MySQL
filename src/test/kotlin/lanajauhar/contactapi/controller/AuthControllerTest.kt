package lanajauhar.contactapi.controller

import tools.jackson.core.type.TypeReference
import tools.jackson.databind.ObjectMapper
import lanajauhar.contactapi.entity.User
import lanajauhar.contactapi.model.LoginUserRequest
import lanajauhar.contactapi.model.TokenResponse
import lanajauhar.contactapi.model.WebResponse
import lanajauhar.contactapi.repository.AddressRepository
import lanajauhar.contactapi.repository.ContactRepository
import lanajauhar.contactapi.repository.UserRepository
import org.springframework.security.crypto.bcrypt.BCrypt
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ActiveProfiles
import org.springframework.http.MediaType
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.setup.MockMvcBuilders
import org.springframework.web.context.WebApplicationContext
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status

@SpringBootTest
@ActiveProfiles("test")
class AuthControllerTest {
    @Autowired
    private lateinit var webApplicationContext: WebApplicationContext

    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var userRepo: UserRepository

    @Autowired
    private lateinit var contactRepository: ContactRepository

    @Autowired
    private lateinit var addressRepository: AddressRepository

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    @BeforeEach
    fun setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build()
        addressRepository.deleteAll()
        contactRepository.deleteAll()
        userRepo.deleteAll()
    }

    @Test
    fun loginFailedUserNotFound() {
        val loginReq = LoginUserRequest().apply {
            username = "username"
            password = "password"
        }
        mockMvc.perform(
            post("/api/auth/login")
                .accept(MediaType.APPLICATION_JSON)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginReq))
        ).andExpectAll(
            status().isUnauthorized
        ).andDo { result ->
            val response = objectMapper.readValue(result.response.contentAsString, object : TypeReference<WebResponse<String>>() {})
            org.junit.jupiter.api.Assertions.assertNotNull(response.errorMessage)
        }
    }

    @Test
    fun loginFailedWrongPW() {
        val user = User().apply {
            username = "username"
            name = "name"
            password = BCrypt.hashpw("password", BCrypt.gensalt())
        }
        userRepo.save(user)

        val loginReq = LoginUserRequest().apply {
            username = "username"
            password = "tidaksesuai"
        }
        mockMvc.perform(
            post("/api/auth/login")
                .accept(MediaType.APPLICATION_JSON)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginReq))
        ).andExpectAll(
            status().isUnauthorized
        ).andDo { result ->
            val response = objectMapper.readValue(result.response.contentAsString, object : TypeReference<WebResponse<String>>() {})
            org.junit.jupiter.api.Assertions.assertNotNull(response.errorMessage)
        }
    }

    @Test
    fun loginSucces() {
        val user = User().apply {
            username = "username"
            name = "name"
            password = BCrypt.hashpw("password", BCrypt.gensalt())
        }
        userRepo.save(user)

        val loginReq = LoginUserRequest().apply {
            username = "username"
            password = "password"
        }
        mockMvc.perform(
            post("/api/auth/login")
                .accept(MediaType.APPLICATION_JSON)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginReq))
        ).andExpectAll(
            status().isOk
        ).andDo { result ->
            val response = objectMapper.readValue(result.response.contentAsString, object : TypeReference<WebResponse<TokenResponse>>() {})
            org.junit.jupiter.api.Assertions.assertNull(response.errorMessage)
            org.junit.jupiter.api.Assertions.assertNotNull(response.data?.token)
            org.junit.jupiter.api.Assertions.assertNotNull(response.data?.expired_at)
            val userdb = userRepo.findById("username").orElse(null)
            org.junit.jupiter.api.Assertions.assertNotNull(userdb)
            org.junit.jupiter.api.Assertions.assertEquals(userdb?.token, response.data?.token)
            org.junit.jupiter.api.Assertions.assertEquals(userdb?.tokenExpiredAt, response.data?.expired_at)
        }
    }

    @Test
    fun logoutFailed() {
        mockMvc.perform(
            delete("/api/auth/logout")
                .accept(MediaType.APPLICATION_JSON)
        ).andExpectAll(
            status().isUnauthorized
        ).andDo { result ->
            val response = objectMapper.readValue(result.response.contentAsString, object : TypeReference<WebResponse<String>>() {})
            org.junit.jupiter.api.Assertions.assertNotNull(response.errorMessage)
        }
    }

    @Test
    fun logoutSucces() {
        val user = User().apply {
            username = "test"
            name = "test"
            password = BCrypt.hashpw("test", BCrypt.gensalt())
            token = "test"
            tokenExpiredAt = System.currentTimeMillis() * 1000000L
        }
        userRepo.save(user)

        mockMvc.perform(
            delete("/api/auth/logout")
                .accept(MediaType.APPLICATION_JSON)
                .header("X-API-TOKEN", "test")
        ).andExpectAll(
            status().isOk
        ).andDo { result ->
            val response = objectMapper.readValue(result.response.contentAsString, object : TypeReference<WebResponse<String>>() {})
            org.junit.jupiter.api.Assertions.assertNull(response.errorMessage)
            org.junit.jupiter.api.Assertions.assertEquals("OK", response.data)
            val userdb = userRepo.findById("test").orElse(null)
            org.junit.jupiter.api.Assertions.assertNotNull(userdb)
            org.junit.jupiter.api.Assertions.assertNull(userdb?.token)
            org.junit.jupiter.api.Assertions.assertNull(userdb?.tokenExpiredAt)
        }
    }
}
