package lanajauhar.contactapi.model

import com.fasterxml.jackson.annotation.JsonIgnore
import jakarta.validation.constraints.Email
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size

class UpdateContactRequest {
    @JsonIgnore
    @NotBlank
    var id: String = ""

    @NotBlank(message = "First name dibutuhkan")
    @Size(max = 100)
    var firstName: String = ""

    @Size(max = 100)
    var lastName: String? = null

    @Size(max = 100)
    @Email(message = "Invalid email dibutuhkan")
    var email: String? = null

    @Size(max = 100)
    var phone: String? = null
}
