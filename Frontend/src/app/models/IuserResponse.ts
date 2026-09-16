import { Iuser } from './users.model';

export interface IuserResponse {
  message: string;
  data: Iuser[];
}