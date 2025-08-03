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
    fecha_consulta = models.DateField(null=True, blank=True)  # Para reportes de stock en fecha
    fecha_inicio = models.DateField(null=True, blank=True)   # Para reportes de período
    fecha_fin = models.DateField(null=True, blank=True)      # Para reportes de período
    datos_reporte = models.JSONField()  # Almacena el contenido del reporte

    def __str__(self):
        operario_nombre = self.operario.nombre if self.operario else 'Sistema'
        return f"Reporte {self.id_reporte} - {self.get_tipo_reporte_display()} - {operario_nombre}"

    class Meta:
        ordering = ['-fecha_generacion']

