
namespace API.Extensions
{
    public static class DateTimeExtension
    {
        public static int CalculateAge(this DateTime dob)
        {
            var today = DateTime.Today;
            var a = (today.Year * 100 + today.Month) * 100 + today.Day;
            var b = (dob.Year * 100 + dob.Month) * 100 + dob.Day;
            return (a - b) / 10000;
        }
    }
}