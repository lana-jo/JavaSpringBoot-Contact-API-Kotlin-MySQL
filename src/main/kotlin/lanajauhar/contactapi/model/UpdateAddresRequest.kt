package lanajauhar.contactapi.model

import com.fasterxml.jackson.annotation.JsonIgnore
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size

class UpdateAddresRequest {
    @JsonIgnore
    @NotBlank
    var contactId: String = ""

    @JsonIgnore
    @NotBlank
    var addressId: String = ""

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
