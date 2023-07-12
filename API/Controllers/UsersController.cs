using API.Data;
using API.Entities;
using API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
    [Authorize]

    public class UsersController : BaseApiController
    {
        private readonly IUserRepository _userRepository;

        public UsersController(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }
        [HttpGet]
        public async Task<ActionResult<IEnumerable<AppUser>>> GetAllUser()
        {
            var users = await _userRepository.GetUsersAsync();
            return Ok(users);
        }
        [HttpGet("{userName}")]
        public async Task<ActionResult<AppUser>> GetUserById(string userName)
        {
            var user = await _userRepository.GetUserByUserNameAsync(userName);
            return Ok(user);
        }
    }
}