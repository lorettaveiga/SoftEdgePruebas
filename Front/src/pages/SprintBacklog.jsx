import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { UserContext } from "../components/UserContext";
import ErrorPopup from "../components/ErrorPopup";
import SuccessPopup from "../components/SuccessPopup";
import TopAppBar from "../components/TopAppBar";
import SprintDetails from "../components/SprintDetails";
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

  // Función para generar sprints dinámicamente
  const generateSprints = (sprintNumber, projectTasks = []) => {
    const sprints = [];
    for (let i = 1; i <= sprintNumber; i++) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + (i - 1) * 14); // 2 semanas por sprint
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 13); // Sprint de 2 semanas

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
      const sprintTasks = projectTasks.filter(
        (task) => parseInt(task.sprint, 10) === i
      );

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
        }

        // Generar sprints dinámicamente basado en sprintNumber del proyecto
        const sprintNumber = data.sprintNumber || 3; // Default a 3 si no existe
        const generatedSprints = generateSprints(sprintNumber, allTasks);
        setSprints(generatedSprints);
      } catch (error) {
        setError("Error al cargar el proyecto. Por favor, inténtalo de nuevo.");
        console.error("Error fetching project:", error);
      }
      setLoading(false);
    };

    fetchData();
  }, [projectId]);

  const handleSprintClick = (sprint) => {
    console.log("Sprint seleccionado:", sprint);
    setSelectedSprint(sprint);
  };

  const handleCloseSprintDetails = () => {
    setSelectedSprint(null);
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
              sprints.map((sprint, index) => (
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
                          className={`task-status-badge ${task.status
                            .toLowerCase()
                            .replace(/\s+/g, "-")}`}
                        >
                          {task.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="no-sprints">
                <p>No hay sprints disponibles</p>
              </div>
            )}
          </div>
        </div>
      </div>
      console.log("Valor de selectedSprint:", selectedSprint);

      {selectedSprint && (
        console.log("Project ID en SprintBacklog:", projectId),

        <SprintDetails
          sprint={selectedSprint}
          sprintTasks={selectedSprint?.tasks || []}
          onClose={handleCloseSprintDetails}
          setAllTasks={setSprints}
          projectId={projectId} // Pasa el projectId aquí
        />
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
