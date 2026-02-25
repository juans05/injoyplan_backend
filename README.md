# Injoyplan Backend

API REST para la plataforma social Injoyplan, construida con NestJS, Prisma y PostgreSQL.

## 🚀 Características

- ✅ **Autenticación completa**: Registro, login, verificación de email, recuperación de contraseña con JWT
- ✅ **Dos tipos de usuarios**: Persona normal y Empresa (Barranco Bar)
- 🔄 **Perfiles de usuario**: Avatar, descripción, seguidores/seguidos
- 📝 **Publicaciones**: Con likes y me encanta
- 🎉 **Eventos**: Gestión completa de eventos con fechas, ubicaciones y favoritos
- 💬 **Chat**: Individual y grupal
- 👥 **Sistema de amigos**: Solicitudes, aceptación, rechazo
- 📍 **Ubicaciones**: Departamentos, provincias, distritos
- 🔍 **Explorar**: Búsqueda y filtrado de eventos

## 📋 Prerrequisitos

- Node.js 18+
- PostgreSQL 14+
- pnpm 8+

## 🛠️ Instalación

1. Instalar dependencias:
```bash
pnpm install
```

2. Configurar variables de entorno:
```bash
cp .env.example .env
```

Editar `.env` con tus credenciales:
- `DATABASE_URL`: URL de conexión a PostgreSQL
- `JWT_SECRET`: Clave secreta para JWT
- `EMAIL_*`: Configuración de correo (Brevo/Sendinblue)
- `CLOUDINARY_*`: Configuración para subida de imágenes (opcional)

3. Generar el cliente de Prisma y ejecutar migraciones:
```bash
pnpm prisma generate
pnpm prisma migrate dev --name init
```

## 🏃 Ejecución

### Desarrollo
```bash
pnpm run start:dev
```

### Producción
```bash
pnpm run build
pnpm run start:prod
```

El servidor estará disponible en `http://localhost:4201`

## 📚 Documentación API

La documentación Swagger está disponible en: `http://localhost:4201/api-docs`

## 🗂️ Estructura del Proyecto

```
src/
├── auth/               # Autenticación y autorización
│   ├── dto/           # Data Transfer Objects
│   ├── guards/        # Guards de autenticación
│   ├── strategies/    # Estrategias Passport
│   └── decorators/    # Decoradores personalizados
├── users/             # Gestión de usuarios y perfiles
├── events/            # Gestión de eventos
├── posts/             # Publicaciones y likes
├── chat/              # Chat individual y grupal
├── friendships/       # Sistema de amigos
├── favorites/         # Favoritos de eventos
├── locations/         # Ubicaciones geográficas
├── complaints/        # Reclamaciones
└── prisma/            # Servicio de Prisma
```

## 📊 Modelos de Base de Datos

### User
- Información básica del usuario
- Tipos: NORMAL, COMPANY
- Verificación de email
- Recuperación de contraseña

### Profile
- Avatar y cover image
- Descripción personal
- Información adicional

### Event
- Título, descripción, categoría
- Múltiples fechas
- Ubicación
- Estado activo/inactivo
- Eventos destacados

### Post
- Contenido e imagen
- Likes (LIKE/LOVE)

### ChatRoom
- Individual o grupal
- Múltiples participantes
- Mensajes

### Friendship
- Estados: PENDING, ACCEPTED, REJECTED

### Follow
- Sistema de seguidores/seguidos

## 🔐 Endpoints de Autenticación

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/auth/register` | Registrar nuevo usuario |
| POST | `/auth/login` | Iniciar sesión |
| POST | `/auth/verify-email` | Verificar email |
| POST | `/auth/forgot-password` | Solicitar recuperación de contraseña |
| POST | `/auth/reset-password` | Restablecer contraseña |
| GET | `/auth/refresh` | Refrescar token |
| GET | `/auth/me` | Obtener usuario actual |

## 🔒 Seguridad

- **JWT**: Autenticación basada en tokens
- **Bcrypt**: Hash de contraseñas
- **CORS**: Configurado para orígenes específicos
- **Rate Limiting**: Throttler para prevenir abuso
- **Validation Pipes**: Validación automática de DTOs

## 🧪 Testing

```bash
# Unit tests
pnpm run test

# E2E tests
pnpm run test:e2e

# Test coverage
pnpm run test:cov
```

## 📝 Scripts Disponibles

- `start:dev`: Iniciar en modo desarrollo
- `start:prod`: Iniciar en modo producción
- `build`: Compilar el proyecto
- `prisma:generate`: Generar cliente de Prisma
- `prisma:migrate`: Ejecutar migraciones
- `prisma:studio`: Abrir Prisma Studio

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es privado y confidencial.

## 🚧 Estado del Proyecto

### ✅ Completado
- Configuración inicial del proyecto
- Schema de Prisma con todos los modelos
- Módulo de autenticación completo
- Configuración de seguridad (CORS, Throttler, Validation)
- Documentación Swagger

### 🔄 Pendiente
- Módulo de usuarios y perfiles
- Módulo de eventos (migración desde proyecto anterior)
- Módulo de publicaciones
- Módulo de chat
- Módulo de amigos y seguimiento
- Módulo de favoritos
- Módulo de ubicaciones
- Módulo de reclamaciones
