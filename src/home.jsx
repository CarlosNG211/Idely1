import React, { useState, useEffect } from 'react';
import { MapPin, Phone, Package, User, DollarSign, Clock, Navigation, MessageCircle, CheckCircle, AlertCircle, Building, X, Store, Printer, ShoppingBasket, Info, MapIcon, ChevronDown, Filter, RefreshCw, Truck } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, update, remove } from 'firebase/database';
import { getFirestore, doc, setDoc, updateDoc, getDoc, query, collection, where, getDocs, limit, serverTimestamp } from 'firebase/firestore';

// Configuración de Firebase
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
const db = getDatabase(app);
const firestore = getFirestore(app);

const DeliveryMapSystem = () => {
  const [pedidos, setPedidos] = useState([]);
  const [selectedPedido, setSelectedPedido] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('todos');
  const [repartidorData] = useState({
    nombre: 'Repartidor Web',
    email: 'repartidor@web.com',
    imagen: '',
    frase: 'Tu pedido está en camino'
  });

  useEffect(() => {
    const pedidosRef = ref(db, 'pedidos_activos');
    
    const unsubscribe = onValue(pedidosRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const pedidosArray = Object.entries(data).map(([id, pedido]) => ({
          id,
          orderId: pedido.orderId || null,
          nombreCliente: pedido.nombreCliente || null,
          telefono: pedido.telefono || null,
          direccion: pedido.direccion || null,
          cantidad: pedido.cantidad || 0,
          metodoPago: pedido.metodoPago || null,
          montoPagado: pedido.montoPagado || null,
          cambio: pedido.cambio || null,
          estado: pedido.estado || 'pendiente',
          ubicacion: pedido.ubicacion || null,
          edificio: pedido.edificio || null,
          productos: pedido.productos || [],
          vendedorData: pedido.vendedorData || null,
          comentarioe: pedido.comentarioe || null,
          comentariop: pedido.comentariop || null,
          email: pedido.email || null
        }));
        setPedidos(pedidosArray);
      } else {
        setPedidos([]);
      }
      setLoading(false);
    }, (error) => {
      console.error('Error al cargar pedidos:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const zonasEntrega = [
    { nombre: 'Edificio A', centro: { lat: 19.72914, lng: -98.46742 }, radio: 29.25, color: '#1976D2', icon: '🏢' },
    { nombre: 'Edificio B', centro: { lat: 19.72971, lng: -98.46744 }, radio: 26.76, color: '#388E3C', icon: '🏢' },
    { nombre: 'Edificio C', centro: { lat: 19.72961, lng: -98.46659 }, radio: 28.19, color: '#D32F2F', icon: '🏢' },
    { nombre: 'Edificio D', centro: { lat: 19.72914, lng: -98.46619 }, radio: 28.23, color: '#F57C00', icon: '🏢' },
    { nombre: 'Edificio E', centro: { lat: 19.72999, lng: -98.46624 }, radio: 21.16, color: '#7B1FA2', icon: '🏢' },
    { nombre: 'Edificio F', centro: { lat: 19.73021, lng: -98.46731 }, radio: 26.40, color: '#0097A7', icon: '🏢' },
    { nombre: 'Edificio G', centro: { lat: 19.73048, lng: -98.46699 }, radio: 16.36, color: '#C2185B', icon: '🏢' },
    { nombre: 'Cafetería', centro: { lat: 19.73003, lng: -98.46689 }, radio: 11.76, color: '#8D6E63', icon: '☕' },
    { nombre: 'Gallineros', centro: { lat: 19.72997, lng: -98.46662 }, radio: 16.88, color: '#FFB74D', icon: '🏠' },
    { nombre: 'En medio', centro: { lat: 19.72952, lng: -98.46701 }, radio: 16.10, color: '#4DB6AC', icon: '🎯' },
    { nombre: 'Árbol de Redes', centro: { lat: 19.72930, lng: -98.46672 }, radio: 21.17, color: '#66BB6A', icon: '🌳' },
    { nombre: 'Fuera Edificio E', centro: { lat: 19.72967, lng: -98.46615 }, radio: 18.41, color: '#9575CD', icon: '📍' },
    { nombre: 'Polideportivo', centro: { lat: 19.72958, lng: -98.46523 }, radio: 75.99, color: '#5D4037', icon: '🏟️' },
    { nombre: 'Dentro de ITESA', centro: { lat: 19.72917, lng: -98.46605 }, radio: 208.99, color: '#9C27B0', icon: '🎓' },
  ];

  const calcularDistancia = (punto1, punto2) => {
    const R = 6371000;
    const lat1Rad = punto1.lat * Math.PI / 180;
    const lat2Rad = punto2.lat * Math.PI / 180;
    const deltaLat = (punto2.lat - punto1.lat) * Math.PI / 180;
    const deltaLon = (punto2.lng - punto1.lng) * Math.PI / 180;

    const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
              Math.cos(lat1Rad) * Math.cos(lat2Rad) *
              Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  const identificarEdificio = (ubicacion) => {
    if (!ubicacion || !ubicacion.lat || !ubicacion.lng) {
      return { nombre: 'Sin ubicación', color: '#757575', icon: '❓' };
    }

    for (let zona of zonasEntrega) {
      if (zona.nombre === 'Fuera de Universidad' || zona.nombre === 'Dentro de ITESA') continue;
      const distancia = calcularDistancia(zona.centro, ubicacion);
      if (distancia <= zona.radio) {
        return zona;
      }
    }
    
    const zonaITESA = zonasEntrega.find(z => z.nombre === 'Dentro de ITESA');
    if (zonaITESA) {
      const distancia = calcularDistancia(zonaITESA.centro, ubicacion);
      if (distancia <= zonaITESA.radio) {
        return zonaITESA;
      }
    }
    return { nombre: 'Fuera de Universidad', color: '#757575', icon: '🌍' };
  };

  const actualizarEstadoCliente = async (clienteEmail, orderId, nuevoEstado) => {
    try {
      const vendidosRef = collection(firestore, clienteEmail, 'vendidos', '0');
      const q = query(vendidosRef, where('orderId', '==', orderId), limit(1));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const pedidoDoc = querySnapshot.docs[0];
        await updateDoc(pedidoDoc.ref, {
          estado: nuevoEstado,
          fechaActualizacion: serverTimestamp(),
          ultimaActualizacionRepartidor: repartidorData.email
        });
        console.log('✅ Estado actualizado en colección del cliente');
      }
    } catch (error) {
      console.error('Error actualizando estado del cliente:', error);
    }
  };

  const handleEnCamino = async (pedido) => {
    try {
      const clienteEmail = pedido.email;
      const orderId = pedido.orderId;
      const docId = pedido.id;

      // Actualizar en Firestore - documento del cliente
      const repartidorRef = doc(firestore, clienteEmail, 'repartidor');
      await setDoc(repartidorRef, {
        nombre: repartidorData.nombre,
        frase: 'Tu pedido está en camino',
        imagen: repartidorData.imagen,
        email: repartidorData.email,
        enCamino: true,
        afuera: false,
        problema: false,
        estado: 'En Camino',
        fechaActualizacion: serverTimestamp()
      }, { merge: true });

      // Actualizar en Realtime Database
      const realtimeRef = ref(db, `pedidos_activos/${docId}`);
      await update(realtimeRef, {
        estado: 'En Camino',
        enCamino: true,
        afuera: false,
        problema: false,
        repartidorEmail: repartidorData.email,
        repartidorNombre: repartidorData.nombre,
        repartidorImagen: repartidorData.imagen,
        repartidorFrase: 'Tu pedido está en camino',
        fechaActualizacion: Date.now()
      });

      // Actualizar estado del cliente
      await actualizarEstadoCliente(clienteEmail, orderId, 'En Camino');

      alert('✅ Cliente notificado: Pedido en camino');
      setSelectedPedido(null);
    } catch (error) {
      console.error('Error en handleEnCamino:', error);
      alert('❌ Error al actualizar estado');
    }
  };

  const handleAfuera = async (pedido) => {
    try {
      const clienteEmail = pedido.email;
      const orderId = pedido.orderId;
      const docId = pedido.id;

      // Actualizar en Firestore
      const repartidorRef = doc(firestore, clienteEmail, 'repartidor');
      await setDoc(repartidorRef, {
        nombre: repartidorData.nombre,
        frase: repartidorData.frase || 'Estoy afuera con tu pedido',
        imagen: repartidorData.imagen,
        email: repartidorData.email,
        afuera: true,
        enCamino: false,
        problema: false,
        estado: 'Afuera',
        fechaActualizacion: serverTimestamp()
      }, { merge: true });

      // Actualizar en Realtime Database
      const realtimeRef = ref(db, `pedidos_activos/${docId}`);
      await update(realtimeRef, {
        estado: 'Afuera',
        afuera: true,
        enCamino: false,
        problema: false,
        repartidorEmail: repartidorData.email,
        repartidorNombre: repartidorData.nombre,
        repartidorImagen: repartidorData.imagen,
        repartidorFrase: repartidorData.frase || 'Estoy afuera con tu pedido',
        fechaActualizacion: Date.now()
      });

      await actualizarEstadoCliente(clienteEmail, orderId, 'Afuera');

      alert('✅ Cliente notificado: Repartidor afuera');
      setSelectedPedido(null);
    } catch (error) {
      console.error('Error en handleAfuera:', error);
      alert('❌ Error al actualizar estado');
    }
  };

  const handleProblema = async (pedido) => {
    try {
      const clienteEmail = pedido.email;
      const orderId = pedido.orderId;
      const docId = pedido.id;

      // Actualizar en Firestore
      const repartidorRef = doc(firestore, clienteEmail, 'repartidor');
      await setDoc(repartidorRef, {
        nombre: repartidorData.nombre,
        frase: 'Hay un problema con tu pedido, lo resolveremos en breve',
        imagen: repartidorData.imagen,
        email: repartidorData.email,
        problema: true,
        afuera: false,
        enCamino: false,
        estado: 'Error',
        fechaActualizacion: serverTimestamp()
      }, { merge: true });

      // Actualizar en Realtime Database
      const realtimeRef = ref(db, `pedidos_activos/${docId}`);
      await update(realtimeRef, {
        estado: 'Error',
        problema: true,
        afuera: false,
        enCamino: false,
        repartidorEmail: repartidorData.email,
        repartidorNombre: repartidorData.nombre,
        repartidorImagen: repartidorData.imagen,
        repartidorFrase: 'Hay un problema con tu pedido, lo resolveremos en breve',
        fechaActualizacion: Date.now()
      });

      await actualizarEstadoCliente(clienteEmail, orderId, 'Error');

      alert('⚠️ Cliente notificado: Hay un problema');
      setSelectedPedido(null);
    } catch (error) {
      console.error('Error en handleProblema:', error);
      alert('❌ Error al actualizar estado');
    }
  };

  const handleCompletar = async (pedido) => {
    try {
      const clienteEmail = pedido.email;
      const orderId = pedido.orderId;
      const docId = pedido.id;

      // Actualizar en Realtime Database - mover a completados
      const realtimeRef = ref(db, `pedidos_activos/${docId}`);
      const pedidoSnapshot = await new Promise((resolve, reject) => {
        const pedidoRef = ref(db, `pedidos_activos/${docId}`);
        onValue(pedidoRef, (snapshot) => {
          resolve(snapshot.val());
        }, { onlyOnce: true });
      });

      if (pedidoSnapshot) {
        const pedidoCompleto = {
          ...pedidoSnapshot,
          estado: 'Listo',
          repartidorEmail: repartidorData.email,
          repartidorNombre: repartidorData.nombre,
          repartidorImagen: repartidorData.imagen,
          fechaCompletado: Date.now(),
          enCamino: false,
          afuera: false,
          problema: false
        };

        // Guardar en pedidos_completados
        const completadosRef = ref(db, `pedidos_completados/${docId}`);
        await update(completadosRef, pedidoCompleto);

        // Eliminar de pedidos_activos
        await remove(realtimeRef);

        // Eliminar de cola_pedidos
        const colaRef = ref(db, `cola_pedidos/${docId}`);
        await remove(colaRef);
      }

      // Actualizar estado del cliente
      await actualizarEstadoCliente(clienteEmail, orderId, 'Listo');

      alert('🎉 Pedido completado exitosamente');
      setSelectedPedido(null);
    } catch (error) {
      console.error('Error en handleCompletar:', error);
      alert('❌ Error al completar pedido');
    }
  };

  const abrirWhatsApp = (telefono, nombre) => {
    if (!telefono) {
      alert('No hay número de teléfono disponible');
      return;
    }
    const numeroLimpio = telefono.replace(/\D/g, '');
    const mensaje = `Hola ${nombre || 'cliente'}, soy el repartidor con tu pedido.`;
    const url = `https://wa.me/${numeroLimpio}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
  };

  const abrirGoogleMaps = (ubicacion) => {
    if (!ubicacion || !ubicacion.lat || !ubicacion.lng) {
      alert('No hay ubicación disponible para este pedido');
      return;
    }
    const url = `https://www.google.com/maps/dir/?api=1&destination=${ubicacion.lat},${ubicacion.lng}`;
    window.open(url, '_blank');
  };

  const pedidosFiltrados = pedidos.filter(p => {
    if (filter === 'todos') return true;
    if (filter === 'pendientes') return p.estado === 'pendiente';
    if (filter === 'en_camino') return p.estado === 'En Camino';
    if (filter === 'afuera') return p.estado === 'Afuera';
    if (filter === 'completados') return p.estado === 'Listo';
    return true;
  });

  const getEstadoColor = (estado) => {
    const colores = {
      'pendiente': '#f59e0b',
      'En Camino': '#3b82f6',
      'Afuera': '#10b981',
      'Listo': '#10b981',
      'Error': '#ef4444'
    };
    return colores[estado] || '#6b7280';
  };

  const getEstadoIcon = (estado) => {
    const iconos = {
      'pendiente': Clock,
      'En Camino': Truck,
      'Afuera': MapPin,
      'Listo': CheckCircle,
      'Error': AlertCircle
    };
    return iconos[estado] || Clock;
  };

  const styles = {
    container: {
      minHeight: '100vh',
      minHeight: '100dvh',
      background: 'linear-gradient(to bottom right, #f8fafc, #e2e8f0)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      paddingBottom: 'env(safe-area-inset-bottom)',
      WebkitFontSmoothing: 'antialiased'
    },
    header: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.2)',
      color: 'white',
      padding: 'max(env(safe-area-inset-top), 1rem) 1rem 1rem',
      marginBottom: '1rem',
      position: 'sticky',
      top: 0,
      zIndex: 30
    },
    card: {
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
      transition: 'all 0.2s ease',
      overflow: 'hidden',
      WebkitTapHighlightColor: 'transparent'
    },
    badge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.375rem',
      padding: '0.375rem 0.75rem',
      borderRadius: '9999px',
      fontSize: '0.8125rem',
      fontWeight: '600'
    },
    button: {
      padding: '0.875rem 1rem',
      borderRadius: '12px',
      fontWeight: '600',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      WebkitTapHighlightColor: 'transparent',
      WebkitTouchCallout: 'none',
      userSelect: 'none',
      fontSize: '0.9375rem',
      minHeight: '44px'
    }
  };

  if (loading) {
    return (
      <div style={{ ...styles.container, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '48px', 
            height: '48px', 
            border: '3px solid #e5e7eb',
            borderTop: '3px solid #667eea',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto'
          }} />
          <p style={{ marginTop: '1rem', color: '#6b7280', fontSize: '1rem', fontWeight: '500' }}>
            Cargando pedidos...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <style>
        {`
          * {
            -webkit-tap-highlight-color: transparent;
          }
          
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          
          @keyframes slideIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          
          .card-animate {
            animation: slideIn 0.3s ease;
          }
          
          @supports (padding: max(0px)) {
            body {
              padding-left: env(safe-area-inset-left);
              padding-right: env(safe-area-inset-right);
            }
          }
          
          button:active {
            opacity: 0.7;
          }
        `}
      </style>

      <div style={styles.header}>
        <div style={{ maxWidth: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ 
                background: 'rgba(255, 255, 255, 0.2)', 
                padding: '0.75rem', 
                borderRadius: '12px',
                backdropFilter: 'blur(10px)'
              }}>
                <Package size={28} />
              </div>
              <div>
                <h1 style={{ fontSize: '1.375rem', fontWeight: '700', margin: 0, marginBottom: '0.125rem' }}>
                  Panel de Entregas
                </h1>
                <p style={{ fontSize: '0.8125rem', opacity: 0.9, margin: 0 }}>
                  Gestión de repartidor
                </p>
              </div>
            </div>
            <div style={{ 
              background: 'rgba(255, 255, 255, 0.2)', 
              padding: '0.625rem 1rem', 
              borderRadius: '12px',
              backdropFilter: 'blur(10px)',
              textAlign: 'center',
              minWidth: '60px'
            }}>
              <p style={{ fontSize: '1.75rem', fontWeight: '700', margin: 0, lineHeight: 1 }}>
                {pedidosFiltrados.length}
              </p>
              <p style={{ fontSize: '0.6875rem', opacity: 0.9, margin: 0, marginTop: '0.125rem' }}>
                Activos
              </p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: '0 1rem 1.5rem' }}>
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ 
            display: 'flex', 
            gap: '0.5rem', 
            overflowX: 'auto',
            WebkitOverflowScrolling: 'touch',
            paddingBottom: '0.5rem',
            msOverflowStyle: 'none',
            scrollbarWidth: 'none'
          }}>
            {['todos', 'pendientes', 'en_camino', 'afuera', 'completados'].map((filterKey) => {
              const labels = {
                todos: { text: 'Todos', icon: Package },
                pendientes: { text: 'Pendientes', icon: Clock },
                en_camino: { text: 'En Camino', icon: Truck },
                afuera: { text: 'Afuera', icon: MapPin },
                completados: { text: 'Listos', icon: CheckCircle }
              };
              const { text, icon: Icon } = labels[filterKey];
              
              return (
                <button
                  key={filterKey}
                  onClick={() => setFilter(filterKey)}
                  style={{
                    ...styles.button,
                    background: filter === filterKey ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'white',
                    color: filter === filterKey ? 'white' : '#374151',
                    boxShadow: filter === filterKey 
                      ? '0 4px 12px rgba(102, 126, 234, 0.3)' 
                      : '0 2px 6px rgba(0, 0, 0, 0.1)',
                    padding: '0.625rem 1rem',
                    minHeight: '44px',
                    whiteSpace: 'nowrap',
                    flexShrink: 0
                  }}
                >
                  <Icon size={18} />
                  {text}
                </button>
              );
            })}
          </div>
        </div>

        {pedidosFiltrados.length === 0 ? (
          <div style={{ ...styles.card, padding: '3rem 1.5rem', textAlign: 'center' }}>
            <Package size={64} style={{ color: '#d1d5db', margin: '0 auto 0.75rem' }} />
            <p style={{ color: '#6b7280', fontSize: '1rem', fontWeight: '500' }}>
              No hay pedidos en esta categoría
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {pedidosFiltrados.map((pedido, index) => {
              const zonaInfo = identificarEdificio(pedido.ubicacion);
              const EstadoIcon = getEstadoIcon(pedido.estado);
              
              return (
                <div
                  key={pedido.id}
                  className="card-animate"
                  style={{
                    ...styles.card,
                    animationDelay: `${index * 0.05}s`
                  }}
                >
                  <div style={{ 
                    padding: '1rem',
                    background: 'linear-gradient(to right, #f9fafb, white)',
                    borderBottom: '1px solid #e5e7eb'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.75rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                        <div style={{ 
                          ...styles.badge, 
                          backgroundColor: getEstadoColor(pedido.estado),
                          color: 'white',
                          alignSelf: 'flex-start'
                        }}>
                          <EstadoIcon size={14} />
                          {pedido.estado}
                        </div>
                        {pedido.orderId && (
                          <span style={{ 
                            fontFamily: 'monospace', 
                            fontSize: '0.8125rem', 
                            color: '#6b7280',
                            background: '#f3f4f6',
                            padding: '0.25rem 0.625rem',
                            borderRadius: '6px',
                            alignSelf: 'flex-start'
                          }}>
                            #{pedido.orderId}
                          </span>
                        )}
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#10b981', margin: 0, lineHeight: 1 }}>
                          ${pedido.cantidad?.toFixed ? pedido.cantidad.toFixed(2) : pedido.cantidad || '0.00'}
                        </p>
                        {pedido.metodoPago && (
                          <p style={{ fontSize: '0.6875rem', color: '#6b7280', margin: 0, marginTop: '0.25rem' }}>
                            {pedido.metodoPago}
                          </p>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.625rem' }}>
                      <span style={{ fontSize: '1.125rem' }}>{zonaInfo.icon}</span>
                      <span style={{
                        ...styles.badge,
                        backgroundColor: `${zonaInfo.color}15`,
                        color: zonaInfo.color,
                        border: `1.5px solid ${zonaInfo.color}30`
                      }}>
                        <Building size={14} />
                        <span style={{ fontSize: '0.8125rem' }}>{pedido.edificio || zonaInfo.nombre}</span>
                      </span>
                    </div>

                    {pedido.nombreCliente && (
                      <div style={{ marginBottom: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#374151' }}>
                          <User size={16} style={{ color: '#667eea' }} />
                          <span style={{ fontWeight: '600', fontSize: '0.9375rem' }}>{pedido.nombreCliente}</span>
                        </div>
                      </div>
                    )}

                    {pedido.direccion && (
                      <div style={{ display: 'flex', alignItems: 'start', gap: '0.5rem', color: '#6b7280', fontSize: '0.8125rem' }}>
                        <MapPin size={14} style={{ color: '#ef4444', marginTop: '2px', flexShrink: 0 }} />
                        <span style={{ lineHeight: 1.4 }}>{pedido.direccion}</span>
                      </div>
                    )}
                  </div>

                  <div style={{ 
                    padding: '0.75rem',
                    background: '#f9fafb',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '0.5rem'
                  }}>
                    {pedido.telefono && (
                      <button
                        onClick={() => abrirWhatsApp(pedido.telefono, pedido.nombreCliente)}
                        style={{
                          ...styles.button,
                          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          color: 'white',
                          boxShadow: '0 2px 8px rgba(16, 185, 129, 0.25)',
                          padding: '0.75rem 0.5rem',
                          fontSize: '0.8125rem'
                        }}
                      >
                        <MessageCircle size={16} />
                        <span style={{ display: window.innerWidth > 380 ? 'inline' : 'none' }}>Chat</span>
                      </button>
                    )}
                    
                    {pedido.ubicacion && (
                      <button
                        onClick={() => abrirGoogleMaps(pedido.ubicacion)}
                        style={{
                          ...styles.button,
                          background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                          color: 'white',
                          boxShadow: '0 2px 8px rgba(59, 130, 246, 0.25)',
                          padding: '0.75rem 0.5rem',
                          fontSize: '0.8125rem'
                        }}
                      >
                        <Navigation size={16} />
                        <span style={{ display: window.innerWidth > 380 ? 'inline' : 'none' }}>Ir</span>
                      </button>
                    )}

                    <button
                      onClick={() => setSelectedPedido(selectedPedido?.id === pedido.id ? null : pedido)}
                      style={{
                        ...styles.button,
                        background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                        color: 'white',
                        boxShadow: '0 2px 8px rgba(139, 92, 246, 0.25)',
                        padding: '0.75rem 0.5rem',
                        fontSize: '0.8125rem'
                      }}
                    >
                      <Info size={16} />
                      <span style={{ display: window.innerWidth > 380 ? 'inline' : 'none' }}>Info</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedPedido && (
        <>
          <div 
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(4px)',
              zIndex: 40,
              animation: 'fadeIn 0.2s ease'
            }}
            onClick={() => setSelectedPedido(null)}
          />
          
          <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 50,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            animation: 'slideIn 0.3s ease',
            padding: 0
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '20px 20px 0 0',
              boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.15)',
              width: '100%',
              maxHeight: '90vh',
              maxHeight: '90dvh',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                padding: '1rem',
                paddingTop: 'max(1rem, env(safe-area-inset-top))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                color: 'white',
                position: 'sticky',
                top: 0,
                zIndex: 10
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  <Package size={20} />
                  <h2 style={{ fontSize: '1.125rem', fontWeight: '700', margin: 0 }}>
                    Detalles del Pedido
                  </h2>
                </div>
                <button
                  onClick={() => setSelectedPedido(null)}
                  style={{
                    padding: '0.5rem',
                    background: 'rgba(255, 255, 255, 0.15)',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: '36px',
                    minHeight: '36px',
                    WebkitTapHighlightColor: 'transparent'
                  }}
                >
                  <X size={20} />
                </button>
              </div>

              <div style={{ 
                overflowY: 'auto',
                flex: 1,
                WebkitOverflowScrolling: 'touch'
              }}>
                <div style={{ padding: '1rem', background: '#f0f9ff' }}>
                  <h3 style={{ 
                    fontWeight: '700',
                    color: '#1f2937',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '0.75rem',
                    fontSize: '1rem'
                  }}>
                    <Info size={18} style={{ color: '#3b82f6' }} />
                    Información del Pedido
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                    {selectedPedido.orderId && (
                      <div style={{ backgroundColor: 'white', borderRadius: '10px', padding: '0.875rem', border: '1px solid #dbeafe' }}>
                        <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>ID del Pedido</p>
                        <p style={{ fontWeight: '600', color: '#1f2937', margin: 0, fontFamily: 'monospace', fontSize: '0.875rem' }}>
                          {selectedPedido.orderId}
                        </p>
                      </div>
                    )}

                    {selectedPedido.nombreCliente && (
                      <div style={{ backgroundColor: 'white', borderRadius: '10px', padding: '0.875rem', border: '1px solid #dbeafe' }}>
                        <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>Cliente</p>
                        <p style={{ fontWeight: '600', color: '#1f2937', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9375rem' }}>
                          <User size={16} style={{ color: '#667eea' }} />
                          {selectedPedido.nombreCliente}
                        </p>
                      </div>
                    )}

                    <div style={{ backgroundColor: 'white', borderRadius: '10px', padding: '0.875rem', border: '2px solid #dbeafe' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#64748b', fontWeight: '500', fontSize: '0.875rem' }}>Total a Cobrar</span>
                        <span style={{ fontSize: '1.5rem', fontWeight: '700', color: '#10b981' }}>
                          ${selectedPedido.cantidad?.toFixed ? selectedPedido.cantidad.toFixed(2) : selectedPedido.cantidad || '0.00'}
                        </span>
                      </div>
                    </div>

                    {selectedPedido.metodoPago && (
                      <div style={{ backgroundColor: 'white', borderRadius: '10px', padding: '0.875rem', border: '1px solid #dbeafe' }}>
                        <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>Método de Pago</p>
                        <p style={{ fontWeight: '600', color: '#1f2937', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9375rem' }}>
                          <DollarSign size={16} style={{ color: '#10b981' }} />
                          {selectedPedido.metodoPago}
                        </p>
                      </div>
                    )}

                    {selectedPedido.montoPagado && (
                      <div style={{ 
                        backgroundColor: '#dbeafe', 
                        borderRadius: '10px', 
                        padding: '0.875rem',
                        borderLeft: '3px solid #3b82f6'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
                          <span style={{ fontSize: '0.8125rem', color: '#1e40af', fontWeight: '600' }}>
                            Cliente paga con:
                          </span>
                          <span style={{ fontSize: '1rem', fontWeight: '700', color: '#1e40af' }}>
                            ${selectedPedido.montoPagado?.toFixed ? selectedPedido.montoPagado.toFixed(2) : selectedPedido.montoPagado}
                          </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '0.8125rem', color: '#1e40af', fontWeight: '600' }}>
                            Cambio a devolver:
                          </span>
                          <span style={{ fontSize: '1rem', fontWeight: '700', color: '#f59e0b' }}>
                            ${selectedPedido.cambio?.toFixed ? selectedPedido.cambio.toFixed(2) : selectedPedido.cambio || '0.00'}
                          </span>
                        </div>
                      </div>
                    )}

                    {selectedPedido.direccion && (
                      <div style={{ backgroundColor: 'white', borderRadius: '10px', padding: '0.875rem', border: '1px solid #dbeafe' }}>
                        <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>Dirección del cliente</p>
                        <p style={{ fontWeight: '600', color: '#1f2937', margin: 0, display: 'flex', alignItems: 'start', gap: '0.5rem', fontSize: '0.875rem', lineHeight: 1.4 }}>
                          <MapPin size={14} style={{ color: '#ef4444', marginTop: '2px', flexShrink: 0 }} />
                          <span>{selectedPedido.direccion}</span>
                        </p>
                      </div>
                    )}

                    {selectedPedido.edificio && (
                      <div style={{ backgroundColor: 'white', borderRadius: '10px', padding: '0.875rem', border: '1px solid #dbeafe' }}>
                        <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>Edificio de Entrega</p>
                        <p style={{ fontWeight: '600', color: '#8b5cf6', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9375rem' }}>
                          <Building size={16} />
                          {selectedPedido.edificio}
                        </p>
                      </div>
                    )}

                    {selectedPedido.telefono && (
                      <div style={{ backgroundColor: 'white', borderRadius: '10px', padding: '0.875rem', border: '1px solid #dbeafe' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div>
                            <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0, marginBottom: '0.25rem' }}>Teléfono</p>
                            <p style={{ fontWeight: '600', color: '#1f2937', margin: 0, fontSize: '0.9375rem' }}>{selectedPedido.telefono}</p>
                          </div>
                          <button
                            onClick={() => abrirWhatsApp(selectedPedido.telefono, selectedPedido.nombreCliente)}
                            style={{
                              backgroundColor: '#10b981',
                              padding: '0.625rem',
                              borderRadius: '10px',
                              border: 'none',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: '0 2px 6px rgba(16, 185, 129, 0.3)',
                              minWidth: '40px',
                              minHeight: '40px',
                              WebkitTapHighlightColor: 'transparent'
                            }}
                          >
                            <Phone size={16} style={{ color: 'white' }} />
                          </button>
                        </div>
                      </div>
                    )}

                    {(selectedPedido.comentarioe || selectedPedido.comentariop) && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {selectedPedido.comentarioe && (
                          <div style={{ 
                            backgroundColor: '#fef3c7', 
                            borderLeft: '3px solid #f59e0b',
                            borderRadius: '8px', 
                            padding: '0.75rem'
                          }}>
                            <p style={{ fontSize: '0.8125rem', fontWeight: '600', color: '#92400e', margin: 0, marginBottom: '0.25rem' }}>
                              📍 Comentario de Entrega:
                            </p>
                            <p style={{ fontSize: '0.8125rem', color: '#78350f', margin: 0, lineHeight: 1.4 }}>
                              {selectedPedido.comentarioe}
                            </p>
                          </div>
                        )}
                        {selectedPedido.comentariop && (
                          <div style={{ 
                            backgroundColor: '#dbeafe', 
                            borderLeft: '3px solid #3b82f6',
                            borderRadius: '8px', 
                            padding: '0.75rem'
                          }}>
                            <p style={{ fontSize: '0.8125rem', fontWeight: '600', color: '#1e40af', margin: 0, marginBottom: '0.25rem' }}>
                              🍽️ Comentario del Pedido:
                            </p>
                            <p style={{ fontSize: '0.8125rem', color: '#1e3a8a', margin: 0, lineHeight: 1.4 }}>
                              {selectedPedido.comentariop}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {selectedPedido.productos && Array.isArray(selectedPedido.productos) && selectedPedido.productos.length > 0 && (
                  <div style={{ padding: '1rem', background: '#faf5ff' }}>
                    <h3 style={{ 
                      fontWeight: '700',
                      color: '#1f2937',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      marginBottom: '0.75rem',
                      fontSize: '1rem'
                    }}>
                      <ShoppingBasket size={18} style={{ color: '#8b5cf6' }} />
                      Productos
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                      {selectedPedido.productos.map((prod, idx) => (
                        <div key={idx} style={{
                          backgroundColor: 'white',
                          borderRadius: '10px',
                          padding: '0.875rem',
                          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                          border: '1px solid #e9d5ff'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.375rem' }}>
                            <div style={{ flex: 1 }}>
                              <p style={{ fontWeight: '600', color: '#1f2937', fontSize: '0.9375rem', margin: 0, marginBottom: '0.125rem' }}>
                                {prod.titulo}
                              </p>
                              {prod.preparado && (
                                <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0 }}>
                                  Preparación: {prod.preparado}
                                </p>
                              )}
                            </div>
                            <span style={{
                              backgroundColor: '#f3e8ff',
                              color: '#7c3aed',
                              padding: '0.25rem 0.625rem',
                              borderRadius: '9999px',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              marginLeft: '0.5rem',
                              flexShrink: 0
                            }}>
                              x{prod.cantidad}
                            </span>
                          </div>
                          <p style={{ fontWeight: '700', color: '#8b5cf6', textAlign: 'right', margin: 0, fontSize: '1rem' }}>
                            ${prod.precio?.toFixed ? prod.precio.toFixed(2) : prod.precio || '0.00'}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedPedido.vendedorData && typeof selectedPedido.vendedorData === 'object' && (
                  <div style={{ padding: '1rem', background: '#f1f5f9' }}>
                    <h3 style={{ 
                      fontWeight: '700',
                      color: '#1f2937',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      marginBottom: '0.75rem',
                      fontSize: '1rem'
                    }}>
                      <Store size={18} style={{ color: '#475569' }} />
                      Recoger en
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                      {selectedPedido.vendedorData.nombre && (
                        <div style={{ backgroundColor: 'white', borderRadius: '10px', padding: '0.875rem', border: '1px solid #e2e8f0' }}>
                          <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>Vendedor</p>
                          <p style={{ fontWeight: '600', color: '#8b5cf6', fontSize: '0.9375rem', margin: 0 }}>
                            {selectedPedido.vendedorData.nombre}
                          </p>
                        </div>
                      )}
                      {selectedPedido.vendedorData.direccion && (
                        <div style={{ backgroundColor: 'white', borderRadius: '10px', padding: '0.875rem', border: '1px solid #e2e8f0' }}>
                          <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>Dirección</p>
                          <p style={{ fontWeight: '600', color: '#1f2937', margin: 0, fontSize: '0.875rem', lineHeight: 1.4 }}>
                            {selectedPedido.vendedorData.direccion}
                          </p>
                        </div>
                      )}
                      {selectedPedido.vendedorData.Vendedortelefono && (
                        <button
                          onClick={() => abrirWhatsApp(selectedPedido.vendedorData.Vendedortelefono, selectedPedido.vendedorData.nombre)}
                          style={{
                            ...styles.button,
                            background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                            color: 'white',
                            boxShadow: '0 2px 8px rgba(139, 92, 246, 0.3)',
                            width: '100%',
                            padding: '0.875rem'
                          }}
                        >
                          <Phone size={16} />
                          Contactar Vendedor
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {selectedPedido.ubicacion && selectedPedido.ubicacion.lat && selectedPedido.ubicacion.lng && (
                  <div style={{ padding: '1rem', background: 'white' }}>
                    <h3 style={{ 
                      fontWeight: '700',
                      color: '#1f2937',
                      marginBottom: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '1rem'
                    }}>
                      <MapPin size={18} style={{ color: '#ef4444' }} />
                      Mapa de Ubicación
                    </h3>
                    <div style={{ 
                      borderRadius: '12px', 
                      overflow: 'hidden', 
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                      border: '1px solid #e5e7eb',
                      marginBottom: '0.75rem'
                    }}>
                      <iframe
                        width="100%"
                        height="250"
                        frameBorder="0"
                        style={{ border: 0 }}
                        src={`https://www.google.com/maps?q=${selectedPedido.ubicacion.lat},${selectedPedido.ubicacion.lng}&z=17&output=embed`}
                        allowFullScreen
                      ></iframe>
                    </div>
                    <button
                      onClick={() => abrirGoogleMaps(selectedPedido.ubicacion)}
                      style={{
                        ...styles.button,
                        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                        color: 'white',
                        boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)',
                        width: '100%',
                        padding: '0.875rem'
                      }}
                    >
                      <Navigation size={16} />
                      Abrir en Google Maps
                    </button>
                  </div>
                )}
              </div>

              <div style={{ 
                padding: '1rem',
                paddingBottom: 'max(1rem, env(safe-area-inset-bottom))',
                background: 'linear-gradient(to bottom, #f9fafb, #f3f4f6)',
                borderTop: '1px solid #e5e7eb',
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '0.625rem'
              }}>
                <button
                  onClick={() => handleEnCamino(selectedPedido)}
                  style={{
                    ...styles.button,
                    flexDirection: 'column',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    padding: '0.75rem',
                    boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
                    minHeight: '70px'
                  }}
                >
                  <Navigation size={20} />
                  <span style={{ fontSize: '0.8125rem', marginTop: '0.25rem' }}>En Camino</span>
                </button>

                <button
                  onClick={() => handleAfuera(selectedPedido)}
                  style={{
                    ...styles.button,
                    flexDirection: 'column',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                    padding: '0.75rem',
                    boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
                    minHeight: '70px'
                  }}
                >
                  <MapPin size={20} />
                  <span style={{ fontSize: '0.8125rem', marginTop: '0.25rem' }}>Afuera</span>
                </button>

                <button
                  onClick={() => handleProblema(selectedPedido)}
                  style={{
                    ...styles.button,
                    flexDirection: 'column',
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    color: 'white',
                    padding: '0.75rem',
                    boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)',
                    minHeight: '70px'
                  }}
                >
                  <AlertCircle size={20} />
                  <span style={{ fontSize: '0.8125rem', marginTop: '0.25rem' }}>Problema</span>
                </button>

                <button
                  onClick={() => handleCompletar(selectedPedido)}
                  style={{
                    ...styles.button,
                    flexDirection: 'column',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                    padding: '0.75rem',
                    boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
                    minHeight: '70px'
                  }}
                >
                  <CheckCircle size={20} />
                  <span style={{ fontSize: '0.8125rem', marginTop: '0.25rem' }}>Completado</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DeliveryMapSystem;
                        