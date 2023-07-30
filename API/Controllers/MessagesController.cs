

using API.DTOs;
using API.Entities;
using API.Extensions;
using API.Helpers;
using API.Interfaces;
using AutoMapper;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    public class MessagesController : BaseApiController
    {
        private readonly IMessageRepository _messageRepository;
        private readonly IUserRepository _userRepository;
        private readonly IMapper _mapper;
        public MessagesController(IMessageRepository messageRepository, IUserRepository userRepository, IMapper mapper)
        {
            _mapper = mapper;
            _userRepository = userRepository;
            _messageRepository = messageRepository;

        }
        [HttpPost]
        public async Task<ActionResult<MessageDto>> AddMessage(CreateMessageDto message)
        {
            string userName = User.GetUserName();
            if (userName == message.RecipientUserName.ToLower()) return BadRequest("You can't sent the message to yourself");
            var currentUser = await _userRepository.GetUserByUserNameAsync(userName);
            var receiveUser = await _userRepository.GetUserByUserNameAsync(message.RecipientUserName);
            if (currentUser == null | receiveUser == null) return NotFound();
            var newMessage = new Message
            {
                Content = message.Content,
                SenderUserName = userName,
                RecipientUserName = message.RecipientUserName,
                Sender = currentUser,
                Recipient = receiveUser,
            };
            _messageRepository.AddMessage(newMessage);
            if (await _messageRepository.SavaAllAsync()) return Ok(_mapper.Map<MessageDto>(newMessage));
            return BadRequest("failed to add message");
        }
        [HttpGet]
        public async Task<ActionResult<PagedList<MessageDto>>> GetMessForUser([FromQuery] MessageParams messageParams)
        {
            messageParams.UserName = User.GetUserName();
            var messages = await _messageRepository.GetMessageForUser(messageParams);
            Response.AddPaginationHeader(new PaginationHeader(messages.CurrentPage, messages.PageSize, messages.TotalCount, messages.TotalCount));
            return Ok(messages);
        }
        [HttpGet("thread/{userName}")]
        public async Task<ActionResult<IEnumerable<MessageDto>>> GetMessThread(string userName)
        {
            var currentUserName = User.GetUserName();
            return Ok(await _messageRepository.GetMessageThread(currentUserName, userName));
        }
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteMess(int id)
        {
            var userName = User.GetUserName();
            var message = await _messageRepository.GetMessage(id);
            if (message.SenderUserName != userName && message.RecipientUserName != userName) return Unauthorized();

            if (message.SenderUserName == userName && message.SenderDeleted == false) message.SenderDeleted = true;
            if (message.RecipientUserName == userName && message.RecipientDeleted == false) message.RecipientDeleted = true;

            if (message.SenderDeleted && message.RecipientDeleted)
            {
                _messageRepository.DeleteMessage(message);
            }
            if (await _messageRepository.SavaAllAsync()) return Ok();

            return BadRequest("Problem deleting the message");
        }
    }
}