
document.addEventListener('DOMContentLoaded', () => {
    const vistaInicio = document.getElementById('view-home');
    const vistaReporte = document.getElementById('view-report');
    const vistaChat = document.getElementById('view-chat');
    const vistaAdmin = document.getElementById('view-admin');
    
    const navInicio = document.getElementById('nav-inicio');
    const navReportar = document.getElementById('nav-reportar');
    const navChat = document.getElementById('nav-chat');
    
    const btnNuevoReporte = document.getElementById('btn-nuevo-reporte');
    const btnIrChat = document.getElementById('btn-ir-chat');
    const btnEnviarReporte = document.getElementById('btn-enviar-reporte');
    
    const enlaceAdmin = document.getElementById('enlace-admin');
    const btnSalirAdmin = document.getElementById('btn-salir-admin');
    const contenedorAdminReportes = document.getElementById('tabla-admin-reportes');
    
    const btnUsarGps = document.getElementById('btn-usar-gps');
    const inputUbicacion = document.getElementById('input-ubicacion');
    const gpsStatus = document.getElementById('gps-status');
    const inputFoto = document.getElementById('input-foto');
    const imagePreview = document.getElementById('image-preview');
    const listaReportesRecientes = document.getElementById('lista-reportes-recientes');
    const statTotal = document.getElementById('stat-total');

    const calleInput = document.getElementById('calle-input');
    const coloniaInput = document.getElementById('colonia-input');
    const inputCategoria = document.getElementById('input-categoria');
    const inputTitulo = document.getElementById('input-titulo');
    const inputDescripcion = document.getElementById('input-descripcion');

    function mostrarVista(vista) {
        vistaInicio.classList.remove('activa');
        vistaReporte.classList.remove('activa');
        vistaChat.classList.remove('activa');
        vistaAdmin.classList.remove('activa');
        navInicio.classList.remove('activo');
        navReportar.classList.remove('activo');
        navChat.classList.remove('activo');
        
        if (vista === 'inicio') {
            vistaInicio.classList.add('activa');
            navInicio.classList.add('activo');
            actualizarDashboard();
        } else if (vista === 'reporte') {
            vistaReporte.classList.add('activa');
            navReportar.classList.add('activo');
        } else if (vista === 'chat') {
            vistaChat.classList.add('activa');
            navChat.classList.add('activo');
        } else if (vista === 'admin') {
            vistaAdmin.classList.add('activa');
            cargarReportesAdmin();
        }
    }
    
    navInicio.addEventListener('click', (e) => { e.preventDefault(); mostrarVista('inicio'); });
    navReportar.addEventListener('click', (e) => { e.preventDefault(); mostrarVista('reporte'); });
    navChat.addEventListener('click', (e) => { e.preventDefault(); mostrarVista('chat'); });
    if (btnNuevoReporte) btnNuevoReporte.addEventListener('click', () => mostrarVista('reporte'));
    if (btnIrChat) btnIrChat.addEventListener('click', () => mostrarVista('chat'));
    
   // ----------------------------------------------------
    // CONTROL DE ACCESO MULTIUSUARIO PARA EL AYUNTAMIENTO
    // ----------------------------------------------------
    const cuentasAdmin = [
        { usuario: "temixco_obras", pass: "Obras2026*", area: "Obras Públicas" },
        { usuario: "temixco_servicios", pass: "Servicios99#", area: "Servicios Públicos" },
        { usuario: "admin_general", pass: "SascTemixco2026", area: "Administración General" }
    ];

    if (enlaceAdmin) {
        enlaceAdmin.addEventListener('click', (e) => {
            e.preventDefault();
            const inputUsuario = prompt("👤 Ingrese su usuario del ayuntamiento:");
            if (inputUsuario === null) return; // Si cancela, no hace nada

            const inputPassword = prompt("🔐 Ingrese su contraseña:");
            if (inputPassword === null) return; // Si cancela, no hace nada

            // Validar si el usuario y contraseña coinciden con alguna cuenta autorizada
            const cuentaEncontrada = cuentasAdmin.find(
                (c) => c.usuario === inputUsuario.trim() && c.pass === inputPassword
            );

            if (cuentaEncontrada) {
                alert(`✅ Bienvenido, acceso concedido para el área de: ${cuentaEncontrada.area}`);
                mostrarVista('admin');
            } else {
                alert("⚠️ Usuario o contraseña incorrectos. Acceso denegado.");
            }
        });
    }
    }
    if (btnSalirAdmin) btnSalirAdmin.addEventListener('click', () => mostrarVista('inicio'));

    let gpsActual = "Cuernavaca /Centro";
    if (btnUsarGps) {
        btnUsarGps.addEventListener('click', () => {
            gpsStatus.textContent = 'Calculando GPS...';
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (pos) => {
                        const lat = pos.coords.latitude.toFixed(5);
                        const lon = pos.coords.longitude.toFixed(5);
                        gpsActual = `Lat: ${lat}, Lon: ${lon}`;
                        inputUbicacion.value = gpsActual;
                        gpsStatus.textContent = '✅ GPS fijado correctamente.';
                    },
                    () => { 
                        gpsActual = "Cuernavaca /Centro (Estimada)";
                        inputUbicacion.value = gpsActual;
                        gpsStatus.textContent = '⚠️ No se pudo obtener GPS preciso, se usó ubicación predeterminada.'; 
                    },
                    { enableHighAccuracy: true }
                );
            } else {
                gpsStatus.textContent = '⚠️ Geolocalización no soportada por el navegador.';
            }
        });
    }

    let fotoBase64 = '';
    if (inputFoto) {
        inputFoto.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (ev) => {
                    fotoBase64 = ev.target.result;
                    imagePreview.innerHTML = `<img src="${fotoBase64}" style="width: 100%; max-height: 120px; object-fit: cover; border-radius: 4px;">`;
                };
                reader.readAsDataURL(file);
            }
        });
    }

    if (btnEnviarReporte) {
        btnEnviarReporte.addEventListener('click', () => {
            const titulo = inputTitulo.value.trim();
            const descripcion = inputDescripcion.value.trim();
            const calle = calleInput.value.trim();
            const colonia = coloniaInput.value.trim();

            if (!titulo) {
                alert("⚠️ Por favor ingrese un título para el reporte.");
                inputTitulo.focus();
                return;
            }

            const direccionCompleta = [calle, colonia].filter(Boolean).join(', ') || inputUbicacion.value || gpsActual;
            const folioGenerado = 'SASC-' + Math.floor(100000 + Math.random() * 900000);
            
            const nuevoReporte = {
                folio: folioGenerado,
                categoria: inputCategoria.value,
                titulo: titulo,
                descripcion: descripcion || 'Sin descripción detallada',
                ubicacion: direccionCompleta,
                foto: fotoBase64,
                estatus: 'Enviado / En revisión',
                fecha: new Date().toLocaleDateString()
            };

            let reportes = JSON.parse(localStorage.getItem('sasc_reportes')) || [];
            reportes.push(nuevoReporte);
            localStorage.setItem('sasc_reportes', JSON.stringify(reportes));

            alert(`✅ Folio oficial generado con éxito: ${folioGenerado}`);

            inputTitulo.value = '';
            inputDescripcion.value = '';
            calleInput.value = '';
            coloniaInput.value = '';
            inputUbicacion.value = '';
            inputFoto.value = '';
            imagePreview.innerHTML = '';
            gpsStatus.textContent = '';
            fotoBase64 = '';

            mostrarVista('inicio');
        });
    }

    let chatPaso = 0;
    let datosChat = { categoria: '', titulo: '', descripcion: '', ubicacion: '' };
    const chatMensajes = document.getElementById('chat-mensajes');
    const chatInputTexto = document.getElementById('chat-input-texto');
    const chatBtnEnviar = document.getElementById('chat-btn-enviar');
    const chatBtnReiniciar = document.getElementById('chat-btn-reiniciar');

    function agregarMensajeChat(texto, autor) {
        if (!chatMensajes) return;
        const div = document.createElement('div');
        div.className = `mensaje ${autor}`;
        div.textContent = texto;
        chatMensajes.appendChild(div);
        chatMensajes.scrollTop = chatMensajes.scrollHeight;
    }

    if (chatBtnEnviar) {
        chatBtnEnviar.addEventListener('click', procesarMensajeChat);
    }
    if (chatInputTexto) {
        chatInputTexto.addEventListener('keypress', (e) => { if (e.key === 'Enter') procesarMensajeChat(); });
    }
    if (chatBtnReiniciar) {
        chatBtnReiniciar.addEventListener('click', () => {
            chatPaso = 0;
            datosChat = { categoria: '', titulo: '', descripcion: '', ubicacion: '' };
            if (chatMensajes) {
                chatMensajes.innerHTML = '<div class="mensaje bot">¡Hola! Soy tu asistente virtual Sined. ¿Qué problema o incidencia municipal deseas reportar hoy?</div>';
            }
        });
    }

    function procesarMensajeChat() {
        if (!chatInputTexto) return;
        const texto = chatInputTexto.value.trim();
        if (!texto) return;
        agregarMensajeChat(texto, 'usuario');
        chatInputTexto.value = '';

        setTimeout(() => {
            if (chatPaso === 0) {
                datosChat.categoria = texto;
                chatPaso++;
                agregarMensajeChat("Entendido. ¿Cuál es el título breve del problema (ej. Fuga de agua, bache en avenida...)?", 'bot');
            } else if (chatPaso === 1) {
                datosChat.titulo = texto;
                chatPaso++;
                agregarMensajeChat("📍 Obteniendo tu ubicación GPS en segundo plano...", 'bot');
                
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition((pos) => {
                        datosChat.ubicacion = `Lat: ${pos.coords.latitude.toFixed(5)}, Lon: ${pos.coords.longitude.toFixed(5)}`;
                        chatPaso = 3;
                        agregarMensajeChat(`Ubicación fijada (${datosChat.ubicacion}). Por último, dame una breve descripción de los hechos.`, 'bot');
                    }, () => {
                        datosChat.ubicacion = "Cuernavaca /Centro (Estimada)";
                        chatPaso = 3;
                        agregarMensajeChat("No se pudo fijar el GPS exacto, pero registramos la zona. Por último, dime una breve descripción:", 'bot');
                    }, { enableHighAccuracy: true });
                } else {
                    datosChat.ubicacion = "Ubicación predeterminada";
                    chatPaso = 3;
                    agregarMensajeChat("Por último, dime una breve descripción de los hechos:", 'bot');
                }
            } else if (chatPaso === 2) {
                // Estado en espera
            } else if (chatPaso === 3) {
                datosChat.descripcion = texto;
                
                const folioGenerado = 'SASC-IA-' + Math.floor(100000 + Math.random() * 900000);
                const nuevoReporte = {
                    folio: folioGenerado,
                    categoria: datosChat.categoria || 'Atención Ciudadana IA',
                    titulo: datosChat.titulo,
                    descripcion: datosChat.descripcion,
                    ubicacion: datosChat.ubicacion,
                    foto: '',
                    estatus: 'Enviado / En revisión',
                    fecha: new Date().toLocaleDateString()
                };

                let reportes = JSON.parse(localStorage.getItem('sasc_reportes')) || [];
                reportes.push(nuevoReporte);
                localStorage.setItem('sasc_reportes', JSON.stringify(reportes));
                
                agregarMensajeChat(`✅ ¡Listo! Folio oficial generado: ${folioGenerado}. Puedes ver el estatus en el inicio.`, 'bot');
                alert(`✅ Folio oficial generado por Asistente: ${folioGenerado}`);
                
                chatPaso = 0;
                datosChat = { categoria: '', titulo: '', descripcion: '', ubicacion: '' };
                mostrarVista('inicio');
            }
        }, 600);
    }

    function actualizarDashboard() {
        if (!statTotal || !listaReportesRecientes) return;
        const reportes = JSON.parse(localStorage.getItem('sasc_reportes')) || [];
        statTotal.textContent = reportes.length;

        if (reportes.length === 0) {
            listaReportesRecientes.innerHTML = '<p class="texto-vacio">No hay reportes registrados localmente.</p>';
            return;
        }

        let html = '';
        [...reportes].reverse().forEach(rep => {
            let colorEstado = rep.estatus.includes('Resuelto') ? '#059669' : '#d97706';
            html += `
                <div style="border: 1px solid #e2e8f0; padding: 10px; border-radius: 6px; margin-bottom: 8px; background: #fff;">
                    <div style="display: flex; justify-content: space-between; font-size: 0.8rem;">
                        <strong style="color: #006847;">${rep.folio}</strong>
                        <span style="color: #64748b;">${rep.fecha}</span>
                    </div>
                    <p style="margin: 4px 0; font-size: 0.85rem;"><strong>[${rep.categoria}]</strong> ${rep.titulo}</p>
                    <p style="color: #64748b; font-size: 0.75rem; margin: 2px 0;">📍 ${rep.ubicacion}</p>
                    <p style="margin: 4px 0 0 0; font-size: 0.8rem;">Estatus: <span style="font-weight: bold; color: ${colorEstado};">🔔 ${rep.estatus}</span></p>
                </div>
            `;
        });
        listaReportesRecientes.innerHTML = html;
    }

    window.cambiarEstatusAdmin = function(index, nuevoEstatus) {
        let reportes = JSON.parse(localStorage.getItem('sasc_reportes')) || [];
        if (reportes[index]) {
            reportes[index].estatus = nuevoEstatus;
            localStorage.setItem('sasc_reportes', JSON.stringify(reportes));
            alert(`🔔 Alerta: El folio ${reportes[index].folio} cambió a "${nuevoEstatus}".`);
        }
    };

    window.eliminarReporteAdmin = function(index) {
        if (confirm('¿Desea eliminar este registro oficial?')) {
            let reportes = JSON.parse(localStorage.getItem('sasc_reportes')) || [];
            reportes.splice(index, 1);
            localStorage.setItem('sasc_reportes', JSON.stringify(reportes));
            cargarReportesAdmin();
        }
    };

    function cargarReportesAdmin() {
        if (!contenedorAdminReportes) return;
        const reportes = JSON.parse(localStorage.getItem('sasc_reportes')) || [];
        if (reportes.length === 0) {
            contenedorAdminReportes.innerHTML = '<p class="texto-vacio">No hay reportes registrados en el sistema.</p>';
            return;
        }

        let html = '<div style="display: flex; flex-direction: column; gap: 12px;">';
        [...reportes].reverse().forEach((rep, indexReal) => {
            const index = reportes.length - 1 - indexReal;
            html += `
                <div style="border: 1px solid #cbd5e1; padding: 12px; border-radius: 6px; background: #f8fafc;">
                    ${rep.foto ? `<img src="${rep.foto}" style="width: 100%; max-height: 120px; object-fit: cover; border-radius: 4px; margin-bottom: 6px;">` : ''}
                    <p style="margin: 0 0 2px 0; font-size: 0.85rem;"><strong>Folio:</strong> <span style="color: #006847;">${rep.folio}</span></p>
                    <p style="margin: 0 0 2px 0; font-size: 0.85rem;"><strong>Categoría:</strong> ${rep.categoria}</p>
                    <p style="margin: 0 0 4px 0; font-size: 0.85rem;"><strong>Problema:</strong> ${rep.titulo} - ${rep.descripcion}</p>
                    <p style="margin: 0 0 6px 0; font-size: 0.75rem; color: #475569;">📍 <strong>GPS / Dirección:</strong> ${rep.ubicacion}</p>
                    
                    <div style="background: #e6f2ee; padding: 6px; border-radius: 4px; font-size: 0.75rem; text-align: center; color: #006847; margin-bottom: 8px; font-weight: bold;">
                        🗺️ [Cuadrilla Asignada]
                    </div>

                    <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #cbd5e1; padding-top: 8px;">
                        <div>
                            <label style="font-size: 0.75rem; font-weight: bold;">Estatus:</label>
                            <select onchange="window.cambiarEstatusAdmin(${index}, this.value)" style="padding: 4px; border-radius: 4px; font-size: 0.8rem;">
                                <option value="Enviado / En revisión" ${rep.estatus === 'Enviado / En revisión' ? 'selected' : ''}>En revisión</option>
                                <option value="En Proceso / Cuadrilla Asignada" ${rep.estatus === 'En Proceso / Cuadrilla Asignada' ? 'selected' : ''}>Cuadrilla Asignada</option>
                                <option value="Resuelto con Éxito" ${rep.estatus === 'Resuelto con Éxito' ? 'selected' : ''}>Resuelto</option>
                            </select>
                        </div>
                        <button onclick="window.eliminarReporteAdmin(${index})" style="background: #dc2626; color: white; border: none; padding: 6px 10px; border-radius: 4px; cursor: pointer; font-size: 0.75rem;">🗑️ Eliminar</button>
                    </div>
                </div>
            `;
        });
        html += '</div>';
        contenedorAdminReportes.innerHTML = html;
    }

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('admin.sw.js')
            .then(() => console.log('Service Worker registrado con éxito.'))
            .catch((err) => console.log('Error al registrar Service Worker:', err));
    }

    actualizarDashboard();
});
