using System.ComponentModel.DataAnnotations;

namespace ApiTest.Model
{
    public class TestUser
    {
        [Key]
        [Required]
        public int UserId { get; set; }

        [Required]
        public string FirstName { get; set; } = string.Empty;

        [Required]
        public string LastName { get; set; } = string.Empty;

        [Required]
        public string UserName { get; set; } = string.Empty;

        [Required]
        public string MobileNo { get; set; } = string.Empty;

        [Required]
        public string EmailId { get; set; } = string.Empty;

        // For temporary storage of plaintext password before hashing
        [Required]
        [DataType(DataType.Password)]
        public string Password { get; set; } = string.Empty;

        // For storing hashed password
        [Required]
        public string PasswordHash { get; set; } = string.Empty;

        public DateTime CreatedDate { get; set; } = DateTime.Now;

        public string Role { get; set; } = string.Empty;

        public string Token { get; set; } = string.Empty;

        public string? RefreshToken { get; set; }

        public DateTime RefreshTokenExpireTime { get; set; }

        public string? ResetPasswordToken { get; set; }

        public DateTime ResetPasswordExpired { get; set; }

        // URL for user profile image
        public string? ImageUrl { get; set; }
    }
}
