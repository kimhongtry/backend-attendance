import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from "typeorm";
import { Teacher } from "./teachers";

@Entity("attendance")
export class Attendance {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "date" })
  date!: string; // Format: YYYY-MM-DD

  @Column({ nullable: true })
  checkInMethod?: string; 

  @Column()
  status!: string; // Important: Check if you save 'present' or 'Present'

  // Link this to the 'attendances' array in your Teacher entity
  @ManyToOne(() => Teacher, (teacher) => teacher.attendances, { onDelete: "CASCADE" })
  teacher!: Teacher;

  @CreateDateColumn()
  createdAt!: Date;
}