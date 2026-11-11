package lanajauhar.contactapi.model

import jakarta.validation.constraints.Size

class UpdateUserRequest {
    @Size(max = 100)
    var name: String? = null

    @Size(max = 100)
    var password: String? = null
}
