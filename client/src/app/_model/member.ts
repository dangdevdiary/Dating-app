import { Photo } from './photo';

export interface Member {
  id: number;
  userName: string;
  avatar: string;
  age: number;
  knownAs: string;
  created: string;
  lastActive: string;
  gender: string;
  introduction: string;
  looingFor: string;
  interests: string;
  city: string;
  country: string;
  photos: Photo[];
}
