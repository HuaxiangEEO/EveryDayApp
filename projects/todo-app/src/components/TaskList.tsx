import type { List } from '../types/task'
import { useTasks } from '../hooks/useTasks'
import { DATE_GROUP_ORDER, DATE_GROUP_LABELS } from '../utils/dateGroup'
import AddTaskInput from './AddTaskInput'
import TaskItem from './TaskItem'
import TaskEditModal from './TaskEditModal'
import { useState } from 'react'
import type { Task } from '../types/task'
import './TaskList.css'

interface TaskListProps {
  list: List
}

export default function TaskList({ list }: TaskListProps) {
  const { lists, getFilteredForList, getGroupedByDate, addTask, toggleComplete, updateTask, deleteTask } = useTasks()
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const filtered = getFilteredForList(list)
  const grouped = getGroupedByDate(filtered)
  const getListName = (listId: string) => lists.find(l => l.id === listId)?.name ?? listId
  const defaultListId = list.type === 'custom' || list.type === 'inbox' ? list.id : lists.find(l => l.type === 'inbox')?.id

  return (
    <div className="task-list">
      <AddTaskInput
        placeholder={list.type === 'custom' ? `添加任务至「${list.name}」` : '添加任务至「收集箱」'}
        onAdd={async (title, options) => {
          await addTask(title, {
            ...options,
            listId: list.type === 'custom' || list.type === 'inbox' ? list.id : undefined,
          })
        }}
        onEmptyAddClick={() => setShowAddModal(true)}
      />
      <div className="task-list-groups">
        {DATE_GROUP_ORDER.map(key => {
          const tasks = grouped.get(key) ?? []
          if (tasks.length === 0) return null
          return (
            <section key={key} className="task-group">
              <h3 className="task-group-title">{DATE_GROUP_LABELS[key]} {tasks.length}</h3>
              {tasks.map(task => (
                <TaskItem
                  key={task.id}
                  task={task}
                  listName={getListName(task.listId)}
                  onToggle={toggleComplete}
                  onEdit={setEditingTask}
                />
              ))}
            </section>
          )
        })}
      </div>
      {filtered.length === 0 && (
        <div className="task-list-empty">没有任务</div>
      )}
      {editingTask && (
        <TaskEditModal
          task={editingTask}
          lists={lists}
          onSave={(patch) => { updateTask(editingTask.id, patch); setEditingTask(null) }}
          onDelete={() => { deleteTask(editingTask.id); setEditingTask(null) }}
          onClose={() => setEditingTask(null)}
        />
      )}
      {showAddModal && (
        <TaskEditModal
          task={null}
          lists={lists}
          defaultListId={defaultListId}
          onAdd={async (data) => {
            await addTask(data.title, {
              listId: data.listId,
              dueDate: data.dueDate,
              dueTime: data.dueTime,
              important: data.important,
              urgent: data.urgent,
              recurrence: data.recurrence,
              recurrenceEnd: data.recurrenceEnd,
              recurrenceEndDate: data.recurrenceEndDate,
              recurrenceEndCount: data.recurrenceEndCount,
            })
            setShowAddModal(false)
          }}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  )
}
