package lanajauhar.contactapi.model

import jakarta.validation.constraints.NotNull

class SearchContactRequest {
    var name: String? = null
    var email: String? = null
    var phone: String? = null
    var query: String? = null

    @NotNull
    var page: Int? = 0

    @NotNull
    var size: Int? = 10
}
