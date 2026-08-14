import { IsString, Length, Matches, MinLength, MaxLength } from 'class-validator';

export class VerifyOtpDto {
  @IsString()
  @MinLength(8)
  @MaxLength(20)
  @Matches(/^(\+?95|0)?9\d{7,9}$/, {
    message: 'Phone must be a valid Myanmar mobile number',
  })
  phone: string;

  @IsString()
  @Length(6, 6, { message: 'OTP must be exactly 6 digits' })
  @Matches(/^\d{6}$/, { message: 'OTP must be numeric' })
  code: string;
}
