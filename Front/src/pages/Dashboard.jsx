import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { UserContext } from "../components/UserContext";
import ErrorPopup from "../components/ErrorPopup";
import SuccessPopup from "../components/SuccessPopup";
import TopAppBar from "../components/TopAppBar";
import EditMemberPopup from "../components/EditMemeberPopup";
import RenderRequirementsTab from "../components/RenderRequirementsTab";
import TeamEditPopup from "../components/TeamEditPopup";
import ModificationHistory from "../components/ModificationHistory";
import SprintDetails from "../components/SprintDetails";
import "../css/Dashboard.css";

const Dashboard = () => {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const role = localStorage.getItem("role");
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { userId } = useContext(UserContext);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [activeRequirement, setActiveRequirement] = useState("EP");
  const [isEditing, setIsEditing] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [showTeamPopup, setShowTeamPopup] = useState(false);
  const [allTasks, setAllTasks] = useState([]);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [editing, setEditing] = useState(false);
  const [saveStatus, setSaveStatus] = useState({
    loading: false,
    error: null,
    success: false,
  });

  // Sprint backlog states
  const [sprints, setSprints] = useState([
    {
      number: 1,
      status: "En progreso",
      startDate: "2024-04-01",
      endDate: "2024-04-14",
      tasks: [
        {
          title: "Implementar autenticación",
          description: "Crear sistema de login y registro",
          status: "En progreso",
        },
        {
          title: "Diseñar interfaz de usuario",
          description: "Crear wireframes y mockups",
          status: "Completado",
        },
      ],
    },
    {
      number: 2,
      status: "Planificado",
      startDate: "2024-04-15",
      endDate: "2024-04-28",
      tasks: [
        {
          title: "Desarrollar API",
          description: "Implementar endpoints principales",
          status: "Pendiente",
        },
        {
          title: "Configurar base de datos",
          description: "Crear esquema y migraciones",
          status: "Pendiente",
        },
      ],
    },
    {
      number: 3,
      status: "Pendiente",
      startDate: "2024-04-29",
      endDate: "2024-05-12",
      tasks: [
        {
          title: "Pruebas de integración",
          description: "Realizar pruebas de sistema completo",
          status: "Pendiente",
        },
      ],
    },
  ]);
  const [tasks, setTasks] = useState([]);
  const [selectedSprint, setSelectedSprint] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [availableMembers, setAvailableMembers] = useState([]);
  const [countdown, setCountdown] = useState(3);
  const [editData, setEditData] = useState({
    title: "",
    description: "",
    nombreProyecto: "",
    descripcion: "",
  });
  const [requirementEditData, setRequirementEditData] = useState({
    title: "",
    description: "",
  });
  const [showMemberMenu, setShowMemberMenu] = useState(null);
  const [editingMember, setEditingMember] = useState(null);
  const [memberAction, setMemberAction] = useState(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskFormData, setTaskFormData] = useState({
    title: "",
    description: "",
    priority: "",
    assignee: "",
  });
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [deleteMode, setDeleteMode] = useState(false);
  const [taskToSelect, setTaskToSelect] = useState(null);
  const [showProjectDeleteConfirmation, setShowProjectDeleteConfirmation] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [nextTaskNumber, setNextTaskNumber] = useState(0);
  const [draggedTask, setDraggedTask] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await fetchProject();
      const projectMembers = await fetchTeamMembers();
      await fetchAvailableUsers(projectMembers);
      await fetchAllTasks();
      setLoading(false);
    };

    fetchData();
  }, [projectId]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (showProjectDeleteConfirmation) {
      let timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    } else {
      setCountdown(3);
    }
  }, [showProjectDeleteConfirmation]);

  const fetchProject = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("No se encontró un token de autenticación. Por favor, inicia sesión.");
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/projectsFB/${projectId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch project");
      const data = await response.json();
      setProject(data);
      setEditData({
        nombreProyecto: data.nombreProyecto,
        descripcion: data.descripcion,
      });
    } catch (error) {
      setError("Error al cargar el proyecto. Por favor, inténtalo de nuevo.");
      console.error("Error fetching project:", error);
    }
  };

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch(
          `${BACKEND_URL}/projectsFB/${projectId}/all-tasks`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (!response.ok) throw new Error("Error al cargar las tareas");

        const { tasks: dbTasks } = await response.json();
        setTasks(dbTasks);
      } catch (error) {
        console.error("Error al cargar las tareas:", error);
        setError("No se pudieron cargar las tareas del proyecto.");
      }
    };

    fetchTasks();
  }, [projectId]);

  const handleSprintClick = (sprint) => {
    setSelectedSprint(sprint);
  };

  const handleCloseSprintDetails = () => {
    setSelectedSprint(null);
  };

  const fetchAvailableUsers = async (projectMembers) => {
    try {
      const response = await fetch(`${BACKEND_URL}/users`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const data = await response.json();

      if (data.success) {
        const mappedUsers = data.users.map((user) => ({
          id: user.UserID,
          name: user.username,
          lastname: user.lastname,
          role: user.role,
          email: user.email,
          initials: `${user.username[0] || ""}${user.lastname?.[0] || ""}`.toUpperCase(),
        }));

        const filteredUsers = mappedUsers.filter(
          (user) => !projectMembers.some((member) => member.id === user.id)
        );

        setAvailableMembers(filteredUsers);
      } else {
        console.error("Error fetching users:", data.message);
      }
    } catch (error) {
      console.error("Error fetching available users:", error);
    }
  };

  const fetchTeamMembers = async () => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/projectsFB/${projectId}/team`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch team members");
      }

      const data = await response.json();

      if (data.success) {
        const mappedTeamMembers = data.teamMembers.map((member) => ({
          id: member.UserID,
          name: member.username,
          lastname: member.lastname,
          title: member.title,
          email: member.email,
          initials: `${member.username[0] || ""}${member.lastname?.[0] || ""}`.toUpperCase(),
        }));

        setTeamMembers(mappedTeamMembers);
        return mappedTeamMembers;
      } else {
        console.error("Error fetching team members:", data.message);
      }
    } catch (error) {
      console.error("Error fetching team members:", error);
      setError("Error al cargar los miembros del equipo.");
    }
  };

  const fetchAllTasks = async () => {
    try {
      const resp = await fetch(
        `${BACKEND_URL}/projectsFB/${projectId}/all-tasks`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (!resp.ok) throw new Error("Failed to fetch all tasks");

      const { tasks: dbTasks } = await resp.json();
      setAllTasks(dbTasks);
      console.log("Tareas obtenidas:", dbTasks);

      const nextTaskNumber = dbTasks.length;
      setNextTaskNumber(nextTaskNumber);
      console.log(nextTaskNumber);
    } catch (error) {
      console.error("Error fetching all tasks:", error);
    }
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/projectsFB/${projectId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(editData),
      });

      if (!response.ok) throw new Error("Failed to update project");

      setProject((prev) => ({
        ...prev,
        ...editData,
      }));
      setIsEditing(false);
      console.log("Project updated successfully");
      setSuccessMessage("Proyecto actualizado exitosamente.");
    } catch (error) {
      console.error("Error updating project:", error);
      setError("Error al actualizar el proyecto. Por favor, inténtalo de nuevo.");
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedItem || !project) return;

    try {
      setSaveStatus({ loading: true, error: null, success: false });

      const updatedProject = {
        ...project,
        [activeRequirement]: project[activeRequirement].map((item) =>
          item.id === selectedItem.id
            ? {
                ...item,
                titulo: requirementEditData.title,
                data: requirementEditData.description,
              }
            : item
        ),
      };

      const response = await fetch(`${BACKEND_URL}/projectsFB/${projectId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          nombreProyecto: updatedProject.nombreProyecto,
          descripcion: updatedProject.descripcion,
          [activeRequirement]: updatedProject[activeRequirement],
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || "Error al guardar en el servidor");
      }

      setProject(updatedProject);
      setSaveStatus({ loading: false, error: null, success: true });
      setSuccessMessage("Cambios guardados exitosamente");
      handleClosePopup(); // Asegurarse de cerrar el popup después de guardar
    } catch (error) {
      console.error("Error al guardar:", error);
      setSaveStatus({
        loading: false,
        error: error.message,
        success: false,
      });
      setError(error.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (editing) {
      setRequirementEditData((prev) => ({
        ...prev,
        [name]: value,
      }));
    } else {
      setEditData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const closeErrorPopup = () => {
    setError(null);
  };

  const closeSuccessPopup = () => {
    setSuccessMessage(null);
  };

  const handleItemClick = async (item) => {
    setSelectedItem(item);
    setRequirementEditData({
      title: item.titulo,
      description: item.data,
    });
    setShowPopup(true);

    try {
      const resp = await fetch(
        `${BACKEND_URL}/projectsFB/${projectId}/tasks?requirementType=${activeRequirement}&elementId=${item.id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (!resp.ok) throw new Error("Failed to fetch tasks");
      const { tasks: dbTasks } = await resp.json();
      const mapped = dbTasks.map((t) => {
        const rawId = t.id.toString();
        const num = rawId.startsWith("T") ? rawId.slice(1) : rawId;
        const padded = num.padStart(2, "0");
        return {
          id: `T${padded}`,
          title: t.titulo,
          description: t.descripcion,
          priority: t.prioridad,
          assignee: teamMembers.find((m) => m.id === t.asignados)?.email || "",
        };
      });
      setTasks((prev) => ({ ...prev, [item.id]: mapped }));
    } catch (err) {
      console.error("Error fetching tasks:", err);
    }
  };

  const handleStatCardClick = (requirementType) => {
    setActiveTab("requirements");
    setActiveRequirement(requirementType);
  };

  const handleEditTeam = () => {
    setShowTeamPopup(true);
  };

  const handleMemberSelect = (member) => {
    setSelectedMembers((prev) => {
      if (prev.some((m) => m.email === member.email)) {
        return prev.filter((m) => m.email !== member.email);
      } else {
        return [...prev, member];
      }
    });
  };

  const handleSaveTeam = async (addedMembers, removedMembers, currentUser) => {
    try {
      // 1. Realizar las operaciones de vinculación/desvinculación
      await Promise.all([
        ...addedMembers.map(member =>
          fetch(`${BACKEND_URL}/projectsFB/linkUserToProject`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({ userId: member.id, projectId }),
          })
        ),
        ...removedMembers.map(member =>
          fetch(`${BACKEND_URL}/projectsFB/unlinkUserFromProject`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({ userId: member.id, projectId }),
          })
        )
      ]);

      // 2. Registrar cambios en el historial
      await Promise.all([
        ...addedMembers.map(member =>
          fetch(`${BACKEND_URL}/projectsFB/${projectId}/history`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({
              action: "MEMBER_ADDED",
              userId: currentUser.userId,
              userName: currentUser.name,
              userLastname: currentUser.lastname,
              targetUserId: member.id,
              details: `Se agregó a ${member.name} ${member.lastname || ''} (${member.email}) al equipo del proyecto`,
              timestamp: new Date().toISOString(),
            }),
          })
        ),
        ...removedMembers.map(member =>
          fetch(`${BACKEND_URL}/projectsFB/${projectId}/history`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({
              action: "MEMBER_REMOVED",
              userId: currentUser.userId,
              userName: currentUser.name,
              userLastname: currentUser.lastname,
              targetUserId: member.id,
              details: `Se removió a ${member.name} ${member.lastname || ''} (${member.email}) del equipo del proyecto`,
              timestamp: new Date().toISOString(),
            }),
          })
        )
      ]);

      // 3. Actualizar el estado local
      setTeamMembers(prev => [
        ...prev.filter(tm => !removedMembers.some(rm => rm.email === tm.email)),
        ...addedMembers
      ]);
      
      setAvailableMembers(prev => [
        ...prev.filter(am => !addedMembers.some(m => m.email === am.email)),
        ...removedMembers
      ]);

      setShowTeamPopup(false);
      setSuccessMessage("Equipo actualizado correctamente");
    } catch (err) {
      console.error(err);
      setError("No se pudieron guardar los cambios de equipo");
    }
  };

  const handleCancelTeam = () => {
    setShowTeamPopup(false);
    setSelectedMembers([]);
  };

  const handleMemberMenuClick = (e, member) => {
    e.stopPropagation();
    setShowMemberMenu(showMemberMenu === member.email ? null : member.email);
  };

  const handleEditMember = (member) => {
    setEditingMember(member);
    setMemberAction("edit");
    setShowMemberMenu(null);
  };

  const handleRemoveMember = async (member) => {
    try {
      await fetch(`${BACKEND_URL}/projectsFB/unlinkUserFromProject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          userId: member.id,
          projectId,
        }),
      });

      setTeamMembers((prev) =>
        prev.filter((teamMember) => teamMember.email !== member.email)
      );
      setAvailableMembers((prev) => [...prev, member]);
      setEditingMember(null);
      setMemberAction(null);
      setSuccessMessage("Miembro eliminado exitosamente.");
    } catch (error) {
      console.error("Error removing user from project:", error);
      setError("Error al eliminar miembro del proyecto.");
    }
  };

  const handleUpdateMember = (e) => {
    e.preventDefault();
    if (editingMember) {
      setTeamMembers((prev) =>
        prev.map((member) =>
          member.email === editingMember.email ? editingMember : member
        )
      );
      setEditingMember(null);
      setMemberAction(null);
    }
  };

  const handleConfirmRemove = () => {
    if (editingMember) {
      setTeamMembers((prev) =>
        prev.filter((member) => member.email !== editingMember.email)
      );
      setAvailableMembers((prev) => [...prev, editingMember]);
      setEditingMember(null);
      setMemberAction(null);
    }
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    setShowTaskForm(false);
    setSelectedItem(null);
    setTaskFormData({
      title: "",
      description: "",
      priority: "",
      assignee: "",
    });
    setEditing(false);
    setDeleteMode(false);
    setRequirementEditData({
      title: "",
      description: ""
    });
    setSaveStatus({
      loading: false,
      error: null,
      success: false
    });
    setIsEditing(false);
  };

  const handleDragStart = (e, taskId, index) => {
    e.dataTransfer.setData("taskId", taskId);
    e.dataTransfer.setData("index", index);
    e.currentTarget.classList.add("dragging");
    setDraggedTask({ id: taskId, index });
  };

  const handleDragEnd = (e) => {
    document.querySelectorAll(".dragging").forEach((element) => {
      element.classList.remove("dragging");
    });
    setDraggedTask(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add("drag-over");
  };

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove("drag-over");
  };

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    if (draggedTask) {
      if (!projectId) {
        console.error("El ID del proyecto no está definido");
        return;
      }

      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found. Please log in.");
        setError("No se encontró un token de autenticación. Por favor, inicia sesión.");
        return;
      }

      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/projectsFB/${projectId}/tasks`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              taskId: draggedTask.id,
              estado: newStatus,
            }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Error al actualizar la tarea en Firestore:", errorData);
          setError(errorData.message || "Error al actualizar la tarea.");
        }
      } catch (error) {
        console.error("Error al conectar con Firestore:", error);
        setError("Error al conectar con el servidor.");
      }

      setDraggedTask(null);
    }
  };

  const handleDeleteTask = async (taskId, elementId) => {
    const updatedTasksArr = (tasks[elementId] || []).filter(
      (task) => task.id !== taskId
    );
    setTasks((prev) => ({
      ...prev,
      [elementId]: updatedTasksArr,
    }));
    setSuccessMessage("Tarea eliminada exitosamente.");
    setShowDeleteConfirmation(false);
    setTaskToDelete(null);
    setDeleteMode(false);

    try {
      const payload = {
        requirementType: activeRequirement,
        elementId,
        tasks: updatedTasksArr.map((task) => ({
          id: task.id.toString(),
          titulo: task.title,
          descripcion: task.description,
          prioridad: task.priority,
          asignados: teamMembers.find((m) => m.email === task.assignee)?.id || null,
        })),
      };
      await fetch(`${BACKEND_URL}/projectsFB/${projectId}/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.error("Error al eliminar tarea en servidor:", err);
      setError("Error al eliminar la tarea en el servidor.");
    }
  };

  const renderSprintBacklogTab = () => (
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
          </div>
        ))
      ) : (
        <div className="no-sprints">
          <p>No hay sprints disponibles</p>
        </div>
      )}
    </div>
  );

  const renderRequirementsTab = () => (
    <RenderRequirementsTab
      project={project}
      activeRequirement={activeRequirement}
      setActiveRequirement={setActiveRequirement}
      handleItemClick={handleItemClick}
      showPopup={showPopup}
      selectedItem={selectedItem}
      handleClosePopup={handleClosePopup}
      tasks={tasks}
      setTasks={setTasks}
      teamMembers={teamMembers}
      setTaskToDelete={setTaskToDelete}
      deleteMode={deleteMode}
      setDeleteMode={setDeleteMode}
      handleDragStart={handleDragStart}
      handleDragOver={handleDragOver}
      handleDragEnter={handleDragEnter}
      handleDragLeave={handleDragLeave}
      handleDrop={handleDrop}
      handleDragEnd={handleDragEnd}
      showTaskForm={showTaskForm}
      setShowTaskForm={setShowTaskForm}
      taskFormData={taskFormData}
      setTaskFormData={setTaskFormData}
      setSuccessMessage={setSuccessMessage}
      setShowDeleteConfirmation={setShowDeleteConfirmation}
      role={role}
      editing={editing}
      setEditing={setEditing}
      saveStatus={saveStatus}
      setSaveStatus={setSaveStatus}
      requirementEditData={requirementEditData}
      setRequirementEditData={setRequirementEditData}
      handleSaveEdit={handleSaveEdit}
      handleInputChange={handleInputChange}
      nextTaskNumber={nextTaskNumber}
      setNextTaskNumber={setNextTaskNumber}
    />
  );

  const handleDeleteProject = async (projectId) => {
    setProjectToDelete(projectId);
    setShowProjectDeleteConfirmation(true);
  };

  const confirmDeleteProject = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/projectsFB/${projectId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) throw new Error("Failed to delete project");

      setSuccessMessage("Proyecto eliminado exitosamente.");
      setTimeout(() => {
        navigate("/home");
      }, 1000);
    } catch (error) {
      console.error("Error deleting project:", error);
      setError("Error al eliminar el proyecto. Por favor, inténtalo de nuevo.");
    } finally {
      setShowProjectDeleteConfirmation(false);
      setProjectToDelete(null);
    }
  };

  const renderOverviewTab = () => (
    <div className="overview-section">
      <div className="project-header">
        {isEditing ? (
          <>
            <input
              type="text"
              value={editData.nombreProyecto}
              onChange={(e) =>
                setEditData({ ...editData, nombreProyecto: e.target.value })
              }
              className="edit-input title"
            />
            <textarea
              value={editData.descripcion}
              onChange={(e) =>
                setEditData({ ...editData, descripcion: e.target.value })
              }
              className="edit-input description"
            />
            <div className="edit-actions">
              <button className="save-button" onClick={handleSave}>
                Guardar
              </button>
              <button
                className="cancel-button"
                onClick={() => setIsEditing(false)}
              >
                Cancelar
              </button>
            </div>
          </>
        ) : (
          <>
            <h1>{project.nombreProyecto}</h1>
            <p style={{ marginBottom: "10px", fontSize: "16px" }}>
              {project.descripcion}
            </p>
            {(role === "admin" || role === "editor") && (
              <div className="button-container">
                <button
                  className="popup-button delete"
                  onClick={() => handleDeleteProject(projectId)}
                >
                  Eliminar Proyecto
                </button>

                <button
                  className="popup-button primary"
                  onClick={() => setIsEditing(true)}
                >
                  Editar Proyecto
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <div className="stats-grid">
        <div
          className="stat-card clickable"
          onClick={() => handleStatCardClick("EP")}
        >
          <h3>Épicas</h3>
          <p className="stat-number">{project.EP?.length || 0}</p>
        </div>
        <div
          className="stat-card clickable"
          onClick={() => handleStatCardClick("RF")}
        >
          <h3>Requerimientos Funcionales</h3>
          <p className="stat-number">{project.RF?.length || 0}</p>
        </div>
        <div
          className="stat-card clickable"
          onClick={() => handleStatCardClick("RNF")}
        >
          <h3>Requerimientos No Funcionales</h3>
          <p className="stat-number">{project.RNF?.length || 0}</p>
        </div>
        <div
          className="stat-card clickable"
          onClick={() => handleStatCardClick("HU")}
        >
          <h3>Historias de Usuario</h3>
          <p className="stat-number">{project.HU?.length || 0}</p>
        </div>
      </div>

      <div className="modification-history-section">
        <ModificationHistory projectId={projectId} />
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="white-container">
        <TopAppBar />
        <div className="home-container">
          <div className="main-title">
            <h1>Dashboard</h1>
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
            <h1>Dashboard</h1>
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
            ? `${project.nombreProyecto} - Dashboard`
            : "Dashboard"}
        </h1>
      </div>
      <div className="dashboard-content">
        <div className="main-dashboard-content">
          <button className="back-button" onClick={() => navigate("/home")}>
            ←
          </button>
          <div className="dashboard-tabs">
            <button
              className={`tab-button ${
                activeTab === "overview" ? "active" : ""
              }`}
              onClick={() => setActiveTab("overview")}
            >
              Vista General
            </button>
            <button
              className={`tab-button ${
                activeTab === "requirements" ? "active" : ""
              }`}
              onClick={() => setActiveTab("requirements")}
            >
              Elementos
            </button>
            <button
              className={`tab-button ${
                activeTab === "sprint-backlog" ? "active" : ""
              }`}
              onClick={() => setActiveTab("sprint-backlog")}
            >
              Sprint Backlog
            </button>
          </div>

          <div className="tab-content">
            {activeTab === "overview"
              ? renderOverviewTab()
              : activeTab === "requirements"
              ? renderRequirementsTab()
              : renderSprintBacklogTab()}
          </div>
        </div>

        <div className="team-members-container">
          <h2 className="team-members-title">Equipo del Proyecto</h2>
          <div className="team-members-content">
            {teamMembers.map((member, index) => (
              <div key={index} className="team-member-card">
                <div className="member-profile">{member.initials}</div>
                <div className="member-info">
                  <div className="member-name" style={{ fontSize: "16px" }}>
                    {member.name}
                  </div>
                  <div className="member-role" style={{ fontSize: "16px" }}>
                    {member.title}
                  </div>
                  <div className="member-email" style={{ fontSize: "16px" }}>
                    {member.email}
                  </div>
                </div>
                {(role === "editor" || role === "admin") && (
                  <div className="member-actions">
                    {showMemberMenu === member.email && (
                      <div className="member-menu">
                        {role === "admin" && (
                          <button onClick={() => handleEditMember(member)}>
                            Editar
                          </button>
                        )}
                        <button onClick={() => handleRemoveMember(member)}>
                          Eliminar
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
          {(role === "admin" || role === "editor") && (
            <button className="edit-team-button" onClick={handleEditTeam}>
              Gestionar Equipo
            </button>
          )}
        </div>
      </div>

      {editingMember && (
        <EditMemberPopup
          editingMember={editingMember}
          setEditingMember={setEditingMember}
          memberAction={memberAction}
          setMemberAction={setMemberAction}
          setTeamMembers={setTeamMembers}
          setAvailableMembers={setAvailableMembers}
        />
      )}

      {showTeamPopup && (
        <TeamEditPopup
          availableMembers={availableMembers}
          teamMembers={teamMembers}
          handleSaveTeam={handleSaveTeam}
          handleCancelTeam={handleCancelTeam}
          setError={setError}
        />
      )}

      {selectedSprint && (
        <SprintDetails
          sprint={selectedSprint}
          sprintTasks={allTasks.filter((task) => {
            return parseInt(task.sprint, 10) === selectedSprint.number;
          })}
          setAllTasks={setAllTasks}
          onClose={handleCloseSprintDetails}
          projectId={projectId}
        />
      )}

      <ErrorPopup message={error} onClose={closeErrorPopup} />
      <SuccessPopup message={successMessage} onClose={closeSuccessPopup} />

      {showDeleteConfirmation && taskToDelete && (
        <div
          className="popup-overlay"
          onClick={() => setShowDeleteConfirmation(false)}
        >
          <div
            className="popup-content confirmation-popup"
            onClick={(e) => e.stopPropagation()}
            style={{ minWidth: "500px", textAlign: "center" }}
          >
            <button
              className="popup-close"
              onClick={() => setShowDeleteConfirmation(false)}
            >
              ×
            </button>
            <h3>Confirmar eliminación</h3>
            <p>
              ¿Estás seguro que deseas eliminar la tarea "{taskToDelete.title}"?
            </p>
            <p>Esta acción no se puede deshacer.</p>
            <div className="confirmation-actions">
              <button
                className="cancel-button"
                onClick={() => setShowDeleteConfirmation(false)}
              >
                Cancelar
              </button>
              <button
                className="delete-button"
                onClick={() =>
                  handleDeleteTask(taskToDelete.id, taskToDelete.elementId)
                }
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {showProjectDeleteConfirmation && (
        <div
          className="popup-overlay"
          onClick={() => setShowProjectDeleteConfirmation(false)}
        >
          <div
            className="popup-content confirmation-popup"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "400px", textAlign: "center" }}
          >
            <h3>Confirmar eliminación</h3>
            <p>
              ¿Estás seguro que deseas eliminar el proyecto? Esta acción no se
              puede deshacer.
            </p>
            <div className="confirmation-actions">
              <button
                className="cancel-button"
                onClick={() => setShowProjectDeleteConfirmation(false)}
              >
                Cancelar
              </button>
              <button
                className="delete-button"
                id="project-delete-button"
                disabled={countdown > 0}
                onClick={confirmDeleteProject}
              >
                {countdown > 0 ? `Eliminar (${countdown})` : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;