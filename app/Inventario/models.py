from django.db import models

# Create your models here.

class Usuario(models.Model):
    id_usuario = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=100)
    email = models.EmailField(max_length=100, unique=True)
    contraseña = models.CharField(max_length=100)

    class Meta:
        abstract = True


class Operario(Usuario):
    cargo = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.nombre} - {self.cargo}"

class Administrador(Usuario):
    def __str__(self):
        return f"Administrador: {self.nombre}"
    

class Ecoladrillo(models.Model):
    SIZES = [
        ('small', 'Small'),
        ('medium', 'Medium'),
        ('large', 'Large'),
    ]
    
    id_ecoladrillo = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=100)
    descripcion = models.TextField()
    size = models.CharField(max_length=20, choices=SIZES, default='medium')
    material_principal = models.ForeignKey('Material', on_delete=models.CASCADE, related_name='ecoladrillos')
    cantidad_material_requerida = models.IntegerField(default=1)  # Cantidad base de material necesaria
    cantidad = models.IntegerField(default=0)  # Stock disponible

    def __str__(self):
        return f"{self.nombre} ({self.get_size_display()}) - {self.material_principal.nombre}"
    
    def calcular_material_necesario(self, cantidad_ecoladrillos):
        """Calcula la cantidad total de material necesaria para producir X ecoladrillos"""
        return cantidad_ecoladrillos * self.cantidad_material_requerida
    
    def puede_producir(self, cantidad_ecoladrillos):
        """Verifica si hay suficiente material para producir la cantidad solicitada"""
        material_necesario = self.calcular_material_necesario(cantidad_ecoladrillos)
        return self.material_principal.cantidad_disponible >= material_necesario
    
    def agregar_stock(self, cantidad):
        """Aumenta la cantidad de ecoladrillos"""
        if cantidad < 0:
            raise ValueError("La cantidad debe ser positiva")
        self.cantidad += cantidad
        self.save()
    
    def reducir_stock(self, cantidad):
        """Reduce la cantidad de ecoladrillos"""
        if cantidad <= 0:
            raise ValueError("La cantidad debe ser mayor a cero")
        if self.cantidad < cantidad:
            raise ValueError(f"No hay suficientes ecoladrillos disponibles. Stock actual: {self.cantidad}")
        self.cantidad -= cantidad
        self.save()
    

class Material(models.Model):
    id_insumo = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=100)
    tipo = models.CharField(max_length=50)
    cantidad_disponible = models.IntegerField(default=0)
    unidad_medida = models.CharField(max_length=20)

    def __str__(self):
        return f"{self.nombre} ({self.cantidad_disponible} {self.unidad_medida})"

    def agregar_stock(self, agregar_cantidad):
        """Aumenta la cantidad disponible de un material"""
        if agregar_cantidad < 0:
            raise ValueError("La cantidad debe ser positiva")
        self.cantidad_disponible += agregar_cantidad
        self.save()
    
    def reducir_stock(self, reducir_cantidad):
        """Reduce la cantidad disponible de un material"""
        if reducir_cantidad < 0:
            raise ValueError("La cantidad debe ser positiva")
        if self.cantidad_disponible < reducir_cantidad:
            raise ValueError("No hay suficiente stock para reducir")
        self.cantidad_disponible -= reducir_cantidad
        self.save()

class RegistroEcoladrillo(models.Model):
    id_registro = models.AutoField(primary_key=True)
    fecha = models.DateField()
    ecoladrillo = models.ForeignKey(Ecoladrillo, on_delete=models.CASCADE)
    cantidad = models.IntegerField(default=0)

    def __str__(self):
        return f"Registro {self.id_registro} - {self.ecoladrillo.nombre} - Fecha: {self.fecha} - Cantidad: {self.cantidad}"
    
    def save(self, *args, **kwargs):
        if not self.pk:
            """Registra la producción de ecoladrillos y consume el material necesario"""

            if self.cantidad <= 0:
                raise ValueError("La cantidad debe ser mayor a cero")
            
            if not self.ecoladrillo:
                raise ValueError("El ecoladrillo es requerido")
            
            # Verificar si hay suficiente material
            if not self.ecoladrillo.puede_producir(self.cantidad):
                material_necesario = self.ecoladrillo.calcular_material_necesario(self.cantidad)
                raise ValueError(
                    f"No hay suficiente {self.ecoladrillo.material_principal.nombre} disponible. "
                    f"Necesario: {material_necesario} {self.ecoladrillo.material_principal.unidad_medida}, "
                    f"Disponible: {self.ecoladrillo.material_principal.cantidad_disponible} {self.ecoladrillo.material_principal.unidad_medida}"
                )
        
            # Guardar el registro primero
            super().save(*args, **kwargs)
            
            # Aumentar stock de ecoladrillos
            self.ecoladrillo.agregar_stock(self.cantidad)
            
            # Reducir stock de material
            material_usado = self.ecoladrillo.calcular_material_necesario(self.cantidad)
            self.ecoladrillo.material_principal.reducir_stock(material_usado)
        else:
            # Si ya existe, solo guardar sin modificar stock
            super().save(*args, **kwargs)


class RetiroEcoladrillo(models.Model):
    id_retiro = models.AutoField(primary_key=True)
    fecha = models.DateField()
    ecoladrillo = models.ForeignKey(Ecoladrillo, on_delete=models.CASCADE)
    cantidad = models.IntegerField(default=0)
    motivo = models.CharField(max_length=200)

    def __str__(self):
        return f"Retiro {self.id_retiro} - {self.ecoladrillo.nombre} - Cantidad: {self.cantidad}"
    
    def save(self, *args, **kwargs):
        if not self.pk:
            """Reduce la cantidad de ecoladrillos cuando se crea un nuevo retiro"""
            
            if self.cantidad <= 0:
                raise ValueError("La cantidad debe ser mayor a cero")
            
            if not self.ecoladrillo:
                raise ValueError("El ecoladrillo es requerido")
            
            if self.ecoladrillo.cantidad < self.cantidad:
                raise ValueError(f"No hay suficientes ecoladrillos disponibles. Stock actual: {self.ecoladrillo.cantidad}")
            
            # Guardar el retiro primero
            super().save(*args, **kwargs)
            
            # Luego reducir el stock del ecoladrillo
            self.ecoladrillo.cantidad -= self.cantidad
            self.ecoladrillo.save()
        else:
            # Si ya existe, solo guardar sin modificar stock
            super().save(*args, **kwargs)
    
class RegistroMaterial(models.Model):
    id_registro_material = models.AutoField(primary_key=True)
    fecha = models.DateField()
    cantidad = models.IntegerField(default=0)
    material = models.ForeignKey(Material, on_delete=models.CASCADE)
    origen = models.CharField(max_length=100, default='')

    def __str__(self):
        return f"Registro {self.id_registro_material} - {self.material.nombre} - Cantidad: {self.cantidad}"

class Reporte(models.Model):
    TIPOS_REPORTE = [
        ('stock_fecha', 'Stock en Fecha'),
        ('resumen_inventario', 'Resumen de Inventario'),
        ('resumen_retiros', 'Resumen de Retiros'),
    ]
    
    id_reporte = models.AutoField(primary_key=True)
    tipo_reporte = models.CharField(max_length=20, choices=TIPOS_REPORTE)
    fecha_generacion = models.DateTimeField(auto_now_add=True)
    operario = models.ForeignKey(Operario, on_delete=models.SET_NULL, null=True, blank=True)
    datos_reporte = models.JSONField()  # Almacena el contenido del reporte

    def obtener_ecoladrillos_sin_stock(self):
        """Método utilitario para obtener ecoladrillos sin stock desde datos_reporte"""
        if 'ecoladrillos_sin_stock' in self.datos_reporte:
            return self.datos_reporte['ecoladrillos_sin_stock']
        elif 'ecoladrillos' in self.datos_reporte:
            return [e for e in self.datos_reporte['ecoladrillos'] if not e.get('tiene_stock', True)]
        return []
    
    def obtener_materiales_sin_stock(self):
        """Método utilitario para obtener materiales sin stock desde datos_reporte"""
        if 'materiales_sin_stock' in self.datos_reporte:
            return self.datos_reporte['materiales_sin_stock']
        elif 'materiales' in self.datos_reporte:
            return [m for m in self.datos_reporte['materiales'] if not m.get('tiene_stock', True)]
        return []
    
    def obtener_todos_ecoladrillos(self):
        """Método utilitario para obtener todos los ecoladrillos desde datos_reporte"""
        if 'ecoladrillos' in self.datos_reporte:
            return self.datos_reporte['ecoladrillos']
        elif 'ecoladrillos_sin_stock' in self.datos_reporte and 'ecoladrillos_con_stock' in self.datos_reporte:
            return self.datos_reporte['ecoladrillos_sin_stock'] + self.datos_reporte['ecoladrillos_con_stock']
        return []
    
    def obtener_todos_materiales(self):
        """Método utilitario para obtener todos los materiales desde datos_reporte"""
        if 'materiales' in self.datos_reporte:
            return self.datos_reporte['materiales']
        elif 'materiales_sin_stock' in self.datos_reporte and 'materiales_con_stock' in self.datos_reporte:
            return self.datos_reporte['materiales_sin_stock'] + self.datos_reporte['materiales_con_stock']
        return []

    def __str__(self):
        operario_nombre = self.operario.nombre if self.operario else 'Sistema'
        return f"Reporte {self.id_reporte} - {self.get_tipo_reporte_display()} - {operario_nombre}"

    class Meta:
        ordering = ['-fecha_generacion']


class ReporteStockFecha(Reporte):
    fecha_consulta = models.DateField(null=True, blank=True)  # Para reportes de stock en fecha
    
    def generar_datos_stock(self):
        """Genera los datos de stock para todos los ecoladrillos y materiales en la fecha consultada"""
        from django.utils import timezone
        
        # Obtener todos los ecoladrillos con su stock actual
        ecoladrillos_data = []
        for ecoladrillo in Ecoladrillo.objects.all():
            ecoladrillos_data.append({
                'id': ecoladrillo.id_ecoladrillo,
                'nombre': ecoladrillo.nombre,
                'descripcion': ecoladrillo.descripcion,
                'size': ecoladrillo.get_size_display(),
                'material_principal': ecoladrillo.material_principal.nombre,
                'cantidad_stock': ecoladrillo.cantidad,
                'tiene_stock': ecoladrillo.cantidad > 0
            })
        
        # Obtener todos los materiales con su stock actual
        materiales_data = []
        for material in Material.objects.all():
            materiales_data.append({
                'id': material.id_insumo,
                'nombre': material.nombre,
                'tipo': material.tipo,
                'cantidad_disponible': material.cantidad_disponible,
                'unidad_medida': material.unidad_medida,
                'tiene_stock': material.cantidad_disponible > 0
            })
        
        # Guardar en datos_reporte
        self.datos_reporte = {
            'fecha_consulta': self.fecha_consulta.isoformat() if self.fecha_consulta else timezone.now().date().isoformat(),
            'ecoladrillos': ecoladrillos_data,
            'materiales': materiales_data,
            'total_ecoladrillos': len(ecoladrillos_data),
            'total_materiales': len(materiales_data),
            'ecoladrillos_con_stock': len([e for e in ecoladrillos_data if e['tiene_stock']]),
            'materiales_con_stock': len([m for m in materiales_data if m['tiene_stock']])
        }
        self.save()
        return self.datos_reporte
    
    def __str__(self):
        return f"Reporte Stock Fecha {self.id_reporte} - {self.get_tipo_reporte_display()} - {self.fecha_consulta}"

class ReporteResumenInventario(Reporte):
    def generar_datos_resumen(self):
        """Genera los datos de resumen del inventario, enfocándose en items sin stock"""
        
        # Obtener ecoladrillos sin stock
        ecoladrillos_sin_stock = []
        ecoladrillos_con_stock = []
        
        for ecoladrillo in Ecoladrillo.objects.all():
            ecoladrillo_data = {
                'id': ecoladrillo.id_ecoladrillo,
                'nombre': ecoladrillo.nombre,
                'descripcion': ecoladrillo.descripcion,
                'size': ecoladrillo.get_size_display(),
                'material_principal': ecoladrillo.material_principal.nombre,
                'cantidad_stock': ecoladrillo.cantidad,
                'cantidad_material_requerida': ecoladrillo.cantidad_material_requerida
            }
            
            if ecoladrillo.cantidad == 0:
                ecoladrillos_sin_stock.append(ecoladrillo_data)
            else:
                ecoladrillos_con_stock.append(ecoladrillo_data)
        
        # Obtener materiales sin stock
        materiales_sin_stock = []
        materiales_con_stock = []
        
        for material in Material.objects.all():
            material_data = {
                'id': material.id_insumo,
                'nombre': material.nombre,
                'tipo': material.tipo,
                'cantidad_disponible': material.cantidad_disponible,
                'unidad_medida': material.unidad_medida
            }
            
            if material.cantidad_disponible == 0:
                materiales_sin_stock.append(material_data)
            else:
                materiales_con_stock.append(material_data)
        
        # Guardar en datos_reporte
        self.datos_reporte = {
            'ecoladrillos_sin_stock': ecoladrillos_sin_stock,
            'ecoladrillos_con_stock': ecoladrillos_con_stock,
            'materiales_sin_stock': materiales_sin_stock,
            'materiales_con_stock': materiales_con_stock,
            'resumen': {
                'total_ecoladrillos_sin_stock': len(ecoladrillos_sin_stock),
                'total_ecoladrillos_con_stock': len(ecoladrillos_con_stock),
                'total_materiales_sin_stock': len(materiales_sin_stock),
                'total_materiales_con_stock': len(materiales_con_stock)
            }
        }
        self.save()
        return self.datos_reporte
    
    def __str__(self):
        return f"Reporte Resumen Inventario {self.id_reporte} - {self.get_tipo_reporte_display()}"

class ReporteResumenRetiros(Reporte):
    fecha_inicio = models.DateField(null=True, blank=True)  # Para reportes de stock en período
    fecha_fin = models.DateField(null=True, blank=True)  # Para reportes de stock en período
    
    def generar_datos_retiros(self):
        """Genera los datos de retiros en el período especificado"""
        
        # Filtrar retiros por fecha si están especificadas
        retiros_query = RetiroEcoladrillo.objects.all()
        
        if self.fecha_inicio:
            retiros_query = retiros_query.filter(fecha__gte=self.fecha_inicio)
        if self.fecha_fin:
            retiros_query = retiros_query.filter(fecha__lte=self.fecha_fin)
        
        # Procesar datos de retiros
        retiros_data = []
        total_cantidad_retirada = 0
        ecoladrillos_retirados = {}
        
        for retiro in retiros_query:
            retiro_data = {
                'id_retiro': retiro.id_retiro,
                'fecha': retiro.fecha.isoformat(),
                'ecoladrillo_nombre': retiro.ecoladrillo.nombre,
                'ecoladrillo_size': retiro.ecoladrillo.get_size_display(),
                'cantidad': retiro.cantidad,
                'motivo': retiro.motivo
            }
            retiros_data.append(retiro_data)
            total_cantidad_retirada += retiro.cantidad
            
            # Agrupar por ecoladrillo
            ecoladrillo_key = f"{retiro.ecoladrillo.nombre} ({retiro.ecoladrillo.get_size_display()})"
            if ecoladrillo_key not in ecoladrillos_retirados:
                ecoladrillos_retirados[ecoladrillo_key] = {
                    'nombre': retiro.ecoladrillo.nombre,
                    'size': retiro.ecoladrillo.get_size_display(),
                    'total_retirado': 0,
                    'numero_retiros': 0
                }
            ecoladrillos_retirados[ecoladrillo_key]['total_retirado'] += retiro.cantidad
            ecoladrillos_retirados[ecoladrillo_key]['numero_retiros'] += 1
        
        # Guardar en datos_reporte
        self.datos_reporte = {
            'periodo': {
                'fecha_inicio': self.fecha_inicio.isoformat() if self.fecha_inicio else None,
                'fecha_fin': self.fecha_fin.isoformat() if self.fecha_fin else None
            },
            'retiros': retiros_data,
            'resumen_por_ecoladrillo': list(ecoladrillos_retirados.values()),
            'estadisticas': {
                'total_retiros': len(retiros_data),
                'total_cantidad_retirada': total_cantidad_retirada,
                'tipos_ecoladrillos_diferentes': len(ecoladrillos_retirados)
            }
        }
        self.save()
        return self.datos_reporte
    
    def __str__(self):
        return f"Reporte Resumen Retiros {self.id_reporte} - {self.get_tipo_reporte_display()}"