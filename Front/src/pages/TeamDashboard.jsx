import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopAppBar from '../components/TopAppBar';
import '../css/TeamDashboard.css';

const TeamDashboard = () => {
  const navigate = useNavigate();
  const [selectedMember, setSelectedMember] = useState(null);

  // Mock data for demonstration - in real app this would come from an API
  const teamMembers = [
    {
      id: 1,
      name: 'Juan Pérez',
      recovery: 85,
      sleepPerformance: 92,
      strain: 12.5,
      hrv: 65,
      sleepDuration: 7.5,
      lastUpdated: '2024-03-20'
    },
    {
      id: 2,
      name: 'María García',
      recovery: 45, // Low recovery example
      sleepPerformance: 78,
      strain: 15.2,
      hrv: 42,
      sleepDuration: 6.8,
      lastUpdated: '2024-03-20'
    },
    {
      id: 3,
      name: 'Carlos López',
      recovery: 72,
      sleepPerformance: 85,
      strain: 8.7,
      hrv: 58,
      sleepDuration: 7.2,
      lastUpdated: '2024-03-20'
    },
    {
      id: 4,
      name: 'Ana Martínez',
      recovery: 68,
      sleepPerformance: 88,
      strain: 9.3,
      hrv: 55,
      sleepDuration: 7.0,
      lastUpdated: '2024-03-20'
    },
    {
      id: 5,
      name: 'Roberto Sánchez',
      recovery: 32, // Low recovery example
      sleepPerformance: 65,
      strain: 16.8,
      hrv: 38,
      sleepDuration: 6.5,
      lastUpdated: '2024-03-20'
    },
    {
      id: 6,
      name: 'Laura Torres',
      recovery: 75,
      sleepPerformance: 90,
      strain: 7.5,
      hrv: 62,
      sleepDuration: 7.8,
      lastUpdated: '2024-03-20'
    },
    {
      id: 7,
      name: 'Miguel Rodríguez',
      recovery: 82,
      sleepPerformance: 94,
      strain: 6.8,
      hrv: 68,
      sleepDuration: 8.0,
      lastUpdated: '2024-03-20'
    },
    {
      id: 8,
      name: 'Sofía Vargas',
      recovery: 58,
      sleepPerformance: 82,
      strain: 11.2,
      hrv: 48,
      sleepDuration: 6.9,
      lastUpdated: '2024-03-20'
    },
    {
      id: 9,
      name: 'Diego Morales',
      recovery: 28, // Low recovery example
      sleepPerformance: 62,
      strain: 17.5,
      hrv: 35,
      sleepDuration: 6.2,
      lastUpdated: '2024-03-20'
    },
    {
      id: 10,
      name: 'Elena Castro',
      recovery: 78,
      sleepPerformance: 89,
      strain: 8.2,
      hrv: 60,
      sleepDuration: 7.4,
      lastUpdated: '2024-03-20'
    }
  ];

  const getMetricColor = (metric, value) => {
    switch (metric) {
      case 'recovery':
        return value < 40 ? '#e17055' : value < 60 ? '#fdcb6e' : '#7a5a96';
      case 'sleepPerformance':
        return value < 70 ? '#e17055' : value < 85 ? '#fdcb6e' : '#7a5a96';
      case 'strain':
        return value > 15 ? '#e17055' : value > 12 ? '#fdcb6e' : '#7a5a96';
      case 'hrv':
        return value < 40 ? '#e17055' : value < 50 ? '#fdcb6e' : '#7a5a96';
      case 'sleepDuration':
        return value < 6.5 ? '#e17055' : value < 7 ? '#fdcb6e' : '#7a5a96';
      default:
        return '#7a5a96';
    }
  };

  const getRecommendations = (member) => {
    const recommendations = [];

    // Recomendaciones basadas en recuperación
    if (member.recovery < 40) {
      recommendations.push({
        type: 'warning',
        message: 'Recuperación muy baja (40%). Dejar salir temprano hoy para que pueda descansar mejor'
      });
      recommendations.push({
        type: 'warning',
        message: 'Ofrecer un refrigerio rico en proteínas y carbohidratos para ayudar a la recuperación'
      });
    } else if (member.recovery < 60) {
      recommendations.push({
        type: 'caution',
        message: 'Recuperación moderada (60%). Dar un descanso extra de 15 minutos en la tarde para mantener la energía'
      });
    }

    // Recomendaciones basadas en esfuerzo
    if (member.strain > 15) {
      recommendations.push({
        type: 'warning',
        message: 'Esfuerzo muy alto (15+). Reducir la carga de trabajo para hoy y priorizar tareas esenciales'
      });
      recommendations.push({
        type: 'warning',
        message: 'Ofrecer un snack rico en electrolitos para reponer lo perdido durante el esfuerzo'
      });
    }

    // Recomendaciones basadas en sueño
    if (member.sleepPerformance < 70) {
      recommendations.push({
        type: 'warning',
        message: 'Calidad de sueño deficiente (70%). Permitir entrada más tarde mañana para recuperar el descanso'
      });
      recommendations.push({
        type: 'warning',
        message: 'Ofrecer café o té para mantener la energía durante el día'
      });
    }

    if (member.sleepDuration < 6.5) {
      recommendations.push({
        type: 'caution',
        message: 'Duración de sueño insuficiente (6.5h). Dar un descanso de 20 minutos después del almuerzo para compensar'
      });
    }

    // Recomendaciones basadas en VFC
    if (member.hrv < 40) {
      recommendations.push({
        type: 'warning',
        message: 'VFC baja (40ms) indica estrés. Sugerir una caminata corta al aire libre para reducir el estrés'
      });
      recommendations.push({
        type: 'warning',
        message: 'Ofrecer un espacio tranquilo para descansar 10 minutos y practicar respiración profunda'
      });
    }

    // Recomendación general si todo está bien
    if (recommendations.length === 0) {
      recommendations.push({
        type: 'success',
        message: 'Todas las métricas están en niveles óptimos. Mantener horario normal'
      });
    }

    // Agregar recomendaciones específicas según las métricas
    if (member.recovery < 60 || member.sleepPerformance < 70) {
      recommendations.push({
        type: 'info',
        message: 'Ofrecer agua con electrolitos para ayudar en la recuperación'
      });
    } else if (member.strain > 12) {
      recommendations.push({
        type: 'info',
        message: 'Ofrecer frutas ricas en potasio (plátano, naranja) para reponer electrolitos'
      });
    } else {
      recommendations.push({
        type: 'info',
        message: 'Mantener hidratación con agua regular'
      });
    }

    return recommendations;
  };

  const RecommendationPopup = ({ member, onClose }) => {
    if (!member) return null;

    const recommendations = getRecommendations(member);

    return (
      <div className="recommendation-popup-overlay" onClick={onClose}>
        <div className="recommendation-popup-content" onClick={e => e.stopPropagation()}>
          <button className="recommendation-popup-close" onClick={onClose}>&times;</button>
          <h2 className="recommendation-popup-title">Recomendaciones para {member.name}</h2>
          <div className="recommendation-list">
            {recommendations.map((rec, index) => (
              <div key={index} className={`recommendation-item ${rec.type}`}>
                {rec.message}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <TopAppBar />
      <div className="main-title" style={{ marginBottom: '28px' }}>
        <h1>Dashboard del Equipo</h1>
      </div>
      <div className="team-dashboard-container">
        <button 
          className="back-button" 
          onClick={() => navigate('/biometricos')}
        >
          ←
        </button>
        <div className="team-grid">
          {teamMembers.map((member) => (
            <div 
              key={member.id} 
              className="team-member-card"
              onClick={() => setSelectedMember(member)}
              style={{ cursor: 'pointer' }}
            >
              <div className="team-member-header">
                <h3>{member.name}</h3>
                <span className="last-updated">Última actualización: {member.lastUpdated}</span>
              </div>
              <div className="team-member-metrics">
                <div className="metric-row">
                  <span className="metric-label">Recuperación</span>
                  <span className="metric-value" style={{ color: getMetricColor('recovery', member.recovery) }}>
                    {member.recovery}%
                  </span>
                </div>
                <div className="metric-row">
                  <span className="metric-label">Desempeño del Sueño</span>
                  <span className="metric-value" style={{ color: getMetricColor('sleepPerformance', member.sleepPerformance) }}>
                    {member.sleepPerformance}%
                  </span>
                </div>
                <div className="metric-row">
                  <span className="metric-label">Esfuerzo</span>
                  <span className="metric-value" style={{ color: getMetricColor('strain', member.strain) }}>
                    {member.strain}
                  </span>
                </div>
                <div className="metric-row">
                  <span className="metric-label">VFC</span>
                  <span className="metric-value" style={{ color: getMetricColor('hrv', member.hrv) }}>
                    {member.hrv} ms
                  </span>
                </div>
                <div className="metric-row">
                  <span className="metric-label">Duración del Sueño</span>
                  <span className="metric-value" style={{ color: getMetricColor('sleepDuration', member.sleepDuration) }}>
                    {member.sleepDuration} h
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {selectedMember && (
        <RecommendationPopup 
          member={selectedMember} 
          onClose={() => setSelectedMember(null)} 
        />
      )}
    </>
  );
};

export default TeamDashboard; 