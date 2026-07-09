# Mini Banco Digital

Proyecto realizado para la evaluación de Programación Front End.

Es una aplicación hecha con React, Vite, Firebase Authentication y Cloud Firestore. La idea es simular una banca digital básica donde un usuario puede registrarse, iniciar sesión, ver su saldo, transferir dinero a otro usuario y revisar su historial de movimientos.

## Funcionalidades

- Registro de usuarios con Firebase Authentication.
- Inicio de sesión con email y contraseña.
- Creación del perfil del usuario en Firestore con saldo inicial de $100.000.
- Dashboard con nombre, email y saldo actual.
- Saldo actualizado en tiempo real con `onSnapshot`.
- Transferencias entre usuarios por email.
- Validaciones antes de transferir:
  - el monto debe ser mayor a 0,
  - el usuario debe tener saldo suficiente,
  - el destinatario debe existir,
  - el usuario no se puede transferir a sí mismo.
- Historial de movimientos enviados y recibidos en tiempo real.
- Cada movimiento muestra tipo, contraparte, fecha y monto.
- Cierre de sesión con limpieza del estado.
- Depósito y retiro simulado como bonus.
- Filtro de búsqueda en el historial como bonus.

## Tecnologías usadas

- React
- Vite
- Firebase Authentication
- Cloud Firestore
- CSS

## Instalación y ejecución

Primero se deben instalar las dependencias:

```bash
npm install
```

Luego se ejecuta el proyecto:

```bash
npm run dev
```

La aplicación se abre en:

```txt
http://localhost:5173/
```

## Configuración de Firebase

El proyecto usa variables de entorno para no dejar las credenciales directamente escritas en el código.

Se debe crear un archivo `.env` en la raíz del proyecto usando como base el archivo `.env.example`.

Formato del archivo `.env`:

```txt
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_auth_domain
VITE_FIREBASE_PROJECT_ID=tu_project_id
VITE_FIREBASE_STORAGE_BUCKET=tu_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
VITE_FIREBASE_APP_ID=tu_app_id
```

El archivo `.env` no se sube al repositorio porque está agregado en `.gitignore`.

En Firebase se debe tener activado:

- Authentication con Email/Password.
- Cloud Firestore.

## Usuarios de prueba

Usuario 1:

```txt
Nombre: Eren Yeager
Email: eren.yeager@gmail.com
Contraseña: 123456
```

Usuario 2:

```txt
Nombre: Levi Ackerman
Email: levi.ackerman@gmail.com
Contraseña: 123456
```

## Modelo de datos

### Colección users

```txt
users/{uid}
```

Guarda los datos principales de cada usuario.

```js
{
  nombre: string,
  email: string,
  saldo: number,
  creadoEn: timestamp
}
```

### Colección movimientos

```txt
movimientos/{id}
```

Guarda las transferencias, depósitos y retiros.

```js
{
  emisorUid: string,
  receptorUid: string,
  emisorEmail: string,
  receptorEmail: string,
  monto: number,
  fecha: timestamp,
  descripcion: string
}
```

## Manejo de eventos y estado

La aplicación usa formularios controlados, por lo que los valores de los inputs viven en el estado con `useState`.

Los formularios usan `event.preventDefault()` para evitar que la página se recargue al enviar.

También se deshabilitan botones mientras una operación se está procesando, para evitar dobles envíos.

Las suscripciones a Firebase se manejan con `useEffect` y se limpian usando `unsubscribe()` cuando cambia el usuario o se cierra sesión.

## Uso de IA

Usé IA como apoyo durante el desarrollo, pero fui revisando y probando el código antes de dejarlo en el proyecto.

La IA me ayudó a ordenar la estructura inicial, separar la lógica de Firebase en el archivo `bankService.js` y entender mejor el uso de `onSnapshot`, `useEffect` y las transacciones de Firestore.

También me sirvió para detectar y corregir errores. Por ejemplo, al principio el historial no mostraba la fecha del movimiento, así que agregué una función para formatearla y mostrarla en la interfaz. Además, una versión de la consulta del historial usaba `orderBy`, pero eso podía generar problemas de índices en Firestore, por lo que lo cambié y dejé el ordenamiento en React.

Otro problema fue que algunos usuarios existían en Firebase Authentication, pero no tenían perfil creado en Firestore. Para solucionarlo agregué una validación que crea el perfil automáticamente si no existe. También corregí detalles del formulario, como limpiar estados y evitar autocompletados molestos del navegador.

En resumen, usé IA como guía para avanzar y revisar errores, pero fui probando la app, entendiendo los cambios y ajustando el código para que funcionara según lo pedido.

También agregué un filtro para buscar movimientos por email o tipo de movimiento, y lo probé con los usuarios de prueba.