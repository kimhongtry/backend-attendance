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

  @Column()
  status!: string; // 'present', 'absent', or 'permission'

  // Many attendance records can belong to one teacher
  @ManyToOne(() => Teacher, (teacher) => teacher.id, { onDelete: "CASCADE" })
  teacher!: Teacher;

  @CreateDateColumn()
  createdAt!: Date;
}
