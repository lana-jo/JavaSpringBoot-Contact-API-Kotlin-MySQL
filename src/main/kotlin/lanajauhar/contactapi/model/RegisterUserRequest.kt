package lanajauhar.contactapi.model

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size

class RegisterUserRequest {
    @NotBlank
    @Size(max = 100)
    var username: String = ""

    @NotBlank
    @Size(max = 100)
    var password: String = ""

    @NotBlank
    @Size(max = 100)
    var name: String = ""
}
