package lanajauhar.contactapi.resolver

import jakarta.servlet.http.HttpServletRequest
import lanajauhar.contactapi.entity.User
import lanajauhar.contactapi.repository.UserRepository
import lanajauhar.contactapi.controller.AuthController.Companion.COOKIE_NAME
import org.springframework.core.MethodParameter
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Component
import org.springframework.web.bind.support.WebDataBinderFactory
import org.springframework.web.context.request.NativeWebRequest
import org.springframework.web.method.support.HandlerMethodArgumentResolver
import org.springframework.web.method.support.ModelAndViewContainer
import org.springframework.web.server.ResponseStatusException

@Component
class UserArgumentResolver(
    private val userRepo: UserRepository
) : HandlerMethodArgumentResolver {

    override fun supportsParameter(parameter: MethodParameter): Boolean {
        return User::class.java.isAssignableFrom(parameter.parameterType)
    }

    override fun resolveArgument(
        parameter: MethodParameter,
        mavContainer: ModelAndViewContainer?,
        webRequest: NativeWebRequest,
        binderFactory: WebDataBinderFactory?
    ): Any {
        val servletRequest = webRequest.getNativeRequest(HttpServletRequest::class.java)
        // Header (mobile) atau cookie HttpOnly (web) — keduanya valid.
        val token = servletRequest?.getHeader("X-API-TOKEN")
            ?: servletRequest?.cookies
                ?.firstOrNull { it.name == COOKIE_NAME }
                ?.value
        if (token == null) {
            throw ResponseStatusException(HttpStatus.UNAUTHORIZED, "Tidak Terdaftar")
        }
        val user = userRepo.findFirstByToken(token)
            ?: throw ResponseStatusException(HttpStatus.UNAUTHORIZED, "Tidak Terdaftar")
        if ((user.tokenExpiredAt ?: 0L) < System.currentTimeMillis()) {
            throw ResponseStatusException(HttpStatus.UNAUTHORIZED, "Token Habis")
        }
        return user
    }
}
