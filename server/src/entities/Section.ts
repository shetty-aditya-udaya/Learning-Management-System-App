import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from "typeorm";
import { Course } from "./Course";
import { Lesson } from "./Lesson";

@Entity("sections")
export class Section {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  title: string;

  @Column()
  order_index: number;

  @ManyToOne(() => Course, (course) => course.sections, { onDelete: "CASCADE" })
  @JoinColumn({ name: "course_id" })
  course: Course;

  @OneToMany(() => Lesson, (lesson) => lesson.section)
  lessons: Lesson[];
}
