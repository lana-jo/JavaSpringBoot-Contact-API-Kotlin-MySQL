package lanajauhar.contactapi.entity

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.Index
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.Table
import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Size

@Entity
@Table(name = "addresses", indexes = [Index(name = "fk_contacts_addresses", columnList = "contact_id")])
class Address {
    @Id
    @Size(max = 100)
    @Column(name = "id", nullable = false, length = 100)
    var id: String = ""

    @Size(max = 200)
    @Column(name = "street", length = 200)
    var street: String? = null

    @Size(max = 100)
    @Column(name = "city", length = 100)
    var city: String? = null

    @Size(max = 100)
    @Column(name = "province", length = 100)
    var province: String? = null

    @Size(max = 100)
    @NotNull
    @Column(name = "country", nullable = false, length = 100)
    var country: String = ""

    @Size(max = 100)
    @Column(name = "postal_code", length = 100)
    var postalCode: String? = null

    @ManyToOne
    @JoinColumn(name = "contact_id", referencedColumnName = "id")
    var contact: Contact? = null
}
