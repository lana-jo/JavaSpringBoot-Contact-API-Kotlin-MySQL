package lanajauhar.contactapi.model

import com.fasterxml.jackson.annotation.JsonIgnore
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size

class CreateAddresRequest {
    @JsonIgnore
    @NotBlank
    var contactId: String = ""

    @Size(max = 100)
    var street: String? = null

    @Size(max = 100)
    var city: String? = null

    @Size(max = 100)
    var province: String? = null

    @NotBlank
    @Size(max = 100)
    var country: String = ""

    @Size(max = 100)
    var postalCode: String? = null
}
