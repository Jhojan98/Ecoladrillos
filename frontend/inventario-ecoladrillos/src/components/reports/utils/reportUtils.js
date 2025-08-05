// Funciones utilitarias para reportes
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const formatDateTime = (dateTimeString) => {
  const date = new Date(dateTimeString);
  return date.toLocaleString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const printReport = (reportData, notify) => {
  const printContent = document.getElementById("report-content");

  if (!printContent) {
    notify.error("No se pudo obtener el contenido del reporte");
    return;
  }

  try {
    const winPrint = window.open(
      "",
      "_blank",
      "left=0,top=0,width=800,height=900,toolbar=0,scrollbars=1,status=0"
    );

    if (!winPrint) {
      notify.error(
        "No se pudo abrir la ventana de impresión. Verifique que no esté bloqueada por el navegador."
      );
      return;
    }

    winPrint.document.write(`
      <html>
        <head>
          <title>Reporte - ${reportData?.tipo_reporte}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
            .report-header { text-align: center; margin-bottom: 30px; }
            .report-info { margin-bottom: 20px; }
            .report-data { margin-top: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .summary-item { margin: 10px 0; padding: 10px; background: #f9f9f9; border-radius: 5px; }
            .info-row { display: flex; justify-content: space-between; margin-bottom: 8px; }
            .info-label { font-weight: bold; }
            .summary-value { 
              display: inline-block; 
              background: #23478d; 
              color: white; 
              padding: 5px 10px; 
              border-radius: 3px; 
              font-weight: bold; 
            }
            .status-with-stock { color: green; font-weight: bold; }
            .status-without-stock { color: red; font-weight: bold; }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);

    winPrint.document.close();

    // Esperar a que el contenido se cargue antes de imprimir
    winPrint.onload = () => {
      winPrint.focus();
      setTimeout(() => {
        winPrint.print();
        winPrint.close();
      }, 500);
    };
  } catch (error) {
    notify.error("Error al generar la impresión");
  }
};
