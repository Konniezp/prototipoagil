// ===== DATOS COMPARTIDOS =====
const funcionarios = [
    { id: 1, nombre: "Juan Pérez", rut: "12345678-9" },
    { id: 2, nombre: "María Gómez", rut: "98765432-1" },
    { id: 3, nombre: "Carlos López", rut: "45678912-3" }
];

const areas = ["Urgencias", "Pediatría", "Cirugía", "Cardiología", "Neurología"];
const horarios = ["08:00 - 16:00", "16:00 - 00:00", "00:00 - 08:00"];

// ===== FUNCIONES UTILITARIAS =====
function formatDate(year, month, day) {
    return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
}

function daysInMonth(month, year) {
    return new Date(year, month, 0).getDate();
}

function getFirstDayOfMonth(month, year) {
    let day = new Date(year, month - 1, 1).getDay();
    return day === 0 ? 6 : day - 1;
}

function showNotification(message, isError = false) {
    const notification = document.createElement('div');
    notification.className = `notification ${isError ? 'error' : ''}`;
    notification.innerHTML = `
        ${message}
        <span class="notification-close">×</span>
    `;
    
    document.getElementById('notificationContainer').appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    });
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

function formatDisplayDate(dateStr) {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
}

function isWithinNext5Days(dateStr) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const targetDate = new Date(dateStr);
    targetDate.setHours(0, 0, 0, 0);
    
    const maxDate = new Date(today);
    maxDate.setDate(today.getDate() + 5);
    
    return targetDate >= today && targetDate <= maxDate;
}

// ===== FUNCIONALIDAD GENERAL =====
document.addEventListener('DOMContentLoaded', function() {
    if (document.querySelector('.funcionario-view')) {
        initFuncionarioCalendar();
    }
});

// ===== CÓDIGO PARA FUNCIONARIO =====
function initFuncionarioCalendar() {
    const funcionarioId = 1;
    const funcionarioActual = funcionarios.find(f => f.id === funcionarioId);
    let currentMonth = new Date().getMonth() + 1;
    let currentYear = new Date().getFullYear();

    // Datos de ejemplo del funcionario
    const misTurnos = [
        { fecha: formatDate(currentYear, 4, 15), area: "Urgencias", horario: "16:00 - 00:00" },
        { fecha: formatDate(currentYear, 4, 20), area: "Urgencias", horario: "08:00 - 16:00" },
        { fecha: formatDate(currentYear, 4, 25), area: "Pediatría", horario: "00:00 - 08:00" },
        { fecha: formatDate(currentYear, 5, 3), area: "Urgencias", horario: "00:00 - 08:00" }
    ];

    // Datos de ejemplo para turnos existentes
    const allShifts = [
        { fecha: formatDate(currentYear, 4, 15), area: "Urgencias", horario: "08:00 - 16:00", funcionario: "Ana Silva" },
        { fecha: formatDate(currentYear, 4, 16), area: "Urgencias", horario: "16:00 - 00:00", funcionario: "Carlos López" },
        { fecha: formatDate(currentYear, 4, 17), area: "Urgencias", horario: "00:00 - 08:00", funcionario: "María Gómez" },
        { fecha: formatDate(currentYear, 4, 18), area: "Pediatría", horario: "08:00 - 16:00", funcionario: "Pedro Sánchez" }
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

        const selectedArea = document.getElementById('areaFilter').value;
        let filteredTurnos = misTurnos.filter(t => {
            const turnoMonth = parseInt(t.fecha.split('-')[1]);
            return turnoMonth === month && (selectedArea === '' || t.area === selectedArea);
        });

        const daysOfWeek = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
        daysOfWeek.forEach(day => {
            const header = document.createElement('div');
            header.className = 'day-header';
            header.textContent = day;
            calendarBody.appendChild(header);
        });

        const firstDay = getFirstDayOfMonth(month, year);
        const totalDays = daysInMonth(month, year);

        // Obtener fecha actual
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const currentDateStr = formatDate(today.getFullYear(), today.getMonth() + 1, today.getDate());

        for (let i = 0; i < firstDay; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.className = 'calendar-day empty';
            calendarBody.appendChild(emptyCell);
        }

        for (let day = 1; day <= totalDays; day++) {
            const dateStr = formatDate(year, month, day);
            const cell = document.createElement('div');
            cell.className = 'calendar-day';
            
            // Resaltar día actual
            if (dateStr === currentDateStr) {
                cell.classList.add('current-day');
            }
            
            cell.innerHTML = `<div class="day-number">${day}</div>`;

            const turnosDia = filteredTurnos.filter(t => t.fecha === dateStr);
            if (turnosDia.length > 0) {
                turnosDia.forEach(turno => {
                    const turnoDiv = document.createElement('div');
                    turnoDiv.className = isWithinNext5Days(dateStr) ? 'my-shift upcoming-shift' : 'my-shift';
                    turnoDiv.innerHTML = `
                        <p><strong>${turno.area}</strong></p>
                        <p>${turno.horario}</p>
                    `;
                    
                    // Añadir botón para turnos en los próximos 5 días
                    if (isWithinNext5Days(dateStr)) {
                        const changeBtn = document.createElement('button');
                        changeBtn.className = 'btn-change-shift';
                        changeBtn.textContent = 'Solicitar Cambio';
                        changeBtn.addEventListener('click', (e) => {
                            e.stopPropagation();
                            openShiftChangeModal(dateStr, `${turno.area} - ${turno.horario}`);
                        });
                        turnoDiv.appendChild(changeBtn);
                    }
                    
                    cell.appendChild(turnoDiv);
                });
            }

            calendarBody.appendChild(cell);
        }
    }

    function openShiftChangeModal(dateStr, shiftDetails) {
        const modal = document.getElementById('shiftChangeModal');
        const today = new Date();
        const maxDate = new Date(today);
        maxDate.setDate(today.getDate() + 5);

        // Configurar valores del formulario
        document.getElementById('originalShiftDate').value = formatDisplayDate(dateStr);
        document.getElementById('originalShiftDetails').value = shiftDetails;
        
        // Configurar rango de fechas permitido
        const dateInput = document.getElementById('newShiftDate');
        dateInput.min = today.toISOString().split('T')[0];
        dateInput.max = maxDate.toISOString().split('T')[0];
        dateInput.value = '';
        
        // Limpiar verificaciones anteriores
        document.getElementById('availabilityCheck').textContent = '';
        document.getElementById('newShiftTime').value = '';
        document.getElementById('changeReason').value = '';
        document.getElementById('charCount').textContent = '200';
        
        // Mostrar información de rango de fechas
        document.querySelector('.date-range-info').textContent = 
            `Puedes seleccionar entre ${formatDisplayDate(dateInput.min)} y ${formatDisplayDate(dateInput.max)}`;
        
        // Mostrar modal
        modal.style.display = 'block';
    }

    function setupFuncionarioEventListeners() {
        document.getElementById('prevMonth').addEventListener('click', () => {
            currentMonth = currentMonth === 1 ? 12 : currentMonth - 1;
            currentYear = currentMonth === 12 ? currentYear - 1 : currentYear;
            updateFuncionarioCalendar(currentMonth, currentYear);
        });

        document.getElementById('nextMonth').addEventListener('click', () => {
            currentMonth = currentMonth === 12 ? 1 : currentMonth + 1;
            currentYear = currentMonth === 1 ? currentYear + 1 : currentYear;
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

        // Configurar evento para cerrar modal
        document.querySelector('.close-modal').addEventListener('click', () => {
            document.getElementById('shiftChangeModal').style.display = 'none';
        });

        // Configurar evento para verificar disponibilidad
        document.getElementById('checkAvailabilityBtn').addEventListener('click', checkShiftAvailability);

        // Configurar evento para enviar formulario
        document.getElementById('shiftChangeForm').addEventListener('submit', function(e) {
            e.preventDefault();
            submitShiftChangeRequest();
        });

        // Configurar evento para el contador de caracteres
        document.getElementById('changeReason').addEventListener('input', function() {
            const remaining = 200 - this.value.length;
            document.getElementById('charCount').textContent = remaining;
            
            if (remaining < 0) {
                this.value = this.value.substring(0, 200);
                document.getElementById('charCount').textContent = 0;
            }
        });

        // Configurar evento para cerrar modal de confirmación
        document.getElementById('confirmCloseBtn').addEventListener('click', function() {
            document.getElementById('confirmationModal').style.display = 'none';
        });
    }

    function checkShiftAvailability() {
        const newDate = document.getElementById('newShiftDate').value;
        const newTime = document.getElementById('newShiftTime').value;
        const availabilityCheck = document.getElementById('availabilityCheck');
        const originalDetails = document.getElementById('originalShiftDetails').value;
        const area = originalDetails.split(' - ')[0];
        
        if (!newDate || !newTime) {
            showNotification('Por favor complete fecha y horario', true);
            return;
        }
        
        // Verificar disponibilidad en el área del usuario
        const isAvailable = !allShifts.some(shift => 
            shift.area === area && 
            shift.fecha === newDate && 
            shift.horario === newTime
        );
        
        availabilityCheck.style.display = 'block';
        
        if (isAvailable) {
            availabilityCheck.textContent = '✅ Turno disponible en tu área';
            availabilityCheck.className = 'availability-check available';
        } else {
            const conflictingShift = allShifts.find(shift => 
                shift.area === area && 
                shift.fecha === newDate && 
                shift.horario === newTime
            );
            availabilityCheck.textContent = `❌ Turno ocupado por ${conflictingShift.funcionario}`;
            availabilityCheck.className = 'availability-check unavailable';
        }
    }

    function submitShiftChangeRequest() {
        const availabilityCheck = document.getElementById('availabilityCheck');
        const originalDate = document.getElementById('originalShiftDate').value;
        const originalDetails = document.getElementById('originalShiftDetails').value;
        const newDate = document.getElementById('newShiftDate').value;
        const newTime = document.getElementById('newShiftTime').value;
        const reason = document.getElementById('changeReason').value;
        
        if (availabilityCheck.classList.contains('unavailable')) {
            showNotification('No puede solicitar un turno ya asignado en su área', true);
            return;
        }
        
        if (!newDate || !newTime || !reason) {
            showNotification('Complete todos los campos', true);
            return;
        }
        
        // Mostrar confirmación
        const confirmationModal = document.getElementById('confirmationModal');
        document.getElementById('confirmationMessage').textContent = 
            `Su solicitud de cambio para ${originalDate} (${originalDetails}) 
            a ${formatDisplayDate(newDate)} (${newTime}) ha sido enviada al coordinador. 
            Recibirá una respuesta en 24 horas.`;
        
        document.getElementById('shiftChangeModal').style.display = 'none';
        confirmationModal.style.display = 'block';
        
        // Simular respuesta del coordinador después de 24 horas (5 segundos para demo)
        setTimeout(() => {
            const randomApproved = Math.random() > 0.3; // 70% de probabilidad de aprobación
            const notificationMsg = randomApproved 
                ? `Su solicitud de cambio de turno para ${formatDisplayDate(newDate)} ha sido aprobada.` 
                : `Su solicitud de cambio de turno para ${formatDisplayDate(newDate)} ha sido rechazada.`;
            
            showNotification(notificationMsg, !randomApproved);
        }, 5000);
    }
}
