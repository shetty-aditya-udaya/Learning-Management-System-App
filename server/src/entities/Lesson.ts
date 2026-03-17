import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from "typeorm";
import { Section } from "./Section";
import { Progress } from "./Progress";

@Entity("lessons")
export class Lesson {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  title: string;

  @Column()
  video_url: string;

  @Column()
  duration_seconds: number;

  @Column()
  order_index: number;

  @ManyToOne(() => Section, (section) => section.lessons, { onDelete: "CASCADE" })
  @JoinColumn({ name: "section_id" })
  section: Section;

  @OneToMany(() => Progress, (progress) => progress.lesson)
  progress_records: Progress[];
}
