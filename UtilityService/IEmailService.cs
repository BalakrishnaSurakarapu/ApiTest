using ApiTest.Model;

namespace ApiTest.UtilityService
{
    public interface IEmailService
    {
        void SendEmail(EmailModel emailModel);
    }
}
