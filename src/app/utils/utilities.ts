export class Utilities {

  static convertToBaseNamePath(name: string): string {
    const noAccents = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const replaceN = noAccents.replace(/ñ/gi, "n");
    const toCamelCase = replaceN.replace(/\w+/g, (match) => {
      return match.charAt(0).toUpperCase() + match.slice(1).toLowerCase();
    });
    const noSpaces = toCamelCase.replace(/\s+/g, '');
    return noSpaces;

  }

  static generatePassword(): string {
    const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lower = "abcdefghijklmnopqrstuvwxyz";
    const character_special = "!@#$*";

    let password = "";

    for (let i = 0; i < 2; i++) password += lower.charAt(Math.floor(Math.random() * lower.length));

    password += upper.charAt(Math.floor(Math.random() * upper.length));
    password += character_special.charAt(Math.floor(Math.random() * character_special.length));

    for (let i = 0; i < 2; i++) password += lower.charAt(Math.floor(Math.random() * lower.length));

    password += upper.charAt(Math.floor(Math.random() * upper.length));
    password += character_special.charAt(Math.floor(Math.random() * character_special.length));

    for (let i = 0; i < 2; i++) password += lower.charAt(Math.floor(Math.random() * lower.length));

    return password;
  }

  static replaceText(value: string): string {
    const regex = /[^a-zA-Z0-9 ]/g;
    return value.toLowerCase().replace(/ /g, '').replace(regex, '');
  }
}