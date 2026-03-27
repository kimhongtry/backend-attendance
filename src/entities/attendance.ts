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
  date!: string; // Stored as YYYY-MM-DD

  @Column()
  status!: string; // 'present', 'absent', or 'permission'

  // This links the attendance record to a specific teacher
  @ManyToOne(() => Teacher, (teacher) => teacher.id, { onDelete: "CASCADE" })
  teacher!: Teacher;

  @CreateDateColumn()
  createdAt!: Date;
}
