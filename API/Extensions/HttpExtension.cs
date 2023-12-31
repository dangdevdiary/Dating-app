
using System.Text.Json;
using API.Helpers;

namespace API.Extensions
{
    public static class HttpExtension
    {
        public static void AddPaginationHeader(this HttpResponse httpResponse, PaginationHeader paginationHeader)
        {
            var jsonOpt = new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            };
            httpResponse.Headers.Add("Pagination", JsonSerializer.Serialize(paginationHeader, jsonOpt));
            httpResponse.Headers.Add("Access-Control-Expose-Headers", "Pagination");
        }
    }
}