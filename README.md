Entiendo perfectamente. El texto anterior tenía mezclados comandos de NestJS con las instrucciones reales del proyecto. He limpiado todo el "ruido", los enlaces externos y las secciones que no querías.

Aquí tienes el código limpio del `README.md` listo para copiar y pegar:

---

# 📄 File Authenticator API

API para **firmar y verificar documentos** usando criptografía (RSA + SHA-256) y almacenamiento de firmas en **SQLite con Prisma**. Soporta procesamiento de archivos físicos y cadenas en formato **Base64**.

---

## 🧱 Tecnologías

* **Framework:** NestJS (Node.js >= 18)
* **Criptografía:** Crypto (RSA + AES + SHA-256)
* **Base de Datos:** SQLite + Prisma ORM
* **Gestión de Archivos:** Multer

---

## ⚙️ Configuración e Instalación

### 1. Clonar e Instalar

```bash
git clone https://github.com/gimzz/file-authenticator.git
cd file-authenticator
npm install

```

### 2. Variables de Entorno

Crea un archivo llamado `.env` en la raíz del proyecto y agrega lo siguiente:

```env
SECRET_KEY=una_clave_para_aes_de_32_caracteres_minimo
DATABASE_URL="file:./prisma/sing.db"

```

### 3. Generar Llaves RSA (Firmado)

Crea una carpeta llamada `keys/` en la raíz y genera el par de llaves:

```bash
mkdir keys
openssl genrsa -out keys/private.key 2048
openssl rsa -in keys/private.key -pubout -out keys/public.key

```

### 4. Inicializar Base de Datos

Ejecuta estos comandos para configurar Prisma y SQLite:

```bash
npm run db:generate
npm run db:push

```

---

## ▶️ Ejecución

```bash
# Modo desarrollo
npm run start:dev



La API estará disponible en: `http://localhost:3000`

---

## 🔐 Endpoints Principales

### 📌 Firmar Archivo (File)

* **Endpoint:** `POST /signature/sign/file`
* **Content-Type:** `multipart/form-data`
* **Body:** `file` (Cualquier archivo: PDF, JPG, PNG, etc.)

### 📌 Firmar Archivo (Base64)

* **Endpoint:** `POST /signature/sign/base64`
* **Content-Type:** `application/json`
* **Body:**
```json
{
  "pdfBase64": "JVBERi0xLjQKJ..."
}

```



### 📌 Verificar Archivo (File)

* **Endpoint:** `POST /signature/verify`
* **Content-Type:** `multipart/form-data`
* **Body:** `file` (El archivo que deseas validar)

### 📌 Verificar Archivo (Base64)

* **Endpoint:** `POST /signature/verify`
* **Content-Type:** `application/json`
* **Body:**
```json
{
  "pdfBase64": "JVBERi0xLjQKJ..."
}

```



---

## 🛠️ ¿Cómo funciona?

1. **Hasing:** Se obtiene el hash **SHA-256** único del contenido del archivo.
2. **Firma:** Ese hash se firma con la **Llave Privada** del servidor.
3. **Cifrado:** La firma se cifra con **AES** (usando la `SECRET_KEY`) y se guarda en la base de datos junto al hash.
4. **Verificación:** Al recibir un archivo, se busca su hash en la DB, se descifra la firma y se comprueba con la **Llave Pública**. Si el archivo fue alterado, la verificación será negativa.

---

## 👨‍💻 Autor

Desarrollado por **Gimzz**
✨ Proyecto educativo y demostrativo de firmas digitales.
Esto es una version **demo** de un proyecto **comercial**. 

---
