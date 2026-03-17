import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from "typeorm";
import { Enrollment } from "./Enrollment";

export enum UserRole {
  STUDENT = "STUDENT",
  ADMIN = "ADMIN",
  INSTRUCTOR = "INSTRUCTOR",
}

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password_hash: string;

  @Column({ type: "enum", enum: UserRole, default: UserRole.STUDENT })
  role: UserRole;

  @CreateDateColumn()
  created_at: Date;

  @OneToMany(() => Enrollment, (enrollment) => enrollment.user)
  enrollments: Enrollment[];
}
