
using API.DTOs;
using API.Entities;
using API.Extensions;
using API.Interfaces;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace API.SignalR
{
    [Authorize]
    public class MessageHub : Hub
    {
        private readonly IMapper _mapper;
        private readonly IHubContext<PresenceHub> _presenceHub;
        private readonly IUnitOfWork _unitOfWork;
        public MessageHub(IHubContext<PresenceHub> presenceHub, IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _presenceHub = presenceHub;
            _mapper = mapper;

        }
        public override async Task OnConnectedAsync()
        {
            var httpContext = Context.GetHttpContext();
            var otherUser = httpContext.Request.Query["user"];
            var groupName = GetGroupName(Context.User.GetUserName(), otherUser);
            await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
            var group = await AddToGroup(groupName);
            await Clients.Group(groupName).SendAsync("UpdatedGroup", group);
            var messages = _unitOfWork.MessageRepository.GetMessageThread(Context.User.GetUserName(), otherUser);
            if (_unitOfWork.HasChanges()) await _unitOfWork.Complete();
            await Clients.Caller.SendAsync("ReceiveMessageThread", messages);
        }
        public override async Task OnDisconnectedAsync(Exception exception)
        {
            var group = await RemoveFromMessGroup();
            await Clients.Group(group.Name).SendAsync("UpdatedGroup");
            await base.OnDisconnectedAsync(exception);

        }
        public async Task SendMess(CreateMessageDto createMessageDto)
        {
            string userName = Context.User.GetUserName();
            if (userName == createMessageDto.RecipientUserName.ToLower())
                throw new HubException("You can't send message to yourself");
            var currentUser = await _unitOfWork.UserRepository.GetUserByUserNameAsync(userName);
            var receiveUser = await _unitOfWork.UserRepository.GetUserByUserNameAsync(createMessageDto.RecipientUserName);
            if (currentUser == null | receiveUser == null) new HubException("User not found");

            var newMessage = new Message
            {
                Content = createMessageDto.Content,
                SenderUserName = userName,
                RecipientUserName = createMessageDto.RecipientUserName,
                Sender = currentUser,
                Recipient = receiveUser,
            };

            var groupName = GetGroupName(currentUser.UserName, receiveUser.UserName);
            var group = await _unitOfWork.MessageRepository.GetMessGroup(groupName);
            if (group.Connections.Any(c => c.UserName == receiveUser.UserName))
            {
                newMessage.DateRead = DateTime.UtcNow;
            }
            else
            {
                var connections = await PresenceTracker.GetConnectionForUser(receiveUser.UserName);
                if (connections != null)
                {
                    await _presenceHub.Clients.Clients(connections).SendAsync("NewMessageReceived", new
                    {
                        userName = currentUser.UserName,
                        knownAs = currentUser.KnownAs
                    });
                }
            }

            _unitOfWork.MessageRepository.AddMessage(newMessage);
            if (await _unitOfWork.Complete())
            {
                await Clients.Group(groupName).SendAsync("NewMessage", _mapper.Map<MessageDto>(newMessage));
            }

        }
        private string GetGroupName(string caller, string other)
        {
            var stringCompare = string.CompareOrdinal(caller, other) < 0;
            return stringCompare ? $"{caller}-{other}" : $"{other}-{caller}";
        }
        private async Task<Group> AddToGroup(string groupName)
        {
            var group = await _unitOfWork.MessageRepository.GetMessGroup(groupName);
            var connection = new Connection(Context.ConnectionId, Context.User.GetUserName());
            if (group == null)
            {
                group = new Group(groupName);
                _unitOfWork.MessageRepository.AddGroup(group);
            }
            group.Connections.Add(connection);
            if (await _unitOfWork.Complete()) return group;
            throw new HubException("Failed to add to group");
        }
        private async Task<Group> RemoveFromMessGroup()
        {
            var group = await _unitOfWork.MessageRepository.GetGroupForConnection(Context.ConnectionId);
            var connection = group.Connections.FirstOrDefault(c => c.ConnectionId == Context.ConnectionId);
            _unitOfWork.MessageRepository.RemoveConnection(connection);
            if (await _unitOfWork.Complete())
                return group;
            throw new HubException("Failed to remove from group");
        }
    }
}