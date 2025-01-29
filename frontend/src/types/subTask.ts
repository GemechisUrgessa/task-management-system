export interface Subtask {
    id: number;
    title: string;
    status: 'pending' | 'in progress' | 'completed';
    priority: 'low' | 'medium' | 'high';
    due_date: string;
    }