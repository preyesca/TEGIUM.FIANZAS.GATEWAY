export interface IMailOptions {
  to: Array<string>;
  cc?: Array<string>;
  attachments?: Array<IMailOptionAttachment>;
}

export interface IMailOptionAttachment {
  filename: string;
  valueType: 'path' | 'base64' | 'arrayBuffer';
  value: string;
  contentType: string;
}
