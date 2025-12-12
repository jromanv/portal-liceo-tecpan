const pool = require('../config/database');
const { hashPassword } = require('../utils/bcrypt');
const Papa = require('papaparse');
const XLSX = require('xlsx');
const jschardet = require('jschardet');
const iconv = require('iconv-lite');

// Función para parsear archivo CSV
const parseCSV = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    try {
      // Detectar la codificación del archivo
      const detected = jschardet.detect(fileBuffer);
      const encoding = detected.encoding || 'utf8';

      console.log(`Codificación detectada: ${encoding} (confianza: ${detected.confidence})`);

      // Convertir el buffer a UTF-8
      let fileContent;
      if (encoding.toLowerCase() === 'utf-8' || encoding.toLowerCase() === 'utf8') {
        fileContent = fileBuffer.toString('utf8');
      } else {
        // Convertir desde la codificación detectada a UTF-8
        fileContent = iconv.decode(fileBuffer, encoding);
      }

      // Parsear el CSV
      Papa.parse(fileContent, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          resolve(results.data);
        },
        error: (error) => {
          reject(error);
        },
      });
    } catch (error) {
      console.error('Error al parsear CSV:', error);
      reject(error);
    }
  });
};

// Función para parsear archivo Excel
const parseExcel = (fileBuffer) => {
  const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet);
  return data;
};

// Validar un usuario individual
const validateUser = async (userData, lineNumber, existingEmails, existingCodigos) => {
  const errors = [];

  // Validar email
  if (!userData.email || userData.email.trim() === '') {
    errors.push(`Línea ${lineNumber}: Email es obligatorio`);
  } else {
    const email = userData.email.trim().toLowerCase();

    const allowedDomains = process.env.ALLOWED_DOMAINS.split(',');
    const domain = email.split('@')[1];
    if (!allowedDomains.includes(domain)) {
      errors.push(`Línea ${lineNumber}: Email debe ser institucional (@liceotecpan.edu.gt o @liceotecpan.com)`);
    }

    // Verificar email duplicado en el archivo
    if (existingEmails.has(email)) {
      errors.push(`Línea ${lineNumber}: Email duplicado en el archivo`);
    } else {
      existingEmails.add(email);
    }

    // Verificar email en BD
    const emailCheck = await pool.query(
      'SELECT id FROM usuarios WHERE email = $1',
      [email]
    );
    if (emailCheck.rows.length > 0) {
      errors.push(`Línea ${lineNumber}: Email ya existe en la base de datos`);
    }
  }

  // Validar password
  if (!userData.password || userData.password.trim() === '') {
    errors.push(`Línea ${lineNumber}: Contraseña es obligatoria`);
  } else if (userData.password.trim().length < 6) {
    errors.push(`Línea ${lineNumber}: Contraseña debe tener al menos 6 caracteres`);
  }

  // Validar nombre
  if (!userData.nombre || userData.nombre.trim() === '') {
    errors.push(`Línea ${lineNumber}: Nombre es obligatorio`);
  }

  // Validar apellido
  if (!userData.apellido || userData.apellido.trim() === '') {
    errors.push(`Línea ${lineNumber}: Apellido es obligatorio`);
  }

  // Validar rol
  const rol = userData.rol ? userData.rol.trim().toLowerCase() : '';
  if (!['estudiante', 'docente', 'director'].includes(rol)) {
    errors.push(`Línea ${lineNumber}: Rol debe ser estudiante, docente o director`);
  }

  // Validaciones específicas por rol
  if (rol === 'estudiante' || rol === 'docente') {
    // Validar código personal
    if (!userData.codigo_personal || userData.codigo_personal.trim() === '') {
      errors.push(`Línea ${lineNumber}: Código personal es obligatorio para ${rol}s`);
    } else {
      const codigo = userData.codigo_personal.trim();

      // Verificar código duplicado en el archivo
      const codigoKey = `${rol}-${codigo}`;
      if (existingCodigos.has(codigoKey)) {
        errors.push(`Línea ${lineNumber}: Código personal duplicado en el archivo`);
      } else {
        existingCodigos.add(codigoKey);
      }

      // Verificar código en BD
      const table = rol === 'estudiante' ? 'estudiantes' : 'docentes';
      const codigoCheck = await pool.query(
        `SELECT id FROM ${table} WHERE codigo_personal = $1`,
        [codigo]
      );
      if (codigoCheck.rows.length > 0) {
        errors.push(`Línea ${lineNumber}: Código personal ya existe en la base de datos`);
      }
    }
  }

  // Validar plan para estudiantes
  if (rol === 'estudiante') {
    const plan = userData.plan ? userData.plan.trim().toLowerCase() : '';
    if (!['diario', 'fin_de_semana'].includes(plan)) {
      errors.push(`Línea ${lineNumber}: Plan debe ser diario o fin_de_semana para estudiantes`);
    }
  }

  // Validar jornada para docentes
  if (rol === 'docente') {
    const jornada = userData.jornada ? userData.jornada.trim().toLowerCase() : '';
    if (!['diario', 'fin_de_semana', 'ambas'].includes(jornada)) {
      errors.push(`Línea ${lineNumber}: Jornada debe ser diario, fin_de_semana o ambas para docentes`);
    }
  }

  return errors;
};

// Procesar archivo y validar
const processFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No se recibió ningún archivo',
      });
    }

    // Parsear archivo según tipo
    let data;
    const fileExtension = req.file.originalname.split('.').pop().toLowerCase();

    if (fileExtension === 'csv') {
      data = await parseCSV(req.file.buffer);
    } else if (['xlsx', 'xls'].includes(fileExtension)) {
      data = parseExcel(req.file.buffer);
    } else {
      return res.status(400).json({
        success: false,
        message: 'Formato de archivo no soportado',
      });
    }

    // Validar que haya datos
    if (!data || data.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'El archivo está vacío',
      });
    }

    // Validar estructura del archivo
    const requiredColumns = ['email', 'password', 'rol', 'nombre', 'apellido'];
    const firstRow = data[0];
    const missingColumns = requiredColumns.filter(col => !(col in firstRow));

    if (missingColumns.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Columnas faltantes en el archivo: ${missingColumns.join(', ')}`,
      });
    }

    // Validar cada usuario
    const validationErrors = [];
    const validUsers = [];
    const existingEmails = new Set();
    const existingCodigos = new Set();

    for (let i = 0; i < data.length; i++) {
      const lineNumber = i + 2; // +2 porque la primera fila es el header y empezamos en 1
      const userData = data[i];

      const errors = await validateUser(userData, lineNumber, existingEmails, existingCodigos);

      if (errors.length > 0) {
        validationErrors.push(...errors);
      } else {
        validUsers.push({
          ...userData,
          email: userData.email.trim().toLowerCase(),
          rol: userData.rol.trim().toLowerCase(),
          plan: userData.plan ? userData.plan.trim().toLowerCase() : null,
          jornada: userData.jornada ? userData.jornada.trim().toLowerCase() : null,
        });
      }
    }

    // Responder con resultados de validación
    res.json({
      success: true,
      data: {
        totalRows: data.length,
        validUsers: validUsers.length,
        invalidUsers: validationErrors.length,
        errors: validationErrors,
        users: validUsers,
      },
    });
  } catch (error) {
    console.error('Error al procesar archivo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al procesar archivo',
      error: error.message,
    });
  }
};

// Crear usuarios masivamente
const bulkCreateUsers = async (req, res) => {
  const client = await pool.connect();

  try {
    const { users } = req.body;

    if (!users || !Array.isArray(users) || users.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No se recibieron usuarios para crear',
      });
    }

    await client.query('BEGIN');

    // Obtener ciclo activo UNA VEZ
    const cicloResult = await client.query(
      'SELECT id FROM ciclos_escolares WHERE activo = true LIMIT 1'
    );
    const cicloActivo = cicloResult.rows.length > 0 ? cicloResult.rows[0].id : null;

    const results = {
      success: [],
      errors: [],
    };

    for (let i = 0; i < users.length; i++) {
      const userData = users[i];

      try {
        // Hashear contraseña
        const hashedPassword = await hashPassword(userData.password);

        // Insertar en tabla usuarios
        const userResult = await client.query(
          'INSERT INTO usuarios (email, password, rol, activo) VALUES ($1, $2, $3, $4) RETURNING id',
          [userData.email, hashedPassword, userData.rol, true]
        );

        const userId = userResult.rows[0].id;
        let estudianteId = null;

        // Insertar en tabla específica según rol
        if (userData.rol === 'estudiante') {
          const estudianteResult = await client.query(
            'INSERT INTO estudiantes (usuario_id, codigo_personal, nombre, apellido, plan) VALUES ($1, $2, $3, $4, $5) RETURNING id',
            [userId, userData.codigo_personal, userData.nombre, userData.apellido, userData.plan]
          );
          estudianteId = estudianteResult.rows[0].id;

          console.log(`Estudiante creado: ${userData.nombre} ${userData.apellido} (ID: ${estudianteId})`);

          // Si tiene grado en el CSV, inscribirlo automáticamente
          if (userData.grado && userData.grado.trim() !== '' && cicloActivo) {
            console.log(`Buscando grado: "${userData.grado.trim()}"`);

            // Buscar el grado por nombre
            const gradoResult = await client.query(
              `SELECT gc.id, g.nombre 
       FROM grados_ciclo gc
       JOIN grados g ON gc.grado_id = g.id
       WHERE g.nombre = $1 AND gc.ciclo_id = $2 AND gc.activo = true`,
              [userData.grado.trim(), cicloActivo]
            );

            if (gradoResult.rows.length > 0) {
              const gradoCicloId = gradoResult.rows[0].id;
              const gradoNombre = gradoResult.rows[0].nombre;

              console.log(`Grado encontrado: "${gradoNombre}" (ID: ${gradoCicloId})`);

              // Inscribir al estudiante
              await client.query(
                `INSERT INTO inscripciones (estudiante_id, grado_ciclo_id, ciclo_id, fecha_inscripcion, estado)
         VALUES ($1, $2, $3, CURRENT_DATE, 'activo')`,
                [estudianteId, gradoCicloId, cicloActivo]
              );

              console.log(`INSCRITO: ${userData.nombre} → ${gradoNombre}`);
            } else {
              console.log(`GRADO NO ENCONTRADO: "${userData.grado}" - NO inscrito`);
            }
          }
        }

        else if (userData.rol === 'docente') {
          await client.query(
            'INSERT INTO docentes (usuario_id, codigo_personal, nombre, apellido, jornada) VALUES ($1, $2, $3, $4, $5)',
            [userId, userData.codigo_personal, userData.nombre, userData.apellido, userData.jornada]
          );
        } else if (userData.rol === 'director') {
          await client.query(
            'INSERT INTO directores (usuario_id, nombre, apellido) VALUES ($1, $2, $3)',
            [userId, userData.nombre, userData.apellido]
          );
        }

        results.success.push({
          email: userData.email,
          nombre: `${userData.nombre} ${userData.apellido}`,
        });
      } catch (error) {
        console.error(`Error al crear usuario ${userData.email}:`, error);
        results.errors.push({
          email: userData.email,
          error: error.message,
        });
      }
    }

    await client.query('COMMIT');

    res.json({
      success: true,
      message: `Se crearon ${results.success.length} de ${users.length} usuarios`,
      data: results,
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error en carga masiva:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear usuarios',
      error: error.message,
    });
  } finally {
    client.release();
  }
};

module.exports = {
  processFile,
  bulkCreateUsers,
};