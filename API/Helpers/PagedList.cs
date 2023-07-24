using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace API.Helpers
{
    public class PagedList<T> : List<T>
    {
        public int CurrentPage { get; set; }
        public int TotalCount { get; set; }
        public int TotalPage { get; set; }
        public int PageSize { get; set; }
        public PagedList(IEnumerable<T> items, int TotalSizeItems, int pageNumber, int pageSize)
        {
            CurrentPage = pageNumber;
            TotalCount = TotalSizeItems;
            TotalPage = (int)Math.Ceiling(TotalSizeItems / (double)pageSize);
            PageSize = pageSize;
            AddRange(items);
        }
        public static async Task<PagedList<T>> CreateAsync(IQueryable<T> source, int pageNumber, int pageSize)
        {
            var count = await source.CountAsync();
            var items = await source.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToListAsync();
            return new PagedList<T>(items, count, pageNumber, pageSize);
        }

    }
}