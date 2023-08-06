
using System.Security.Cryptography;
using System.Text;
using API.Data;
using API.DTOs;
using API.Entities;
using API.Interfaces;
using AutoMapper;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
    public class AccountController : BaseApiController
    {
        private readonly ITokenService _tokenService;
        private readonly IMapper _mapper;
        private readonly UserManager<AppUser> _userManager;
        public AccountController(UserManager<AppUser> userManager, ITokenService tokenService, IMapper mapper)
        {
            _userManager = userManager;
            _tokenService = tokenService;
            _mapper = mapper;
        }
        [HttpPost("register")]
        public async Task<ActionResult<AppUser>> RegisterAccount(RegisterDto registerDto)
        {
            if (await UserExist(registerDto.UserName))
            {
                return BadRequest("User is taken!");
            }
            var newUser = _mapper.Map<AppUser>(registerDto);
            newUser.UserName = registerDto.UserName.ToLower();
            var result = await _userManager.CreateAsync(newUser, registerDto.Password);
            if (!result.Succeeded) return BadRequest(result.Errors);
            var roleResult = await _userManager.AddToRoleAsync(newUser, "member");
            if (!roleResult.Succeeded) return BadRequest(roleResult.Errors);
            return Ok(new UserDto
            {
                UserName = newUser.UserName,
                Token = await _tokenService.CreateToken(newUser),
                KnownAs = newUser.KnownAs,
                Gender = newUser.Gender
            });
        }
        public async Task<bool> UserExist(string userName)
        {
            return await _userManager.Users.AnyAsync(u => u.UserName == userName.ToLower());
        }
        [HttpPost("login")]
        public async Task<ActionResult<UserDto>> Login(LoginDto loginDto)
        {
            var user = await _userManager.Users.Include(u => u.Photos).FirstOrDefaultAsync(u => u.UserName == loginDto.UserName);
            if (user == null) return Unauthorized("Invalid Username");
            var checkPass = await _userManager.CheckPasswordAsync(user, loginDto.Password);
            if (!checkPass) return Unauthorized("Invalid Password");

            return Ok(new UserDto
            {
                UserName = user.UserName,
                Token = await _tokenService.CreateToken(user),
                Avatar = user.Photos.FirstOrDefault(p => p.IsMain)?.Url,
                Gender = user.Gender,
                KnownAs = user.KnownAs
            });
        }
    }
}