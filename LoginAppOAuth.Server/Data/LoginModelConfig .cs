using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace LoginAppOAuth.Server.Data
{
    public class LoginModelConfig : IEntityTypeConfiguration<LoginModel>
    {
        public void Configure(EntityTypeBuilder<LoginModel> builder)
        {
            builder.HasKey(lm => lm.Id);

            builder.Property(lm => lm.Email)
                .IsRequired()
                .HasMaxLength(256);

            builder.Property(lm => lm.Password)
                .IsRequired()
                .HasMaxLength(256); 

            builder.Property(lm => lm.Token)
                .HasMaxLength(256);

        }
    }
}
