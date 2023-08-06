

using API.DTOs;
using API.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
    public class AdminController : BaseApiController
    {
        private readonly UserManager<AppUser> _userManager;
        public AdminController(UserManager<AppUser> userManager)
        {
            _userManager = userManager;

        }

        [Authorize(Policy = "RequireAdminRole")]
        [HttpGet("users-with-roles")]
        public async Task<ActionResult> GetRoles()
        {
            var users = await _userManager.Users.Select(u => new
            {
                u.Id,
                u.UserName,
                Roles = u.UserRoles.Select(r => r.Role.Name)
            }).ToListAsync();
            return Ok(users);
        }

        [Authorize(Policy = "ModeratePhotoRole")]
        [HttpGet("photos-to-moderate")]
        public ActionResult GetPhotoModeration()
        {
            return Ok("only admin and moderator can see this");
        }

        [Authorize(Policy = "RequireAdminRole")]
        [HttpPost("edit-roles")]
        public async Task<ActionResult> EditRoles(EditRolesDtos editRolesDtos)
        {
            var user = await _userManager.FindByNameAsync(editRolesDtos.UserName);
            if (user == null) return NotFound("user not found!");

            if (editRolesDtos.Roles.Count <= 0) return BadRequest("You must select at least 1 role");

            var userRoles = await _userManager.GetRolesAsync(user);
            var result = await _userManager.AddToRolesAsync(user, editRolesDtos.Roles.Except(userRoles));
            if (!result.Succeeded) return BadRequest("Failed to add role for user");

            result = await _userManager.RemoveFromRolesAsync(user, userRoles.Except(editRolesDtos.Roles));
            if (!result.Succeeded) return BadRequest("Failed to remove from roles");

            return Ok(await _userManager.GetRolesAsync(user));
        }
    }
}