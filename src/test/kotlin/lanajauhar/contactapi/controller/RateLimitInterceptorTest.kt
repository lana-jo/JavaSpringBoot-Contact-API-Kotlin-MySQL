package lanajauhar.contactapi.controller

import lanajauhar.contactapi.config.RateLimitInterceptor
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ActiveProfiles
import org.springframework.http.MediaType
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import org.springframework.test.web.servlet.setup.MockMvcBuilders
import org.springframework.web.context.WebApplicationContext

@SpringBootTest
@ActiveProfiles("test")
class RateLimitInterceptorTest {
    @Autowired
    private lateinit var webApplicationContext: WebApplicationContext

    @Autowired
    private lateinit var rateLimitInterceptor: RateLimitInterceptor

    private lateinit var mockMvc: MockMvc

    @BeforeEach
    fun setUp() {
        rateLimitInterceptor.reset()
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build()
    }

    @Test
    fun rateLimitBlocksAfterMaxRequests() {
        val body = """{"username":"x","password":"wrongpass"}"""

        for (i in 1..10) {
            mockMvc.perform(
                post("/api/auth/login")
                    .accept(MediaType.APPLICATION_JSON)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(body)
            ).andExpect(status().isUnauthorized)
        }

        // Request ke-11 dari IP yang sama harus diblok
        mockMvc.perform(
            post("/api/auth/login")
                .accept(MediaType.APPLICATION_JSON)
                .contentType(MediaType.APPLICATION_JSON)
                .content(body)
        ).andExpect(status().isTooManyRequests)
    }
}
