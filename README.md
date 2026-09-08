# Red de Bicicletas — Express, Mongoose, Passport, JWT, Heroku y login social

## Módulo 3: Deploy en Heroku, Mongo Atlas, SendGrid, login social y monitoreo

### Qué se agregó
- **config/database.js** — conecta a Mongo local en desarrollo, y a Mongo Atlas (`MONGO_URI`) cuando `NODE_ENV=production`.
- **config/mailer.js** — en desarrollo manda los emails por Ethereal; en producción, por SendGrid.
- **models/usuario.js** — métodos `findOneOrCreateByGoogle` y `findOneOrCreateByFacebook`.
- **config/passport.js** — estrategias `google` (OAuth2) y `facebook-token` (valida el access_token del cliente contra la Graph API de Facebook).
- **routes/auth-social.js** — `/auth/google`, `/auth/google/callback`, `POST /auth/facebook/token`.
- **app.js** — `require('newrelic')` como primera línea del archivo.
- **Procfile** y **newrelic.js** — listos para Heroku.

### Variables de entorno necesarias
Ver `.env.example`. En local, copiala como `.env`. En Heroku, se cargan como Config Vars (ver guía de deploy).

### Deploy a Heroku (resumen)
```bash
heroku login
heroku create nombre-de-tu-app
heroku config:set NODE_ENV=production
heroku config:set MONGO_URI="mongodb+srv://usuario:password@tu-cluster.mongodb.net/red_bicicletas"
heroku config:set JWT_SECRET="..."
heroku config:set SESSION_SECRET="..."
heroku config:set SENDGRID_API_KEY="..."
heroku config:set APP_URL="https://nombre-de-tu-app.herokuapp.com"
git push heroku main
```

### Verificación
- Local: `npm start` conecta a Mongo local y manda mails por Ethereal.
- Producción (Heroku): conecta a Mongo Atlas y manda mails por SendGrid.
- `GET /api/bicicletas` sin token → 401. Con `Authorization: Bearer <token>` (obtenido en `POST /api/auth/login`) → 200.

## Módulo 2: Autenticación (recordatorio)
Registro, login, verificación de cuenta por email, recupero de contraseña, JWT en la API. Ver `controllers/usuario.js`, `routes/usuarios.js`, `views/usuarios/`.

## Módulo 1: CRUD de Bicicletas (recordatorio)
`models/bicicleta.js`, `controllers/bicicleta.js`, `routes/bicicleta.js`, tests en `spec/` (`npm test`).
