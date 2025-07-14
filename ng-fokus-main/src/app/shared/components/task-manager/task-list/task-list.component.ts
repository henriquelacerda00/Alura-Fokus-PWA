import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TaskItem } from '../task-item';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './task-list.component.html',
  styleUrl: './task-list.component.scss'
})
export class TaskListComponent {

  @Input()
  taskItem!: TaskItem;

  @Output()
  onTaskClick = new EventEmitter<TaskItem>();

  onTaskListClick(taskItem: TaskItem): void {
    this.taskItem.isActive = !this.taskItem.isActive;
    this.onTaskClick.emit(taskItem);
  }
}
