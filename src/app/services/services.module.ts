import { Module } from '@nestjs/common';
import { FileStorageService } from './shared/file-storage.service';
import { NotificationService } from './shared/notification.service';

@Module({
  providers: [NotificationService, FileStorageService],
  exports: [NotificationService, FileStorageService],
})
export class SharedServicesModule {}
