package lanajauhar.contactapi.service

import jakarta.validation.ConstraintViolationException
import jakarta.validation.Validator
import org.springframework.stereotype.Service

@Service
class ValidationService(
    private val validator: Validator
) {
    fun validate(req: Any) {
        val violations = validator.validate(req)
        if (violations.isNotEmpty()) {
            throw ConstraintViolationException(violations)
        }
    }
}
