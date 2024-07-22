import { ApiProperty } from '@nestjs/swagger';

export class FnzMailOptionsAttachmentDTO {
  @ApiProperty({ required: true })
  filename: string;

  @ApiProperty({ required: true })
  valueType: 'path' | 'base64' | 'arrayBuffer';

  @ApiProperty({ required: false })
  value: string;

  @ApiProperty({ required: true })
  contentType: string;
}

export class FnzMailOptionsDTO {
  @ApiProperty({ required: true })
  to: Array<string>;
  cc?: Array<string>;
  attachments?: Array<FnzMailOptionsAttachmentDTO>;
}
