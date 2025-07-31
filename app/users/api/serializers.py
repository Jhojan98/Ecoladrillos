from rest_framework import serializers
from django.contrib.auth import authenticate
from ..models import Usuario, PerfilOperario, PerfilAdministrador


class PerfilOperarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = PerfilOperario
        fields = ['cargo', 'fecha_ingreso']
        read_only_fields = ['fecha_ingreso']


class PerfilAdministradorSerializer(serializers.ModelSerializer):
    class Meta:
        model = PerfilAdministrador
        fields = ['nivel_acceso', 'fecha_asignacion']
        read_only_fields = ['fecha_asignacion']


class UsuarioSerializer(serializers.ModelSerializer):
    perfil_operario = PerfilOperarioSerializer(read_only=True)
    perfil_administrador = PerfilAdministradorSerializer(read_only=True)
    password = serializers.CharField(write_only=True)

    class Meta:
        model = Usuario
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'tipo_usuario', 'is_active', 'date_joined', 'last_login',
            'perfil_operario', 'perfil_administrador', 'password'
        ]
        read_only_fields = ['id', 'date_joined', 'last_login']

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = Usuario.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        if password:
            instance.set_password(password)
        
        instance.save()
        return instance


class UsuarioCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)
    cargo = serializers.CharField(required=False, write_only=True)

    class Meta:
        model = Usuario
        fields = [
            'username', 'email', 'first_name', 'last_name',
            'tipo_usuario', 'password', 'password_confirm', 'cargo'
        ]

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Las contraseñas no coinciden")
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        cargo = validated_data.pop('cargo', 'Sin asignar')
        password = validated_data.pop('password')
        
        user = Usuario.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        
        # Si es operario y se proporcionó un cargo, actualizarlo
        if user.tipo_usuario == 'operario' and cargo != 'Sin asignar':
            if hasattr(user, 'perfil_operario'):
                user.perfil_operario.cargo = cargo
                user.perfil_operario.save()
        
        return user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()

    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')

        if username and password:
            user = authenticate(
                request=self.context.get('request'),
                username=username,
                password=password
            )

            if not user:
                raise serializers.ValidationError(
                    'No se pudo autenticar con las credenciales proporcionadas.'
                )

            if not user.is_active:
                raise serializers.ValidationError(
                    'La cuenta de usuario está desactivada.'
                )

            attrs['user'] = user
            return attrs
        else:
            raise serializers.ValidationError(
                'Debe incluir "username" y "password".'
            )


class CambiarPasswordSerializer(serializers.Serializer):
    password_actual = serializers.CharField()
    password_nueva = serializers.CharField(min_length=8)
    password_confirmar = serializers.CharField()

    def validate(self, attrs):
        if attrs['password_nueva'] != attrs['password_confirmar']:
            raise serializers.ValidationError("Las contraseñas nuevas no coinciden")
        return attrs

    def validate_password_actual(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("La contraseña actual es incorrecta")
        return value
