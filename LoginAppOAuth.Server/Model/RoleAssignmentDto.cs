using System.ComponentModel.DataAnnotations;

namespace LoginAppOAuth.Server.Model
{
    public class RoleAssignmentDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        public string Role { get; set; }
    }

}
