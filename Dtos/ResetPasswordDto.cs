namespace ApiTest.Dtos
{
    public record ResetPasswordDto
    {
        public string Email { get; init; } = string.Empty;
        public string EmailToken { get; init; } = string.Empty;
        public string NewPassword { get; init; } = string.Empty;
        public string ConformPassword { get; init; } = string.Empty;
    }
}