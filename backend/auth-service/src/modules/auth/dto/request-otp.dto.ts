import { IsString, Matches, MinLength, MaxLength } from 'class-validator';

export class RequestOtpDto {
  @IsString()
  @MinLength(8)
  @MaxLength(20)
  @Matches(/^(\+?95|0)?9\d{7,9}$/, {
    message: 'Phone must be a valid Myanmar mobile number',
  })
  phone: string;
}
