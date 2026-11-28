using ViewBookCinemas.API.Models.DTOs;

namespace ViewBookCinemas.API.Services.Interfaces
{
    public interface IAuthService
    {
        Task<LoginResponse?> LoginAsync(
            LoginRequest request,
            CancellationToken cancellationToken);

        Task<RegisterResponse?> RegisterAsync(
            RegisterRequest request,
            CancellationToken cancellationToken);
    }
}