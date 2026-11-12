package lanajauhar.contactapi.entity

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.Index
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.OneToMany
import jakarta.persistence.Table
import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Size

@Entity
@Table(
    name = "users",
    uniqueConstraints = [jakarta.persistence.UniqueConstraint(name = "token", columnNames = ["token"])]
)
class User {
    @Id
    @Size(max = 100)
    @Column(name = "username", nullable = false, length = 100)
    var username: String = ""

    @Size(max = 100)
    @NotNull
    @Column(name = "password", nullable = false, length = 100)
    var password: String = ""

    @Size(max = 100)
    @NotNull
    @Column(name = "name", nullable = false, length = 100)
    var name: String = ""

    @Size(max = 100)
    @Column(name = "token", length = 100)
    var token: String? = null

    @Column(name = "token_expired_at")
    var tokenExpiredAt: Long? = null

    @OneToMany(mappedBy = "user")
    var contacts: List<Contact> = emptyList()

    override fun toString(): String =
        "User(username=$username, name=$name, tokenExpiredAt=$tokenExpiredAt)"
}
