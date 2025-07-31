from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status

def custom_exception_handler(exc, context):
    """
    Manejador personalizado de excepciones para estandarizar el formato de errores
    """
    # Llamar al manejador de excepciones por defecto de DRF
    response = exception_handler(exc, context)

    if response is not None:
        # Crear un formato personalizado de error
        custom_response_data = {}
        
        # Verificar el tipo de error y estructurarlo de manera consistente
        if isinstance(response.data, dict):
            # Si es un error de validación con múltiples campos
            if any(isinstance(value, list) for value in response.data.values()):
                errores = []
                for field, messages in response.data.items():
                    if isinstance(messages, list):
                        for message in messages:
                            if field == 'non_field_errors':
                                errores.append(str(message))
                            else:
                                errores.append(f"{field}: {message}")
                    else:
                        if field == 'non_field_errors':
                            errores.append(str(messages))
                        else:
                            errores.append(f"{field}: {messages}")
                
                custom_response_data = {
                    'errores': errores,
                    'codigo_estado': response.status_code
                }
            else:
                # Si es un error simple con un mensaje
                if 'detail' in response.data:
                    custom_response_data = {
                        'error': response.data['detail'],
                        'codigo_estado': response.status_code
                    }
                else:
                    custom_response_data = {
                        'error': str(response.data),
                        'codigo_estado': response.status_code
                    }
        
        elif isinstance(response.data, list):
            # Si es una lista de errores
            custom_response_data = {
                'errores': response.data,
                'codigo_estado': response.status_code
            }
        else:
            # Para cualquier otro caso
            custom_response_data = {
                'error': str(response.data),
                'codigo_estado': response.status_code
            }

        response.data = custom_response_data

    return response


def format_validation_errors(serializer_errors):
    """
    Formatea los errores de validación del serializer en un formato consistente
    """
    errores = []
    
    for field, messages in serializer_errors.items():
        if isinstance(messages, list):
            for message in messages:
                if field == 'non_field_errors':
                    errores.append(str(message))
                else:
                    errores.append(f"{field}: {message}")
        else:
            if field == 'non_field_errors':
                errores.append(str(messages))
            else:
                errores.append(f"{field}: {messages}")
    
    return errores
