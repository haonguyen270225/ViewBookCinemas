using System.ComponentModel.DataAnnotations;

namespace ViewBookCinemas.API.Models.DTOs
{
    public class RegisterRequest
    {
        [Required(ErrorMessage = "Username is required.")]
        [StringLength(50, MinimumLength = 3)]
        [RegularExpression(
            @"^[a-zA-Z0-9_]+$",
            ErrorMessage = "Username only allows letters, numbers and underscore.")]
        public string Username { get; set; } = string.Empty;

        [Required(ErrorMessage = "Email is required.")]
        [EmailAddress(ErrorMessage = "Invalid email address.")]
        [StringLength(150)]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Password is required.")]
        [StringLength(100, MinimumLength = 8)]
        [RegularExpression(
            @"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).+$",
            ErrorMessage = "Password must contain uppercase, lowercase, number and special character.")]
        public string Password { get; set; } = string.Empty;

        [Required(ErrorMessage = "Full name is required.")]
        [StringLength(100, MinimumLength = 2)]
        public string FullName { get; set; } = string.Empty;

        [StringLength(15)]
        public string? PhoneNumber { get; set; }
    }
}