import * as moment from 'moment';

export class GeneralValidator {
  static isNumeric(input: any | null): boolean {
    return input && input !== '' && /^\d+$/.test(input) && !isNaN(input);
  }

  static isAlphanumeric(input: string | null): boolean {
    return input && /^[a-z A-Z0-9áéíóúÁÉÍÓÚñÑ.,]+$/.test(input);
  }

  static isEmail(input: string | null): boolean {
    return input && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);
  }

  static isMultipleEmailWithSeparator(
    input: string | null,
    separator: string,
  ): boolean {
    if (!input) return false;

    const emails = input.split(separator);
    return emails.every((email) => this.isEmail(email.trim()));
  }

  static isDateWithFormat(input: string | null, format: string): boolean {
    if (!input || input.trim() === '') return false;
    //if (!format || format === '') format = 'dd/MM/yyyy';
    const formats = ['YYYY-MM-DDTHH:mm:ss.SSSZ', 'dd/MM/yyyy'];
    var isValid = moment(input, formats, true).isValid();
    return isValid;
  }

  // Validaciones específicas
  static isTelefonoCorrespondencia(input: string | null): boolean {
    if (!input || input.trim() === '') return false;
    const phones: string[] = input.replace(/ /g, '').split(';');

    for (let p = 0; p < phones.length; p++) {
      const phone: string = phones[p];
      if (phone === '' || !/^[0-9,()]*$/.test(phone)) return false;
      if (phone.includes('(') || phone.includes(')')) {
        if (!phone.endsWith(')') || phone.replace(/[\d,]/g, '') !== '()')
          return false;
        const phoneExt = phone.substring(
          phone.indexOf('(') + 1,
          phone.length - 1,
        );
        const extensiones = phoneExt.split(',');
        if (!extensiones.every((ex) => this.isNumeric(ex))) return false;
      } else if (!this.isNumeric(phone)) return false;
    }
    return true;
  }

  static isOnlyLetters(input: string | null) {
    return input && /^[a-z A-ZáéíóúñÁÉÍÓÚÑ]+$/.test(input);
  }
}
