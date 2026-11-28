
using Microsoft.AspNetCore.Mvc;
using ViewBookCinemas.API.Models.DTOs;
using ViewBookCinemas.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace ViewBookCinemas.API.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(
            [FromBody] LoginRequest request,
            CancellationToken cancellationToken)
        {
            var result = await _authService.LoginAsync(
                request,
                cancellationToken);

            if (result == null)
            {
                return Unauthorized(new
                {
                    message = "Invalid account or password."
                });
            }

            return Ok(result);
        }

        [Authorize]
        [HttpGet("me")]
        public IActionResult GetCurrentUser()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var username = User.FindFirstValue(ClaimTypes.Name);
            var email = User.FindFirstValue(ClaimTypes.Email);
            var role = User.FindFirstValue(ClaimTypes.Role);

            return Ok(new
            {
                userId,
                username,
                email,
                role
            });
        }
        [HttpPost("register")]
        public async Task<IActionResult> Register(
    [FromBody] RegisterRequest request,
    CancellationToken cancellationToken)
        {
            var result = await _authService.RegisterAsync(
                request,
                cancellationToken);

            if (result == null)
            {
                return Conflict(new
                {
                    message = "Username or email already exists."
                });
            }

            return Ok(new
            {
                message = "Registration successful.",
                user = result
            });
        }

    }

}
