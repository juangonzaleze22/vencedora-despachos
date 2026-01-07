import React, { useState } from 'react';
import Modal from '../ui/Modal';
import { despachosService } from '../../services/despachosService';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useAlert } from '../../context/AlertContext';
import { formatTime12h } from '../../js/utils/dateUtils';

function ReportesModal({ isOpen, onClose }) {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(false);
    const { showAlert } = useAlert();

    const loadImage = (url) => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = url;
            img.onload = () => resolve(img);
            img.onerror = reject;
        });
    };

    const generatePDF = async () => {
        setLoading(true);
        try {
            // 1. Fetch Data
            const filters = {};
            if (startDate) filters.fechaInicio = startDate;
            if (endDate) filters.fechaFin = endDate;
            if (status) filters.estado = status;

            const result = await despachosService.search(filters);

            if (!result.success) {
                throw new Error(result.error || 'Error al obtener datos');
            }

            const despachos = result.data;

            if (despachos.length === 0) {
                showAlert('warning', 'No se encontraron despachos con los filtros seleccionados.');
                setLoading(false);
                return;
            }

            // 2. Generate PDF
            const doc = new jsPDF();

            // Add Logo
            const logoUrl = './images/logo.png';
            try {
                const img = await loadImage(logoUrl);
                const logoWidth = 30;
                const logoHeight = (img.height * logoWidth) / img.width;
                doc.addImage(img, 'PNG', 14, 10, logoWidth, logoHeight);
            } catch (err) {
                console.warn('Logo not found or could not be loaded', err);
            }

            // Header
            doc.setFontSize(18);
            doc.text('Reporte de Despachos', 14, 35); // Adjusted Y position

            doc.setFontSize(11);
            doc.setTextColor(100);
            const dateStr = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
            doc.text(`Fecha de emisión: ${dateStr}`, 14, 42);

            // Helper to format YYYY-MM-DD to DD/MM/YYYY
            const formatDate = (isoDate) => {
                if (!isoDate) return '';
                const [year, month, day] = isoDate.split('-');
                return `${day}/${month}/${year}`;
            };

            let filterText = 'Filtros: ';
            if (startDate) filterText += `Desde ${formatDate(startDate)} `;
            if (endDate) filterText += `Hasta ${formatDate(endDate)} `;
            if (status) filterText += `Estado: ${getStatusLabel(status)}`;
            if (filterText === 'Filtros: ') filterText += 'Todos';

            doc.text(filterText, 14, 48);

            // Table
            const tableColumn = ["Fecha", "Hora", "ID Factura", "Cliente", "Estado", "Descripción", "Motivo Cancelación"];
            const tableRows = [];

            despachos.forEach(ticket => {
                const dateObj = new Date(ticket.fecha);
                const dateStr = dateObj.toLocaleDateString();
                const timeStr = formatTime12h(ticket.fecha);

                const ticketData = [
                    dateStr,
                    timeStr,
                    ticket.idFactura,
                    ticket.nombre,
                    getStatusLabel(ticket.estado),
                    ticket.descripcion || '',
                    ticket.estado === 'cancelled' && ticket.motivoCancelacion ? ticket.motivoCancelacion : '-'
                ];
                tableRows.push(ticketData);
            });

            autoTable(doc, {
                head: [tableColumn],
                body: tableRows,
                startY: 54,
                theme: 'grid',
                headStyles: { fillColor: [66, 139, 202], overflow: 'visible', },
                styles: { fontSize: 8 },
                columnStyles: {
                    0: { cellWidth: 'wrap' },
                    1: { cellWidth: 'wrap' },
                    4: { cellWidth: 'wrap' }, // Índice 1 es "Hora". 'wrap' aquí hace que NO salte de línea.
                    5: { cellWidth: 50 }, // Width for description
                    6: { cellWidth: 50 } // Width for motivo cancelación
                },
                didParseCell: function (data) {
                    // Update index for Status column (now index 4)
                    if (data.section === 'body' && data.column.index === 4) {
                        const statusText = data.cell.raw;
                        if (statusText === 'Parcial') {
                            data.cell.styles.fillColor = [255, 241, 118]; // Light Yellow
                            data.cell.styles.textColor = [50, 50, 0];
                        } else if (statusText === 'En Progreso') {
                            data.cell.styles.fillColor = [187, 222, 251]; // Light Blue
                            data.cell.styles.textColor = [0, 50, 100];
                        } else if (statusText === 'Completado') {
                            data.cell.styles.fillColor = [200, 230, 201]; // Light Green
                            data.cell.styles.textColor = [0, 50, 0];
                        } else if (statusText === 'Cancelado') {
                            data.cell.styles.fillColor = [255, 205, 210]; // Light Red
                            data.cell.styles.textColor = [100, 0, 0];
                        }
                    }
                }
            });

            // Save
            doc.save(`reporte_despachos_${Date.now()}.pdf`);

            showAlert('success', 'Reporte generado y descargado correctamente.');

        } catch (error) {
            console.error('Error generando reporte:', error);
            showAlert('error', 'Error al generar el reporte.');
        } finally {
            setLoading(false);
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'pending': return 'Parcial';
            case 'in_progress': return 'En Progreso';
            case 'completed': return 'Completado';
            case 'cancelled': return 'Cancelado';
            default: return status || 'Todo';
        }
    };

    if (!isOpen) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Generar Reporte de Despachos"
        >
            <div className="space-y-4 font-body">

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha Inicio</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 text-sm dark:text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha Fin</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 text-sm dark:text-white"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Estado</label>
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 text-sm dark:text-white"
                    >
                        <option value="">Todos</option>
                        <option value="pending">Parcialmente Entregado</option>
                        <option value="in_progress">En Progreso</option>
                        <option value="completed">Completado</option>
                        <option value="cancelled">Cancelado</option>
                    </select>
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        onClick={onClose}
                        className="mr-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={generatePDF}
                        disabled={loading}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800 disabled:opacity-50 flex items-center"
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Generando...
                            </>
                        ) : (
                            'Descargar PDF'
                        )}
                    </button>
                </div>
            </div>
        </Modal>
    );
}



export default ReportesModal;
