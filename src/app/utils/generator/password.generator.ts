import { genSaltSync, hashSync } from 'bcryptjs';

const encrypt = (password: string) => {
  const salt = genSaltSync();
  return hashSync(password, salt);
};

const generatePassword = () => {
  const chars =
    '0123456789abcdefghijklmnopqrstuvwxyz!@#$%^&*()ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const passwordLength = 12;
  let password = '';
  for (var i = 0; i <= passwordLength; i++) {
    var randomNumber = Math.floor(Math.random() * chars.length);
    password += chars.substring(randomNumber, randomNumber + 1);
  }

  return password;
};

export { encrypt, generatePassword };
