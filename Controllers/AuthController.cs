using ApiTest.Data;
using ApiTest.Dtos;
using ApiTest.helper;
using ApiTest.Helpers;
using ApiTest.Model;
using ApiTest.UtilityService;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;


namespace ApiTest.Controllers
{
    // [EnableCors("MyPolicy")]
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _config;
        private readonly IEmailService _emailService;

        public AuthController(ApplicationDbContext context, IConfiguration config,IEmailService emailservice)
        {
            _context = context;
            _config = config;
            _emailService = emailservice;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] UserRegisterDto userObj)
        {

            if (userObj == null)
                return BadRequest();

            //check username
            if (await CheckUserNameExistAsync(userObj.UserName))
                return BadRequest(new { Message = "Username already exists!" });

            //check emailid
            if (await CheckEmaileExistAsync(userObj.EmailId))
                return BadRequest(new { Message = "Email already exists!" });

            //check password strength
            var passValidation = CheckPasswordStrength(userObj.Password);
            if (!string.IsNullOrEmpty(passValidation))
                return BadRequest(new { message = passValidation });

            if (await _context.TestUsers.AnyAsync(u => u.UserName == userObj.UserName))
                return BadRequest(new { Message = "Email already exists." });

            var user = new TestUser
            {
                FirstName = userObj.FirstName,
                LastName = userObj.LastName,
                UserName = userObj.UserName,
                EmailId = userObj.EmailId,
                MobileNo = userObj.MobileNo,
                Password = userObj.Password,
                PasswordHash = PasswordHelper.HashPassword(userObj.Password),
                Token = string.Empty,
                Role = userObj.Role,
                CreatedDate = DateTime.Now,
                ImageUrl = userObj.ImageUrl,
                RefreshToken = null,
            };

            _context.TestUsers.Add(user);
            await _context.SaveChangesAsync();

            return Ok(new { message = "User registered successfully." });
        }
        private Task<bool> CheckUserNameExistAsync(string userName)
          => _context.TestUsers.AnyAsync(x => x.UserName == userName);
        private Task<bool> CheckEmaileExistAsync(string email)
         => _context.TestUsers.AnyAsync(x => x.EmailId == email);

        private string CheckPasswordStrength(string password)
        {
            StringBuilder sb = new StringBuilder();

            if (password.Length < 8)
                sb.AppendLine("Minimum password length should be 8.");
            //sb.AppendLine("Password must be alphanumeric.");

            if (!Regex.IsMatch(password, "[a-z]"))
                sb.AppendLine("Password must be small letter.");
            if (!Regex.IsMatch(password, "[A-Z]"))
                sb.AppendLine("Password must be capital letter.");
            if (!Regex.IsMatch(password, "[0-9]"))
                sb.AppendLine("Password must be number.");

            if (!Regex.IsMatch(password, "[^a-zA-Z0-9]"))
                sb.AppendLine("Password must contain at least one special character.");

            return sb.ToString();
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] UserLoginDto loginObj)
        {
            if (loginObj == null)
                return BadRequest();

            var user = await _context.TestUsers.FirstOrDefaultAsync(u => u.UserName == loginObj.UserName);

            if (user == null)
                return NotFound(new { message = "User not found" });

            if (!PasswordHelper.VerifyPassword(loginObj.Password, user.PasswordHash))
                return BadRequest(new { message = "password is incorrect" });

            var token = GenerateJwtToken(user);
            user.Token = token;

            var newaccessToken = user.Token;
            var newrefreshToken = Createrefreshtoken();
            user.RefreshToken = newrefreshToken;
            user.RefreshTokenExpireTime = DateTime.Now.AddDays(5);
            await _context.SaveChangesAsync();
            return Ok(new TokenAPIDto()
            {
                AccessToken = newaccessToken,
                RefreshToken = newrefreshToken
            });

            // return Ok(new { Token = user.Token, Message = "Login successful" });

        }

        private string GenerateJwtToken(TestUser user)
        {
            var claims = new[]
            {
        new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
        new Claim(ClaimTypes.Email, user.EmailId),
        new Claim(ClaimTypes.Role, user.Role),
        new Claim("imageUrl", user.ImageUrl),
        new Claim(ClaimTypes.Name, user.UserName),
    };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(1),
                signingCredentials: creds);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }




        [HttpGet("{id}")]
        public async Task<ActionResult<TestUser>> GetUserById(int id)
        {
            var user = await _context.TestUsers.FindAsync(id);

            if (user == null)
            {
                return NotFound(); // 404
            }

            return Ok(user); // 200
        }


       // [Authorize]
        [HttpGet("All")]
        public async Task<ActionResult<IEnumerable<TestUser>>> GetUsers()
        {
            return await _context.TestUsers
                .Select(user => new TestUser
                {
                    UserId = user.UserId,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    UserName = user.UserName,
                    MobileNo = user.MobileNo,
                    EmailId = user.EmailId,
                    Role = user.Role,
                    CreatedDate = user.CreatedDate,
                    ImageUrl = user.ImageUrl,
                    Token =user.Token,
                    Password=user.Password,
                    PasswordHash=user.PasswordHash
                    // Don't return Password or PasswordHash
                })
                .ToListAsync();
        }

        [HttpPost("Refresh")]
        public async Task<IActionResult> Refresh(TokenAPIDto tokenAPIDto)
        {
            if (tokenAPIDto == null || string.IsNullOrEmpty(tokenAPIDto.RefreshToken))
                return BadRequest(new { message = "Invalid client request" });
            var principal = GetPrincipalFromExpiredToken(tokenAPIDto.AccessToken);
            var userId = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var user = await _context.TestUsers.FirstOrDefaultAsync(u => u.UserId.ToString() == userId && u.RefreshToken == tokenAPIDto.RefreshToken);
            if (user == null || user.RefreshTokenExpireTime <= DateTime.UtcNow)
                return Unauthorized(new { message = "Invalid client request" });
            var newAccessToken = GenerateJwtToken(user);
            var newRefreshToken = Createrefreshtoken();
            user.Token = newAccessToken;
            user.RefreshToken = newRefreshToken;
            user.RefreshTokenExpireTime = DateTime.UtcNow.AddDays(1); // Set a new expiration time for the refresh token
            await _context.SaveChangesAsync();
            return Ok(new TokenAPIDto
            {
                AccessToken = newAccessToken,
                RefreshToken = newRefreshToken
            });
        }

        private string Createrefreshtoken()
        {
            string refreshToken;

            do
            {
                var tokenBytes = RandomNumberGenerator.GetBytes(64);
                refreshToken = Convert.ToBase64String(tokenBytes);
            }
            while (_context.TestUsers.Any(u => u.RefreshToken == refreshToken));

            return refreshToken;
        }

        private ClaimsPrincipal GetPrincipalFromExpiredToken(string token)
        {
            var tokenvalidationParameters = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"])),
                ValidateIssuer = false,
                ValidateAudience = false,
                ValidateLifetime = false,
                ClockSkew = TimeSpan.Zero
            };
            var tokenHandler = new JwtSecurityTokenHandler();
            SecurityToken securityToken;
            var principal = tokenHandler.ValidateToken(token, tokenvalidationParameters, out securityToken);
            var jwtSecurityToken = securityToken as JwtSecurityToken;
            if (jwtSecurityToken == null || !jwtSecurityToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256, StringComparison.InvariantCultureIgnoreCase))
            {
                throw new SecurityTokenException("Invalid token");
            }
            return principal;
        }


        [HttpPost("ResetPassword")]
        public async Task<IActionResult>SendEmail(string email)
        {
            var user = await _context.TestUsers.FirstOrDefaultAsync(u => u.EmailId == email);
            if (user == null)
            {
                return NotFound(new { StatusCode = 404, message = "User not found" });
            }
            var tokenBytes = RandomNumberGenerator.GetBytes(64);
            var resetToken = Convert.ToBase64String(tokenBytes);
            user.ResetPasswordToken = resetToken;
            user.ResetPasswordExpired = DateTime.UtcNow.AddMinutes(15); // Set expiration time for the reset token
            string from = _config["EmailSettings:From"];
            var emaildel = new EmailModel(email, "Reset Password", EmailBody.EmailStringBody(email, resetToken));
            _emailService.SendEmail(emaildel);
            _context.Entry(user).State = EntityState.Modified; // Mark the user as modified
            await _context.SaveChangesAsync();  
            return Ok(new { StatusCode = 200, message = "Reset password email sent successfully" });
        }


        [HttpPost("ResetPasswordConfirm")]
        public async Task<IActionResult> ResetPassword(ResetPasswordDto resetPasswordDto)
        {
            if (resetPasswordDto.NewPassword != resetPasswordDto.ConformPassword)
            {
                return BadRequest(new { StatusCode = 400, message = "New password and confirm password do not match" });
            }

            var incomingToken = Uri.UnescapeDataString(resetPasswordDto.EmailToken ?? string.Empty)
                          .Replace(" ", "+");

            var user = await _context.TestUsers.AsTracking().FirstOrDefaultAsync(u => u.EmailId == resetPasswordDto.Email);

            if (user == null)
            {
                return BadRequest(new { StatusCode = 400, message = "User not found with this email", email = resetPasswordDto.Email });
            }

            if (user.ResetPasswordToken != incomingToken)
            {
                return BadRequest(new
                {
                    StatusCode = 400,
                    message = "Token mismatch",
                    expectedToken = user.ResetPasswordToken,
                    incomingToken = incomingToken
                });
            }

            
            if (user.ResetPasswordExpired < DateTime.UtcNow)
            {
                return BadRequest(new
                {
                    StatusCode = 400,
                    message = "Token expired",
                    expiredAt = user.ResetPasswordExpired,
                    currentUtc = DateTime.UtcNow
                });
            }

            // Success
            user.Password = PasswordHelper.HashPassword(resetPasswordDto.NewPassword);
            user.ResetPasswordToken = null; // Invalidate token
            user.ResetPasswordExpired = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { StatusCode = 200, message = "Password reset successfully" });
        }
        //[HttpPut("{id}")]
        //public async Task<IActionResult> UpdateUser(int id, TestUser user)
        //{
        //    if (id != user.UserId)
        //        return BadRequest();

        //    var existingUser = await _context.TestUsers.FindAsync(id);
        //    if (existingUser == null)
        //        return NotFound();

        //    existingUser.FirstName = user.FirstName;
        //    existingUser.LastName = user.LastName;
        //    existingUser.UserName = user.UserName;
        //    existingUser.EmailId = user.EmailId;
        //    existingUser.MobileNo = user.MobileNo;
        //    existingUser.Role = user.Role;
        //    existingUser.ImageUrl = user.ImageUrl;
        //    existingUser.Password = user.Password;

        //    // Update password only if supplied
        //    if (!string.IsNullOrWhiteSpace(user.Password))
        //    {
        //        existingUser.PasswordHash = PasswordHelper.HashPassword(user.Password);

        //        existingUser.Password = string.Empty;
        //    }

        //    await _context.SaveChangesAsync();
        //    return NoContent();
        //}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(int id, UpdateUserDto dto)
        {
            var existingUser = await _context.TestUsers.FindAsync(id);
            if (existingUser == null)
                return NotFound();

            existingUser.FirstName = dto.FirstName;
            existingUser.LastName = dto.LastName;
            existingUser.UserName = dto.UserName;
            existingUser.EmailId = dto.EmailId;
            existingUser.MobileNo = dto.MobileNo;
            existingUser.Role = dto.Role;
            existingUser.ImageUrl = dto.ImageUrl;

            // Only update password if it is provided
            if (!string.IsNullOrWhiteSpace(dto.Password))
            {
                existingUser.PasswordHash = PasswordHelper.HashPassword(dto.Password);
            }

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // DELETE: api/TestUser/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.TestUsers.FindAsync(id);
            if (user == null) return NotFound();

            _context.TestUsers.Remove(user);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}