import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])], // Registers the Repository
  exports: [TypeOrmModule], // Allows AuthModule to use this repository later
})
export class UsersModule {}