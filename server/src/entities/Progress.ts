import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Unique } from "typeorm";
import { Enrollment } from "./Enrollment";
import { Lesson } from "./Lesson";

@Entity("progress")
@Unique(["enrollment", "lesson"])
export class Progress {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ default: 0 })
  watched_seconds: number;

  @Column({ default: false })
  is_completed: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  last_watched_at: Date;

  @ManyToOne(() => Enrollment, (enrollment) => enrollment.progress_records, { onDelete: "CASCADE" })
  @JoinColumn({ name: "enrollment_id" })
  enrollment: Enrollment;

  @ManyToOne(() => Lesson, (lesson) => lesson.progress_records, { onDelete: "CASCADE" })
  @JoinColumn({ name: "lesson_id" })
  lesson: Lesson;
}
