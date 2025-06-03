import React from 'react';
import whoopService from '../services/whoopService';
import "../css/Login.css";

const LoginWhoop = () => {
    const handleLogin = () => {
        window.location.href = whoopService.getAuthUrl();
    };

    return (
        <div style={{
            minHeight: '100vh',
            width: '100vw',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #f8f8fc 60%, #ede6f7 100%)',
        }}>
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                maxWidth: 420,
                padding: '0 1.5rem',
            }}>
                <img src="/Whoop-circle-logo-1.webp" alt="Whoop Logo" style={{ width: 90, height: 90, marginBottom: 32 }} />
                <h2 className="form-title" style={{ textAlign: 'center', color: '#222', fontWeight: 700, marginBottom: 18, fontSize: '3rem' }}>Conectar con WHOOP</h2>
                <p style={{ color: '#555', marginBottom: '2.5rem', textAlign: 'center', fontSize: '1.15rem', maxWidth: 380 }}>
                    Inicia sesión con tu cuenta de WHOOP para ver tus datos biométricos y mejorar tu experiencia en StratEdge.
                </p>
                <button onClick={handleLogin} className="main-button" style={{ width: '100%', fontSize: '1.15rem', padding: '1rem 0', borderRadius: 12, maxWidth: 340 }}>
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                        <img src="/Whoop-circle-logo-1.webp" alt="Whoop Logo" style={{ width: 30, height: 30, marginRight: 4 }} />
                        Conectar con WHOOP
                    </span>
                </button>
            </div>
        </div>
    );
};

export default LoginWhoop; 