import { IsString, IsOptional, IsEmail, MinLength } from "class-validator";

export class CreateCustomerDto {
  @IsString() @MinLength(2) code!: string;
  @IsString() @MinLength(2) nameAr!: string;
  @IsString() phone!: string;
  @IsString() projectId!: string;
  @IsOptional() @IsString() nameEn?: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() type?: string;
}
