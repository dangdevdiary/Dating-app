
using API.Extensions;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
builder.Services.AddApplicationServices(builder.Configuration);
builder.Services.AddIdentityExtensitonServices(builder.Configuration);
var app = builder.Build();
// middleware
app.UseCors(policy => policy.WithOrigins("https://localhost:4200").AllowAnyHeader().AllowAnyMethod()).UseAuthentication().UseAuthorization();

app.MapControllers();

app.Run();
