document.addEventListener('DOMContentLoaded', () => {
    const tablaCuerpo = document.getElementById('tablaCuerpo');
    const totalReportesEl = document.getElementById('totalReportes');
    const revisionCountEl = document.getElementById('revisionCount');
    const resueltoCountEl = document.getElementById('resueltoCount');
    const btnLimpiar = document.getElementById('btn-limpiar');

    function cargarPanelAdmin() {
        const reportes = JSON.parse(localStorage.getItem('sasc_reportes')) || [];
        tablaCuerpo.innerHTML = '';

        let revisionProceso = 0;
        let resueltos = 0;

        if (reportes.length === 0) {
            tablaCuerpo.innerHTML = '<tr><td colspan="7" style="text-align: center; color: #718096; padding: 25px;">No hay reportes registrados en el sistema estatal.</td></tr>';
            totalReportesEl.innerText = '0';
            revisionCountEl.innerText = '0';
            resueltoCountEl.innerText = '0';
            return;
        }

        reportes.slice().reverse().forEach((rep, originalIndex) => {
            const index = reportes.length - 1 - originalIndex;

            if (rep.estatus === 'En revisión' || rep.estatus === 'En proceso') {
                revisionProceso++;
            }
            if (rep.estatus === 'Resuelto') {
                resueltos++;
            }

            const fila = document.createElement('tr');
            fila.innerHTML = `
                <td><strong>${rep.folio || 'SASC-MOR-XXXX'}</strong></td>
                <td>${rep.categoria}</td>
                <td>${rep.titulo}</td>
                <td>📍 ${rep.ubicacion}</td>
                <td>${rep.fecha}</td>
                <td><span style="font-weight: bold; color: ${rep.estatus === 'Resuelto' ? '#276749' : '#d97706'};">${rep.estatus}</span></td>
                <td>
                    <select class="selector-estatus" data-index="${index}">
                        <option value="En revisión" ${rep.estatus === 'En revisión' ? 'selected' : ''}>En revisión</option>
                        <option value="En proceso" ${rep.estatus === 'En proceso' ? 'selected' : ''}>En proceso</option>
                        <option value="Resuelto" ${rep.estatus === 'Resuelto' ? 'selected' : ''}>Resuelto</option>
                    </select>
                </td>
            `;
            tablaCuerpo.appendChild(fila);
        });

        totalReportesEl.innerText = reportes.length;
        revisionCountEl.innerText = revisionProceso;
        resueltoCountEl.innerText = resueltos;
    }

    tablaCuerpo.addEventListener('change', (e) => {
        if (e.target.classList.contains('selector-estatus')) {
            const index = parseInt(e.target.getAttribute('data-index'));
            const nuevoEstatus = e.target.value;
            let reportes = JSON.parse(localStorage.getItem('sasc_reportes')) || [];
            if (reportes[index]) {
                reportes[index].estatus = nuevoEstatus;
                localStorage.setItem('sasc_reportes', JSON.stringify(reportes));
                cargarPanelAdmin();
            }
        }
    });

    btnLimpiar.addEventListener('click', () => {
        if (confirm('¿Está seguro de vaciar todos los registros del sistema estatal?')) {
            localStorage.removeItem('sasc_reportes');
            cargarPanelAdmin();
        }
    });

    cargarPanelAdmin();
});