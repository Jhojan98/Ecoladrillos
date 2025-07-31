import { confirmDialog } from "primereact/confirmdialog";

/* 
PROPIEDADES DISPONIBLES EN confirm():

message: string - El mensaje a mostrar
header: string - Título del dialog
icon: string - Icono de PrimeIcons (ej: 'pi pi-trash', 'pi pi-exclamation-triangle')
acceptLabel: string - Texto del botón de aceptar
rejectLabel: string - Texto del botón de rechazar
acceptClassName: string - Clase CSS para el botón de aceptar
rejectClassName: string - Clase CSS para el botón de rechazar
onAccept: function - Función que se ejecuta al aceptar
onReject: function - Función que se ejecuta al rechazar

CLASES CSS DISPONIBLES PARA BOTONES:
- p-button-danger (rojo)
- p-button-warning (naranja)
- p-button-success (verde)
- p-button-info (azul)
- p-button-secondary (gris)
- p-button-text (transparente con borde)

ICONOS COMUNES:
- pi pi-trash (eliminar)
- pi pi-exclamation-triangle (advertencia)
- pi pi-question-circle (pregunta)
- pi pi-save (guardar)
- pi pi-times (cancelar)
- pi pi-check (confirmar)
*/

export const useConfirm = () => {
  // confirmar por defecto
  const defaultConfirm = ({ message, onAccept }) => {
    confirmDialog({
      message: `¿Estás seguro de que quieres ${message}?`,
      header: "Confirmar",
      icon: "pi pi-question-circle",
      acceptLabel: "Sí",
      rejectLabel: "No",
      acceptClassName: "p-button-info",
      rejectClassName: "p-button-text",
      accept: onAccept,
      draggable: false,
    });
  };

  // confirmar por defecto
  const saveConfirm = ({ message, onAccept }) => {
    confirmDialog({
      message: `¿Estás seguro de que quieres ${message}?`,
      header: "Confirmar",
      icon: "pi pi-save",
      acceptLabel: "Sí",
      rejectLabel: "No",
      acceptClassName: "p-button-info",
      rejectClassName: "p-button-text",
      accept: onAccept,
      draggable: false,
    });
  };

  // confirmar eliminacion
  const deleteConfirm = ({ message, onAccept }) => {
    confirmDialog({
      message: `¿Estás seguro de que quieres eliminar ${message}?`,
      header: "Eliminar",
      icon: "pi pi-trash",
      acceptLabel: "Eliminar",
      rejectLabel: "Cancelar",
      acceptClassName: "p-button-danger",
      rejectClassName: "p-button-text",
      accept: onAccept,
      draggable: false,
    });
  };

  return { defaultConfirm, saveConfirm, deleteConfirm };
};
