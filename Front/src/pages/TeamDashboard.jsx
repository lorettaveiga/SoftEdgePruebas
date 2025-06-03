import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/TeamDashboard.css';
import TopAppBar from '../components/TopAppBar';
import whoopService from '../services/whoopService';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const TeamDashboard = () => {
    const [teamData, setTeamData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTeamData = async () => {
            try {
                // Aquí simularemos los datos del equipo
                // En una implementación real, esto vendría de tu backend
                const mockTeamData = [
                    {
                        id: 1,
                        name: 'Tere Martínez',
                        recovery: 85,
                        sleep: 92,
                        strain: 12.5,
                        stressLevel: 'Bajo',
                        lastUpdate: new Date().toISOString()
                    },
                    {
                        id: 2,
                        name: 'María Castresana',
                        recovery: 45,
                        sleep: 78,
                        strain: 15.2,
                        stressLevel: 'Alto',
                        lastUpdate: new Date().toISOString()
                    },
                    {
                        id: 3,
                        name: 'Mariana González',
                        recovery: 65,
                        sleep: 85,
                        strain: 10.8,
                        stressLevel: 'Medio',
                        lastUpdate: new Date().toISOString()
                    }
                ];
                setTeamData(mockTeamData);
                setLoading(false);
            } catch (err) {
                setError('Error al cargar los datos del equipo');
                setLoading(false);
            }
        };

        fetchTeamData();
    }, []);

    const getStressColor = (level) => {
        switch (level.toLowerCase()) {
            case 'alto':
                return '#ff4444';
            case 'medio':
                return '#ffbb33';
            case 'bajo':
                return '#00C851';
            default:
                return '#33b5e5';
        }
    };

    const getRecoveryColor = (value) => {
        if (value >= 70) return '#00C851';
        if (value >= 40) return '#ffbb33';
        return '#ff4444';
    };

    if (loading) return <div className="team-dashboard-loading">Cargando datos del equipo...</div>;
    if (error) return <div className="team-dashboard-error">{error}</div>;

    return (
        <div className="team-dashboard">
            <TopAppBar title="Dashboard del Equipo" />
            <div className="team-dashboard-container">
                <h1>Estado del Equipo</h1>
                <div className="team-grid">
                    {teamData.map((member) => (
                        <div key={member.id} className="team-member-card">
                            <div className="member-header">
                                <h2>{member.name}</h2>
                                <div className="stress-indicator" style={{ color: getStressColor(member.stressLevel) }}>
                                    {member.stressLevel === 'Alto' ? (
                                        <WarningIcon style={{ color: '#ff4444' }} />
                                    ) : (
                                        <CheckCircleIcon style={{ color: getStressColor(member.stressLevel) }} />
                                    )}
                                    <span>{member.stressLevel}</span>
                                </div>
                            </div>
                            <div className="member-metrics">
                                <div className="metric">
                                    <span className="metric-label">Recuperación</span>
                                    <span className="metric-value" style={{ color: getRecoveryColor(member.recovery) }}>
                                        {member.recovery}%
                                    </span>
                                </div>
                                <div className="metric">
                                    <span className="metric-label">Sueño</span>
                                    <span className="metric-value">{member.sleep}%</span>
                                </div>
                                <div className="metric">
                                    <span className="metric-label">Strain</span>
                                    <span className="metric-value">{member.strain}</span>
                                </div>
                            </div>
                            <div className="member-footer">
                                <span className="last-update">
                                    Última actualización: {new Date(member.lastUpdate).toLocaleString()}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TeamDashboard; 