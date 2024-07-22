import { SessionTokenDto } from 'src/app/common/dto/session-token.dto';
import { WorkflowDto } from './workflow.dto';

export class WorkflowAvanzarDto {
  session: SessionTokenDto;
  workflow: WorkflowDto;
  lang: string;
}
