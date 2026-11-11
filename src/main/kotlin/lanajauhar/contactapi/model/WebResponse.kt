package lanajauhar.contactapi.model

class WebResponse<T> {
    var data: T? = null
    var errorMessage: String? = null
    var paging: PagingResponse? = null
}
