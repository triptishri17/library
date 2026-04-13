import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';

// Modules
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { BooksModule } from './modules/books/books.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { BorrowModule } from './modules/borrow/borrow.module';
import { FinesModule } from './modules/fines/fines.module';
import { NotificationsModule } from './modules/notifications/notifications.module';

@Module({
  imports: [
    // ENV configuration
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],

      useFactory: async (configService: ConfigService) => {
        const mongoUri = configService.get<string>('MONGODB_URI');

        console.log('MongoDB URI:', mongoUri);

        return {
          uri: mongoUri,
        };
      },
    }),

    ScheduleModule.forRoot(),

    // Application Modules
    AuthModule,
    UsersModule,
    BooksModule,
    CategoriesModule,
    BorrowModule,
    FinesModule,
    NotificationsModule,
  ],
})
export class AppModule {}
