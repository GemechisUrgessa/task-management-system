import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { Task } from './Task';
import { IsIn, IsNotEmpty } from 'class-validator';

@Entity({ name: 'subtask' })
export class Subtask {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    @IsNotEmpty({ message: 'Title is required' })
    title!: string;

    @Column({ default: 'pending' })
    @IsIn(['pending', 'in progress', 'completed'], { message: 'Invalid status' })
    status!: string;

    @Column({ default: 'medium' })
    @IsIn(['low', 'medium', 'high'], { message: 'Invalid priority' })
    priority!: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    due_date!: Date;

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;

    @ManyToOne(() => Task, (task) => task.subtasks, { onDelete: 'CASCADE' })
    task!: Task;
}