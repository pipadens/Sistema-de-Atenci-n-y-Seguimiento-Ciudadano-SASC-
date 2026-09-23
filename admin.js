document.addEventListener("DOMContentLoaded", () => {
    // Candado de seguridad básico al cargar el panel admin
    const password = prompt("🔐 Ingrese la contraseña de administración de SASC:");
    if (password !== "1234") {
        alert("⚠️ Contraseña incorrecta. Redirigiendo al portal ciudadano.");
        window.location.href = "index.html";
        return;
    }

    cargarReportesAdmin();
    document.getElementById('btn-actualizar-admin').addEventListener('click', cargarReportesAdmin);
});

const contenedorAdminReportes = document.getElementById('tabla-admin-reportes');

function cargarReportesAdmin() {
    const reportes = JSON.parse(localStorage.getItem('sasc_reportes')) || [];

    if (reportes.length === 0) {
        contenedorAdminReportes.innerHTML = '<p class="texto-vacio">No hay reportes ciudadanos registrados en el sistema.</p>';
        return;
    }

    let html = '<div style="display: flex; flex-direction: column; gap: 15px;">';
    
    [...reportes].reverse().forEach((rep, indexReal) => {
        const index = reportes.length - 1 - indexReal;
        
        html += `
            <div style="border: 1px solid #cbd5e1; padding: 15px; border-radius: 8px; background: #f8fafc;">
                ${rep.foto ? `<img src="${rep.foto}" style="width: 100%; max-height: 120px; object-fit: cover; border-radius: 4px; margin-bottom: 8px;">` : ''}
                <p style="margin: 0 0 4px 0;"><strong>Folio:</strong> <span style="color: #1b396a; font-weight: bold;">${rep.folio}</span></p>
                <p style="margin: 0 0 4px 0;"><strong>Categoría:</strong> ${rep.categoria}</p>
                <p style="margin: 0 0 4px 0;"><strong>Título:</strong> ${rep.titulo}</p>
                <p style="margin: 0 0 4px 0; font-size: 0.9rem; color: #475569;"><strong>Descripción:</strong> ${rep.descripcion}</p>
                <p style="margin: 0 0 8px 0; font-size: 0.85rem; color: #475569;">📍 <strong>Coordenadas GPS:</strong> ${rep.ubicacion}</p>
                
                <!-- Visualizador de Mapa Estilo Temixco -->
                <div style="background: #e2e8f0; padding: 8px; border-radius: 6px; font-size: 0.8rem; text-align: center; color: #334155; margin-bottom: 10px;">
                    🗺️ [Mapa Operativo Temixco] Ubicación georreferenciada para la cuadrilla.
                </div>

                <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #cbd5e1; padding-top: 10px;">
                    <div>
                        <label style="font-size: 0.8rem; font-weight: bold;">Estatus:</label>
                        <select onchange="cambiarEstatusAdmin(${index}, this.value)" style="padding: 4px; border-radius: 4px; font-size: 0.85rem;">
                            <option value="Enviado / En revisión" ${rep.estatus === 'Enviado / En revisión' ? 'selected' : ''}>En revisión</option>
                            <option value="En Proceso / Cuadrilla Asignada" ${rep.estatus === 'En Proceso / Cuadrilla Asignada' ? 'selected' : ''}>Cuadrilla Asignada</option>
                            <option value="Resuelto con Éxito" ${rep.estatus === 'Resuelto con Éxito' ? 'selected' : ''}>Resuelto</option>
                        </select>
                    </div>
                    <button onclick="eliminarReporteAdmin(${index})" style="background: #dc2626; color: white; border: none; padding: 6px 10px; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">🗑️ Eliminar</button>
                </div>
            </div>
        `;
    });
    html += '</div>';
    contenedorAdminReportes.innerHTML = html;
}

function cambiarEstatusAdmin(index, nuevoEstatus) {
    let reportes = JSON.parse(localStorage.getItem('sasc_reportes')) || [];
    if (reportes[index]) {
        reportes[index].estatus = nuevoEstatus;
        localStorage.setItem('sasc_reportes', JSON.stringify(reportes));
        alert(`🔔 Notificación proactiva: El folio ${reportes[index].folio} ha cambiado a "${nuevoEstatus}".`);
    }
}

function eliminarReporteAdmin(index) {
    if (confirm('¿Estás segura de eliminar este registro del sistema?')) {
        let reportes = JSON.parse(localStorage.getItem('sasc_reportes')) || [];
        reportes.splice(index, 1);
        localStorage.setItem('sasc_reportes', JSON.stringify(reportes));
        cargarReportesAdmin();
    }
}