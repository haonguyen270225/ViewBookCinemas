
using System.ComponentModel.DataAnnotations;

namespace ViewBookCinemas.API.Models.DTOs
{
    public class LoginRequest
    {
        [Required]
        [StringLength(150)]
        public string Account { get; set; } = string.Empty;

        [Required]
        public string Password { get; set; } = string.Empty;
    }
}
