import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { UserContext } from "../components/UserContext";
import ErrorPopup from "../components/ErrorPopup";
import SuccessPopup from "../components/SuccessPopup";
import TopAppBar from "../components/TopAppBar";
import SprintDetails from "../components/SprintDetails";
import TaskReassignmentPopup from "../components/TaskReassignmentPopup";
import "../css/SprintBacklog.css";

const SprintBacklog = () => {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const { projectId } = useParams();
  console.log("Project ID desde useParams:", projectId);
  const navigate = useNavigate();
  const { userId } = useContext(UserContext);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [selectedSprint, setSelectedSprint] = useState(null);
  const [sprints, setSprints] = useState([]);
  const [sprintDuration, setSprintDuration] = useState(2);
  const [showDeleteSprintConfirmation, setShowDeleteSprintConfirmation] = useState(false);
  const [showTaskReassignmentPopup, setShowTaskReassignmentPopup] = useState(false);
  const [tasksToReassign, setTasksToReassign] = useState([]);
  const [sprintToDelete, setSprintToDelete] = useState(null);

  // Función para generar sprints dinámicamente
  const generateSprints = (
    sprintNumber,
    projectTasks = [],
    duration = 2,
    projectCreatedAt = null
  ) => {
    const sprints = [];
    const durationDays = duration * 7; // Convert weeks to days

    for (let i = 1; i <= sprintNumber; i++) {
      const startDate = new Date(projectCreatedAt || new Date());
      startDate.setDate(startDate.getDate() + (i - 1) * durationDays);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + durationDays - 1);

      // Determinar status del sprint
      let status;
      if (i === 1) {
        status = "En progreso";
      } else if (i === 2 && sprintNumber > 1) {
        status = "Planificado";
      } else {
        status = "Pendiente";
      }

      // Filtrar tareas para este sprint específico
      const sprintTasks = projectTasks
        .filter((task) => parseInt(task.sprint, 10) === i)
        .map((task) => ({
          title: task.titulo || task.title,
          description: task.descripcion || task.description,
          estado: task.estado || 'Pendiente',
          priority: task.prioridad || task.priority,
          assignee: task.asignado || task.assignee,
        }));

      sprints.push({
        number: i,
        status: status,
        startDate: startDate.toISOString().split("T")[0],
        endDate: endDate.toISOString().split("T")[0],
        tasks: sprintTasks,
      });
    }
    return sprints;
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch project data
        const response = await fetch(`${BACKEND_URL}/projectsFB/${projectId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (!response.ok) throw new Error("Failed to fetch project");
        const data = await response.json();
        console.log("Project data:", data);
        setProject(data);

        // Set sprint duration from project data - this ensures we always use DB values
        const projectSprintDuration = data.sprintDuration || 2;
        setSprintDuration(projectSprintDuration);
        console.log("Sprint duration from DB:", projectSprintDuration);

        // Fetch all tasks
        const tasksResponse = await fetch(
          `${BACKEND_URL}/projectsFB/${projectId}/all-tasks`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        let allTasks = [];
        if (tasksResponse.ok) {
          const tasksData = await tasksResponse.json();
          allTasks = tasksData.tasks || [];
          console.log("Tasks from DB:", allTasks);
        }

        // Generate sprints using the actual duration and creation date from DB
        const sprintNumber = data.sprintNumber || 3;
        const generatedSprints = generateSprints(
          sprintNumber,
          allTasks,
          projectSprintDuration,
          data.fechaCreacion
        );
        console.log(
          "Generated sprints with duration:",
          projectSprintDuration,
          generatedSprints
        );
        setSprints(generatedSprints);
      } catch (error) {
        setError("Error al cargar el proyecto. Por favor, inténtalo de nuevo.");
        console.error("Error fetching project:", error);
      }
      setLoading(false);
    };

    if (projectId) {
      fetchData();
    }
  }, [projectId]);

  const handleSprintClick = (sprint) => {
    console.log("Sprint seleccionado:", sprint);
    setSelectedSprint(sprint);
  };

  const handleCloseSprintDetails = () => {
    setSelectedSprint(null);
  };

  // Add function to handle adding new sprints
  const handleAddSprint = async () => {
    try {
      const newSprintNumber = (project.sprintNumber || 3) + 1;
      
      // Update project in database with new sprint count
      const updateData = {
        nombreProyecto: project.nombreProyecto,
        descripcion: project.descripcion,
        sprintNumber: newSprintNumber,
        sprintDuration: project.sprintDuration || 2,
        estatus: project.estatus,
        fechaCreacion: project.fechaCreacion,
        // Include all the existing arrays
        EP: project.EP || [],
        RF: project.RF || [],
        RNF: project.RNF || [],
        HU: project.HU || [],
      };

      const response = await fetch(`${BACKEND_URL}/projectsFB/${projectId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error("Failed to update project with new sprint count");
      }

      // Update local project state
      const updatedProject = { ...project, sprintNumber: newSprintNumber };
      setProject(updatedProject);

      // Regenerate sprints with new count
      try {
        const tasksResponse = await fetch(
          `${BACKEND_URL}/projectsFB/${projectId}/all-tasks`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        let allTasks = [];
        if (tasksResponse.ok) {
          const tasksData = await tasksResponse.json();
          allTasks = tasksData.tasks || [];
        }

        const regeneratedSprints = generateSprints(
          newSprintNumber,
          allTasks,
          projectSprintDuration,
          project.fechaCreacion
        );
        setSprints(regeneratedSprints);
      } catch (taskError) {
        console.error("Error fetching tasks:", taskError);
        const regeneratedSprints = generateSprints(
          newSprintNumber,
          [],
          projectSprintDuration,
          project.fechaCreacion
        );
        setSprints(regeneratedSprints);
      }

      setSuccessMessage("Sprint agregado exitosamente.");
    } catch (error) {
      console.error("Error adding new sprint:", error);
      setError("Error al agregar el nuevo sprint. Por favor, inténtalo de nuevo.");
    }
  };

  // Add function to handle deleting the last sprint with task reassignment
  const handleDeleteLastSprint = async () => {
    try {
      const currentSprintCount = project.sprintNumber || 3;
      
      // Prevent deleting if there's only one sprint
      if (currentSprintCount <= 1) {
        setError("No se puede eliminar el sprint. Debe haber al menos un sprint en el proyecto.");
        return;
      }

      // Get tasks assigned to the last sprint
      const tasksResponse = await fetch(
        `${BACKEND_URL}/projectsFB/${projectId}/all-tasks`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      let allTasks = [];
      if (tasksResponse.ok) {
        const tasksData = await tasksResponse.json();
        allTasks = tasksData.tasks || [];
      }

      // Filter tasks that belong to the sprint being deleted
      const tasksInLastSprint = allTasks.filter(task => 
        parseInt(task.sprint, 10) === currentSprintCount
      );

      // Set data for task reassignment popup
      setTasksToReassign(tasksInLastSprint);
      setSprintToDelete(currentSprintCount);
      
      // Generate available sprints (all except the one being deleted)
      const availableSprints = sprints.filter(sprint => sprint.number !== currentSprintCount);
      
      if (tasksInLastSprint.length > 0 && availableSprints.length > 0) {
        // Show task reassignment popup if there are tasks to reassign
        setShowTaskReassignmentPopup(true);
      } else {
        // If no tasks or no available sprints, proceed with deletion
        await performSprintDeletion(currentSprintCount, {});
      }
      
      setShowDeleteSprintConfirmation(false);
    } catch (error) {
      console.error("Error preparing sprint deletion:", error);
      setError("Error al preparar la eliminación del sprint.");
      setShowDeleteSprintConfirmation(false);
    }
  };

  // Function to perform the actual sprint deletion with task reassignments
  const performSprintDeletion = async (sprintNumber, taskAssignments) => {
    try {
      const newSprintNumber = sprintNumber - 1;

      if (Object.keys(taskAssignments).length > 0) {
        const tasksResponse = await fetch(
          `${BACKEND_URL}/projectsFB/${projectId}/all-tasks`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (tasksResponse.ok) {
          const tasksData = await tasksResponse.json();
          const allTasks = tasksData.tasks || [];

          const updatedTasks = allTasks.map(task => {
            if (taskAssignments[task.id]) {
              return {
                ...task,
                sprint: taskAssignments[task.id], // Ensure sprint is passed as a number
              };
            }
            return task;
          }).filter(task => task.sprint !== sprintNumber);

          const tasksByElement = {};
          updatedTasks.forEach(task => {
            const key = `${task.requirementType}_${task.elementId}`;
            if (!tasksByElement[key]) {
              tasksByElement[key] = {
                requirementType: task.requirementType,
                elementId: task.elementId,
                tasks: [],
              };
            }
            tasksByElement[key].tasks.push({
              id: task.id,
              titulo: task.titulo,
              descripcion: task.descripcion,
              prioridad: task.prioridad,
              asignados: task.asignados,
              sprint: task.sprint,
              estado: task.estado || 'Pendiente',
            });
          });

          for (const elementData of Object.values(tasksByElement)) {
            await fetch(`${BACKEND_URL}/projectsFB/${projectId}/tasks`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
              body: JSON.stringify({
                requirementType: elementData.requirementType,
                elementId: elementData.elementId,
                tasks: elementData.tasks,
              }),
            });
          }
        }
      }

      // Update project with reduced sprint count
      const updateData = {
        nombreProyecto: project.nombreProyecto,
        descripcion: project.descripcion,
        sprintNumber: newSprintNumber,
        sprintDuration: project.sprintDuration || 2,
        estatus: project.estatus,
        fechaCreacion: project.fechaCreacion,
        EP: project.EP || [],
        RF: project.RF || [],
        RNF: project.RNF || [],
        HU: project.HU || [],
      };

      const response = await fetch(`${BACKEND_URL}/projectsFB/${projectId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error("Failed to update project with new sprint count");
      }

      // Update local project state
      const updatedProject = { ...project, sprintNumber: newSprintNumber };
      setProject(updatedProject);

      // Regenerate sprints with new count
      try {
        const tasksResponse = await fetch(
          `${BACKEND_URL}/projectsFB/${projectId}/all-tasks`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        let allTasks = [];
        if (tasksResponse.ok) {
          const tasksData = await tasksResponse.json();
          allTasks = tasksData.tasks || [];
        }

        const regeneratedSprints = generateSprints(
          newSprintNumber,
          allTasks,
          project.sprintDuration || 2,
          project.fechaCreacion
        );
        setSprints(regeneratedSprints);
      } catch (taskError) {
        console.error("Error fetching tasks:", taskError);
        const regeneratedSprints = generateSprints(
          newSprintNumber,
          [],
          project.sprintDuration || 2,
          project.fechaCreacion
        );
        setSprints(regeneratedSprints);
      }

      setSuccessMessage("Sprint eliminado exitosamente.");
    } catch (error) {
      console.error("Error deleting sprint:", error);
      setError("Error al eliminar el sprint. Por favor, inténtalo de nuevo.");
    }
  };

  // Handle task reassignment confirmation
  const handleTaskReassignmentConfirm = async (taskAssignments) => {
    await performSprintDeletion(sprintToDelete, taskAssignments);
    setShowTaskReassignmentPopup(false);
    setTasksToReassign([]);
    setSprintToDelete(null);
  };

  // Handle task reassignment cancellation
  const handleTaskReassignmentCancel = () => {
    setShowTaskReassignmentPopup(false);
    setTasksToReassign([]);
    setSprintToDelete(null);
  };

  if (loading) {
    return (
      <div className="white-container">
        <TopAppBar />
        <div className="home-container">
          <div className="main-title">
            <h1>Sprint Backlog</h1>
          </div>
          <div className="dashboard-loading">
            <div className="spinner"></div>
            <p>Cargando proyecto...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="white-container">
        <TopAppBar />
        <div className="home-container">
          <div className="main-title">
            <h1>Sprint Backlog</h1>
          </div>
          <div className="dashboard-error">
            <h2>Proyecto no encontrado</h2>
            <button onClick={() => navigate("/home")}>Volver al inicio</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <TopAppBar />
      <div className="main-title">
        <h1>
          {project && project.nombreProyecto
            ? `${project.nombreProyecto} - Sprint Backlog`
            : "Sprint Backlog"}
        </h1>
      </div>
      <div className="dashboard-content">
        <div className="main-dashboard-content">
          <button
            className="back-button"
            onClick={() => navigate(`/project/${projectId}`)}
          >
            ←
          </button>

          <div className="sprints-grid">
            {sprints.length > 0 ? (
              <>
                {sprints.map((sprint, index) => (
                  <div
                    key={index}
                    className="sprint-card"
                    onClick={() => handleSprintClick(sprint)}
                  >
                    <h3 className="sprint-title">SPRINT {sprint.number}</h3>
                    <div className="sprint-status-container">
                      <span
                        className={`status-badge ${sprint.status
                          .toLowerCase()
                          .replace(/\s+/g, "-")}`}
                      >
                        {sprint.status}
                      </span>
                    </div>
                    <div className="sprint-dates">
                      <div className="date-item">
                        <span className="calendar-icon">📅</span>
                        <span className="date-text">
                          {new Date(sprint.startDate).toLocaleDateString("es-ES", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="date-separator">→</div>
                      <div className="date-item">
                        <span className="calendar-icon">📅</span>
                        <span className="date-text">
                          {new Date(sprint.endDate).toLocaleDateString("es-ES", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                    <div className="sprint-tasks">
                      {sprint.tasks?.map((task, taskIndex) => (
                        <div key={taskIndex} className="sprint-task">
                          <h4>{task.title}</h4>
                          <p>{task.description}</p>
                          <span
                            className={`task-status-badge ${(task.estado || 'pendiente')
                              .toLowerCase()
                              .replace(/\s+/g, "-")}`}
                          >
                            {task.estado || 'Pendiente'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                {/* Add Sprint Card */}
                <div
                  className="sprint-card add-sprint-card"
                  onClick={handleAddSprint}
                >
                  <div className="add-sprint-content">
                    <div className="add-sprint-icon">+</div>
                    <h3 className="add-sprint-title">Agregar Sprint</h3>
                    <p className="add-sprint-description">
                      Haz clic para añadir un nuevo sprint al proyecto
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <div className="no-sprints">
                <p>No hay sprints disponibles</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedSprint && (
        <SprintDetails
          sprint={selectedSprint}
          sprintTasks={selectedSprint?.tasks || []}
          onClose={handleCloseSprintDetails}
          setAllTasks={setSprints}
          projectId={projectId}
        />
      )}

      {/* Task Reassignment Popup */}
      {showTaskReassignmentPopup && (
        <TaskReassignmentPopup
          sprintToDelete={sprintToDelete}
          tasksToReassign={tasksToReassign}
          availableSprints={sprints.filter(sprint => sprint.number !== sprintToDelete)}
          onConfirm={handleTaskReassignmentConfirm}
          onCancel={handleTaskReassignmentCancel}
        />
      )}

      {/* Delete Sprint Confirmation Dialog */}
      {showDeleteSprintConfirmation && (
        <div
          className="popup-overlay"
          onClick={() => setShowDeleteSprintConfirmation(false)}
        >
          <div
            className="popup-content confirmation-popup"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "400px", textAlign: "center" }}
          >
            <h3>Confirmar eliminación de Sprint</h3>
            <p>
              ¿Estás seguro que deseas eliminar el último sprint (Sprint {project.sprintNumber || 3})?
            </p>
            <div className="confirmation-actions">
              <button
                className="cancel-button"
                onClick={() => setShowDeleteSprintConfirmation(false)}
              >
                Cancelar
              </button>
              <button
                className="delete-button"
                onClick={handleDeleteLastSprint}
              >
                Continuar
              </button>
            </div>
          </div>
        </div>
      )}

      <ErrorPopup message={error} onClose={() => setError(null)} />
      <SuccessPopup
        message={successMessage}
        onClose={() => setSuccessMessage(null)}
      />
    </div>
  );
};

export default SprintBacklog;
