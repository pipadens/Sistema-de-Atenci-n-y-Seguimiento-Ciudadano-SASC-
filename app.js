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
// Obtener Geolocalización GPS y Traducirla a Dirección Real (Calle, Colonia, Municipio)
        btnGps.addEventListener('click', () => {
            if (!navigator.geolocation) {
                gpsStatus.textContent = 'Tu dispositivo no soporta geolocalización.';
                return;
            }
            
            gpsStatus.textContent = 'Obteniendo ubicación y detectando dirección...';
            
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;
                    
                    // Consultar servicio gratuito de mapas para obtener Calle, Colonia y Municipio
                    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`, {
                        headers: {
                            'Accept-Language': 'es'
                        }
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data && data.address) {
                            const addr = data.address;
                            const calle = addr.road || addr.pedestrian || addr.street || 'Calle sin nombre';
                            const colonia = addr.suburb || addr.neighbourhood || addr.settlement || 'Colonia general';
                            const municipio = addr.municipality || addr.city || addr.county || 'Morelos';
                            
                            // Llenar el input automáticamente con la dirección legible
                            inputUbicacion.value = `${calle}, Col. ${colonia}, ${municipio}`;
                            gpsStatus.textContent = '✅ Dirección detectada con éxito (Puedes editarla si es necesario).';
                        } else {
                            inputUbicacion.value = `Lat: ${lat.toFixed(5)}, Lon: ${lon.toFixed(5)}`;
                            gpsStatus.textContent = '⚠️ Ubicación obtenida por coordenadas.';
                        }
                    })
                    .catch(() => {
                        // Si falla el internet o el servicio de mapas, pone las coordenadas como respaldo
                        inputUbicacion.value = `Lat: ${lat.toFixed(5)}, Lon: ${lon.toFixed(5)}`;
                        gpsStatus.textContent = '✅ Coordenadas GPS obtenidas.';
                    });

                },
                (error) => {
                    gpsStatus.textContent = '⚠️ Permiso de ubicación denegado. Escribe la dirección manualmente.';
                },
                { enableHighAccuracy: true, timeout: 10000 }
            );
        });
