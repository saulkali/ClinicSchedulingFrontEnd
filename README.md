# Clinic Scheduling Frontend

Frontend web de **Clinic Scheduling**, construido con **React + TypeScript + Vite** bajo una estructura inspirada en **MVVM (Model-View-ViewModel)**.

Este repositorio consume la API de backend para gestionar:

- Autenticación y sesión por roles.
- Usuarios, pacientes, doctores y especialidades.
- Citas médicas y disponibilidad de agenda.

---

## Tabla de contenido

1. [Resumen del proyecto](#resumen-del-proyecto)
2. [Stack tecnológico](#stack-tecnológico)
3. [Estructura del proyecto](#estructura-del-proyecto)
4. [Arquitectura MVVM aplicada](#arquitectura-mvvm-aplicada)
5. [Requisitos previos](#requisitos-previos)
6. [Configuración local](#configuración-local)
7. [Variables de entorno](#variables-de-entorno)
8. [Scripts disponibles](#scripts-disponibles)
9. [Flujo de desarrollo recomendado](#flujo-de-desarrollo-recomendado)
10. [Build y despliegue](#build-y-despliegue)
11. [CI/CD](#cicd)
12. [Recursos relacionados](#recursos-relacionados)

---

## Resumen del proyecto

Este frontend implementa una interfaz de gestión clínica con comportamiento condicional por rol, permitiendo separar pantallas y acciones para:

- **ADMIN**
- **DOCTOR**
- **PATIENT**
- Roles de gestión adicionales como **DOCTORS** y **PATIENTS**

La aplicación está pensada para evolucionar modularmente, manteniendo aislada la lógica de negocio del render de UI.

---

## Stack tecnológico

- **Framework UI:** React 19
- **Lenguaje:** TypeScript 5
- **Bundler:** Vite 8
- **UI Components:** Material UI (MUI)
- **Estado / reactividad:** MobX + mobx-react-lite
- **HTTP client:** Axios
- **Ruteo:** react-router-dom
- **Calidad de código:** ESLint

---

## Estructura del proyecto

```text
src/
  common/
    config/          # Configuración de entorno (URLs y paths de API)
    entities/        # Entidades de dominio usadas por ViewModels/Repositories
    helpers/         # Utilidades transversales (fechas, formato, etc.)
    session/         # Manejo de sesión/token
  models/
    irepositories/   # Contratos (interfaces) de acceso a datos
    repositories/    # Implementaciones HTTP de repositorios
  viewmodels/        # Lógica de presentación y casos de uso por pantalla
  views/             # Componentes/páginas React
    components/      # Componentes reutilizables de vistas
```

---

## Arquitectura MVVM aplicada

La implementación se organiza en capas:

- **View (`src/views`)**
  - Renderiza UI y eventos de usuario.
  - No concentra lógica de negocio compleja.
- **ViewModel (`src/viewmodels`)**
  - Coordina estado, validaciones y acciones.
  - Orquesta llamadas a repositorios.
- **Model (`src/models` + `src/common/entities`)**
  - Contratos de datos y acceso a API.
  - Tipado de entidades de dominio.

### Beneficios en este proyecto

- Mayor mantenibilidad por separación de responsabilidades.
- Reutilización de lógica entre pantallas.
- Facilidad para pruebas y evolución funcional.

---

## Requisitos previos

- **Node.js** 20+ recomendado.
- **npm** 10+.
- Backend Clinic Scheduling API disponible y accesible.

---

## Configuración local

1. Clonar repositorio:

```bash
git clone https://github.com/saulkali/ClinicSchedulingFrontEnd.git
cd ClinicSchedulingFrontEnd
```

2. Instalar dependencias:

```bash
npm install
```

3. Configurar variables de entorno (ver sección siguiente).

4. Ejecutar en modo desarrollo:

```bash
npm run dev
```

5. Abrir la URL que indique Vite (usualmente `http://localhost:5173`).

---

## Variables de entorno

La configuración principal vive en `src/common/config/env.ts` y lee variables `VITE_*`.

Ejemplo de `.env` recomendado:

```env
VITE_API_BASE_URL=http://localhost:5078
VITE_AUTH_LOGIN_PATH=/api/auth/login
VITE_ROLE_PATH=/api/role
VITE_USER_PATH=/api/user
VITE_DOCTOR_PATH=/api/doctor
VITE_PATIENT_PATH=/api/patient
VITE_SPECIALTY_PATH=/api/specialty
VITE_APPOINTMENT_PATH=/api/appointment
VITE_DOCTOR_SCHEDULE_PATH=/api/DoctorSchedule
```

> Si una variable no se define, `env.ts` usa valores por defecto razonables para entorno local.

---

## Scripts disponibles

- `npm run dev`: inicia servidor de desarrollo.
- `npm run build`: compila TypeScript y genera build de producción.
- `npm run lint`: ejecuta análisis estático con ESLint.
- `npm run preview`: sirve localmente el build generado.

---

## Flujo de desarrollo recomendado

1. Crear rama por feature o fix.
2. Implementar cambios respetando separación MVVM.
3. Ejecutar lint/build local.
4. Validar flujos por rol impactados.
5. Documentar cambios funcionales y técnicos en los archivos `.md` necesarios.

Para lineamientos más detallados de colaboración, revisar [`CONTRIBUTING.md`](./CONTRIBUTING.md).

---

## Build y despliegue

### Build local

```bash
npm run build
```

### Deploy con Docker

```bash
docker build -t clinicscheduling-frontend .
docker run -d -p 4445:80 --name clinicscheduling-frontend clinicscheduling-frontend
```

Aplicación disponible en:

- `http://localhost:4445`

---

## CI/CD

El repositorio incluye pipeline de Azure DevOps (`azure-pipelines.yml`) que:

1. Copia el código fuente al servidor objetivo vía SSH.
2. Construye imagen Docker.
3. Reemplaza contenedor en ejecución.
4. Publica frontend en puerto `4445`.

---

## Recursos relacionados

- **Backend API:** https://github.com/saulkali/ClinicSchedulingAPI.git
- **Frontend:** https://github.com/saulkali/ClinicSchedulingFrontEnd.git
- **Demo frontend (si está disponible):** http://170.80.240.210:4445/
- **Swagger backend (si está disponible):** http://170.80.240.210:4444/swagger/index.html

---

## Documentación adicional

- [Guía de colaboración para desarrolladores](./CONTRIBUTING.md)
- [Consideraciones de migración Delphi → React](./concideracion_delphi.md)
