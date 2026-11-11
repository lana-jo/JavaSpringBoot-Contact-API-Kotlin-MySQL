package lanajauhar.contactapi.controller

import lanajauhar.contactapi.entity.User
import lanajauhar.contactapi.model.RegisterUserRequest
import lanajauhar.contactapi.model.UpdateUserRequest
import lanajauhar.contactapi.model.UserResponse
import lanajauhar.contactapi.model.WebResponse
import lanajauhar.contactapi.service.UserService
import org.springframework.http.MediaType
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PatchMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RestController

@RestController
class UserController(
    private val userService: UserService
) {
    @PostMapping(path = ["/api/register"], consumes = [MediaType.APPLICATION_JSON_VALUE], produces = [MediaType.APPLICATION_JSON_VALUE])
    fun register(@RequestBody request: RegisterUserRequest): WebResponse<String> {
        userService.register(request)
        return WebResponse<String>().apply { data = "OK" }
    }

    @GetMapping(path = ["/api/currentUser"], produces = [MediaType.APPLICATION_JSON_VALUE])
    fun currentUser(user: User): WebResponse<UserResponse> {
        val current = userService.current(user)
        return WebResponse<UserResponse>().apply { data = current }
    }

    @PatchMapping(path = ["/api/currentUser"], consumes = [MediaType.APPLICATION_JSON_VALUE], produces = [MediaType.APPLICATION_JSON_VALUE])
    fun update(user: User, @RequestBody req: UpdateUserRequest): WebResponse<UserResponse> {
        val updated = userService.update(user, req)
        return WebResponse<UserResponse>().apply { data = updated }
    }
}
