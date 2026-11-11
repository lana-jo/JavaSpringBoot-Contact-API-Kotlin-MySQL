package lanajauhar.contactapi.controller

import tools.jackson.core.type.TypeReference
import tools.jackson.databind.ObjectMapper
import lanajauhar.contactapi.entity.User
import lanajauhar.contactapi.model.RegisterUserRequest
import lanajauhar.contactapi.model.UpdateUserRequest
import lanajauhar.contactapi.model.UserResponse
import lanajauhar.contactapi.model.WebResponse
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
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status

@SpringBootTest
@ActiveProfiles("test")
class UserControllerTest {
    @Autowired
    private lateinit var webApplicationContext: WebApplicationContext

    private lateinit var mvc: MockMvc

    @Autowired
    private lateinit var userRepository: UserRepository

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    @BeforeEach
    fun setUp() {
        mvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build()
        userRepository.deleteAll()
    }

    @Test
    fun testRegisterSuccess() {
        val request = RegisterUserRequest().apply {
            username = "coba"
            password = "password"
            name = "lana"
        }
        mvc.perform(
            post("/api/register")
                .accept(MediaType.APPLICATION_JSON)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
        ).andExpectAll(
            status().isOk
        ).andDo { result ->
            val response = objectMapper.readValue(result.response.contentAsString, object : TypeReference<WebResponse<String>>() {})
            org.junit.jupiter.api.Assertions.assertEquals("OK", response.data)
        }
    }

    @Test
    fun testRegisterBadRequest() {
        val req = RegisterUserRequest().apply {
            username = ""
            password = ""
            name = ""
        }
        mvc.perform(
            post("/api/register")
                .accept(MediaType.APPLICATION_JSON)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req))
        ).andExpectAll(
            status().isBadRequest
        ).andDo { result ->
            val response = objectMapper.readValue(result.response.contentAsString, object : TypeReference<WebResponse<String>>() {})
            org.junit.jupiter.api.Assertions.assertNotNull(response.errorMessage)
        }
    }

    @Test
    fun testRegisterDuplicate() {
        val user = User().apply {
            username = "test"
            password = BCrypt.hashpw("password", BCrypt.gensalt())
            name = "siapa"
        }
        userRepository.save(user)

        val req = RegisterUserRequest().apply {
            username = "test"
            password = "pw"
            name = "name"
        }
        mvc.perform(
            post("/api/register")
                .accept(MediaType.APPLICATION_JSON)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req))
        ).andExpectAll(
            status().isBadRequest
        ).andDo { result ->
            val response = objectMapper.readValue(result.response.contentAsString, object : TypeReference<WebResponse<String>>() {})
            org.junit.jupiter.api.Assertions.assertNotNull(response.errorMessage)
        }
    }

    @Test
    fun currentUserTokenNotValid() {
        mvc.perform(
            get("/api/currentUser")
                .accept(MediaType.APPLICATION_JSON)
                .header("X-API-TOKEN", "Token Tidak Ditemukan")
        ).andExpectAll(
            status().isUnauthorized
        ).andDo { result ->
            val response = objectMapper.readValue(result.response.contentAsString, object : TypeReference<WebResponse<String>>() {})
            org.junit.jupiter.api.Assertions.assertNotNull(response.errorMessage)
        }
    }

    @Test
    fun currentUserTokenNotSend() {
        mvc.perform(
            get("/api/currentUser")
                .accept(MediaType.APPLICATION_JSON)
        ).andExpectAll(
            status().isUnauthorized
        ).andDo { result ->
            val response = objectMapper.readValue(result.response.contentAsString, object : TypeReference<WebResponse<String>>() {})
            org.junit.jupiter.api.Assertions.assertNotNull(response.errorMessage)
        }
    }

    @Test
    fun currentUserSucces() {
        val user = User().apply {
            username = "test"
            name = "test"
            password = BCrypt.hashpw("test", BCrypt.gensalt())
            token = "test"
            tokenExpiredAt = System.currentTimeMillis() * 1000000L
        }
        userRepository.save(user)

        mvc.perform(
            get("/api/currentUser")
                .accept(MediaType.APPLICATION_JSON)
                .header("X-API-TOKEN", "test")
        ).andExpectAll(
            status().isOk
        ).andDo { result ->
            val response = objectMapper.readValue(result.response.contentAsString, object : TypeReference<WebResponse<UserResponse>>() {})
            org.junit.jupiter.api.Assertions.assertNull(response.errorMessage)
            org.junit.jupiter.api.Assertions.assertEquals("test", response.data?.username)
            org.junit.jupiter.api.Assertions.assertEquals("test", response.data?.name)
        }
    }

    @Test
    fun currentUserTokenExpired() {
        val user = User().apply {
            username = "test"
            name = "test"
            password = BCrypt.hashpw("test", BCrypt.gensalt())
            token = "test"
            tokenExpiredAt = System.currentTimeMillis() - 1000000L
        }
        userRepository.save(user)

        mvc.perform(
            get("/api/currentUser")
                .accept(MediaType.APPLICATION_JSON)
                .header("X-API-TOKEN", "test")
        ).andExpectAll(
            status().isUnauthorized
        ).andDo { result ->
            val response = objectMapper.readValue(result.response.contentAsString, object : TypeReference<WebResponse<String>>() {})
            org.junit.jupiter.api.Assertions.assertNotNull(response.errorMessage)
        }
    }

    @Test
    fun updateUserTokenNotSend() {
        val req = UpdateUserRequest()
        mvc.perform(
            patch("/api/currentUser")
                .accept(MediaType.APPLICATION_JSON)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req))
        ).andExpectAll(
            status().isUnauthorized
        ).andDo { result ->
            val response = objectMapper.readValue(result.response.contentAsString, object : TypeReference<WebResponse<String>>() {})
            org.junit.jupiter.api.Assertions.assertNotNull(response.errorMessage)
        }
    }

    @Test
    fun updateUserSucces() {
        val user = User().apply {
            username = "test"
            name = "test"
            password = BCrypt.hashpw("test", BCrypt.gensalt())
            token = "test"
            tokenExpiredAt = System.currentTimeMillis() * 1000000L
        }
        userRepository.save(user)

        val req = UpdateUserRequest().apply {
            name = "Lana"
            password = "lana12346789"
        }
        mvc.perform(
            patch("/api/currentUser")
                .accept(MediaType.APPLICATION_JSON)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req))
                .header("X-API-TOKEN", "test")
        ).andExpectAll(
            status().isOk
        ).andDo { result ->
            val response = objectMapper.readValue(result.response.contentAsString, object : TypeReference<WebResponse<UserResponse>>() {})
            org.junit.jupiter.api.Assertions.assertNull(response.errorMessage)
            org.junit.jupiter.api.Assertions.assertEquals("test", response.data?.username)
            org.junit.jupiter.api.Assertions.assertEquals("Lana", response.data?.name)

            val userdb = userRepository.findById("test").orElse(null)
            org.junit.jupiter.api.Assertions.assertNotNull(userdb)
            org.junit.jupiter.api.Assertions.assertTrue(BCrypt.checkpw("lana12346789", userdb!!.password))
        }
    }
}
