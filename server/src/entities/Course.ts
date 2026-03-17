import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from "typeorm";
import { Section } from "./Section";
import { Enrollment } from "./Enrollment";

@Entity("courses")
export class Course {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  title: string;

  @Column({ type: "text", nullable: true })
  description: string;

  @Column({ nullable: true })
  thumbnail_url: string;

  @Column({ default: false })
  published: boolean;

  @CreateDateColumn()
  created_at: Date;

  @OneToMany(() => Section, (section) => section.course)
  sections: Section[];

  @OneToMany(() => Enrollment, (enrollment) => enrollment.course)
  enrollments: Enrollment[];
}
