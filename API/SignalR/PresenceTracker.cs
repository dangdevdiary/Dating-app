

namespace API.SignalR
{
    public class PresenceTracker
    {
        private static readonly Dictionary<string, List<string>> OnlineUser = new();
        public Task<bool> UserConnected(string userName, string connectionId)
        {
            bool isOnline = false;
            lock (OnlineUser)
            {
                if (OnlineUser.ContainsKey(userName))
                {
                    OnlineUser[userName].Add(connectionId);
                }
                else
                {
                    OnlineUser.Add(userName, new List<string> { connectionId });
                    isOnline = true;
                }
            }
            return Task.FromResult(isOnline);
        }
        public Task<bool> UserDisconnected(string userName, string connectionId)
        {
            bool isOffline = false;
            lock (OnlineUser)
            {
                if (!OnlineUser.ContainsKey(userName)) return Task.FromResult(isOffline);

                OnlineUser[userName].Remove(connectionId);
                if (OnlineUser[userName].Count == 0)
                {
                    OnlineUser.Remove(userName);
                    isOffline = true;
                }
            }
            return Task.FromResult(isOffline);
        }
        public Task<IEnumerable<string>> GetOnlineUser()
        {
            IEnumerable<string> onlineUsers;
            lock (OnlineUser)
            {
                onlineUsers = OnlineUser.OrderBy(u => u.Key).Select(u => u.Key);
            }
            return Task.FromResult(onlineUsers);
        }
        public static Task<List<string>> GetConnectionForUser(string userName)
        {
            List<string> connectionIds;
            lock (OnlineUser)
            {
                connectionIds = OnlineUser.GetValueOrDefault(userName);
            }
            return Task.FromResult(connectionIds);
        }
    }
}