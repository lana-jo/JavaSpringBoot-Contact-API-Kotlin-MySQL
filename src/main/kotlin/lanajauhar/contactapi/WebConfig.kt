package lanajauhar.contactapi

import lanajauhar.contactapi.config.CsrfCookieFilter
import lanajauhar.contactapi.config.RateLimitInterceptor
import lanajauhar.contactapi.resolver.UserArgumentResolver
import org.springframework.boot.web.servlet.FilterRegistrationBean
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.web.method.support.HandlerMethodArgumentResolver
import org.springframework.web.servlet.config.annotation.CorsRegistry
import org.springframework.web.servlet.config.annotation.InterceptorRegistry
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer

@Configuration
class WebConfig(
    private val userArgumentResolver: UserArgumentResolver,
    private val rateLimitInterceptor: RateLimitInterceptor
) : WebMvcConfigurer {
    override fun addArgumentResolvers(resolvers: MutableList<HandlerMethodArgumentResolver>) {
        resolvers.add(userArgumentResolver)
    }

    @Bean
    fun csrfCookieFilterRegistration(): FilterRegistrationBean<CsrfCookieFilter> {
        val registration = FilterRegistrationBean<CsrfCookieFilter>()
        registration.setFilter(CsrfCookieFilter())
        registration.addUrlPatterns("/api/*")
        registration.setOrder(1)
        return registration
    }

    override fun addInterceptors(registry: InterceptorRegistry) {
        registry.addInterceptor(rateLimitInterceptor)
            .addPathPatterns("/api/auth/*")
    }

    override fun addCorsMappings(registry: CorsRegistry) {
        registry.addMapping("/**")
            .allowedOriginPatterns("http://localhost:*", "http://127.0.0.1:*")
            .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
            .allowedHeaders("*")
            .exposedHeaders("X-API-TOKEN")
            .allowCredentials(true)
    }
}
