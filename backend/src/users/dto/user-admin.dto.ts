import { Expose } from "class-transformer";

export class UserAdminDto {
  @Expose()
  id: number;

  @Expose()
  password: string;
}
