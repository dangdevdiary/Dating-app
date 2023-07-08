
using API.Data;
using API.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    public class BuggyController : BaseApiController
    {
        private readonly DataContext _context;
        public BuggyController(DataContext context)
        {
            _context = context;

        }
        [HttpGet("auth"), Authorize]
        public ActionResult<string> GetAuthErr()
        {

            return "sssssss";
        }
        [HttpGet("not-found")]
        public ActionResult<AppUser> GetNotFoundErr()
        {
            var thing = _context.Users.Find(-1);
            if (thing == null) return NotFound();
            return thing;
        }
        [HttpGet("server-error")]
        public ActionResult<string> GetServerErr()
        {
            var thing = _context.Users.Find(-1);

            return thing.ToString();
        }
        [HttpGet("bad-request")]
        public ActionResult<string> GetBR()
        {
            return BadRequest("something is bad");
        }

    }
}