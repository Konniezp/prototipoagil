// Datos compartidos
const funcionarios = [
    { id: 1, nombre: "Juan Pérez", rut: "12345678-9" },
    { id: 2, nombre: "María Gómez", rut: "98765432-1" },
    { id: 3, nombre: "Carlos López", rut: "45678912-3" }
];

const areas = ["Urgencias", "Pediatría", "Cirugía", "Cardiología", "Neurología"];
const horarios = ["08:00 - 16:00", "16:00 - 00:00", "00:00 - 08:00"];

// Función para formatear fecha
function formatDate(year, month, day) {
    return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
}

// Función para días en mes
function daysInMonth(month, year) {
    return new Date(year, month, 0).getDate();
}

// Función para primer día del mes
function getFirstDayOfMonth(month, year) {
    let day = new Date(year, month - 1, 1).getDay();
    return day === 0 ? 6 : day - 1;
}

// ===== FUNCIONALIDAD GENERAL =====
document.addEventListener('DOMContentLoaded', function() {
    highlightActiveLink();
    
    if (document.querySelector('.coordinador-view')) {
        initCoordinadorCalendar();
    }
    
    if (document.querySelector('.funcionario-view')) {
        initFuncionarioCalendar();
    }
});

function highlightActiveLink() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const menuLinks = {
        'index.html': 'inicioLink',
        'coordinador.html': 'coordinadorLink',
        'funcionario.html': 'funcionarioLink'
    };
    
    for (const [page, linkId] of Object.entries(menuLinks)) {
        const linkElement = document.getElementById(linkId);
        if (linkElement) {
            if (currentPage === page) {
                linkElement.style.backgroundColor = '#3498db';
            }
        }
    }
}

// ===== CÓDIGO PARA COORDINADOR =====
function initCoordinadorCalendar() {
    let turnos = {};
    let currentMonth = new Date().getMonth() + 1;
    let currentYear = new Date().getFullYear();
    let lastAssignment = null;
    let notificationTimeout = null;

    updateCoordinadorCalendar(currentMonth, currentYear);
    setupCoordinadorEventListeners();

    function updateCoordinadorCalendar(month, year) {
        const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", 
                          "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
        document.getElementById('monthYear').textContent = `${monthNames[month - 1]} ${year}`;

        const calendarBody = document.getElementById('calendarBody');
        calendarBody.innerHTML = '';

        const daysOfWeek = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
        daysOfWeek.forEach(day => {
            const header = document.createElement('div');
            header.className = 'day-header';
            header.textContent = day;
            calendarBody.appendChild(header);
        });

        const firstDay = getFirstDayOfMonth(month, year);
        const totalDays = daysInMonth(month, year);

        for (let i = 0; i < firstDay; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.className = 'calendar-day empty';
            calendarBody.appendChild(emptyCell);
        }

        for (let day = 1; day <= totalDays; day++) {
            const dateStr = formatDate(year, month, day);
            const cell = document.createElement('div');
            cell.className = 'calendar-day';
            cell.innerHTML = `<div class="day-number">${day}</div>`;

            if (turnos[dateStr] && turnos[dateStr].length > 0) {
                turnos[dateStr].forEach(turno => {
                    const turnoDiv = document.createElement('div');
                    turnoDiv.className = 'shift';
                    turnoDiv.innerHTML = `
                        <p><strong>${turno.funcionario}</strong></p>
                        <p>${turno.area} - ${turno.horario}</p>
                    `;
                    cell.appendChild(turnoDiv);
                });
            }

            cell.addEventListener('click', () => openModal(day, month, year));
            calendarBody.appendChild(cell);
        }
    }

    function setupCoordinadorEventListeners() {
        document.getElementById('prevMonth').addEventListener('click', () => {
            if (currentMonth === 1) {
                currentMonth = 12;
                currentYear--;
            } else {
                currentMonth--;
            }
            updateCoordinadorCalendar(currentMonth, currentYear);
        });

        document.getElementById('nextMonth').addEventListener('click', () => {
            if (currentMonth === 12) {
                currentMonth = 1;
                currentYear++;
            } else {
                currentMonth++;
            }
            updateCoordinadorCalendar(currentMonth, currentYear);
        });

        document.getElementById('undoButton').addEventListener('click', undoLastAssignment);
    }

    function openModal(day, month, year) {
        const modal = document.getElementById('modalTurno');
        document.getElementById('modalTitle').textContent = `Asignar Turno - ${day}/${month}/${year}`;
        
        const funcionarioSelect = document.getElementById('funcionario');
        funcionarioSelect.innerHTML = '';
        funcionarios.forEach(func => {
            const option = document.createElement('option');
            option.value = func.id;
            option.textContent = func.nombre;
            funcionarioSelect.appendChild(option);
        });

        const areaSelect = document.getElementById('area');
        areaSelect.innerHTML = '';
        areas.forEach(area => {
            const option = document.createElement('option');
            option.value = area;
            option.textContent = area;
            areaSelect.appendChild(option);
        });

        const horarioSelect = document.getElementById('horario');
        horarioSelect.innerHTML = '';
        horarios.forEach(horario => {
            const option = document.createElement('option');
            option.value = horario;
            option.textContent = horario;
            horarioSelect.appendChild(option);
        });

        modal.dataset.date = formatDate(year, month, day);
        modal.style.display = 'flex';
    }

    document.getElementById('turnoForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const funcionarioId = parseInt(document.getElementById('funcionario').value);
        const funcionario = funcionarios.find(f => f.id === funcionarioId);
        const area = document.getElementById('area').value;
        const horario = document.getElementById('horario').value;
        const dateStr = document.getElementById('modalTurno').dataset.date;

        if (!turnos[dateStr]) {
            turnos[dateStr] = [];
        }

        const newTurno = {
            funcionario: funcionario.nombre,
            area: area,
            horario: horario
        };

        turnos[dateStr].push(newTurno);
        document.getElementById('modalTurno').style.display = 'none';
        updateCoordinadorCalendar(currentMonth, currentYear);
        
        // Guardar info para posible deshacer
        lastAssignment = {
            date: dateStr,
            turno: newTurno,
            index: turnos[dateStr].length - 1
        };

        // Mostrar notificación con botón deshacer
        const dateParts = dateStr.split('-');
        const formattedDate = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;
        showNotification(
            `Turno asignado a ${funcionario.nombre} para el ${formattedDate} en ${area}`,
            true
        );

        // Configurar timeout para ocultar notificación después de 5 segundos
        if (notificationTimeout) {
            clearTimeout(notificationTimeout);
        }
        notificationTimeout = setTimeout(() => {
            if (document.getElementById('notification').classList.contains('hidden')) return;
            document.getElementById('notification').classList.add('hidden');
        }, 5000);
    });

    function undoLastAssignment() {
        if (!lastAssignment) return;
        
        const { date, turno, index } = lastAssignment;
        
        if (turnos[date] && turnos[date][index]) {
            // Verificar que el turno a eliminar coincide con el que guardamos
            const currentTurno = turnos[date][index];
            if (currentTurno.funcionario === turno.funcionario && 
                currentTurno.area === turno.area && 
                currentTurno.horario === turno.horario) {
                
                turnos[date].splice(index, 1);
                if (turnos[date].length === 0) {
                    delete turnos[date];
                }
                
                updateCoordinadorCalendar(currentMonth, currentYear);
                showNotification("Turno eliminado correctamente", false);
            }
        }
        
        lastAssignment = null;
        document.getElementById('notification').classList.add('hidden');
    }
}

// ===== CÓDIGO PARA FUNCIONARIO =====
function initFuncionarioCalendar() {
    const funcionarioId = 1;
    const funcionarioActual = funcionarios.find(f => f.id === funcionarioId);
    let currentMonth = new Date().getMonth() + 1;
    let currentYear = new Date().getFullYear();

    const misTurnos = [
        { fecha: "2025-04-04", area: "Urgencias", horario: "08:00 - 16:00" },
        { fecha: "2025-04-12", area: "Urgencias", horario: "16:00 - 00:00" },
        { fecha: "2025-04-15", area: "Urgencias", horario: "16:00 - 00:00" },
        { fecha: "2025-04-20", area: "Urgencias", horario: "08:00 - 16:00" },
        { fecha: "2025-05-03", area: "Urgencias", horario: "00:00 - 08:00" }
    ];

    document.getElementById('nombreFuncionario').textContent = funcionarioActual.nombre;
    document.getElementById('rutFuncionario').textContent = funcionarioActual.rut;
    updateFuncionarioCalendar(currentMonth, currentYear);
    setupFuncionarioEventListeners();

    function updateFuncionarioCalendar(month, year) {
        const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", 
                          "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
        document.getElementById('currentMonth').textContent = `${monthNames[month - 1]} ${year}`;

        const calendarBody = document.getElementById('calendarBody');
        calendarBody.innerHTML = '';

        // Aplicar filtros
        const selectedArea = document.getElementById('areaFilter').value;
        let filteredTurnos = misTurnos.filter(t => {
            const turnoMonth = parseInt(t.fecha.split('-')[1]);
            return turnoMonth === month && (selectedArea === '' || t.area === selectedArea);
        });

        // Crear encabezados de días
        const daysOfWeek = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
        daysOfWeek.forEach(day => {
            const header = document.createElement('div');
            header.className = 'day-header';
            header.textContent = day;
            calendarBody.appendChild(header);
        });

        const firstDay = getFirstDayOfMonth(month, year);
        const totalDays = daysInMonth(month, year);

        // Días vacíos al inicio
        for (let i = 0; i < firstDay; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.className = 'calendar-day empty';
            calendarBody.appendChild(emptyCell);
        }

        // Días del mes
        for (let day = 1; day <= totalDays; day++) {
            const dateStr = formatDate(year, month, day);
            const cell = document.createElement('div');
            cell.className = 'calendar-day';
            cell.innerHTML = `<div class="day-number">${day}</div>`;

            // Mostrar turnos del día
            const turnosDia = filteredTurnos.filter(t => t.fecha === dateStr);
            if (turnosDia.length > 0) {
                turnosDia.forEach(turno => {
                    const turnoDiv = document.createElement('div');
                    turnoDiv.className = 'my-shift';
                    turnoDiv.innerHTML = `
                        <p><strong>${turno.area}</strong></p>
                        <p>${turno.horario}</p>
                    `;
                    cell.appendChild(turnoDiv);
                });
            }

            calendarBody.appendChild(cell);
        }
    }

    function setupFuncionarioEventListeners() {
        document.getElementById('prevMonth').addEventListener('click', () => {
            if (currentMonth === 1) {
                currentMonth = 12;
                currentYear--;
            } else {
                currentMonth--;
            }
            updateFuncionarioCalendar(currentMonth, currentYear);
        });

        document.getElementById('nextMonth').addEventListener('click', () => {
            if (currentMonth === 12) {
                currentMonth = 1;
                currentYear++;
            } else {
                currentMonth++;
            }
            updateFuncionarioCalendar(currentMonth, currentYear);
        });

        document.getElementById('monthSelector').addEventListener('change', function() {
            currentMonth = parseInt(this.value);
            updateFuncionarioCalendar(currentMonth, currentYear);
        });
        
        document.getElementById('areaFilter').addEventListener('change', function() {
            updateFuncionarioCalendar(currentMonth, currentYear);
        });
        
        document.getElementById('resetFilters').addEventListener('click', function() {
            document.getElementById('areaFilter').value = '';
            updateFuncionarioCalendar(currentMonth, currentYear);
        });
    }
}

// ===== NOTIFICACIONES =====
function showNotification(message, showUndoButton = false) {
    const notification = document.getElementById('notification');
    const notificationMessage = document.getElementById('notificationMessage');
    const undoButton = document.getElementById('undoButton');
    
    notificationMessage.textContent = message;
    undoButton.style.display = showUndoButton ? 'block' : 'none';
    notification.classList.remove('hidden');
}

// Historia 7 solicitud de cambio

document.addEventListener('DOMContentLoaded', function() {
            // Seleccionar turno
            const botonesSeleccionar = document.querySelectorAll('.seleccionar-turno');
            const formularioCambio = document.getElementById('formulario-cambio');
            const turnoSeleccionadoInfo = document.getElementById('turno-seleccionado-info');
            
            botonesSeleccionar.forEach(boton => {
                boton.addEventListener('click', function() {
                    const turnoItem = this.closest('.turno-item');
                    const fecha = turnoItem.querySelector('.turno-date').textContent;
                    const horario = turnoItem.querySelector('.shift p:first-child').textContent;
                    
                    turnoSeleccionadoInfo.textContent = `${fecha}, ${horario}`;
                    formularioCambio.style.display = 'block';
                    
                    // Scroll al formulario
                    formularioCambio.scrollIntoView({ behavior: 'smooth' });
                });
            });
            
            // Contador de caracteres para el motivo
            const motivoCambio = document.getElementById('motivo-cambio');
            const contadorCaracteres = document.getElementById('contador-caracteres');
            
            motivoCambio.addEventListener('input', function() {
                const caracteresRestantes = 200 - this.value.length;
                contadorCaracteres.textContent = `${caracteresRestantes} caracteres restantes`;
            });
            
            // Verificar disponibilidad
            const verificarDisponibilidad = document.getElementById('verificar-disponibilidad');
            const mensajeDisponibilidad = document.getElementById('mensaje-disponibilidad');
            
            verificarDisponibilidad.addEventListener('click', function() {
                // Aquí iría la lógica para verificar solapamiento con otros turnos
                const nuevaFecha = document.getElementById('nueva-fecha').value;
                const nuevoHorario = document.getElementById('nuevo-horario').value;
                
                if (!nuevaFecha || !nuevoHorario) {
                    mensajeDisponibilidad.textContent = 'Por favor, seleccione fecha y horario';
                    mensajeDisponibilidad.style.backgroundColor = '#ffecec';
                    mensajeDisponibilidad.style.color = '#e74c3c';
                } else {
                    // Simulación de verificación exitosa
                    mensajeDisponibilidad.textContent = 'Horario disponible en su área. No hay solapamiento con otros turnos.';
                    mensajeDisponibilidad.style.backgroundColor = '#e8f8f5';
                    mensajeDisponibilidad.style.color = '#2ecc71';
                }
                
                mensajeDisponibilidad.style.display = 'block';
            });
            
            // Enviar solicitud
            const solicitudForm = document.getElementById('solicitud-cambio-form');
            const modalConfirmacion = document.getElementById('modal-confirmacion');
            const cerrarModal = document.getElementById('cerrar-modal');
            const notificacion = document.getElementById('notificacion');
            const notificacionMensaje = document.getElementById('notificacion-mensaje');
            
            solicitudForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                // Mostrar modal de confirmación
                modalConfirmacion.style.display = 'flex';
            });
            
            // Cerrar modal
            cerrarModal.addEventListener('click', function() {
                modalConfirmacion.style.display = 'none';
                
                // Mostrar notificación
                notificacionMensaje.textContent = 'Solicitud enviada correctamente';
                notificacion.style.backgroundColor = '#2ecc71';
                notificacion.classList.remove('hidden');
                
                // Ocultar notificación después de 5 segundos
                setTimeout(() => {
                    notificacion.classList.add('hidden');
                }, 5000);
                
                // Aquí iría la lógica para enviar la solicitud al servidor
            });
            
            // Cerrar modal al hacer clic en la X
            document.querySelector('.close').addEventListener('click', function() {
                modalConfirmacion.style.display = 'none';
            });
            
            // Cerrar modal al hacer clic fuera del contenido
            window.addEventListener('click', function(event) {
                if (event.target === modalConfirmacion) {
                    modalConfirmacion.style.display = 'none';
                }
            });
        });
