import { CoreFolioLayoutDetailBodyColumnDto } from 'src/modules/core/domain/helpers/dto/core.folio-layout.dto';
import { ELayoutColumnType } from 'src/modules/core/domain/helpers/enum/core.layout-column-type.enum';
import { GeneralValidator } from './general.validator';

export class LayoutValidator {
  static getContent(content: any): string {
    if (
      !content ||
      content.toString().trim() === '' ||
      content.toString().trim() === 'null'
    )
      return '';

    if (content instanceof Date) return content.toISOString();
    return content.toString().trim();
  }

  static hasData(content: string): boolean {
    return content != '';
  }

  static createNotification(
    value: any,
    column: CoreFolioLayoutDetailBodyColumnDto,
  ): string | null {
    const content = this.getContent(value);

    if (column?.required && !this.hasData(content))
      return `El campo ${column.name.toUpperCase()} no tiene información`;

    const message: string = `El dato '${content}' del campo ${column.name?.toUpperCase()}`;

    switch (column.type) {
      case ELayoutColumnType.NUMERIC: {
        if (!GeneralValidator.isNumeric(content))
          return `${message} no es un valor numérico válido`;
        break;
      }
      case ELayoutColumnType.ALPHANUMERIC: {
        if (!GeneralValidator.isAlphanumeric(content))
          return `${message} no es un valor alfanumérico válido`;
        break;
      }
      case ELayoutColumnType.EMAIL: {
        if (!GeneralValidator.isEmail(content))
          return `${message} no es un valor de correo electrónico válido`;
        break;
      }
      case ELayoutColumnType.EMAIL_MULTIPLE_WITH_SEPARATOR: {
        if (
          !GeneralValidator.isMultipleEmailWithSeparator(
            content,
            column.separator,
          )
        )
          return `${message} no es un valor de correo electrónico válido (separado por '${column.separator}')`;
        break;
      }
      case ELayoutColumnType.DATE_WITH_FORMAT: {
        if (!GeneralValidator.isDateWithFormat(content, column.format))
          return `${message} no tiene un formato de fecha '${column.format}' válido.`;
        break;
      }
      case ELayoutColumnType.TELEFONO_CORRESPONDENCIA: {
        if (!GeneralValidator.isTelefonoCorrespondencia(content))
          return `${message} no tiene un formato válido`;
        break;
      }
    }

    return null;
  }
}
