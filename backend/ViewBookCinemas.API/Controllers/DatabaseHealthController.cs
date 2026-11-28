
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ViewBookCinemas.API.Data;

namespace ViewBookCinemas.API.Controllers
{
    [ApiController]
    [Route("api/database-health")]
    public class DatabaseHealthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IWebHostEnvironment _environment;
        private readonly ILogger<DatabaseHealthController> _logger;

        public DatabaseHealthController(
            ApplicationDbContext context,
            IWebHostEnvironment environment,
            ILogger<DatabaseHealthController> logger)
        {
            _context = context;
            _environment = environment;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> CheckDatabase(
            CancellationToken cancellationToken)
        {
            // Chỉ cho phép kiểm tra trong môi trường Development.
            if (!_environment.IsDevelopment())
            {
                return NotFound();
            }

            try
            {
                // Kiểm tra kết nối SQL Server.
                bool canConnect = await _context.Database
                    .CanConnectAsync(cancellationToken);

                if (!canConnect)
                {
                    return StatusCode(503, new
                    {
                        status = "Unhealthy",
                        message = "Cannot connect to SQL Server."
                    });
                }

                // Đếm số lượng Users và Roles.
                int totalUsers = await _context.Users
                    .CountAsync(cancellationToken);

                int totalRoles = await _context.Roles
                    .CountAsync(cancellationToken);

                // Đọc thử một User cùng Role tương ứng.
                var sampleUser = await _context.Users
                    .AsNoTracking()
                    .OrderBy(user => user.UserId)
                    .Select(user => new
                    {
                        user.UserId,
                        user.Status,
                        RoleName = user.Role.RoleName
                    })
                    .FirstOrDefaultAsync(cancellationToken);

                return Ok(new
                {
                    status = "Healthy",
                    message = "Connected to SQL Server successfully.",
                    database = "ViewBookCinemasDB",
                    totalUsers,
                    totalRoles,
                    relationshipTest = sampleUser == null
                        ? "No user data found."
                        : "User - Role relationship is working.",
                    sampleUser = sampleUser == null ? null : new
                    {
                        sampleUser.UserId,
                        sampleUser.Status,
                        sampleUser.RoleName
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Database health check failed.");

                return StatusCode(500, new
                {
                    status = "Unhealthy",
                    message = "An error occurred while checking the database."
                });
            }
        }
    }
}
