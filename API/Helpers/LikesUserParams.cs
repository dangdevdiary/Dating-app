

namespace API.Helpers
{
    public class LikesUserParams : PaginationParams
    {
        public int UserId { get; set; }
        public string Predicate { get; set; }
    }
}