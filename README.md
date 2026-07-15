# Mini Banco Digital

Proyecto realizado para la evaluación de Programación Front End.

Este proyecto es una aplicación de banco digital simple, hecha con React, Vite y Firebase. La idea era simular un sistema donde una persona pueda registrarse, iniciar sesión, ver su saldo, hacer transferencias a otro usuario y revisar su historial de movimientos.

Para esta evaluación también se agregaron pruebas unitarias usando Vitest y React Testing Library.

## Funcionalidades principales

- Registro de usuarios con Firebase Authentication.
- Inicio de sesión con email y contraseña.
- Creación de perfil de usuario en Firestore.
- Saldo inicial de $100.000.
- Dashboard con nombre, email y saldo actual.
- Saldo actualizado en tiempo real.
- Transferencias por email a otros usuarios.
- Validaciones antes de transferir.
- Historial de movimientos enviados y recibidos.
- Búsqueda en el historial.
- Cierre de sesión.
- Depósito y retiro simulado como bonus.

## Tecnologías usadas

- React
- Vite
- Firebase Authentication
- Cloud Firestore
- CSS
- Vitest
- React Testing Library
- user-event
- jsdom

## Instalación del proyecto

Primero se deben instalar las dependencias:

```bash
npm install
```

Luego se puede ejecutar el proyecto con:

```bash
npm run dev
```

La aplicación se abre normalmente en:

```txt
http://localhost:5173/
```

## Configuración de Firebase

El proyecto usa variables de entorno para no dejar las credenciales directamente en el código.

Se debe crear un archivo `.env` en la raíz del proyecto, usando como ejemplo el archivo `.env.example`.

Ejemplo del archivo `.env`:

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

Esta colección guarda los datos principales del usuario.

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

Esta colección guarda los movimientos realizados en la aplicación.

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

## Manejo de estado y eventos

En el proyecto se usaron estados con `useState` para manejar los formularios, mensajes, usuario actual, perfil, saldo y movimientos.

Los formularios usan `event.preventDefault()` para evitar que la página se recargue al enviar.

También se usan estados como `procesando` para deshabilitar botones mientras se realiza una acción, por ejemplo al iniciar sesión, registrarse o hacer una transferencia.

Las suscripciones a Firebase se manejan con `useEffect`, y se limpian con `unsubscribe()` cuando corresponde.

## Evaluación 2: Testing unitario

En esta segunda parte se agregaron pruebas unitarias al proyecto.

Para esto se configuró Vitest junto con React Testing Library, user-event y jsdom.

La idea fue probar las partes más importantes del proyecto sin conectarse a Firebase real durante los tests.

## Comandos para los tests

Para ejecutar los tests:

```bash
npm test
```

Para ejecutar los tests una sola vez:

```bash
npm test -- --run
```

Para generar la cobertura:

```bash
npm run coverage
```

## Tests realizados

Se hicieron pruebas en tres partes principales del proyecto.

### 1. Validaciones de transferencia

Archivo:

```txt
src/utils/validaciones.test.js
```

En estos tests se revisó la lógica de validación antes de hacer una transferencia.

Se probaron casos como:

- Monto negativo.
- Monto en cero.
- Monto no numérico.
- Monto con decimales.
- Monto con puntos o comas.
- Monto mayor al saldo disponible.
- Transferencia al mismo usuario.
- Email vacío.
- Email inválido.
- Transferencia válida.

También se usó `it.each` para probar varios montos inválidos de forma más ordenada.

### 2. Formulario de transferencia

Archivo:

```txt
src/components/TransferForm.test.jsx
```

En estos tests se revisó el comportamiento del formulario desde el punto de vista del usuario.

Se comprobó que:

- Se muestran los campos y el botón de enviar.
- Aparece un error si el email no es válido.
- Aparece un error si el monto tiene punto.
- No se llama al servicio si los datos son inválidos.
- Se llama al servicio una sola vez cuando la transferencia es válida.
- Aparece un error si el destinatario no existe.
- Aparece un error si falla el servicio de transferencia.

### 3. Historial de movimientos

Archivo:

```txt
src/components/Historial.test.jsx
```

En estos tests se revisó que el historial funcione correctamente.

Se comprobó que:

- Muestre un mensaje cuando no hay movimientos.
- Muestre los movimientos existentes.
- Ordene los movimientos del más reciente al más antiguo.
- Distinga entre envíos y recepciones.
- Permita filtrar movimientos.
- Muestre un mensaje cuando no se encuentran resultados.

## Mocking de servicios

Para los tests no se usó Firebase real.

Se usaron mocks con `vi.mock` y `vi.fn` para simular funciones del servicio, por ejemplo:

```txt
buscarUsuarioPorEmail
transferirDinero
```

Esto permite probar casos correctos y casos con error sin depender de internet, Firebase o Firestore.

## Refactor realizado

Para poder testear mejor el proyecto, separé algunas partes del código.

Antes había más lógica junta en `App.jsx`, pero para las pruebas era mejor separar responsabilidades.

Se hicieron estos cambios:

- Se creó `src/utils/validaciones.js` para dejar las validaciones de transferencia en una función pura.
- Se creó el componente `TransferForm`.
- Se creó el componente `Historial`.
- Se dejó `App.jsx` más ordenado y con menos responsabilidades.

Un caso importante fue el input del monto. Al principio usaba `type="number"`, pero al probar el valor `5.000`, el navegador lo tomaba como `5`. Por eso cambié ese input a `type="text"` y dejé la validación en una función aparte.

Esto ayudó a que el comportamiento fuera más claro y más fácil de probar.

## Resultado de los tests

Resultado final:

```txt
Test Files  3 passed
Tests       23 passed
```

## Cobertura obtenida

Resultado del comando `npm run coverage`:

```txt
Statements: 94.11%
Branches:   87.03%
Functions:  100%
Lines:      96.96%
```

La cobertura supera el mínimo solicitado de 70%.

## Uso de IA

Usé IA como apoyo durante el desarrollo del proyecto, pero fui revisando y probando los cambios antes de dejarlos listos.

En la primera parte me ayudó a ordenar algunas ideas, revisar validaciones y separar mejor la lógica de Firebase en servicios.

En la segunda parte la usé como apoyo para entender mejor cómo armar los tests unitarios, cómo usar mocks y cómo separar componentes para que fueran más fáciles de probar.

Un ejemplo fue el caso del monto `5.000`. Al hacer el test, se detectó que el input `type="number"` no servía bien para esa validación, porque el valor se convertía a `5`. Por eso se cambió a `type="text"` y se validó el monto manualmente.

También se fueron corrigiendo errores a medida que aparecían en la terminal. Cada cambio se probó con:

```bash
npm test -- --run
```

y también con:

```bash
npm run coverage
```

No dejé el código solo porque sí. Fui probando hasta que los tests quedaron en verde y la cobertura quedó sobre lo solicitado.