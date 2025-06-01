namespace ApiTest.Dtos
{
    public class UpdateUserDto
    {
            public string FirstName { get; set; }
            public string LastName { get; set; }
            public string UserName { get; set; }
            public string EmailId { get; set; }
            public string MobileNo { get; set; }
            public string Role { get; set; }
            public string ImageUrl { get; set; }
            public string Password { get; set; } // plain password from frontend
    }
}
