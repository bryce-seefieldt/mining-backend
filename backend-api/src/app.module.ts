import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/user.entity'; // We will create this in the next step
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    // 1. Load .env variables
    ConfigModule.forRoot({
      isGlobal: true, // Makes variables available everywhere
    }),
    
    // 2. Configure Database Connection
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: 'localhost', // In Prod, this will be your Aurora Endpoint
        port: 5432,
        username: configService.get<string>('DATABASE_USER', 'postgres'),
        password: configService.get<string>('DATABASE_PASSWORD', 'Seven30est!'),
        database: configService.get<string>('DATABASE_NAME', 'app_db'),
        // Auto-load entities so you don't have to import them manually
        autoLoadEntities: true, 
        // DANGER: synchronizes DB schema with code. 
        // Set to 'true' for Dev/Beta. Set to 'false' for Production (use Migrations instead).
        synchronize: true, 
      }),
    }),
    
    UsersModule,
  ],
})
export class AppModule {}