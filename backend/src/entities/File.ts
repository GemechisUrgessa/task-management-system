import 'reflect-metadata';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { Task } from './Task';
import { IsNotEmpty } from 'class-validator';

@Entity({ name: 'file' })
export class File {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    @IsNotEmpty({ message: 'File URL is required' })
    file_url!: string;

    @Column()
    @IsNotEmpty({ message: 'File type is required' })
    file_type!: string;

    @CreateDateColumn()
    uploaded_at!: Date;

    @Column()
    @IsNotEmpty({ message: 'Public ID is required' })
    public_id!: string;

    @ManyToOne(() => Task, (task) => task.files, { onDelete: 'CASCADE' })
    task!: Task;
}
