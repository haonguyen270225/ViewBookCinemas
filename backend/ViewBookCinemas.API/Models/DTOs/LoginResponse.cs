
namespace ViewBookCinemas.API.Models.DTOs
{
    public class LoginResponse
    {
        public string Token { get; set; } = string.Empty;

        public DateTime ExpiresAt { get; set; }

        public UserInfo User { get; set; } = null!;
    }

    public class UserInfo
    {
        public int UserId { get; set; }

        public string Username { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public string FullName { get; set; } = string.Empty;

        public string? PhoneNumber { get; set; }

        public DateOnly? DateOfBirth { get; set; }

        public string? Gender { get; set; }

        public string? AvatarUrl { get; set; }

        public string? Address { get; set; }

        public string Status { get; set; } = string.Empty;

        public string RoleName { get; set; } = string.Empty;
    }
}
