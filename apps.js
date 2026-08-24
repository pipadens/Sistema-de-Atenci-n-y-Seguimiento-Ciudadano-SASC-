// Registro del Service Worker para habilitar la PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(reg => console.log('Service Worker registrado con éxito:', reg.scope))
            .catch(err => console.error('Error al registrar el Service Worker:', err));
    });
}

// Control de Vistas (SPA - Single Page Application)
const vistaInicio = document.getElementById('view-home');
const vistaReporte = document.getElementById('view-report');
const navInicio = document.getElementById('nav-inicio');
const navReportar = document.getElementById('nav-reportar');
const btnNuevoReporte = document.getElementById('btn-nuevo-reporte');

function mostrarVista(vista) {
    if (vistaInicio && vistaReporte) {
        // Ocultar vistas
        vistaInicio.classList.remove('activa');
        vistaReporte.classList.remove('activa');
        if (navInicio) navInicio.classList.remove('activo');
        if (navReportar) navReportar.classList.remove('activo');
        
        // Mostrar la vista seleccionada
        if (vista === 'inicio') {
            vistaInicio.classList.add('activa');
            if (navInicio) navInicio.classList.add('activo');
        } else if (vista === 'reporte') {
            vistaReporte.classList.add('activa');
            if (navReportar) navReportar.classList.add('activo');
        }
    }
}

// Eventos de Navegación inferior y botones
if (navInicio) {
    navInicio.addEventListener('click', (e) => {
        e.preventDefault();
        mostrarVista('inicio');
    });
}
if (navReportar) {
    navReportar.addEventListener('click', (e) => {
        e.preventDefault();
        mostrarVista('reporte');
    });
}
if (btnNuevoReporte) {
    btnNuevoReporte.addEventListener('click', () => mostrarVista('reporte'));
}

// Elementos de Geolocalización y Cámara
const btnGps = document.getElementById('btn-gps');
const inputUbicacion = document.getElementById('input-ubicacion');
const gpsStatus = document.getElementById('gps-status');
const inputFoto = document.getElementById('input-foto');
const imagePreview = document.getElementById('image-preview');
let fotoBase64 = '';

// Obtener Geolocalización GPS automática
if (btnGps) {
    btnGps.addEventListener('click', () => {
        if (!navigator.geolocation) {
            if (gpsStatus) gpsStatus.textContent = 'Tu dispositivo no soporta geolocalización.';
            return;
        }
        
        if (gpsStatus) gpsStatus.textContent = 'Obteniendo ubicación exacta...';
        
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude.toFixed(5);
                const lon = position.coords.longitude.toFixed(5);
                if (inputUbicacion) inputUbicacion.value = `Lat: ${lat}, Lon: ${lon}`;
                if (gpsStatus) gpsStatus.textContent = '✅ Ubicación fija obtenida correctamente.';
            },
            (error) => {
                if (gpsStatus) gpsStatus.textContent = '⚠️ Permiso de ubicación denegado o no disponible.';
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    });
}

// Vista previa de la foto tomada con la cámara trasera
if (inputFoto) {
    inputFoto.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                fotoBase64 = event.target.result;
                if (imagePreview) {
                    imagePreview.innerHTML = `<img src="${fotoBase64}" alt="Evidencia" style="width: 100%; max-height: 150px; object-fit: cover; border-radius: 6px; margin-top: 5px;">`;
                }
            }
            reader.readAsDataURL(file);
        }
    });
}

// Cargar reportes guardados en la interfaz de inicio
function cargarReportesRecientes() {
    // Busca contenedores genéricos de reportes en tu HTML
    const contenedor = document.getElementById('lista-reportes') || document.getElementById('reports-list');
    if (!contenedor) return;

    let reportes = JSON.parse(localStorage.getItem('sasc_reportes') || '[]');
    
    if (reportes.length === 0) {
        contenedor.innerHTML = '<p class="texto-vacio">No hay reportes registrados localmente.</p>';
        return;
    }

    contenedor.innerHTML = '';
    
    // Recorrer del más reciente al más antiguo
    reportes.slice().reverse().forEach(r => {
        const itemReporte = document.createElement('div');
        itemReporte.className = 'reporte-item';
        itemReporte.style.cssText = 'background: #f8fafc; border: 1px solid #e2e8f0; padding: 12px; margin-bottom: 10px; border-radius: 6px;';
        
        itemReporte.innerHTML = `
            <h4 style="color: #1b4d3e; margin: 0 0 5px 0;">📌 ${r.titulo}</h4>
            <p style="margin: 0 0 5px 0; font-size: 0.9rem;"><strong>Ubicación:</strong> ${r.ubicacion}</p>
            <p style="margin: 0 0 5px 0; font-size: 0.9rem;">${r.descripcion}</p>
            <small style="color: #64748b;">Folio: ${r.id} | Registrado el: ${r.fecha}</small>
        `;
        contenedor.appendChild(itemReporte);
    });
}

// Manejo del envío del formulario
const btnEnviarReporte = document.getElementById('btn-enviar-reporte');
if (btnEnviarReporte) {
    btnEnviarReporte.addEventListener('click', function() {
        const titulo = document.getElementById('input-titulo')?.value || '';
        const descripcion = document.getElementById('input-descripcion')?.value || '';
        const ubicacion = inputUbicacion?.value || '';

        // Validar campos obligatorios
        if (!titulo.trim() || !descripcion.trim() || !ubicacion.trim()) {
            alert('⚠️ Por favor completa el título, la descripción y obtén la ubicación GPS.');
            return;
        }

        // Crear el objeto del nuevo reporte con folio único
        const nuevoReporte = {
            id: 'SASC-' + Math.floor(100000 + Math.random() * 900000),
            titulo: titulo,
            descripcion: descripcion,
            ubicacion: ubicacion,
            fecha: new Date().toLocaleDateString(),
            status: 'En Revisión',
            foto: fotoBase64
        };

        // Guardar en el LocalStorage
        let reportes = JSON.parse(localStorage.getItem('sasc_reportes') || '[]');
        reportes.push(nuevoReporte);
        localStorage.setItem('sasc_reportes', JSON.stringify(reportes));

        alert('✅ ¡Reporte enviado con éxito!\n\nFolio generado: ' + nuevoReporte.id + '\n¡Gracias por tu aportación!');

        // Limpiar campos del formulario
        document.getElementById('input-titulo').value = '';
        document.getElementById('input-descripcion').value = '';
        if (inputUbicacion) inputUbicacion.value = '';
        if (inputFoto) inputFoto.value = '';
        if (imagePreview) imagePreview.innerHTML = '';
        if (gpsStatus) gpsStatus.textContent = '';
        fotoBase64 = '';

        // Actualizar lista y volver a la pantalla de inicio
        cargarReportesRecientes();
        mostrarVista('inicio');
    });
}

// Inicializar al cargar la página
window.onload = function() {
    cargarReportesRecientes();
    mostrarVista('inicio');
};