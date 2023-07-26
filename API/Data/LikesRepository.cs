

using API.DTOs;
using API.Entities;
using API.Extensions;
using API.Helpers;
using API.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace API.Data
{
    public class LikesRepository : ILikesRepository
    {
        private readonly DataContext _context;
        public LikesRepository(DataContext context)
        {
            _context = context;
        }
        public async Task<UserLike> GetUserLike(int sourceUserId, int targetUserId)
        {
            return await _context.Likes.FindAsync(sourceUserId, targetUserId);
        }

        public async Task<PagedList<LikeDto>> GetUserLikes(LikesUserParams likesUserParams)
        {
            var users = _context.Users.OrderBy(u => u.UserName).AsQueryable();
            var likes = _context.Likes.AsQueryable();
            if (likesUserParams.Predicate == "liked")
            {
                likes = likes.Where(l => l.SourceUserId == likesUserParams.UserId);
                users = likes.Select(u => u.TargetUser);
            }
            if (likesUserParams.Predicate == "likedBy")
            {
                likes = likes.Where(l => l.TargetUserId == likesUserParams.UserId);
                users = likes.Select(u => u.SourceUser);
            }
            var ULikeList = users.Select(u => new LikeDto
            {
                UserName = u.UserName,
                Id = u.Id,
                Age = u.DateOfBirth.CalculateAge(),
                Avatar = u.Photos.FirstOrDefault(p => p.IsMain).Url,
                City = u.City,
                KnownAs = u.KnownAs
            });
            return await PagedList<LikeDto>.CreateAsync(ULikeList, likesUserParams.PageNumber, likesUserParams.PageSize);
        }

        public Task<AppUser> GetUserWithLikes(int userId)
        {
            return _context.Users.Include(u => u.LikedUsers).FirstOrDefaultAsync(u => u.Id == userId);
        }
    }
}