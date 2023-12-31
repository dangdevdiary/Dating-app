

using API.DTOs;
using API.Entities;
using API.Extensions;
using AutoMapper;

namespace API.Helpers
{
    public class AutoMapperProfiles : Profile
    {
        public AutoMapperProfiles()
        {
            CreateMap<AppUser, MemberDto>()
            .ForMember(dest => dest.Avatar, opt => opt.MapFrom(src => src.Photos.FirstOrDefault(u => u.IsMain).Url))
            .ForMember(destinationMember => destinationMember.Age, opt => opt.MapFrom(sourceMember => sourceMember.DateOfBirth.CalculateAge()));
            CreateMap<Photo, PhotoDto>();
            CreateMap<UpdateUserDto, AppUser>();
            CreateMap<UpdateUserDto, MemberDto>();
            CreateMap<RegisterDto, AppUser>();
            CreateMap<Message, MessageDto>()
            .ForMember(dest => dest.SenderAvatar, opt => opt.MapFrom(s => s.Sender.Photos.FirstOrDefault(p => p.IsMain).Url))
            .ForMember(dest => dest.RecipientAvatar, opt => opt.MapFrom(r => r.Recipient.Photos.FirstOrDefault(p => p.IsMain).Url));
            CreateMap<DateTime, DateTime>().ConvertUsing(d => DateTime.SpecifyKind(d, DateTimeKind.Utc));
            CreateMap<DateTime?, DateTime?>().ConvertUsing(d => d.HasValue ? DateTime.SpecifyKind(d.Value, DateTimeKind.Utc) : null);
        }
    }
}