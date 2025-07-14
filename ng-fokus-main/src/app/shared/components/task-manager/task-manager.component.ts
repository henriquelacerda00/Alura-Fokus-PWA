import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { TaskListComponent } from './task-list/task-list.component';
import { TaskItem } from './task-item';
import { v4 as uuidv4 } from 'uuid';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IndexedDBService } from '../../services/indexed-db.service';

@Component({
  selector: 'app-task-manager',
  standalone: true,
  imports: [
    CommonModule,
    TaskListComponent,
    ReactiveFormsModule
  ],
  templateUrl: './task-manager.component.html',
  styleUrl: './task-manager.component.scss'
})
export class TaskManagerComponent implements OnInit {

  taskForm: FormGroup;
  hasShowForm = false;

  tasks: TaskItem[] = [];
  taskItemSelected: TaskItem | null = null;

  constructor(
    private fb: FormBuilder,
    private indexDB : IndexedDBService
  ) {
    this.taskForm = this.fb.group({
      description: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.indexDB.listAllTasks().subscribe({
      next: (tasks) => {
        this.tasks = tasks;
      },
      error: (err) => {
        console.error('Erro ao listar tarefas do IndexedDB:', err);
      }
    });
  }

  onAddTaskClick(): void {
    this.hasShowForm = true;
    this.taskForm.reset();
  }

  onTaskListClick(selectedTask: TaskItem): void {
    this.taskItemSelected = selectedTask;
    this.tasks.forEach(task => {
      task.isActive = task.uuid === selectedTask.uuid;
    });
    // Nota: A propriedade 'isActive' está sendo atualizada apenas localmente para a UI.
    // Para persistir essa alteração, seria necessário um método 'updateTask' no
    // IndexedDBService para salvar o estado atualizado da tarefa.
  }

  onSaveTask(): void {
    if (this.taskForm.invalid) {
      return;
    }
    const newTask: TaskItem = {
      uuid: uuidv4(),
      description: this.taskForm.value.description,
      isActive: false,
    };

    this.indexDB.addTask(newTask).subscribe({
      next: (task) => {
        this.tasks.push(task);
        this.taskForm.reset();
        this.hasShowForm = false;
      },
      error: (err) => {
        console.error('Falha ao salvar a tarefa no IndexedDB', err);
      },
    });
  }

  onCleanTasksClick(): void {
    this.indexDB.clearAllTasks().subscribe({
      next: () => {
        this.tasks = [];
        this.taskItemSelected = null;
      },
      error: (err) => {
        console.error('Falha ao limpar as tarefas do IndexedDB', err);
      }
    });
  }

  onCancelBtnClick(): void {
    this.hasShowForm = false;
  }
}
