using System;
using System.Security.Cryptography;
using System.Text;

namespace LoginAppOAuth.Server.Controllers
{
    public static class TokenGenerator
    {
        public static string GenerateRandomToken(int length = 20)
        {
            const string validChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
            using (var rng = new RNGCryptoServiceProvider())
            {
                var token = new StringBuilder(length);
                var byteBuffer = new byte[4];

                for (int i = 0; i < length; i++)
                {
                    rng.GetBytes(byteBuffer);
                    var randomNumber = BitConverter.ToUInt32(byteBuffer, 0);
                    token.Append(validChars[(int)(randomNumber % (uint)validChars.Length)]);
                }

                return token.ToString();
            }
        }
    }
}
