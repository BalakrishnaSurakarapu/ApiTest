using ApiTest.Model;
using MailKit.Net.Smtp;
using MimeKit;

namespace ApiTest.UtilityService
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;
        public EmailService(IConfiguration configuration)
        {
            _configuration = configuration;
        }
        public void SendEmail(EmailModel emailModel)
        {
            var emailMessage = new MimeMessage();
            var from =_configuration["EmailSettings:From"];
            emailMessage.From.Add(new MailboxAddress("ApiTest", from));
            emailMessage.To.Add(new MailboxAddress(emailModel.To,emailModel.To));
            emailMessage.Subject = emailModel.Subject;
            emailMessage.Body = new TextPart(MimeKit.Text.TextFormat.Html)
            {
                Text = string.Format(emailModel.Content)
            };

            using(var client = new SmtpClient())
            {
                try
                {
                   // client.Connect(_configuration["EmailSettings:SmtpServer"], int.Parse(_configuration["EmailSettings:Port"]), true);
                    client.Connect(_configuration["EmailSettings:SmtpServer"], int.Parse(_configuration["EmailSettings:Port"]), MailKit.Security.SecureSocketOptions.StartTls);

                    client.Authenticate(_configuration["EmailSettings:Username"], _configuration["EmailSettings:Password"]);
                    client.Send(emailMessage);
                  //  client.Disconnect(true);
                }
                catch
                {
                    throw new Exception("Error sending email. Please check your SMTP settings and try again.");
                }
                finally
                {
                    client.Disconnect(true);
                    client.Dispose();
                }

            }
        }
    }
}
