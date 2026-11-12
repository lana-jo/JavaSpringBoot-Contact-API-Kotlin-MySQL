package lanajauhar.contactapi.config

import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.stereotype.Component
import org.springframework.web.servlet.HandlerInterceptor
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.Executors
import java.util.concurrent.TimeUnit

/**
 * Rate limiter per-IP untuk endpoint auth, mencegah brute-force pada login.
 * Catatan: hanya menggunakan remoteAddr; X-Forwarded-For tidak dipercaya
 * karena bisa dipalsukan klien untuk bypass.
 */
@Component
class RateLimitInterceptor : HandlerInterceptor {

    private class Window(
        var count: Int,
        val resetAt: Long
    )

    private val windows = ConcurrentHashMap<String, Window>()

    init {
        // Bersikan window kedaluwarsa agar map tidak tumbuh tanpa batas.
        val cleaner = Executors.newSingleThreadScheduledExecutor { r ->
            Thread(r, "rate-limit-cleaner").apply { isDaemon = true }
        }
        cleaner.scheduleAtFixedRate(
            {
                val cutoff = System.currentTimeMillis()
                windows.entries.removeIf { it.value.resetAt <= cutoff }
            },
            1, 1, TimeUnit.MINUTES
        )
    }

    override fun preHandle(request: HttpServletRequest, response: HttpServletResponse, handler: Any): Boolean {
        val key = "${request.remoteAddr}:${request.requestURI}"
        val now = System.currentTimeMillis()

        val window = windows.compute(key) { _, old ->
            if (old != null && now < old.resetAt) old else Window(0, now + WINDOW_MS)
        } ?: Window(0, now + WINDOW_MS)

        synchronized(window) {
            if (window.count >= MAX_REQUESTS) {
                response.status = HttpStatus.TOO_MANY_REQUESTS.value()
                response.contentType = MediaType.APPLICATION_JSON_VALUE
                response.characterEncoding = Charsets.UTF_8.name()
                response.writer.write("""{"errors":"Terlalu banyak permintaan, coba lagi nanti"}""")
                return false
            }
            window.count++
        }
        return true
    }

    /** Hanya untuk pengujian: reset semua window rate limit. */
    fun reset() {
        windows.clear()
    }

    companion object {
        private const val MAX_REQUESTS = 10
        private const val WINDOW_MS = 60_000L
    }
}
