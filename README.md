<p align="center">
  <a href="https://www.teggium.com" target="blank"><img width="200" src="https://uatprestomsh.teggium.com/assets/images/logos/logo-teggium-dark.svg"  alt="Teggium_logo" /></a>
</p>

<p align="center">API Gateway • <b>Marsh</b></p>

## 🛠️ Instaladores

Herramientas requeridas para el desarrollo.

| Nombre                                                                                | Command                |
| :------------------------------------------------------------------------------------ | :--------------------- |
| [Visual Studio Code](https://code.visualstudio.com/)                                  | -                      |
| [Node.js](https://nodejs.org/dist/v18.16.0/node-v18.16.0-x64.msi)                     | -                      |
| [MongoDB](https://fastdl.mongodb.org/windows/mongodb-windows-x86_64-6.0.5-signed.msi) | -                      |
| [Git](https://git-scm.com/download/win)                                               | \_                     |
| [Postman](https://dl.pstmn.io/download/latest/win64)                                  | -                      |
| [NestJS](https://angular.io/guide/setup-local#install-the-angular-cli)                | `npm i -g @nestjs/cli` |

## 📄 Extensiones y configuraciones

Se detalla algunas extensiones y/o configuraciones que nos permitirá mejorar la productividad y calidad de nuestro código:

| Extensión                                                                                                | Extension Id                          |
| :------------------------------------------------------------------------------------------------------- | :------------------------------------ |
| [Error Lens](https://marketplace.visualstudio.com/items?itemName=usernamehw.errorlens)                   | `usernamehw.errorlens`                |
| [Image preview](https://marketplace.visualstudio.com/items?itemName=kisstkondoros.vscode-gutter-preview) | `kisstkondoros.vscode-gutter-preview` |
| [Import Cost](https://marketplace.visualstudio.com/items?itemName=wix.vscode-import-cost)                | `wix.vscode-import-cost`              |
| [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)                   | `esbenp.prettier-vscode`              |
| [TODO Highlight](https://marketplace.visualstudio.com/items?itemName=wayou.vscode-todo-highlight)        | `wayou.vscode-todo-highlight`         |
| [Todo Tree](https://marketplace.visualstudio.com/items?itemName=Gruntfuggly.todo-tree)                   | `Gruntfuggly.todo-tree`               |
| [SonarLint](https://marketplace.visualstudio.com/items?itemName=SonarSource.sonarlint-vscode)            | `SonarSource.sonarlint-vscode`        |
| [Turbo Console Log](https://marketplace.visualstudio.com/items?itemName=ChakrounAnas.turbo-console-log)  | `ChakrounAnas.turbo-console-log`      |
| [Peacock](https://marketplace.visualstudio.com/items?itemName=johnpapa.vscode-peacock)                   | `johnpapa.vscode-peacock`             |
| [indent-rainbow](https://marketplace.visualstudio.com/items?itemName=oderwat.indent-rainbow)             | `oderwat.indent-rainbow`              |

En el `settings.json` de su **VS Code** agregar la siguiente configuración:

```bash
 "omnisharp.organizeImportsOnFormat": true,
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.organizeImports": "explicit"
  },
  "typescript.updateImportsOnFileMove.enabled": "always",
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "javascript.updateImportsOnFileMove.enabled": "always",
  "editor.fontLigatures": true,
  "editor.guides.bracketPairs": true,
  "editor.guides.bracketPairsHorizontal": true
```

## 📄 MongoDB Database Tools

Para utilizar los siguientes comandos es necesario descargar [MongoDB Command Line Database Tools Download](https://www.mongodb.com/try/download/database-tools).

- Es necesario registrar la ruta generada **Ejem:** `C:\Program Files\MongoDB\Tools\100\bin` en `Environment Variables` del usuario **(PATH)**.

| Comando                                                                   | Extension Id                                            |
| :------------------------------------------------------------------------ | :------------------------------------------------------ |
| [mongodump](https://www.mongodb.com/docs/database-tools/mongodump/)       | `mongodump -d <MI_DATABASE> -o <MI_RUTA_DESTINO>`       |
| [mongorestore](https://www.mongodb.com/docs/database-tools/mongorestore/) | `mongorestore -d <MI_DATABASE_DESTINO> <MI_RUTA_DUMP>"` |

## 📄 Environment Variables

Para ejecutar el proyecto es necesario crear un archivo en la carpeta raiz llamado `.env` con las siguiente variables:

```bash
# PORT: Puerto para iniciar la aplicación
PORT=5080

# APP: Configuración de la aplicación
# 1. CORS: Urls de la web y el portal (Separados por coma ;)
# 2. LIMIT_PAYLOAD: Tamaño máximo de la solicitud
# 3. PREFIX: Prefijo de las solicitudes
# 4. TIMELOGOUT: Tiempo de inactividad máx. en minutos para cerrar sesión automáticamente
# 5. TIMEOUT: Tiempo de espera para procesar una solicitud
# 6. WEB: Url de la aplicación web de Lockton
# 7. TIME_LOGIN: Tiempo de espera para ingresar al sistema, en caso de que se cierre el explorador sin hacer logout
MSH_APP_CORS=http://localhost:5081;http://localhost:5082
MSH_APP_LIMIT_PAYLOAD=25mb
MSH_APP_PREFIX=api
MSH_APP_TIMELOGOUT=40
MSH_APP_TIMEOUT=10000
MSH_APP_WEB=http://localhost:5081
MSH_APP_TIME_LOGIN=2

# DATABASE: Uri de conexión a mongoDB
MSH_DATABASE_URI=mongodb://localhost:27017/marsh

# JRWT: Tiempo de expiración del refreshToken
MSH_JRWT_EXPIRES_IN=24h

# JWT:
# 1. EXPIRES_IN: Tiempo de expiración del jwt
# 2. PORTAL_COUNTDOWN_SECONDS: Contador regresivo en segundos para cerrar el sesión en el Portal
# 3. PORTAL_EXPIRES_IN: Tiempo de sesión del Portal
# 4. PORTAL_COUNTDOWN_MESSAGE: Determina el tiempo en que aparecera el mensaje debe ser menor al  portal_expires_in
# 5. SECRET: Clave secreta
# 6. URL: ...
MSH_JWT_EXPIRES_IN=5h
MSH_JWT_PORTAL_COUNTDOWN_SECONDS=20
MSH_JWT_PORTAL_EXPIRES_IN=5h
MSH_JWT_PORTAL_COUNTDOWN_MESSAGE=1m
MSH_JWT_SECRET=0fccebb2-60e9-48cd-9e02-487ebf98e910
MSH_JWT_URL=https://insurance.com.mx

# MAIL
# 1. HOST: Servidor SMTP
# 2. SECURE: Cifrado de la conexión con SSL/TLS (true o false)
# 3. PORT: Puerto del servidor a conectarse
# 4. USER: Correo electrónico para autenticarse
# 5. PASSWORD: Contraseña del correo para autenticarse
# 6. FROM: Nombre asociado al correo electrónico del remitente
MSH_MAIL_HOST=smtp.gmail.com
MSH_MAIL_SECURE=true
MSH_MAIL_PORT=465
MSH_MAIL_USER=micorreo@dominio.com
MSH_MAIL_PASSWORD=**********
MSH_MAIL_FROM=Notificaciones Teggium

# NOTIFICATIONS
# 1. CORREO_COPIA: Destinatarios para CC (Múltiples correos separados por ;)
# 2. MAXIMUM_SIZE_IN_MB: Tamaño máximo del archivo en MB
MSH_NOTIFICATIONS_CORREO_COPIA=micorreo.copia@dominio.com
MSH_NOTIFICATIONS_MAXIMUM_SIZE_IN_MB=25

# REPOSITORY
# 1. PATH: Carpeta para guardar los archivos que se generan
# 2. SEPARATOR: Separador de rutas de carpetas (Windows: \ Mac: /)
MSH_REPOSITORY_PATH=C:\Files\Marsh
MSH_REPOSITORY_SEPARATOR=\

# SWAGGER
# 1. DESCRIPTION: Descripción de la aplicación
# 2. ENABLED: Habilita o deshabilita swagger (true o false)
# 2. TITLE: Título de la aplicación
# 3. VERSION: Versión de la aplicación
MSH_SWAGGER_DESCRIPTION=API Gateway - Marsh (Fianzas)
MSH_SWAGGER_ENABLED=true
MSH_SWAGGER_TITLE=API Gateway - Marsh (Fianzas)
MSH_SWAGGER_VERSION=1.0

# URLS
# 1. DOCUMENTS_MANAGER: Url del api de File.Manager
MSH_URL_DOCUMENTS_MANAGER=https://localhost:7169

# TEMP (Eliminar al pasar notificaciones)
NOTIFICACIONES_URL=http://localhost:4010

# TASKS
#1 TASK_NOTIFICATIONS_REMINDER_EVERY= Se considera m para minutos y h para horas.
MSH_TASK_NOTIFICATIONS_REMINDER_EVERY=5m
# time_zone del proyecto
MSH_TIME_ZONE=`America/Mexico_City`

```

## 🛠️ Iniciar aplicación (Development)

Se requiere tener en ejecución los siguientes proyectos:

| Aplicación                                | Url                     |
| :---------------------------------------- | :---------------------- |
| [Web](http://localhost:5081)              | `http://localhost:5081` |
| [Portal Asegurado](http://localhost:5082) | `http://localhost:5082` |

Para iniciar la aplicación se necesita ejecutar alguno de estos comandos:

```bash
npm run start:dev
```

## 🛠️ Despliegue

- Obtener el compilado del aplicativo para publicar en otro ambiente:

| Ambiente | Comando          |
| :------- | :--------------- |
| DEV      | `npm run deploy` |
| QA       | `npm run deploy` |
| PROD     | `npm run deploy` |

- En el ambiente, posicionarse en la carpeta **root**, abrir el **cmd** y ejecutar el siguiente comando:

```bash
npm i --only=production
```
