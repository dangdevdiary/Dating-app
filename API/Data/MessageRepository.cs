using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.DTOs;
using API.Entities;
using API.Helpers;
using API.Interfaces;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.EntityFrameworkCore;

namespace API.Data
{
    public class MessageRepository : IMessageRepository
    {
        private readonly DataContext _context;
        private readonly IMapper _mapper;
        public MessageRepository(DataContext context, IMapper mapper)
        {
            _mapper = mapper;
            _context = context;

        }

        public void AddGroup(Group group)
        {
            _context.Groups.Add(group);
        }

        public void AddMessage(Message message)
        {
            _context.Messages.Add(message);
        }

        public void DeleteMessage(Message message)
        {
            _context.Messages.Remove(message);
        }

        public async Task<Connection> GetConnection(string connectionId)
        {
            return await _context.Connections.FindAsync(connectionId);
        }

        public async Task<Group> GetGroupForConnection(string connectionId)
        {
            return await _context.Groups.Include(g => g.Connections).Where(g => g.Connections.Any(c => c.ConnectionId == connectionId)).FirstOrDefaultAsync();
        }

        public async Task<Message> GetMessage(int id)
        {
            return await _context.Messages.FindAsync(id);
        }

        public async Task<PagedList<MessageDto>> GetMessageForUser(MessageParams messageParams)
        {
            var query = _context.Messages.OrderByDescending(u => u.MessageSent).AsQueryable();
            query = messageParams.Container switch
            {
                "Inbox" => query.Where(m => m.RecipientUserName == messageParams.UserName && m.RecipientDeleted == false),
                "Outbox" => query.Where(m => m.SenderUserName == messageParams.UserName && m.SenderDeleted == false),
                _ => query.Where(m => m.RecipientUserName == messageParams.UserName && m.RecipientDeleted == false && m.DateRead == null)
            };
            var messages = query.ProjectTo<MessageDto>(_mapper.ConfigurationProvider);
            var response = await PagedList<MessageDto>.CreateAsync(messages, messageParams.PageNumber, messageParams.PageSize);
            return response;
        }

        public async Task<IEnumerable<MessageDto>> GetMessageThread(string currentUserName, string RecipientUserName)
        {
            var messages = _context.Messages
            .Where(
                m => m.RecipientUserName == currentUserName && m.SenderUserName == RecipientUserName && m.RecipientDeleted == false
                || m.RecipientUserName == RecipientUserName && m.SenderUserName == currentUserName && m.SenderDeleted == false
            ).OrderBy(m => m.MessageSent).AsQueryable();
            var unReadMess = messages.Where(m => m.DateRead == null && m.RecipientUserName == currentUserName).ToList();
            if (unReadMess.Any())
            {
                foreach (var m in unReadMess)
                {
                    m.DateRead = DateTime.UtcNow;
                }
            }
            return await messages.ProjectTo<MessageDto>(_mapper.ConfigurationProvider).ToListAsync();
        }

        public async Task<Group> GetMessGroup(string groupName)
        {
            return await _context.Groups.Include(g => g.Connections).FirstOrDefaultAsync(g => g.Name == groupName);
        }

        public void RemoveConnection(Connection connection)
        {
            _context.Connections.Remove(connection);
        }


    }
}