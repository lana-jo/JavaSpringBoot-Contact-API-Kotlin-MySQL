package lanajauhar.contactapi.controller

import lanajauhar.contactapi.entity.User
import lanajauhar.contactapi.model.LoginUserRequest
import lanajauhar.contactapi.model.TokenResponse
import lanajauhar.contactapi.model.WebResponse
import lanajauhar.contactapi.service.AuthService
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.MediaType
import org.springframework.http.ResponseCookie
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RestController
import java.time.Duration

@RestController
class AuthController(
    private val authService: AuthService,
    @Value("\${app.cookie.secure:true}") private val secureCookies: Boolean
) {
    @PostMapping(
        path = ["/api/auth/login"],
        consumes = [MediaType.APPLICATION_JSON_VALUE],
        produces = [MediaType.APPLICATION_JSON_VALUE]
    )
    fun login(@RequestBody req: LoginUserRequest, response: jakarta.servlet.http.HttpServletResponse): WebResponse<TokenResponse> {
        val tokenResponse = authService.login(req)
        response.addHeader(
            "Set-Cookie",
            ResponseCookie.from(COOKIE_NAME, tokenResponse.token)
                .httpOnly(true)
                .secure(secureCookies)
                .sameSite("Strict")
                .path("/")
                .maxAge(maxAgeMillis(tokenResponse.expired_at))
                .build()
                .toString()
        )
        return WebResponse<TokenResponse>().apply { data = tokenResponse }
    }

    @DeleteMapping(path = ["/api/auth/logout"], produces = [MediaType.APPLICATION_JSON_VALUE])
    fun logout(user: User, response: jakarta.servlet.http.HttpServletResponse): WebResponse<String> {
        authService.logout(user)
        response.addHeader(
            "Set-Cookie",
            ResponseCookie.from(COOKIE_NAME, "")
                .httpOnly(true)
                .secure(secureCookies)
                .sameSite("Strict")
                .path("/")
                .maxAge(0)
                .build()
                .toString()
        )
        return WebResponse<String>().apply { data = "OK" }
    }

    /** Durasi sisa hidup cookie (delta), bukan timestamp absolut. */
    private fun maxAgeMillis(expiredAt: Long): Duration {
        return Duration.ofMillis((expiredAt - System.currentTimeMillis()).coerceAtLeast(0))
    }

    companion object {
        const val COOKIE_NAME = "CONTACT_API_TOKEN"
    }
}
