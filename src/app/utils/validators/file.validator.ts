export class HelperFileValidator {
  static isValid(file: Express.Multer.File | null): boolean {
    return file != null && file != undefined;
  }

  // Example - allowedExtensions: ['xlsx', 'TXT', 'pdF']
  static isAllowedFile(filename: string, allowedExtensions: string[]): boolean {
    return new RegExp(`\\.(${allowedExtensions.join('|')})$`, 'i').test(
      filename,
    );
  }

  static getExtension = (
    filename: string | null | undefined,
  ): string | undefined => filename?.split('.').pop()?.toLowerCase();

  static cleanString(texto) {
    return texto
      .normalize('NFD')
      .replace(
        /([^n\u0300-\u036f]|n(?!\u0303(?![\u0300-\u036f])))[\u0300-\u036f]+/gi,
        '$1',
      )
      .normalize()
      .replace(/ /g, '');
  }
}
