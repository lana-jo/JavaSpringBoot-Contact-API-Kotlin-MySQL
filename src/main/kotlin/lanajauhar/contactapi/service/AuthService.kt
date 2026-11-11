package lanajauhar.contactapi.service

import lanajauhar.contactapi.entity.User
import lanajauhar.contactapi.model.LoginUserRequest
import lanajauhar.contactapi.model.TokenResponse
import lanajauhar.contactapi.repository.UserRepository
import org.springframework.http.HttpStatus
import org.springframework.security.crypto.bcrypt.BCrypt
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException
import java.util.UUID

@Service
class AuthService(
    private val userRepo: UserRepository,
    private val validationService: ValidationService
) {
    @Transactional
    fun login(loginReq: LoginUserRequest): TokenResponse {
        validationService.validate(loginReq)
        val user = userRepo.findById(loginReq.username)
            .orElseThrow { ResponseStatusException(HttpStatus.UNAUTHORIZED, "username atau password Salah") }
        if (BCrypt.checkpw(loginReq.password, user.password)) {
            user.token = UUID.randomUUID().toString()
            user.tokenExpiredAt = expiredDate()
            userRepo.save(user)
            return TokenResponse().apply {
                token = user.token
                expired_at = user.tokenExpiredAt ?: 0L
            }
        }
        throw ResponseStatusException(HttpStatus.UNAUTHORIZED, "username atau password Salah")
    }

    @Transactional
    fun logout(user: User) {
        user.token = null
        user.tokenExpiredAt = null
        userRepo.save(user)
    }

    private fun expiredDate(): Long = System.currentTimeMillis() + (100000L * 16 * 24 * 30)
}
