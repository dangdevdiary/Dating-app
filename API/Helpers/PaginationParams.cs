

namespace API.Helpers
{
    public class PaginationParams
    {
        public int MaxPageSize { get; set; } = 50;
        public int PageNumber { get; set; } = 1;
        private int _pageSize { get; set; } = 10;

        public int PageSize
        {
            get => _pageSize;
            set => _pageSize = (value > MaxPageSize) ? MaxPageSize : value;
        }
    }
}