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
    id_ecoladrillo = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=100)
    descripcion = models.TextField()
    cantidad = models.IntegerField(default=0) # c

    def __str__(self):
        return self.nombre
    def agregar_stock(self, cantidad):
        """Aumenta la cantidad de ecoladrillos"""
        if cantidad < 0:
            raise ValueError("La cantidad debe ser positiva")
        self.cantidad += cantidad
        self.save()
    

class Material(models.Model):
    id_insumo = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=100)
    tipo = models.CharField(max_length=50)
    cantidad_disponible = models.IntegerField(default=0)
    unidad_medida = models.CharField(max_length=20)
    cantidad_para_ecoladrillo = models.IntegerField(default=0)  # Cantidad de material usado por ecoladrillo

    def __str__(self):
        return self.nombre

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
    ecoladrillo = models.ForeignKey(Ecoladrillo, on_delete=models.CASCADE, null =True, blank=True) # Temporal
    cantidad = models.IntegerField(default=0)
    material_usado = models.ForeignKey(Material, on_delete=models.CASCADE)

    def __str__(self):
        return f"Registro {self.id_registro} - Fecha: {self.fecha} - Cantidad: {self.cantidad}"
    
    def save(self, *args, **kwargs):
        if not self.pk:
            """Aumenta la cantidad de ecoladrillos cuando se crea un nuevo registro"""

            if self.cantidad < 0:
                raise ValueError("La cantidad debe ser positiva")
            
            if not self.ecoladrillo:
                raise ValueError("El ecoladrillo es requerido")
                
            cantidad_usado_material = self.cantidad * self.material_usado.cantidad_para_ecoladrillo
            if self.material_usado.cantidad_disponible < cantidad_usado_material:
                raise ValueError("No hay suficiente material disponible para registrar")
        
            super().save(*args, **kwargs)
            
            self.ecoladrillo.agregar_stock(self.cantidad)
            self.material_usado.reducir_stock(cantidad_usado_material)
        else:
            # Si ya existe, solo guardar sin modificar stock
            super().save(*args, **kwargs)


class RetiroEcoladrillo(models.Model):
    id_retiro = models.AutoField(primary_key=True)
    fecha = models.DateField()
    cantidad = models.IntegerField(default=0)
    motivo = models.CharField(max_length=200)

    def __str__(self):
      return self.motivo
    
class RegistroMaterial(models.Model):
    id_registro_material = models.AutoField(primary_key=True)
    id_ingreso = models.IntegerField()
    fecha = models.DateField()
    cantidad = models.IntegerField(default=0)
    material = models.ForeignKey(Material, on_delete=models.CASCADE)
    origen = models.CharField(max_length=100, default='')

    def __str__(self):
        return self.id_ingreso

class Reporte(models.Model):
    id_reporte = models.AutoField(primary_key=True)
    fecha_generacion = models.DateField()
    fecha_inicio = models.DateField()
    fecha_fin = models.DateField()

    def __str__(self):
        return f"Reporte {self.id_reporte} - Fecha: {self.fecha_generacion}"

