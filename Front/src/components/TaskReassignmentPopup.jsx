import React, { useState, useEffect } from 'react';
import '../css/TaskReassignmentPopup.css';

const TaskReassignmentPopup = ({ 
  sprintToDelete, 
  tasksToReassign, 
  availableSprints, 
  onConfirm, 
  onCancel 
}) => {
  const [taskAssignments, setTaskAssignments] = useState({});

  useEffect(() => {
    // Initialize task assignments - default to first available sprint
    const initialAssignments = {};
    tasksToReassign.forEach(task => {
      initialAssignments[task.id] = availableSprints[0]?.number || 1;
    });
    setTaskAssignments(initialAssignments);
  }, [tasksToReassign, availableSprints]);

  const handleAssignmentChange = (taskId, newSprintNumber) => {
    setTaskAssignments(prev => ({
      ...prev,
      [taskId]: parseInt(newSprintNumber)
    }));
  };

  const handleConfirm = () => {
    onConfirm(taskAssignments);
  };

  if (tasksToReassign.length === 0) {
    return (
      <div className="popup-overlay">
        <div className="popup-content task-reassignment-popup">
          <h3>Confirmar eliminación de Sprint {sprintToDelete}</h3>
          <p>El Sprint {sprintToDelete} no tiene tareas asignadas.</p>
          <p>¿Confirmas la eliminación del sprint?</p>
          <div className="reassignment-actions">
            <button className="cancel-button" onClick={onCancel}>
              Cancelar
            </button>
            <button className="confirm-button" onClick={() => onConfirm({})}>
              Eliminar Sprint
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="popup-overlay">
      <div className="popup-content task-reassignment-popup">
        <h3>Reasignar tareas del Sprint {sprintToDelete}</h3>
        <p>
          El Sprint {sprintToDelete} tiene {tasksToReassign.length} tarea(s) asignada(s). 
          Selecciona a qué sprints quieres reasignar cada tarea:
        </p>
        
        <div className="tasks-reassignment-list">
          {tasksToReassign.map(task => (
            <div key={task.id} className="task-reassignment-item">
              <div className="task-info">
                <h4>{task.titulo || task.title}</h4>
                <p>{task.descripcion || task.description}</p>
                <span className={`priority-badge ${task.prioridad || task.priority}`}>
                  {task.prioridad || task.priority}
                </span>
              </div>
              <div className="sprint-assignment">
                <label htmlFor={`sprint-${task.id}`}>Asignar a Sprint:</label>
                <select
                  id={`sprint-${task.id}`}
                  value={taskAssignments[task.id] || availableSprints[0]?.number || 1}
                  onChange={(e) => handleAssignmentChange(task.id, e.target.value)}
                  className="sprint-select"
                >
                  {availableSprints.map(sprint => (
                    <option key={sprint.number} value={sprint.number}>
                      Sprint {sprint.number}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>

        <div className="reassignment-actions">
          <button className="cancel-button" onClick={onCancel}>
            Cancelar
          </button>
          <button className="confirm-button" onClick={handleConfirm}>
            Reasignar y Eliminar Sprint
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskReassignmentPopup;
