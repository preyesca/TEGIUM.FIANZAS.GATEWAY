import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { json } from 'express';
import { I18nValidationPipe } from 'nestjs-i18n';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './app/configuration/filters/exception.filter';
import { ResponseInterceptor } from './app/configuration/interceptors/response.interceptor';
import { TimeOutInterceptor } from './app/configuration/interceptors/timeout.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {logger: ['error', 'warn','verbose'],});

  app.setGlobalPrefix(process.env.MSH_APP_PREFIX);

  const corsOptions: CorsOptions = {
    origin: process.env.MSH_APP_CORS.split(';'),
    methods: '*',
  };

  app.enableCors(corsOptions);

  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalInterceptors(new TimeOutInterceptor());

  app.useGlobalPipes(new I18nValidationPipe());
  app.useGlobalFilters(new AllExceptionsFilter());

  app.use(json({ limit: process.env.MSH_APP_LIMIT_PAYLOAD }));

  const swaggerEnabled = process.env.MSH_SWAGGER_ENABLED === 'true';

  if (swaggerEnabled) {
    const configSwagger = new DocumentBuilder()
      .addBearerAuth()
      .setTitle(process.env.MSH_SWAGGER_TITLE)
      .setDescription(process.env.MSH_SWAGGER_DESCRIPTION)
      .setVersion(process.env.MSH_SWAGGER_VERSION)
      .build();

    const document = SwaggerModule.createDocument(app, configSwagger);
    SwaggerModule.setup('api/swagger', app, document, {
      swaggerOptions: {
        filter: true,
      },
    });
  }

  console.log('*********************************');
  console.log('Puerto:', process.env.PORT);
  console.log('*********************************');

  await app.listen(process.env.PORT || 5080);
}
bootstrap();
