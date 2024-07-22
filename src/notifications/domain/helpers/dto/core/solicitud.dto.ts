import { ApiProperty } from '@nestjs/swagger';
import { FnzMailOptionsDTO } from '../mail.dto';
import { TaskNotificacionReminderDto } from './task-actividad-reminder.dto';

export class FnzSolicitudDTO {
  @ApiProperty({ required: true })
  mailOptions: FnzMailOptionsDTO; // Fixed

  @ApiProperty({ required: true })
  observaciones: string;

  @ApiProperty({ required: true })
  numeroCliente: string;

  @ApiProperty({ required: true })
  nombreAsegurado: string;

  @ApiProperty({ required: true })
  nombreClienteComercial: string;

  @ApiProperty({ required: true })
  aseguradora: string;

  @ApiProperty({ required: true })
  razonSocial: string;

  @ApiProperty({ required: true })
  nombreComercial: string;

  @ApiProperty({ required: true })
  correos: Array<string>;
  
  @ApiProperty({ required: true })
  documentos:string;

  @ApiProperty({ required: true })
  proyectoClienteComercial:string;

  @ApiProperty({ required: true })
  proyectoCliente:string;

 // @ApiProperty({ required: true })
  enlaceAsegurado: string;

  taskNotificacionReminder: TaskNotificacionReminderDto

}
