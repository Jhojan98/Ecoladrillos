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
    cantidad = models.IntegerField(default=0)

    def __str__(self):
        return self.nombre
   

class Material(models.Model):
    id_insumo = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=100)
    tipo = models.CharField(max_length=50)
    cantidad_disponible = models.IntegerField(default=0)
    unidad_medida = models.CharField(max_length=20)

    def __str__(self):
        return self.nombre

class RegistroEcoladrillo(models.Model):
    id_registro = models.AutoField(primary_key=True)
    fecha = models.DateField()
    cantidad = models.IntegerField(default=0)
    material_usado = models.ForeignKey(Material, on_delete=models.CASCADE)

    def __str__(self):
        return f"Registro {self.id_registro} - Fecha: {self.fecha} - Cantidad: {self.cantidad}"

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

