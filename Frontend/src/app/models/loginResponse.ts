import { Iuser } from './users.model';

export interface ILoginResponse {
  success?: boolean;
  message: string;
  token: string;
  user: Iuser;
}
