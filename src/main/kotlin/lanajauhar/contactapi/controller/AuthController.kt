package lanajauhar.contactapi.controller

import lanajauhar.contactapi.entity.User
import lanajauhar.contactapi.model.LoginUserRequest
import lanajauhar.contactapi.model.TokenResponse
import lanajauhar.contactapi.model.WebResponse
import lanajauhar.contactapi.service.AuthService
import org.springframework.http.MediaType
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RestController

@RestController
class AuthController(
    private val authService: AuthService
) {
    @PostMapping(
        path = ["/api/auth/login"],
        consumes = [MediaType.APPLICATION_JSON_VALUE],
        produces = [MediaType.APPLICATION_JSON_VALUE]
    )
    fun login(@RequestBody req: LoginUserRequest): WebResponse<TokenResponse> {
        val tokenResponse = authService.login(req)
        return WebResponse<TokenResponse>().apply { data = tokenResponse }
    }

    @DeleteMapping(path = ["/api/auth/logout"], produces = [MediaType.APPLICATION_JSON_VALUE])
    fun logout(user: User): WebResponse<String> {
        authService.logout(user)
        return WebResponse<String>().apply { data = "OK" }
    }
}
