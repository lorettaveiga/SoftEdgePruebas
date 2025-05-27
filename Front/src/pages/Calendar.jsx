import React, { useState, useEffect } from "react";
import TopAppBar from "../components/TopAppBar"; // Importa el TopAppBar
import "../css/Calendar.css";

const calendarId = "c_5836084e39ec4326fadd3e5e57b6913ca99b6c8c76704bce9f4f18c031ebd2fa@group.calendar.google.com";

const fetchEvents = async (calendarId) => {
  const apiKey = "AIzaSyCut-WwV8r_l6lXLo-GHPzOMAq2zDxrYDM"; // Reemplaza con tu API Key
  try {
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?orderBy=startTime&singleEvents=true&maxResults=5&timeMin=${new Date().toISOString()}&key=${apiKey}`
    );

    if (!response.ok) {
      throw new Error("Error al obtener eventos del calendario público");
    }

    const data = await response.json();
    return data.items; // Devuelve los próximos eventos
  } catch (error) {
    console.error("Error:", error);
    return [];
  }
};

const Calendar = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchEventList = async () => {
      const eventList = await fetchEvents(calendarId);
      setEvents(eventList.slice(0, 3)); // Limita los eventos a los primeros 3
    };

    fetchEventList();
  }, []);

  return (
    <div>
      <TopAppBar /> {/* Incluye el TopAppBar solo en esta página */}
      <div className="calendar-container">
        <h1>Próximos eventos</h1> {/* Cambia el encabezado */}
        {events.length > 0 ? (
          <div className="cards-container">
            {events.map((event, index) => {
              const startDate = new Date(event.start.dateTime || event.start.date);
              const endDate = new Date(event.end.dateTime || event.end.date);
              const duration = Math.abs(endDate - startDate) / (1000 * 60); // Duración en minutos

              return (
                <div key={index} className="card">
                  <p><strong>Nombre:</strong> {event.summary}</p>
                  <p><strong>Fecha:</strong> {startDate.toLocaleDateString()}</p> {/* Solo muestra la fecha */}
                  <p><strong>Duración:</strong> {duration} minutos</p>
                  <p><strong>Ubicación:</strong> {event.location || "No especificada"}</p>
                  <p><strong>Descripción:</strong> {event.description || "No disponible"}</p>
                </div>
              );
            })}
          </div>
        ) : (
          <p>No hay eventos próximos.</p>
        )}
        <iframe
          src={`https://calendar.google.com/calendar/embed?src=${calendarId}&ctz=America/Mexico_City`}
          style={{ border: 0 }}
          width="800"
          height="600"
          frameBorder="0"
          scrolling="no"
        ></iframe>
      </div>
    </div>
  );
};

export default Calendar;