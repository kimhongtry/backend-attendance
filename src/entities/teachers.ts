import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("teachers")
export class Teacher {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  staffId!: string; // Matches 'staffId' in your screenshot

  @Column()
  name!: string; // Matches 'name' in your screenshot

  @Column()
  subject!: string; // Matches 'subject' in your screenshot

  @Column()
  room!: string; // Matches 'room' in your screenshot
}
