

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
        }
    }
}