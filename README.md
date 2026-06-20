# GymApp

Es una webapp para el sistema SaaS multi-tenant orientado a dueños de gimnasios. Está desarrollada con desarrollada con Angular 21, Tailwind CSS. 

El flujo del usuario es muy sencillo, empieza por el inicio de sesión y continúa con la navegación asistida por la barra lateral:

- Dashboard
- Miembros
- Membresías (**No implementado**)
- Configuración (**No implementado**)

> Hay un guard general que evalúa si el usuario se logueo o no, por lo que no te permitirá ingresar a otras rutas de la página sin antes loguearte (e.g. `app/dashboard`)

## Dependencias

Esta app consume un servicio de autenticación [auth-service](https://github.com/guillermovez/auth-service) creado con Spring Boot, está dockerizado para facilitar su despliegue.
