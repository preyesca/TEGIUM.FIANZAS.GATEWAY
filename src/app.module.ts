import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ServeStaticModule } from '@nestjs/serve-static';
import { AcceptLanguageResolver, I18nModule, QueryResolver } from 'nestjs-i18n';
import { join } from 'path';
import { JwtStrategy } from './app/configuration/strategies/jwt.strategy';
import { EndpointModule } from './endpoints/endpoint.module';
import { NotificationModule } from './notifications/notification.module';
import { TaskSchedulingModule } from './schedules/task-scheduling.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '/app/configuration/public'),
    }),

    ConfigModule.forRoot({
      envFilePath: ['.env'],
      isGlobal: true,
    }),

    I18nModule.forRoot({
      fallbackLanguage: 'es',
      loaderOptions: {
        path: join(__dirname, '/app/translation/i18n/'),
        watch: true,
      },
      resolvers: [
        { use: QueryResolver, options: ['lang'] },
        AcceptLanguageResolver,
      ],
      typesOutputPath: join(
        __dirname,
        '../src/app/translation/translate/i18n.translate.ts',
      ),
    }),

    MongooseModule.forRoot(process.env.MSH_DATABASE_URI, {
      connectionFactory: (connection) => {
        connection.plugin(require('mongoose-autopopulate'));
        connection.plugin(require('mongoose-paginate-v2'));
        connection.plugin(require('mongoose-aggregate-paginate-v2'));
        return connection;
      },
    }),

    ScheduleModule.forRoot(),
    EndpointModule,
    TaskSchedulingModule,
    NotificationModule
  ],
  controllers: [],
  providers: [JwtStrategy],
})
export class AppModule {}
