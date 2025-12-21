# 📄 File Authenticator API

API REST para **firmar, verificar y revocar documentos y archivos** usando **criptografía moderna (RSA + SHA-256)**, sin modificar el archivo original.

El sistema permite:

* verificar **si un documento existe**
* verificar **si un archivo fue modificado**
* validar **integridad y autenticidad**
* realizar verificación pública mediante **URL y código QR**
* revocar documentos firmados

Funciona con **cualquier tipo de archivo** (PDF, DOCX, XLSX, imágenes, binarios, etc.) y soporta **multipart/form-data**, **Buffer** y **Base64**.

---

## 🚀 Características principales

* 🔐 Firma digital de archivos con **RSA + SHA-256**
* 🧾 Verificación de integridad **sin alterar el archivo**
* 📦 Soporte para:

  * Subida de archivos (`multipart/form-data`)
  * Archivos en Base64 (`application/json`)
* 🔗 Generación de **URL pública de verificación**
* 📱 Generación de **Código QR** (no embebido en el archivo)
* 🚫 Revocación de documentos firmados
* 🧠 Separación clara entre:

  * **existencia del documento**
  * **autenticidad del contenido**
* ⚠️ Mensajes explícitos para evitar falsa confianza
* 🧩 Arquitectura desacoplada y orientada a servicios

---

## 🧠 Conceptos clave (muy importante)

### ❗ El QR y la URL NO validan el archivo

El QR **solo identifica** un documento dentro del sistema.

✔️ Confirma:

* que el documento existe
* que no fue revocado

❌ NO confirma:

* que el archivo sea original
* que no haya sido modificado

👉 **Para validar un archivo real, siempre debe enviarse el archivo original**

---

## 🧱 Tecnologías

* Node.js (>= 18)
* NestJS
* TypeScript
* Crypto (RSA + AES + SHA-256)
* Prisma ORM
* SQLite
* Multer

---

## 📦 Requisitos

Antes de comenzar asegúrate de tener:

* Node.js >= 18
* npm
* Git
* OpenSSL

---

## 📥 Clonar el repositorio

```bash
git clone https://github.com/gimzz/file-authenticator.git
cd file-authenticator
```

---

## 📦 Instalar dependencias

```bash
npm install
```

---

## 🔐 Variables de entorno

Crea un archivo `.env`:

```env
SECRET_KEY=una_clave_super_secreta_y_larga_123456
PUBLIC_VERIFY_URL=http://localhost:3000/signature/verify
```

### 📌 Notas importantes

* `SECRET_KEY` se usa para **cifrado AES** de la firma
* Se recomienda mínimo **32 caracteres**
* SQLite se crea automáticamente

---

## 🔑 Llaves RSA

Crear carpeta de llaves:

```bash
mkdir keys
```

Generar llaves:

```bash
openssl genrsa -out keys/private.key 2048
openssl rsa -in keys/private.key -pubout -out keys/public.key
```

---

## 🗄️ Base de datos (Prisma)

Generar cliente:

```bash
npm run db:generate
```

Crear base de datos:

```bash
npm run db:push
```

Para **borrar y recrear todo**:

```bash
npx prisma migrate reset
```

---

## ▶️ Ejecutar el proyecto

```bash
npm run start:dev
```

API disponible en:

```
http://localhost:3000
```

---

# 🔐 Endpoints (explicados en detalle)

---

## 📌 1. Firmar archivo (multipart)

### `POST /signature/sign/file`

Firma cualquier archivo enviado.

**Content-Type**

```
multipart/form-data
```

**Body**

```
file: cualquier archivo (PDF, DOCX, JPG, PNG, ZIP, etc.)
```

### 🔧 Qué hace internamente

1. Calcula el **hash SHA-256** del archivo
2. Verifica si ya existe en la base de datos
3. Si no existe:

   * firma el hash con **RSA**
   * cifra la firma con **AES**
   * guarda hash + firma
4. Genera:

   * ID del documento
   * URL pública
   * Código QR

### 📤 Respuesta

Incluye:

* `documentId`
* `verifyUrl`
* `qr` (Base64)
* advertencias de confianza

⚠️ **El QR NO valida el archivo**

---

## 📌 2. Firmar archivo (Base64)

### `POST /signature/sign/base64`

Permite firmar archivos enviados como Base64.

**Content-Type**

```
application/json
```

**Body**

```json
{
  "fileBuffer64": "JVBERi0xLjQKJ..."
}
```

### 🔧 Uso recomendado

* Servicios externos
* Generadores de PDFs
* Microservicios
* Lambdas / workers

---

## 📌 3. Verificación pública (QR / URL)

### `GET /signature/verify/:id`

Usado por:

* QR
* enlaces públicos
* usuarios finales

### 🔍 Qué verifica

✔️ El documento existe
✔️ No está revocado

❌ NO valida el archivo
❌ NO detecta modificaciones

### 📤 Respuesta

Incluye:

* fecha de firma
* estado de revocación
* advertencias claras

---

## 📌 4. Verificación completa con archivo

### `POST /signature/verify/:id/file`

**Content-Type**

```
multipart/form-data
```

**Body**

```
file: archivo original
```

### 🔐 Qué valida realmente

1. Recalcula el hash del archivo
2. Lo compara con el hash firmado
3. Descifra la firma
4. Valida firma RSA con clave pública

### ✅ Resultado

✔️ Archivo auténtico
✔️ No fue modificado
✔️ Firma válida

👉 **Este es el único endpoint que confirma autenticidad real**

---

## 📌 5. Revocar documento

### `POST /signature/revoke/:id`

Revoca un documento firmado.

### 🔧 Qué implica

* El documento deja de ser válido
* Cualquier verificación futura falla
* No debe confiarse ningún archivo asociado

---

## 🧪 Seguridad

* Cualquier cambio en el archivo invalida el hash
* La firma depende exclusivamente del contenido
* El QR **no contiene información sensible**
* No se expone ninguna clave privada

---

## 📂 Modelo de datos

```prisma
model SignedDocument {
  id        String   @id @default(uuid())
  hash      String   @unique
  signature String
  createdAt DateTime @default(now())
  revokedAt DateTime?
}
```

---

## 👨‍💻 Autor

Desarrollado por **Gimzz**
Backend Developer — APIs & Security

