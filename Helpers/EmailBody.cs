﻿using NuGet.Common;

namespace ApiTest.Helpers
{
    public static class EmailBody
    {
        public static string EmailStringBody(string email, string emailToken)
        {
            var link = $"http://localhost:4200/reset?email={email}&token={emailToken}";
            return $@"<html>

    <head>
    </head>
    <body style=""margin:0;padding:0;font-family: Arial, Helvetica, sans-serif;"">
        <div style=""height: auto;background: linear-gradient(to top, #c9c9ff 50%, #6e6ef6 90%) no-repeat;width: 100%;padding: 10px;"">
            <div>
                <h1>Reset your Password</h1>
                <hr>
                <p>You're receiving this email because you requested a password reset for your account.</p>
                <p>Please tap the button below to choose a new password.</p>
                <a href='{link}' target=""_blank"" style=""background-color:#0d6efd;padding:10px;color:white;border-radius:4px;display:block;margin:0 auto;width:50%;text-align:center;text-decoration:none;"">
                    Reset Password
                </a>
                <p>Kind Regards,<br><br>Program</p>
            </div>
        </div>
    </body>
    </html>";
        }
    }
}