package lanajauhar.contactapi.config

import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import lanajauhar.contactapi.controller.AuthController.Companion.COOKIE_NAME
import org.springframework.http.HttpStatus
import org.springframework.web.filter.OncePerRequestFilter

/**
 * Anti-CSRF: request yang diautentikasi lewat cookie (bukan header token)
 * dan mengubah state wajib membawa custom header X-Requested-With.
 * Request lintas situs dari <form>/img tidak bisa menyetel custom header,
 * sehingga serangan CSRF diblokir.
 */
class CsrfCookieFilter : OncePerRequestFilter() {

    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain
    ) {
        val isStateChanging = request.method !in setOf("GET", "HEAD", "OPTIONS")
        val hasSessionCookie = request.cookies?.any { it.name == COOKIE_NAME } == true
        val hasTokenHeader = request.getHeader("X-API-TOKEN") != null

        if (isStateChanging && hasSessionCookie && !hasTokenHeader) {
            if (request.getHeader(HEADER) == null) {
                response.status = HttpStatus.FORBIDDEN.value()
                response.contentType = "application/json"
                response.characterEncoding = Charsets.UTF_8.name()
                response.writer.write("""{"errorMessage":"CSRF check failed"}""")
                return
            }
        }
        filterChain.doFilter(request, response)
    }

    companion object {
        private const val HEADER = "X-Requested-With"
    }
}
