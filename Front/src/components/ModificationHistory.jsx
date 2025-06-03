import React, { useEffect, useState } from "react";
import "../css/ModificationHistory.css";

const ModificationHistory = ({ projectId }) => {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL; // URL del backend
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/projectsFB/${projectId}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (!response.ok) {
          throw new Error("Error al cargar el historial");
        }
        const data = await response.json();
        setHistory(data.modificationHistory || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchHistory();
    }
  }, [projectId]);

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const formattedDate = date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    const formattedTime = date.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });

    return (
      <span>
        {formattedDate}, <strong>{formattedTime}</strong>
        {/* Time */}
      </span>
    );
  };

  const getRequirementTypeSingular = (type) => {
    const types = {
      EP: "Épica",
      RF: "Requerimiento Funcional",
      RNF: "Requerimiento No Funcional",
      HU: "Historia de Usuario",
    };
    return types[type] || type;
  };

  const renderChangeList = (changes) => {
    const items = [];
    Object.entries(changes).forEach(([key, value]) => {
      if (Array.isArray(value) && ["EP", "RF", "RNF", "HU"].includes(key)) {
        value.forEach((change) => {
          const id = change.id;
          if (change.changes.nuevo) {
            items.push(
              <li key={`${key}-${id}-nuevo`}>
                Se agregó {getRequirementTypeSingular(key)} con ID <b>{id}</b>
              </li>
            );
          } else if (change.changes.eliminado) {
            items.push(
              <li key={`${key}-${id}-eliminado`}>
                Se eliminó {getRequirementTypeSingular(key)} con ID <b>{id}</b>
              </li>
            );
          } else {
            Object.entries(change.changes).forEach(([field, vals]) => {
              if (
                vals &&
                typeof vals === "object" &&
                vals.oldValue !== undefined &&
                vals.newValue !== undefined
              ) {
                const fieldLabel =
                  field === "data"
                    ? "descripción"
                    : field === "titulo"
                    ? "título"
                    : field === "tasks"
                    ? "tareas"
                    : field;

                // Handle different types of values
                let oldValueDisplay, newValueDisplay;

                if (field === "tasks") {
                  // For tasks, just show that tasks were modified
                  oldValueDisplay = Array.isArray(vals.oldValue)
                    ? `${vals.oldValue.length} tareas`
                    : "tareas";
                  newValueDisplay = Array.isArray(vals.newValue)
                    ? `${vals.newValue.length} tareas`
                    : "tareas";
                } else if (
                  Array.isArray(vals.oldValue) ||
                  Array.isArray(vals.newValue)
                ) {
                  // For other arrays, show count
                  oldValueDisplay = Array.isArray(vals.oldValue)
                    ? `${vals.oldValue.length} elementos`
                    : String(vals.oldValue);
                  newValueDisplay = Array.isArray(vals.newValue)
                    ? `${vals.newValue.length} elementos`
                    : String(vals.newValue);
                } else if (
                  typeof vals.oldValue === "object" ||
                  typeof vals.newValue === "object"
                ) {
                  // For objects, show a generic message
                  oldValueDisplay = "configuración anterior";
                  newValueDisplay = "configuración nueva";
                } else {
                  // For primitive values, convert to string
                  oldValueDisplay = String(vals.oldValue);
                  newValueDisplay = String(vals.newValue);
                }

                if (field === "tasks") {
                  items.push(
                    <li key={`${key}-${id}-${field}`}>
                      En {getRequirementTypeSingular(key)} <b>{id}</b>, se
                      modificaron las tareas ({oldValueDisplay} →{" "}
                      {newValueDisplay})
                    </li>
                  );
                } else {
                  items.push(
                    <li key={`${key}-${id}-${field}`}>
                      En {getRequirementTypeSingular(key)} <b>{id}</b>, se
                      cambió <b>{fieldLabel}</b> de "{oldValueDisplay}" a "
                      {newValueDisplay}"
                    </li>
                  );
                }
              }
            });
          }
        });
      } else if (value && typeof value === "object") {
        switch (key) {
          case "nombreProyecto":
            if (value.oldValue !== undefined && value.newValue !== undefined) {
              items.push(
                <li key={key}>
                  Se cambió el nombre del proyecto de "{String(value.oldValue)}"
                  a "{String(value.newValue)}"
                </li>
              );
            }
            break;
          case "descripcion":
            if (value.oldValue !== undefined && value.newValue !== undefined) {
              items.push(
                <li key={key}>
                  Se cambió la descripción del proyecto de "
                  {String(value.oldValue)}" a "{String(value.newValue)}"
                </li>
              );
            } else {
              items.push(
                <li key={key}>Se modificó la descripción del proyecto</li>
              );
            }
            break;
          case "sprintDuration":
            if (value.oldValue !== undefined && value.newValue !== undefined) {
              items.push(
                <li key={key}>
                  Se cambió la duración de sprints de {String(value.oldValue)}{" "}
                  semanas a {String(value.newValue)} semanas
                </li>
              );
            }
            break;
          case "EP":
          case "RF":
          case "RNF":
          case "HU":
            items.push(
              <li key={key}>Se modificaron los {getRequirementType(key)}</li>
            );
            break;
          default:
            // For unknown object fields, show a generic message
            items.push(<li key={key}>Se modificó {key}</li>);
        }
      } else {
        // Handle primitive values
        items.push(<li key={key}>Se modificó {key}</li>);
      }
    });
    return <ul className="change-list">{items}</ul>;
  };

  const getRequirementType = (type) => {
    const types = {
      EP: "Épicas",
      RF: "Requerimientos Funcionales",
      RNF: "Requerimientos No Funcionales",
      HU: "Historias de Usuario",
    };
    return types[type] || type;
  };

  if (loading) {
    return <div className="modification-history">Cargando historial...</div>;
  }

  if (error) {
    return <div className="modification-history error">Error: {error}</div>;
  }

  if (history.length === 0) {
    return (
      <div className="modification-history">
        No hay modificaciones registradas
      </div>
    );
  }

  const sortedHistory = [...history].sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
  );

  return (
    <div className="modification-history">
      <h3>Historial de Modificaciones</h3>
      <div className="history-list">
        {sortedHistory.map((item, index) => (
          <div key={index} className="history-item">
            <div className="history-item-header">
              <span className="history-type">Modificación</span>
              <span className="history-date">{formatDate(item.timestamp)}</span>
            </div>
            {renderChangeList(item.changes)}
            <div className="history-user">
              <span className="user-label">Usuario:</span>
              <span className="user-name">
                {item.userName
                  ? `${item.userName} ${item.userLastname || ""}`.trim()
                  : item.userId}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ModificationHistory;
