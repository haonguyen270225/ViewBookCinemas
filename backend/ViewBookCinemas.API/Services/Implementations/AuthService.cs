
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using ViewBookCinemas.API.Data;
using ViewBookCinemas.API.Models.DTOs;
using ViewBookCinemas.API.Models.Entities;
using ViewBookCinemas.API.Services.Interfaces;

namespace ViewBookCinemas.API.Services.Implementations
{
    public class AuthService : IAuthService
    {
        private readonly ApplicationDbContext _context;
        private readonly IPasswordHasher<User> _passwordHasher;
        private readonly IConfiguration _configuration;

        public AuthService(
            ApplicationDbContext context,
            IPasswordHasher<User> passwordHasher,
            IConfiguration configuration)
        {
            _context = context;
            _passwordHasher = passwordHasher;
            _configuration = configuration;
        }

        public async Task<LoginResponse?> LoginAsync(
            LoginRequest request,
            CancellationToken cancellationToken)
        {
            string account = request.Account.Trim();

            var user = await _context.Users
                .Include(user => user.Role)
                .FirstOrDefaultAsync(
                    user => user.Username == account ||
                            user.Email == account,
                    cancellationToken);

            if (user == null ||
                user.Status != "Active" ||
                !user.Role.Status)
            {
                return null;
            }

            // Không chấp nhận dữ liệu mật khẩu mẫu chưa được thay thế.
            if (string.IsNullOrWhiteSpace(user.PasswordHash) ||
                user.PasswordHash == "REPLACE_WITH_REAL_PASSWORD_HASH")
            {
                return null;
            }

            var verificationResult = _passwordHasher.VerifyHashedPassword(
                user,
                user.PasswordHash,
                request.Password);

            if (verificationResult == PasswordVerificationResult.Failed)
            {
                return null;
            }

            string secretKey =
                _configuration["Jwt:SecretKey"]
                ?? throw new InvalidOperationException(
                    "JWT SecretKey is not configured.");

            if (Encoding.UTF8.GetByteCount(secretKey) < 32)
            {
                throw new InvalidOperationException(
                    "JWT SecretKey must contain at least 32 bytes.");
            }

            string issuer =
                _configuration["Jwt:Issuer"]
                ?? throw new InvalidOperationException(
                    "JWT Issuer is not configured.");

            string audience =
                _configuration["Jwt:Audience"]
                ?? throw new InvalidOperationException(
                    "JWT Audience is not configured.");

            int expirationMinutes =
                _configuration.GetValue<int>("Jwt:ExpirationMinutes");

            if (expirationMinutes <= 0)
            {
                expirationMinutes = 60;
            }

            DateTime expiresAt = DateTime.UtcNow
                .AddMinutes(expirationMinutes);

            var claims = new List<Claim>
            {
                new Claim(
                    ClaimTypes.NameIdentifier,
                    user.UserId.ToString()),

                new Claim(ClaimTypes.Name, user.Username),

                new Claim(ClaimTypes.Email, user.Email),

                new Claim(ClaimTypes.Role, user.Role.RoleName)
            };

            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(secretKey));

            var credentials = new SigningCredentials(
                key,
                SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: expiresAt,
                signingCredentials: credentials);

            return new LoginResponse
            {
                Token = new JwtSecurityTokenHandler()
                    .WriteToken(token),

                ExpiresAt = expiresAt,

                User = new UserInfo
                {
                    UserId = user.UserId,
                    Username = user.Username,
                    Email = user.Email,
                    FullName = user.FullName,
                    PhoneNumber = user.PhoneNumber,
                    DateOfBirth = user.DateOfBirth,
                    Gender = user.Gender,
                    AvatarUrl = user.AvatarUrl,
                    Address = user.Address,
                    Status = user.Status,
                    RoleName = user.Role.RoleName
                }
            };
        }

        public async Task<RegisterResponse?> RegisterAsync(
    RegisterRequest request,
    CancellationToken cancellationToken)
        {
            string username = request.Username.Trim();
            string email = request.Email.Trim();

            // 1. Kiểm tra Username đã tồn tại.
            bool usernameExists = await _context.Users
                .AnyAsync(
                    user => user.Username == username,
                    cancellationToken);

            if (usernameExists)
            {
                return null;
            }

            // 2. Kiểm tra Email đã tồn tại.
            bool emailExists = await _context.Users
                .AnyAsync(
                    user => user.Email == email,
                    cancellationToken);

            if (emailExists)
            {
                return null;
            }

            // 3. Tìm Role Customer.
            var customerRole = await _context.Roles
                .FirstOrDefaultAsync(
                    role => role.RoleName == "Customer"
                            && role.Status,
                    cancellationToken);

            if (customerRole == null)
            {
                throw new InvalidOperationException(
                    "Active Customer role was not found.");
            }

            // 4. Khởi tạo tài khoản mới.
            var user = new User
            {
                RoleId = customerRole.RoleId,

                Username = username,
                Email = email,

                FullName = request.FullName.Trim(),
                PhoneNumber = string.IsNullOrWhiteSpace(request.PhoneNumber)
                    ? null
                    : request.PhoneNumber.Trim(),

                Status = "Active",
                IsEmailVerified = false,

                CreatedAt = DateTime.UtcNow
            };

            // 5. Hash mật khẩu.
            user.PasswordHash = _passwordHasher.HashPassword(
                user,
                request.Password);

            // 6. Lưu vào database.
            _context.Users.Add(user);

            await _context.SaveChangesAsync(cancellationToken);

            // 7. Trả thông tin tài khoản.
            return new RegisterResponse
            {
                UserId = user.UserId,
                Username = user.Username,
                Email = user.Email,
                FullName = user.FullName,
                RoleName = customerRole.RoleName,
                Status = user.Status,
                CreatedAt = user.CreatedAt
            };
        }
    }
}
