import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("teachers")
export class Teacher {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  staffId!: string;

  @Column()
  name!: string;

  @Column()
  subject!: string;

  @Column()
  room!: string;

  @Column({ default: "password123" })
  password!: string;
}