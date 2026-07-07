# Mini Banco Digital

Aplicación React + Firebase para simular una banca digital básica.

## Funcionalidades

- Registro e inicio de sesión con Firebase Authentication.
- Creación de usuario en Firestore con saldo inicial de $100.000.
- Dashboard con nombre, email y saldo en tiempo real.
- Transferencias entre usuarios por email.
- Historial de movimientos enviados y recibidos en tiempo real.
- Cierre de sesión con limpieza de estado.
- Depósito y retiro simulado como bonus.

## Modelo de datos

```txt
users/{uid} -> {
  nombre,
  email,
  saldo,
  creadoEn
}

movimientos/{id} -> {
  emisorUid,
  receptorUid,
  emisorEmail,
  receptorEmail,
  monto,
  fecha,
  descripcion
}
```

## Instalación

```bash
npm install
npm run dev
```

## Configuración de Firebase

Crear un archivo `.env` en la raíz del proyecto usando las claves de `.env.example`.

```txt
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_auth_domain
VITE_FIREBASE_PROJECT_ID=tu_project_id
VITE_FIREBASE_STORAGE_BUCKET=tu_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
VITE_FIREBASE_APP_ID=tu_app_id
```

En Firebase se debe activar:

- Authentication con Email/Password.
- Cloud Firestore.

## Usuarios de prueba

Crear desde la app:

```txt
Usuario 1
Nombre: Paola
Email: paola@test.com
Contraseña: 123456

Usuario 2
Nombre: Ana
Email: ana@test.com
Contraseña: 123456
```

## Uso de IA

Usé IA para ordenar la estructura del proyecto, separar la lógica de Firebase en servicios y revisar validaciones. También la usé para entender mejor el uso de onSnapshot, useEffect y transacciones. Revisé el código antes de integrarlo para poder explicarlo en la defensa.
