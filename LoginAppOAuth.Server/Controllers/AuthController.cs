using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System.Threading.Tasks;
using LoginAppOAuth.Server.Model;

namespace LoginAppOAuth.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin,Worker")]
    public class RolesController : ControllerBase
    {
        private readonly UserManager<IdentityUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly ILogger<RolesController> _logger;

        public RolesController(UserManager<IdentityUser> userManager, RoleManager<IdentityRole> roleManager, ILogger<RolesController> logger)
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _logger = logger;
        }

        [HttpPost("AssignRole")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> AssignRole([FromBody] RoleAssignmentDto model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user == null)
            {
                return NotFound(new { Message = "User not found." });
            }

            if (!await _roleManager.RoleExistsAsync(model.Role))
            {
                return BadRequest(new { Message = "Role does not exist." });
            }

            if (await _userManager.IsInRoleAsync(user, model.Role))
            {
                return BadRequest(new { Message = "User already has this role." });
            }

            var result = await _userManager.AddToRoleAsync(user, model.Role);
            if (result.Succeeded)
            {
                _logger.LogInformation($"Role '{model.Role}' assigned to user '{model.Email}'.");
                return Ok(new { Message = "Role assigned successfully." });
            }

            return BadRequest(new { Message = "Failed to assign role." });
        }


        [HttpPost("RemoveRole")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> RemoveRole([FromBody] RoleAssignmentDto model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user == null)
            {
                return NotFound(new { Message = "User not found." });
            }

            if (!await _userManager.IsInRoleAsync(user, model.Role))
            {
                return BadRequest(new { Message = "User does not have this role." });
            }

            var result = await _userManager.RemoveFromRoleAsync(user, model.Role);
            if (result.Succeeded)
            {
                _logger.LogInformation($"Role '{model.Role}' removed from user '{model.Email}'.");
                return Ok(new { Message = "Role removed successfully." });
            }

            return BadRequest(new { Message = "Failed to remove role." });
        }

        [HttpGet("UserInfo")]
        [Authorize]
        public async Task<IActionResult> UserInfo()
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null)
            {
                return NotFound(new { Message = "User not found." });
            }

            var roles = await _userManager.GetRolesAsync(user);

            var userInfo = new
            {
                UserName = user.UserName,
                Roles = roles
            };

            return Ok(userInfo);
        }
    }
}
