

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
        private readonly IUnitOfWork _unitOfWork;

        public LikesController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;

        }
        [HttpPost("{userName}")]
        public async Task<ActionResult> AddLike(string userName)
        {
            int sourceUserId = User.GetIdUser();
            var likedUser = await _unitOfWork.UserRepository.GetUserByUserNameAsync(userName);
            var sourceUser = await _unitOfWork.LikesRepository.GetUserWithLikes(sourceUserId);

            if (likedUser == null) return NotFound("Not found user");
            if (sourceUser.UserName == userName) return BadRequest("You can't like yourself");

            var alreadyLike = _unitOfWork.LikesRepository.GetUserLike(sourceUserId, likedUser.Id);
            if (alreadyLike.Result != null) return BadRequest("You already like this user");

            var newLikeUser = new UserLike
            {
                SourceUserId = sourceUserId,
                TargetUserId = likedUser.Id
            };
            sourceUser.LikedUsers.Add(newLikeUser);
            if (await _unitOfWork.Complete()) return Ok();
            return BadRequest("Failed to like user");

        }
        [HttpGet()]
        public async Task<ActionResult<PagedList<LikeDto>>> GetUserLikes([FromQuery] LikesUserParams likesUserParams)
        {
            likesUserParams.UserId = User.GetIdUser();
            var result = await _unitOfWork.LikesRepository.GetUserLikes(likesUserParams);
            Response.AddPaginationHeader(new PaginationHeader(result.CurrentPage, result.PageSize, result.TotalCount, result.TotalPage));
            return Ok(result);
        }
    }
}