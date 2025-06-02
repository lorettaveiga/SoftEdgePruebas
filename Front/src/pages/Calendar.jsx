import React, { useState, useEffect } from "react";
import TopAppBar from "../components/TopAppBar";
import AddEventForm from "../components/AddEventForm";
import "../css/Calendar.css";

const Calendar = () => {
  const [events, setEvents] = useState([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [token, setToken] = useState(null);

  const CLIENT_ID = "1061399996878-hc2o41g46ci7skkibcqav1sqrrbtd6ho.apps.googleusercontent.com";

  useEffect(() => {
    const initializeGoogleIdentityServices = () => {
      /* global google */
      google.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: handleCredentialResponse,
      });

      google.accounts.id.prompt(); // Muestra el cuadro de inicio de sesión si es necesario
    };

    const handleCredentialResponse = (response) => {
        if (response.credential) {
          console.log("Token recibido:", response.credential);
          setToken(response.credential); // Guarda el token de acceso
        } else {
          console.error("Error al recibir el token:", response);
        }
      };

    initializeGoogleIdentityServices();
  }, []);

  const fetchEvents = async () => {
    if (!token) {
      console.error("No se ha autenticado el usuario.");
      return;
    }

    try {
      const response = await fetch(
        "https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=" +
          new Date().toISOString() +
          "&maxResults=3&singleEvents=true&orderBy=startTime",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Error al obtener eventos");
      }

      const data = await response.json();
      setEvents(data.items);
    } catch (error) {
      console.error("Error al obtener eventos:", error);
    }
  };

  const handleAddEvent = async (eventData) => {
    if (!token) {
      console.error("No se ha autenticado el usuario.");
      return;
    }

    try {
      const response = await fetch(
        "https://www.googleapis.com/calendar/v3/calendars/primary/events",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            summary: eventData.summary,
            location: eventData.location,
            description: eventData.description,
            start: {
              dateTime: new Date(eventData.start).toISOString(),
              timeZone: "America/Mexico_City",
            },
            end: {
              dateTime: new Date(eventData.end).toISOString(),
              timeZone: "America/Mexico_City",
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Error al agregar el evento");
      }

      const newEvent = await response.json();
      console.log("Evento agregado:", newEvent);
      setEvents((prevEvents) => [...prevEvents, newEvent]);
    } catch (error) {
      console.error("Error al agregar el evento:", error);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [token]);

  return (
    <div>
      <TopAppBar />
      <div className="calendar-container">
        <h1>Próximos eventos</h1>
        {events.length > 0 ? (
          <div className="cards-container">
            {events.map((event, index) => {
              const startDate = new Date(event.start.dateTime || event.start.date);
              const endDate = new Date(event.end.dateTime || event.end.date);
              const duration = Math.abs(endDate - startDate) / (1000 * 60);

              return (
                <div key={index} className="card">
                  <p><strong>Nombre:</strong> {event.summary}</p>
                  <p><strong>Fecha:</strong> {startDate.toLocaleDateString()}</p>
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
          src={`https://calendar.google.com/calendar/embed?src=primary&ctz=America/Mexico_City`}
          style={{ border: 0 }}
          width="800"
          height="600"
          frameBorder="0"
          scrolling="no"
        ></iframe>
      </div>
      <button onClick={() => setIsPopupOpen(true)} className="add-event-button">
        Agregar Evento
      </button>
      <AddEventForm
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        onAddEvent={handleAddEvent}
      />
    </div>
  );
};

export default Calendar;