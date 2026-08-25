// Función para registrar el reporte desde la vista ciudadana
function registrarReporteCiudadano(evento) {
    evento.preventDefault();

    // Capturar datos del formulario (ajusta los IDs según tus inputs actuales)
    const categoria = document.getElementById('categoriaReporte').value;
    const zona = document.getElementById('zonaReporte').value;
    const descripcion = document.getElementById('descReporte').value;

    // Generar un número de ticket único aleatorio
    const numeroTicket = 'SASC-' + Math.floor(1000 + Math.random() * 9000);
    
    const nuevoReporte = {
        id: numeroTicket,
        categoria: categoria,
        zona: zona,
        descripcion: descripcion,
        estatus: 'En revisión', // Estatus inicial por defecto
        fecha: new Date().toLocaleDateString()
    };

    // Obtener reportes anteriores de localStorage o iniciar array vacío
    let reportes = JSON.parse(localStorage.getItem('sasc_reportes')) || [];
    reportes.push(nuevoReporte);
    
    // Guardar de vuelta en localStorage
    localStorage.setItem('sasc_reportes', JSON.stringify(reportes));

    // Mostrar simulación de notificación / ticket al ciudadano
    alert(`¡Reporte enviado con éxito!\n\nTu número de folio de seguimiento es: ${numeroTicket}\nGuárdalo para consultar el estatus.`);
    
    // Limpiar formulario
    evento.target.reset();
}