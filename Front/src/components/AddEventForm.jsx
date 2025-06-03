import React, { useState } from "react";

const AddEventForm = ({ isOpen, onClose, onAddEvent }) => {
  const [eventData, setEventData] = useState({
    summary: "",
    start: "",
    end: "",
    location: "",
    description: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEventData({ ...eventData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddEvent(eventData); // Llama a la función para agregar el evento
    onClose(); // Cierra el popup después de agregar el evento
  };

  if (!isOpen) return null; // No renderiza nada si el popup no está abierto

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-content" onClick={(e) => e.stopPropagation()}>
        <button className="popup-close" onClick={onClose}>
          ×
        </button>
        <h2 className="popup-title">Agregar Evento</h2>
        <form onSubmit={handleSubmit} className="add-event-form">
          <input
            type="text"
            name="summary"
            placeholder="Nombre del evento"
            value={eventData.summary}
            onChange={handleChange}
            required
          />
          <input
            type="datetime-local"
            name="start"
            placeholder="Inicio"
            value={eventData.start}
            onChange={handleChange}
            required
          />
          <input
            type="datetime-local"
            name="end"
            placeholder="Fin"
            value={eventData.end}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="location"
            placeholder="Ubicación"
            value={eventData.location}
            onChange={handleChange}
          />
          <textarea
            name="description"
            placeholder="Descripción"
            value={eventData.description}
            onChange={handleChange}
          ></textarea>
          <div className="popup-footer">
            <button
              type="button"
              className="popup-button secondary"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button type="submit" className="popup-button primary">
              Agregar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEventForm;