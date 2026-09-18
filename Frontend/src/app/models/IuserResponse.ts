import { Iuser } from './users.model';

export interface IuserResponse {
  success?: boolean;
  message?: string;
  user: Iuser;
}
