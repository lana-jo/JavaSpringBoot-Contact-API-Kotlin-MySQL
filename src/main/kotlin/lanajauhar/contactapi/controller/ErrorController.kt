package lanajauhar.contactapi.controller

import jakarta.validation.ConstraintViolationException
import lanajauhar.contactapi.model.WebResponse
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice
import org.springframework.web.server.ResponseStatusException

@RestControllerAdvice
class ErrorController {
    @ExceptionHandler(ConstraintViolationException::class)
    fun constrainViolationException(e: ConstraintViolationException): ResponseEntity<WebResponse<String>> {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(WebResponse<String>().apply { errorMessage = e.message })
    }

    @ExceptionHandler(ResponseStatusException::class)
    fun response(e: ResponseStatusException): ResponseEntity<WebResponse<String>> {
        return ResponseEntity.status(e.statusCode).body(WebResponse<String>().apply { errorMessage = e.message })
    }
}
