import React, { useState, useEffect } from 'react';
import { MapPin, Phone, Package, User, DollarSign, Clock, Navigation, MessageCircle, CheckCircle, AlertCircle, Building, X, Store, ShoppingBasket, Info, Truck, LogOut, Home as HomeIcon, FileText, Settings, Menu } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import DeliveryMapSystem from './home';

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyAGYqDE7wRSj7FL0i3MY3-meunLyXkETA0",
  authDomain: "chilitosramen-89223.firebaseapp.com",
  databaseURL: "https://chilitosramen-89223-default-rtdb.firebaseio.com",
  projectId: "chilitosramen-89223",
  storageBucket: "chilitosramen-89223.appspot.com",
  messagingSenderId: "980858860861",
  appId: "1:980858860861:web:50efba800ea74546a08154",
  measurementId: "G-23ZQE8834Z"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// ===================== LOGIN COMPONENT =====================
const Login = ({ onLoginSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      console.log('✅ Usuario autenticado:', result.user.email);
      onLoginSuccess(result.user);
    } catch (error) {
      console.error('❌ Error en login:', error);
      
      if (error.code === 'auth/popup-closed-by-user') {
        setError('Inicio de sesión cancelado');
      } else if (error.code === 'auth/network-request-failed') {
        setError('Error de conexión. Verifica tu internet');
      } else {
        setError('Error al iniciar sesión. Intenta nuevamente');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      minHeight: '-webkit-fill-available', // Para Safari
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      boxSizing: 'border-box'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '20px',
        padding: '1.5rem',
        width: '100%',
        maxWidth: '400px',
        boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.4)',
        animation: 'slideIn 0.4s ease',
        margin: '1rem'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem',
            boxShadow: '0 8px 20px rgba(102, 126, 234, 0.4)',
            transform: 'rotate(-5deg)'
          }}>
            <Package size={36} color="white" />
          </div>
          <h1 style={{ 
            fontSize: '1.75rem', 
            fontWeight: '800', 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            margin: 0,
            marginBottom: '0.5rem',
            lineHeight: 1.2
          }}>
            Panel de Repartidor
          </h1>
          <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: 0, lineHeight: 1.4 }}>
            Gestiona tus entregas de forma eficiente
          </p>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#fee2e2',
            color: '#991b1b',
            padding: '0.875rem',
            borderRadius: '10px',
            marginBottom: '1.25rem',
            fontSize: '0.8rem',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            border: '1px solid #fecaca',
            animation: 'shake 0.5s ease'
          }}>
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          style={{
            width: '100%',
            padding: '1rem',
            background: loading ? '#f3f4f6' : 'white',
            color: loading ? '#9ca3af' : '#1f2937',
            border: '2px solid #e5e7eb',
            borderRadius: '12px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            marginBottom: '1.25rem'
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.12)';
              e.target.style.borderColor = '#667eea';
            }
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.06)';
            e.target.style.borderColor = '#e5e7eb';
          }}
        >
          {loading ? (
            <>
              <div style={{
                width: '18px',
                height: '18px',
                border: '2px solid #e5e7eb',
                borderTop: '2px solid #667eea',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
              Iniciando sesión...
            </>
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 20 20">
                <path fill="#4285F4" d="M19.6 10.23c0-.82-.1-1.42-.25-2.05H10v3.72h5.5c-.15.96-.74 2.31-2.04 3.22v2.45h3.16c1.89-1.73 2.98-4.3 2.98-7.34z"/>
                <path fill="#34A853" d="M13.46 15.13c-.83.59-1.96 1-3.46 1-2.64 0-4.88-1.74-5.68-4.15H1.07v2.52C2.72 17.75 6.09 20 10 20c2.7 0 4.96-.89 6.62-2.42l-3.16-2.45z"/>
                <path fill="#FBBC05" d="M3.99 10c0-.69.12-1.35.32-1.97V5.51H1.07A9.973 9.973 0 000 10c0 1.61.39 3.14 1.07 4.49l3.24-2.52c-.2-.62-.32-1.28-.32-1.97z"/>
                <path fill="#EA4335" d="M10 3.88c1.88 0 3.13.81 3.85 1.48l2.84-2.76C14.96.99 12.7 0 10 0 6.09 0 2.72 2.25 1.07 5.51l3.24 2.52C5.12 5.62 7.36 3.88 10 3.88z"/>
              </svg>
              Iniciar sesión con Google
            </>
          )}
        </button>

        <div style={{
          padding: '1rem',
          backgroundColor: '#f9fafb',
          borderRadius: '10px',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', alignItems: 'start', gap: '0.75rem' }}>
            <div style={{
              flexShrink: 0,
              width: '32px',
              height: '32px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Package size={16} color="white" />
            </div>
            <div>
              <p style={{ 
                fontSize: '0.8rem', 
                fontWeight: '600', 
                color: '#1f2937', 
                margin: 0,
                marginBottom: '0.25rem'
              }}>
                Acceso Seguro
              </p>
              <p style={{ 
                fontSize: '0.75rem', 
                color: '#6b7280', 
                margin: 0,
                lineHeight: 1.4
              }}>
                Inicia sesión con tu cuenta de Google para acceder al panel de entregas
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>
        {`
          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
          }
        `}
      </style>
    </div>
  );
};

// ===================== DASHBOARD COMPONENT =====================
const Dashboard = ({ user, onNavigate, onLogout }) => {
  const menuItems = [
    {
      id: 'deliveries',
      title: 'Gestión de Pedidos',
      description: 'Ver y gestionar entregas activas',
      icon: Package,
      color: '#667eea',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      count: '0'
    },
    {
      id: 'history',
      title: 'Historial',
      description: 'Ver entregas completadas',
      icon: FileText,
      color: '#10b981',
      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      count: '0'
    },
    {
      id: 'stats',
      title: 'Estadísticas',
      description: 'Ver rendimiento y métricas',
      icon: Settings,
      color: '#f59e0b',
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      count: '$0'
    }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      minHeight: '-webkit-fill-available',
      background: 'linear-gradient(to bottom right, #f8fafc, #e2e8f0)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      boxSizing: 'border-box'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '1.5rem 1rem',
        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.2)',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                background: 'rgba(255, 255, 255, 0.2)',
                padding: '0.75rem',
                borderRadius: '12px',
                backdropFilter: 'blur(10px)'
              }}>
                <Menu size={24} />
              </div>
              <div>
                <h1 style={{ fontSize: '1.5rem', fontWeight: '700', margin: 0, marginBottom: '0.25rem' }}>
                  Panel de Control
                </h1>
                <p style={{ fontSize: '0.8rem', opacity: 0.9, margin: 0 }}>
                  Bienvenido, {user?.displayName?.split(' ')[0] || 'Repartidor'}
                </p>
              </div>
            </div>
            
            <button
              onClick={onLogout}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                color: 'white',
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                cursor: 'pointer',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.3)';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              <LogOut size={16} />
              Cerrar Sesión
            </button>
          </div>
          
          {/* User Info Card con Avatar de Google */}
          <div style={{
            marginTop: '1.25rem',
            background: 'rgba(255, 255, 255, 0.15)',
            padding: '0.875rem 1rem',
            borderRadius: '10px',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            {user?.photoURL ? (
              <img 
                src={user.photoURL} 
                alt={user.displayName || 'Avatar'}
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  border: '2px solid rgba(255, 255, 255, 0.5)',
                  objectFit: 'cover',
                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)'
                }}
              />
            ) : (
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid rgba(255, 255, 255, 0.5)'
              }}>
                <User size={24} />
              </div>
            )}
            <div>
              <p style={{ fontSize: '1rem', fontWeight: '700', margin: 0, marginBottom: '0.125rem' }}>
                {user?.displayName || 'Usuario'}
              </p>
              <p style={{ fontSize: '0.75rem', opacity: 0.9, margin: 0 }}>
                {user?.email}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: '1.5rem 1rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                style={{
                  background: 'white',
                  border: 'none',
                  borderRadius: '16px',
                  padding: '1.5rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                  textAlign: 'left',
                  position: 'relative',
                  overflow: 'hidden',
                  width: '100%'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.12)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)';
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: '-25%',
                  right: '-15%',
                  width: '140px',
                  height: '140px',
                  background: item.gradient,
                  borderRadius: '50%',
                  opacity: 0.08
                }} />
                
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    background: item.gradient,
                    borderRadius: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1rem',
                    boxShadow: `0 4px 12px ${item.color}30`
                  }}>
                    <Icon size={28} color="white" />
                  </div>
                  
                  <h3 style={{
                    fontSize: '1.25rem',
                    fontWeight: '700',
                    color: '#1f2937',
                    margin: 0,
                    marginBottom: '0.5rem'
                  }}>
                    {item.title}
                  </h3>
                  
                  <p style={{
                    fontSize: '0.875rem',
                    color: '#6b7280',
                    margin: 0,
                    marginBottom: '1rem',
                    lineHeight: 1.4
                  }}>
                    {item.description}
                  </p>
                  
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.375rem 0.75rem',
                    background: `${item.color}15`,
                    borderRadius: '6px',
                    color: item.color,
                    fontWeight: '600',
                    fontSize: '0.8rem'
                  }}>
                    {item.count}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '1.5rem',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
        }}>
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: '700',
            color: '#1f2937',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <Clock size={20} style={{ color: '#667eea' }} />
            Estadísticas de Hoy
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '0.75rem'
          }}>
            {[
              { label: 'Pedidos Activos', value: '0', color: '#667eea', icon: Package },
              { label: 'Completados', value: '0', color: '#10b981', icon: CheckCircle },
              { label: 'En Camino', value: '0', color: '#3b82f6', icon: Truck },
              { label: 'Total Entregado', value: '$0.00', color: '#f59e0b', icon: DollarSign }
            ].map((stat, index) => {
              const StatIcon = stat.icon;
              return (
                <div key={index} style={{
                  padding: '1rem',
                  background: `linear-gradient(135deg, ${stat.color}10, ${stat.color}05)`,
                  borderRadius: '12px',
                  border: `1px solid ${stat.color}20`,
                  textAlign: 'center'
                }}>
                  <StatIcon size={20} style={{ color: stat.color, marginBottom: '0.5rem' }} />
                  <p style={{ 
                    fontSize: '1.5rem', 
                    fontWeight: '700', 
                    color: stat.color, 
                    margin: 0,
                    marginBottom: '0.25rem'
                  }}>
                    {stat.value}
                  </p>
                  <p style={{ 
                    fontSize: '0.75rem', 
                    color: '#6b7280', 
                    margin: 0,
                    fontWeight: '500'
                  }}>
                    {stat.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

// ===================== PLACEHOLDER PAGE =====================
const PlaceholderPage = ({ title, icon: Icon, onBack }) => (
  <div style={{
    minHeight: '100vh',
    minHeight: '-webkit-fill-available',
    background: 'linear-gradient(to bottom right, #f8fafc, #e2e8f0)',
    padding: '1.5rem 1rem',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    boxSizing: 'border-box'
  }}>
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <button
        onClick={onBack}
        style={{
          background: 'white',
          border: 'none',
          padding: '0.75rem 1.25rem',
          borderRadius: '10px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.875rem',
          fontWeight: '600',
          color: '#667eea',
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08)',
          marginBottom: '1.5rem',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = 'translateX(-4px)';
          e.target.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.12)';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'translateX(0)';
          e.target.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.08)';
        }}
      >
        <HomeIcon size={16} />
        Volver al Menú
      </button>
      
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '3rem 1.5rem',
        textAlign: 'center',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem',
          boxShadow: '0 6px 20px rgba(102, 126, 234, 0.3)'
        }}>
          <Icon size={36} color="white" />
        </div>
        <h1 style={{ 
          fontSize: '1.75rem', 
          fontWeight: '800', 
          color: '#1f2937', 
          marginBottom: '1rem',
          lineHeight: 1.2
        }}>
          {title}
        </h1>
        <p style={{ 
          fontSize: '1rem', 
          color: '#6b7280',
          maxWidth: '400px',
          margin: '0 auto',
          lineHeight: 1.4
        }}>
          Esta página estará disponible próximamente
        </p>
      </div>
    </div>
  </div>
);

// ===================== MAIN APP =====================
const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('dashboard');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setCurrentPage('dashboard');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const handleNavigate = (page) => {
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        minHeight: '-webkit-fill-available',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '3px solid rgba(255, 255, 255, 0.3)',
            borderTop: '3px solid white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }} />
          <p style={{ color: 'white', fontSize: '1rem', fontWeight: '500' }}>
            Cargando...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login onLoginSuccess={setUser} />;
  }

  if (currentPage === 'dashboard') {
    return (
      <Dashboard 
        user={user}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
      />
    );
  }

  if (currentPage === 'deliveries') {
    return (
      <div style={{ 
        minHeight: '100vh', 
        minHeight: '-webkit-fill-available',
        background: 'linear-gradient(to bottom right, #f8fafc, #e2e8f0)',
        boxSizing: 'border-box'
      }}>
        {/* Header con navegación */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
          position: 'sticky',
          top: 0,
          zIndex: 30
        }}>
          <button
            onClick={() => setCurrentPage('dashboard')}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              color: 'white',
              padding: '0.625rem 1rem',
              borderRadius: '8px',
              cursor: 'pointer',
              backdropFilter: 'blur(10px)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: '600',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.3)'}
            onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
          >
            <HomeIcon size={16} />
            Menú
          </button>
          
          {/* Avatar del usuario en el header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {user?.photoURL && (
              <img 
                src={user.photoURL} 
                alt={user.displayName || 'Avatar'}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  border: '2px solid rgba(255, 255, 255, 0.5)',
                  objectFit: 'cover',
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)'
                }}
              />
            )}
            <button
              onClick={handleLogout}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                color: 'white',
                padding: '0.625rem 1rem',
                borderRadius: '8px',
                cursor: 'pointer',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.3)'}
              onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
            >
              <LogOut size={16} />
              Salir
            </button>
          </div>
        </div>
        
        {/* Componente DeliveryMapSystem integrado */}
        <DeliveryMapSystem user={user} />
      </div>
    );
  }

  if (currentPage === 'history') {
    return (
      <PlaceholderPage 
        title="Historial de Entregas" 
        icon={FileText}
        onBack={() => setCurrentPage('dashboard')} 
      />
    );
  }

  if (currentPage === 'stats') {
    return (
      <PlaceholderPage 
        title="Estadísticas y Métricas" 
        icon={Settings}
        onBack={() => setCurrentPage('dashboard')} 
      />
    );
  }

  return null;
};

export default App;