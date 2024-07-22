export class AttachmentDto {
    contentType:string;
    filename: string;
    fileSizeInMegabytes: number = 0;
    adjuntado?: boolean = false;
    value?: string;
    valueType:string
}