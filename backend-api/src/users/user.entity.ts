import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

// 1. Define User Roles (Tiered Access)
export enum UserRole {
  USER = 'user',                // Standard access
  ADMIN = 'admin',              // Can see dashboard
  SUPER_ADMIN = 'super_admin',  // Can delete other admins
}

@Entity('users') // This will create a table named 'users' in Postgres
export class User {
  
  @PrimaryGeneratedColumn('uuid') // Secure, non-guessable IDs
  id: string;

  @Column({ unique: true })
  email: string;

  // Select: false prevents the password from being returned in API responses by default
  @Column({ select: false }) 
  passwordHash: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  // 2. Enforce Role Security
  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({ default: true })
  isActive: boolean;

  // 3. Audit Fields (Crucial for Financial Compliance)
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}