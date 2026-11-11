package lanajauhar.contactapi.service

import lanajauhar.contactapi.entity.User
import lanajauhar.contactapi.model.RegisterUserRequest
import lanajauhar.contactapi.model.UpdateUserRequest
import lanajauhar.contactapi.model.UserResponse
import lanajauhar.contactapi.repository.UserRepository
import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
import org.springframework.security.crypto.bcrypt.BCrypt
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException

@Service
class UserService(
    private val userRepo: UserRepository,
    private val validationService: ValidationService
) {
    private val log = LoggerFactory.getLogger(UserService::class.java)

    @Transactional
    fun register(request: RegisterUserRequest) {
        validationService.validate(request)
        if (userRepo.existsById(request.username)) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Username Sudah Terdaftar")
        }
        val user = User().apply {
            username = request.username
            password = BCrypt.hashpw(request.password, BCrypt.gensalt())
            name = request.name
        }
        userRepo.save(user)
    }

    @Transactional
    fun current(user: User): UserResponse {
        return UserResponse().apply {
            username = user.username
            name = user.name
        }
    }

    @Transactional
    fun update(user: User, req: UpdateUserRequest): UserResponse {
        if (req.name != null) {
            user.name = req.name!!
        }
        if (req.password != null) {
            user.password = BCrypt.hashpw(req.password!!, BCrypt.gensalt())
        }
        userRepo.save(user)
        log.info("User {} updated", user.name)
        return UserResponse().apply {
            name = user.name
            username = user.username
        }
    }
}
