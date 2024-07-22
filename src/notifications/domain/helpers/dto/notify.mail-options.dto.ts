import { ApiProperty } from '@nestjs/swagger';
import { IMailOptions } from 'src/app/common/interfaces/mail.dto';

export class NotifyMailOptionsDto {
  @ApiProperty({ required: true })
  mailOptions: IMailOptions;
}
