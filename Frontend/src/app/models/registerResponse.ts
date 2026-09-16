import { Iuser } from "./users.model";

export interface IRegisterResponse {
  message: string;
  user: Iuser;
}
