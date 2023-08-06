
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using API.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace API.Data
{
    public class Seed
    {
        public static async Task SeedUser(UserManager<AppUser> userManager, RoleManager<AppRole> roleManager)
        {
            if (await userManager.Users.AnyAsync()) return;
            var userData = await File.ReadAllTextAsync("Data/UserSeedData.json");
            var options = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            };
            var users = JsonSerializer.Deserialize<List<AppUser>>(userData, options);
            var roles = new List<AppRole>{
                new AppRole{
                    Name="member",
                },
                new AppRole{
                    Name="admin",
                },
                new AppRole{
                    Name="moderator",
                }
            };
            foreach (var role in roles)
            {
                await roleManager.CreateAsync(role);
            }
            foreach (var user in users)
            {
                user.UserName = user.UserName.ToLower();

                await userManager.CreateAsync(user, "123Ddd");
                await userManager.AddToRoleAsync(user, "member");
            }
            var adminUser = new AppUser
            {
                UserName = "admin"
            };
            await userManager.CreateAsync(adminUser, "Admin123");
            await userManager.AddToRolesAsync(adminUser, new[] { "admin", "moderator" });
        }
    }
}