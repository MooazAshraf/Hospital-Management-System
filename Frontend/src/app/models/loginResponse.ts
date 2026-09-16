import { Iuser } from "./users.model";

export interface ILoginResponse {
  message: string;
  token: string;
  user: Iuser;
}