package lanajauhar.contactapi.repository

import lanajauhar.contactapi.entity.User
import org.springframework.data.jpa.repository.JpaRepository

interface UserRepository : JpaRepository<User, String> {
    fun findFirstByToken(token: String): User?
}
