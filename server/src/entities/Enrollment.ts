import { Entity, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn, Unique, OneToMany } from "typeorm";
import { User } from "./User";
import { Course } from "./Course";
import { Progress } from "./Progress";

@Entity("enrollments")
@Unique(["user", "course"])
export class Enrollment {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @CreateDateColumn()
  enrolled_at: Date;

  @ManyToOne(() => User, (user) => user.enrollments, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user: User;

  @ManyToOne(() => Course, (course) => course.enrollments, { onDelete: "CASCADE" })
  @JoinColumn({ name: "course_id" })
  course: Course;

  @OneToMany(() => Progress, (progress) => progress.enrollment)
  progress_records: Progress[];
}
