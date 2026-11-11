package lanajauhar.contactapi.model

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size

class LoginUserRequest {
    @NotBlank
    @Size(max = 100)
    var username: String = ""

    @NotBlank
    @Size(max = 100)
    var password: String = ""
}
