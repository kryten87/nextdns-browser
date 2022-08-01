import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DatabaseService } from './services/database.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const db = app.get<DatabaseService>(DatabaseService);
  await db.migrateLatest();
  await app.listen(3000);
}
bootstrap();
