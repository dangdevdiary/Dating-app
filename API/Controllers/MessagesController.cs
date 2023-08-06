

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
        private readonly IUnitOfWork _unitOfWork;

        private readonly IMapper _mapper;
        public MessagesController(IMapper mapper, IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;


        }
        [HttpPost]
        public async Task<ActionResult<MessageDto>> AddMessage(CreateMessageDto message)
        {
            string userName = User.GetUserName();
            if (userName == message.RecipientUserName.ToLower()) return BadRequest("You can't sent the message to yourself");
            var currentUser = await _unitOfWork.UserRepository.GetUserByUserNameAsync(userName);
            var receiveUser = await _unitOfWork.UserRepository.GetUserByUserNameAsync(message.RecipientUserName);
            if (currentUser == null | receiveUser == null) return NotFound();
            var newMessage = new Message
            {
                Content = message.Content,
                SenderUserName = userName,
                RecipientUserName = message.RecipientUserName,
                Sender = currentUser,
                Recipient = receiveUser,
            };
            _unitOfWork.MessageRepository.AddMessage(newMessage);
            if (await _unitOfWork.Complete()) return Ok(_mapper.Map<MessageDto>(newMessage));
            return BadRequest("failed to add message");
        }
        [HttpGet]
        public async Task<ActionResult<PagedList<MessageDto>>> GetMessForUser([FromQuery] MessageParams messageParams)
        {
            messageParams.UserName = User.GetUserName();
            var messages = await _unitOfWork.MessageRepository.GetMessageForUser(messageParams);
            Response.AddPaginationHeader(new PaginationHeader(messages.CurrentPage, messages.PageSize, messages.TotalCount, messages.TotalCount));
            return Ok(messages);
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteMess(int id)
        {
            var userName = User.GetUserName();
            var message = await _unitOfWork.MessageRepository.GetMessage(id);
            if (message.SenderUserName != userName && message.RecipientUserName != userName) return Unauthorized();

            if (message.SenderUserName == userName && message.SenderDeleted == false) message.SenderDeleted = true;
            if (message.RecipientUserName == userName && message.RecipientDeleted == false) message.RecipientDeleted = true;

            if (message.SenderDeleted && message.RecipientDeleted)
            {
                _unitOfWork.MessageRepository.DeleteMessage(message);
            }
            if (await _unitOfWork.Complete()) return Ok();

            return BadRequest("Problem deleting the message");
        }
    }
}