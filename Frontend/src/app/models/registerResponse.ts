import { Iuser } from './users.model';

export interface IRegisterResponse {
  success?: boolean;
  message: string;
  user: Iuser;
}
