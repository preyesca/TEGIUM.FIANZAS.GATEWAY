export class SecurityHelper {
  static hiddenSecret(
    valueSecret: string | undefined | null,
    lengthVisible: number = 3,
  ): string {
    if (!valueSecret) return 'Undefined';

    if (valueSecret.length <= lengthVisible * 2)
      return '*'.repeat(valueSecret.length);

    return valueSecret.replace(
      valueSecret.substring(lengthVisible, valueSecret.length - lengthVisible),
      '*'.repeat(valueSecret.length - lengthVisible * 2),
    );
  }
}
