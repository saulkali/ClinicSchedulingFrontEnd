CLINIC SCHEDULING FRONTEND

Este proyecto corresponde al frontend de la API ClinicSchedulingAPI. 
La aplicación fue desarrollada utilizando React.js y se enfoca en consumir los endpoints expuestos por el backend
para la gestión de doctores, pacientes, citas y disponibilidad.

REPOSITORIOS

Backend API:
https://github.com/saulkali/ClinicSchedulingAPI.git

Frontend:
https://github.com/saulkali/ClinicSchedulingFrontEnd.git


DEMO

Se puede consultar una demo funcional desplegada en un servidor físico en la siguiente URL:

Frontend:
http://170.80.240.210:4445/

Swagger Backend:
http://170.80.240.210:4444/swagger/index.html


ARQUITECTURA

El proyecto fue desarrollado utilizando el patrón de arquitectura MVVM (Model-View-ViewModel),
una arquitectura comúnmente utilizada en aplicaciones que manejan interfaces de usuario complejas.

Ventajas aplicadas en este proyecto:

- Separación clara entre UI y lógica de negocio
- Reutilización de lógica en ViewModels
- Mejor mantenibilidad del código
- Escalabilidad para agregar nuevos módulos
- Manejo centralizado del estado


FUNCIONALIDADES DESTACADAS

- Login con roles (Admin, Doctor, Patient)
- Dashboard según rol
- Gestión de citas médicas
- Visualización de disponibilidad por doctor
- Validaciones de negocio desde frontend
- Alertas para pacientes con múltiples cancelaciones

Ejemplo:
El sistema alerta a los pacientes cuando tienen más de 4 cancelaciones dentro de un período de 1 mes.


USUARIOS DE PRUEBA

Si se restauró el backup incluido en el proyecto backend, se pueden utilizar los siguientes usuarios:

Administrador:
admin@clinic.com  
Password: 123456

Paciente:
paciente@clinic.com  
Password: 123456

Doctor:
doctor@clinic.com  
Password: 123456


ROLES DEL SISTEMA

El sistema contempla los siguientes roles:

- ADMIN
- DOCTOR
- PATIENT
- DOCTORS (rol de gestión)
- PATIENTS (rol de gestión)

Dependiendo del rol, la UI mostrará diferentes módulos y funcionalidades.


CÓMO HACER DEPLOY

Dentro del proyecto se incluye un archivo Dockerfile que permite desplegar la aplicación fácilmente
en un contenedor Docker.

Construir la imagen:

docker build -t clinicscheduling-frontend .

Ejecutar el contenedor:

docker run -d -p 4445:80 --name clinicscheduling-frontend clinicscheduling-frontend

Esto expondrá la aplicación en:

http://localhost:4445


CONFIGURACIÓN DE API

La URL del backend puede configurarse mediante variables de entorno o directamente
en los archivos de configuración del proyecto.

Ejemplo:

VITE_API_URL=http://localhost:4444

o para producción:

VITE_API_URL=http://170.80.240.210:4444


VARIABLES DE ENTORNO

Las variables de entorno se encuentran dentro del archivo:

.env

Ahí se pueden configurar valores como:

VITE_API_URL=http://localhost:4444

Alternativamente, también pueden configurarse directamente dentro del archivo:

src/config/env.ts

Esto permite mayor flexibilidad dependiendo del entorno:

- Desarrollo local
- Staging
- Producción
- Docker


PIPELINES Y DESPLIEGUE AUTOMÁTICO

El proyecto cuenta con integración CI/CD configurada. 
Cualquier modificación realizada en los repositorios puede reflejarse automáticamente
en el servidor de despliegue, reduciendo tiempos manuales de publicación.

Los despliegues están automatizados mediante pipelines configurados en Azure DevOps,
aunque pueden adaptarse fácilmente a:

- Jenkins
- GitHub Actions
- GitLab CI

Esto permite:

- Build automático
- Ejecución de pruebas
- Construcción de imagen Docker
- Despliegue automático
- Actualizaciones sin intervención manual