import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from "typeorm";

@Entity("admins")
export class Admin {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  username!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ select: false })
  password_hash!: string;

  @Column({ type: "varchar", nullable: true, default: null }) // ← only change
  profile_image!: string | null;

  @CreateDateColumn()
  created_at!: Date;
}
