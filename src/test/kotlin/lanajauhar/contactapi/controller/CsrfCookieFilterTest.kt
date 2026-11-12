package lanajauhar.contactapi.controller

import lanajauhar.contactapi.config.CsrfCookieFilter
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ActiveProfiles
import org.springframework.http.MediaType
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import org.springframework.test.web.servlet.setup.MockMvcBuilders
import org.springframework.web.context.WebApplicationContext

/**
 * Verifikasi CsrfCookieFilter: request state-changing via cookie
 * wajib membawa header X-Requested-With.
 */
@SpringBootTest
@ActiveProfiles("test")
class CsrfCookieFilterTest {
    @Autowired
    private lateinit var webApplicationContext: WebApplicationContext

    private lateinit var mockMvc: MockMvc

    @BeforeEach
    fun setUp() {
        mockMvc = MockMvcBuilders
            .webAppContextSetup(webApplicationContext)
            .addFilter<org.springframework.test.web.servlet.setup.DefaultMockMvcBuilder>(CsrfCookieFilter())
            .build()
    }

    @Test
    fun cookieWithoutCustomHeaderRejected() {
        mockMvc.perform(
            delete("/api/auth/logout")
                .cookie(jakarta.servlet.http.Cookie("CONTACT_API_TOKEN", "dummy"))
        ).andExpect(status().isForbidden)
    }

    @Test
    fun cookieWithCustomHeaderPasses() {
        // Cookie + X-Requested-With → lolos filter (401 karena token dummy).
        mockMvc.perform(
            delete("/api/auth/logout")
                .cookie(jakarta.servlet.http.Cookie("CONTACT_API_TOKEN", "dummy"))
                .header("X-Requested-With", "XMLHttpRequest")
        ).andExpect(status().isUnauthorized)
    }

    @Test
    fun loginWithoutCookieNotBlocked() {
        // Login tidak membawa cookie sesi → filter tidak memblokir (401 kredensial).
        mockMvc.perform(
            post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""{"username":"x","password":"wrongpass"}""")
        ).andExpect(status().isUnauthorized)
    }
}
