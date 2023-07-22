
using System.Security.Cryptography;
using System.Text;
using API.Data;
using API.DTOs;
using API.Entities;
using API.Interfaces;
using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
    public class AccountController : BaseApiController
    {
        private readonly DataContext _context;
        private readonly ITokenService _tokenService;
        private readonly IMapper _mapper;
        public AccountController(DataContext context, ITokenService tokenService, IMapper mapper)
        {
            _tokenService = tokenService;
            _context = context;
            _mapper = mapper;
        }
        [HttpPost("register")]
        public async Task<ActionResult<AppUser>> RegisterAccount(RegisterDto registerDto)
        {
            if (await UserExist(registerDto.UserName))
            {
                return BadRequest("User is taken!");
            }
            using var hmac = new HMACSHA512();
            var newUser = _mapper.Map<AppUser>(registerDto);
            newUser.UserName = registerDto.UserName.ToLower();
            newUser.PasswordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(registerDto.Password));
            newUser.PasswordSalt = hmac.Key;
            _context.Users.Add(newUser);
            await _context.SaveChangesAsync();
            return Ok(new UserDto
            {
                UserName = newUser.UserName,
                Token = _tokenService.CreateToken(newUser),
                KnownAs = newUser.KnownAs
            });
        }
        public async Task<bool> UserExist(string userName)
        {
            return await _context.Users.AnyAsync(u => u.UserName == userName.ToLower());
        }
        [HttpPost("login")]
        public async Task<ActionResult<UserDto>> Login(LoginDto loginDto)
        {
            var user = await _context.Users.Include(u => u.Photos).FirstOrDefaultAsync(u => u.UserName == loginDto.UserName);
            if (user == null) return Unauthorized("Invalid Username");
            using var hmac = new HMACSHA512(user.PasswordSalt);
            var computeHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(loginDto.Password));
            for (int i = 0; i < computeHash.Length; i++)
            {
                if (computeHash[i] != user.PasswordHash[i]) return Unauthorized("Invalid password!");
            }
            return Ok(new UserDto
            {
                UserName = user.UserName,
                Token = _tokenService.CreateToken(user),
                Avatar = user.Photos.FirstOrDefault(p => p.IsMain)?.Url
            });
        }
    }
}