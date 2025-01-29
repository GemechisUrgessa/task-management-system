// src/entities/Task.ts
import { 
    Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, 
    OneToMany, 
    UpdateDateColumn,
    Index
} from 'typeorm';
import { IsOptional, IsIn, IsNotEmpty } from 'class-validator';
import { Subtask } from './Subtask';
import { File } from './File';

@Entity()
@Index('title', { synchronize: false })
@Index('description', { synchronize: false })
export class Task {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    @IsNotEmpty({ message: 'Title is required' })
    title!: string;

    @Column({ type: 'text', nullable: true })
    @IsOptional()
    description?: string;

    @Column({ default: 'pending' })
    @IsIn(['pending', 'in progress', 'completed'], { message: 'Invalid status' })
    status!: string;

    @Column({ default: 'medium' })
    @IsIn(['low', 'medium', 'high'], { message: 'Invalid priority' })
    priority!: string;

    @CreateDateColumn()
    created_at!: Date;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    due_date!: Date;

    @UpdateDateColumn()
    updated_at!: Date;

    @OneToMany(() => Subtask, subtask => subtask.task)
    subtasks!: Subtask[];

    @OneToMany(() => File, file => file.task)
    files!: File[];
}
