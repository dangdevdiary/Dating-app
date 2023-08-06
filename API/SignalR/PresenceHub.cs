
using API.Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace API.SignalR
{
    [Authorize]
    public class PresenceHub : Hub
    {
        private readonly PresenceTracker _presenceTracker;
        public PresenceHub(PresenceTracker presenceTracker)
        {
            _presenceTracker = presenceTracker;

        }
        public override async Task OnConnectedAsync()
        {
            bool isOnline = await _presenceTracker.UserConnected(Context.User.GetUserName(), Context.ConnectionId);
            if (isOnline)
                await Clients.Others.SendAsync("UserIsOnline", Context.User.GetUserName());

            var currentUsersOnline = await _presenceTracker.GetOnlineUser();
            await Clients.Caller.SendAsync("GetOnlineUsers", currentUsersOnline);
        }
        public override async Task OnDisconnectedAsync(Exception exception)
        {
            bool isOffline = await _presenceTracker.UserDisconnected(Context.User.GetUserName(), Context.ConnectionId);
            if (isOffline)
                await Clients.Others.SendAsync("UserIsOffline", Context.User.GetUserName());

            await base.OnDisconnectedAsync(exception);
        }
    }
}