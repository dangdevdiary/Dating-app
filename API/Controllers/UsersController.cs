using System.Security.Claims;
using API.DTOs;
using API.Entities;
using API.Extensions;
using API.Helpers;
using API.Interfaces;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [Authorize]

    public class UsersController : BaseApiController
    {
        private readonly IMapper _mapper;
        private readonly IPhotoService _photoService;
        private readonly IUnitOfWork _unitOfWork;

        public UsersController(IUnitOfWork unitOfWork, IMapper mapper, IPhotoService photoService)
        {
            _unitOfWork = unitOfWork;
            _photoService = photoService;
            _mapper = mapper;
        }
        [HttpGet]
        public async Task<ActionResult<PagedList<MemberDto>>> GetAllUser([FromQuery] UserParams userParams)
        {
            var gender = await _unitOfWork.UserRepository.GetGender(User.GetUserName());
            userParams.UserName = User.GetUserName();
            if (string.IsNullOrEmpty(userParams.Gender))
            {
                userParams.Gender = gender == "male" ? "female" : "male";
            }
            var users = await _unitOfWork.UserRepository.GetMemberAsync(userParams);
            Response.AddPaginationHeader(new PaginationHeader(users.CurrentPage, users.PageSize, users.TotalCount, users.TotalPage));
            return Ok(users);
        }
        [HttpGet("{userName}")]
        public async Task<ActionResult<MemberDto>> GetUserByUserName(string userName)
        {
            var user = await _unitOfWork.UserRepository.GetUserAsync(userName);
            return Ok(user);
        }
        [HttpPut]
        public async Task<ActionResult> UpdateUser(UpdateUserDto updateUserDto)
        {
            var user = await _unitOfWork.UserRepository.GetUserByUserNameAsync(User.GetUserName());
            if (user == null) return NotFound();
            _mapper.Map(updateUserDto, user);
            if (await _unitOfWork.Complete()) return NoContent();
            return BadRequest("Failed to update user.");
        }
        [HttpPost("add-photo")]
        public async Task<ActionResult<PhotoDto>> AddPhoto(IFormFile file)
        {
            var user = await _unitOfWork.UserRepository.GetUserByUserNameAsync(User.GetUserName());
            if (user == null) return NotFound();
            var result = await _photoService.AddPhotoAsync(file);
            if (result.Error != null) return BadRequest(result.Error.Message);
            var photo = new Photo
            {
                PublicId = result.PublicId,
                Url = result.SecureUrl.AbsoluteUri
            };
            if (user.Photos.Count == 0) photo.IsMain = true;
            user.Photos.Add(photo);
            if (await _unitOfWork.Complete())
            {
                return CreatedAtAction(nameof(GetUserByUserName), new
                {
                    username = user.UserName
                }, _mapper.Map<PhotoDto>(photo));
            };
            return BadRequest("Upload photo failed");
        }
        [HttpPut("set-avatar/{photoId}")]
        public async Task<ActionResult<AppUser>> SetAvatar(int photoId)
        {
            var user = await _unitOfWork.UserRepository.GetUserByUserNameAsync(User.GetUserName());

            if (user == null) return NotFound();

            var photo = user.Photos.FirstOrDefault(x => x.Id == photoId);

            if (photo == null) return NotFound();

            if (photo.IsMain) return BadRequest("this is already your main photo");

            var currentMain = user.Photos.FirstOrDefault(x => x.IsMain);
            if (currentMain != null) currentMain.IsMain = false;
            photo.IsMain = true;

            if (await _unitOfWork.Complete()) return NoContent();

            return BadRequest("Problem setting the main photo");
        }
        [HttpDelete("delete-photo/{photoId}")]
        public async Task<ActionResult> DeletePhoto(int photoId)
        {
            var user = await _unitOfWork.UserRepository.GetUserByUserNameAsync(User.GetUserName());
            var photo = user.Photos.FirstOrDefault(photo => photo.Id == photoId);
            if (photo == null) return NotFound();
            if (photo.IsMain) return BadRequest("You can't delete main photo!");
            if (photo.PublicId != null)
            {
                var result = await _photoService.DeletePhotoAsync(photo.PublicId);
                if (result.Error != null) return BadRequest(result.Error.Message);
            }
            user.Photos.Remove(photo);
            if (await _unitOfWork.Complete()) return Ok();
            return BadRequest("Problem when deleting photo.");
        }
    }
}