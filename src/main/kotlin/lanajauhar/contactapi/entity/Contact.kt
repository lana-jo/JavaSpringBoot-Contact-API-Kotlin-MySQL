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
@Table(name = "contacts", indexes = [Index(name = "fk_users_contacts", columnList = "username")])
class Contact {
    @Id
    var id: String = ""

    @Size(max = 100)
    @NotNull
    @Column(name = "first_name", nullable = false, length = 100)
    var firstName: String = ""

    @Size(max = 100)
    @Column(name = "last_name", length = 100)
    var lastName: String? = null

    @Size(max = 100)
    @Column(name = "phone", length = 100)
    var phone: String? = null

    @Size(max = 100)
    @Column(name = "email", length = 100)
    var email: String? = null

    @ManyToOne
    @JoinColumn(name = "username", referencedColumnName = "username")
    var user: User? = null

    @OneToMany(mappedBy = "contact")
    var addresses: List<Address> = emptyList()
}
