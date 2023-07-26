

using API.Interfaces;
using Microsoft.AspNetCore.Mvc;
using API.Extensions;
using API.Entities;
using API.DTOs;
using API.Helpers;

namespace API.Controllers
{

    public class LikesController : BaseApiController
    {
        private readonly IUserRepository _userRepository;
        private readonly ILikesRepository _likesRepository;
        public LikesController(IUserRepository userRepository, ILikesRepository likesRepository)
        {
            _userRepository = userRepository;
            _likesRepository = likesRepository;
        }
        [HttpPost("{userName}")]
        public async Task<ActionResult> AddLike(string userName)
        {
            int sourceUserId = User.GetIdUser();
            var likedUser = await _userRepository.GetUserByUserNameAsync(userName);
            var sourceUser = await _likesRepository.GetUserWithLikes(sourceUserId);

            if (likedUser == null) return NotFound("Not found user");
            if (sourceUser.UserName == userName) return BadRequest("You can't like yourself");

            var alreadyLike = _likesRepository.GetUserLike(sourceUserId, likedUser.Id);
            if (alreadyLike.Result != null) return BadRequest("You already like this user");

            var newLikeUser = new UserLike
            {
                SourceUserId = sourceUserId,
                TargetUserId = likedUser.Id
            };
            sourceUser.LikedUsers.Add(newLikeUser);
            if (await _userRepository.SaveAllAsync()) return Ok();
            return BadRequest("Failed to like user");

        }
        [HttpGet()]
        public async Task<ActionResult<PagedList<LikeDto>>> GetUserLikes([FromQuery] LikesUserParams likesUserParams)
        {
            likesUserParams.UserId = User.GetIdUser();
            var result = await _likesRepository.GetUserLikes(likesUserParams);
            Response.AddPaginationHeader(new PaginationHeader(result.CurrentPage, result.PageSize, result.TotalCount, result.TotalPage));
            return Ok(result);
        }
    }
}