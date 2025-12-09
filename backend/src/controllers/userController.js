const pool = require('../config/database');
const { hashPassword } = require('../utils/bcrypt');

// Obtener todos los usuarios con paginación y filtros
const getUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      rol = '',
      search = '',
      activo = ''
    } = req.query;

    const offset = (page - 1) * limit;

    // Construir query con filtros
    let query = `
      SELECT 
        u.id, u.email, u.rol, u.activo, u.created_at,
        CASE 
          WHEN u.rol = 'estudiante' THEN e.nombre
          WHEN u.rol = 'docente' THEN d.nombre
          WHEN u.rol = 'director' THEN dir.nombre
        END as nombre,
        CASE 
          WHEN u.rol = 'estudiante' THEN e.apellido
          WHEN u.rol = 'docente' THEN d.apellido
          WHEN u.rol = 'director' THEN dir.apellido
        END as apellido,
        CASE 
          WHEN u.rol = 'estudiante' THEN e.codigo_personal
          WHEN u.rol = 'docente' THEN d.codigo_personal
          ELSE NULL
        END as codigo_personal,
        e.plan,
        d.jornada
      FROM usuarios u
      LEFT JOIN estudiantes e ON u.id = e.usuario_id
      LEFT JOIN docentes d ON u.id = d.usuario_id
      LEFT JOIN directores dir ON u.id = dir.usuario_id
      WHERE 1=1
    `;

    const params = [];
    let paramCount = 1;

    // Filtro por rol
    if (rol) {
      query += ` AND u.rol = $${paramCount}`;
      params.push(rol);
      paramCount++;
    }

    // Filtro por activo
    if (activo !== '') {
      query += ` AND u.activo = $${paramCount}`;
      params.push(activo === 'true');
      paramCount++;
    }

    // Búsqueda por nombre, apellido o email
    if (search) {
      query += ` AND (
        LOWER(e.nombre || ' ' || e.apellido) LIKE LOWER($${paramCount}) OR
        LOWER(d.nombre || ' ' || d.apellido) LIKE LOWER($${paramCount}) OR
        LOWER(dir.nombre || ' ' || dir.apellido) LIKE LOWER($${paramCount}) OR
        LOWER(u.email) LIKE LOWER($${paramCount}) OR
        LOWER(e.codigo_personal) LIKE LOWER($${paramCount}) OR
        LOWER(d.codigo_personal) LIKE LOWER($${paramCount})
      )`;
      params.push(`%${search}%`);
      paramCount++;
    }

    // Filtro por plan (para estudiantes)
    if (req.query.plan) {
      query += ` AND e.plan = $${paramCount}`;
      params.push(req.query.plan);
      paramCount++;
    }

    // Filtro por jornada (para docentes)
    if (req.query.jornada) {
      query += ` AND d.jornada = $${paramCount}`;
      params.push(req.query.jornada);
      paramCount++;
    }

    // Filtro por jornada (para docentes)
    if (req.query.jornada) {
      query += ` AND d.jornada = $${paramCount}`;
      params.push(req.query.jornada);
      paramCount++;
    }

    // Filtro por grado inscrito (para estudiantes)
    if (req.query.gradoCicloId) {
      query += ` AND e.id IN (
        SELECT estudiante_id FROM inscripciones 
        WHERE grado_ciclo_id = $${paramCount} AND estado = 'activo'
      )`;
      params.push(parseInt(req.query.gradoCicloId));
      paramCount++;
    }

    // Filtro por estado de inscripción (para estudiantes)
    if (req.query.inscrito) {
      const cicloActivo = await pool.query('SELECT id FROM ciclos_escolares WHERE activo = true LIMIT 1');
      if (cicloActivo.rows.length > 0) {
        const cicloId = cicloActivo.rows[0].id;

        if (req.query.inscrito === 'true') {
          query += ` AND e.id IN (
            SELECT estudiante_id FROM inscripciones 
            WHERE ciclo_id = $${paramCount} AND estado = 'activo'
          )`;
          params.push(cicloId);
          paramCount++;
        } else if (req.query.inscrito === 'false') {
          query += ` AND e.id NOT IN (
            SELECT estudiante_id FROM inscripciones 
            WHERE ciclo_id = $${paramCount} AND estado = 'activo'
          )`;
          params.push(cicloId);
          paramCount++;
        }
      }
    }

    // Contar total de registros
    const countQuery = `SELECT COUNT(*) FROM (${query}) as total`;
    const countResult = await pool.query(countQuery, params);
    const totalRecords = parseInt(countResult.rows[0].count);

    // Agregar ordenamiento y paginación
    query += ` ORDER BY u.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(parseInt(limit), offset);

    // Ejecutar query
    const result = await pool.query(query, params);

    res.json({
      success: true,
      data: {
        users: result.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalRecords,
          totalPages: Math.ceil(totalRecords / limit),
        },
      },
    });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener usuarios',
    });
  }
};

// Obtener un usuario por ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const userQuery = await pool.query(
      'SELECT * FROM usuarios WHERE id = $1',
      [id]
    );

    if (userQuery.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      });
    }

    const user = userQuery.rows[0];

    // Obtener información adicional según el rol
    let userData = {
      id: user.id,
      email: user.email,
      rol: user.rol,
      activo: user.activo,
    };

    if (user.rol === 'estudiante') {
      const estudianteQuery = await pool.query(
        'SELECT * FROM estudiantes WHERE usuario_id = $1',
        [user.id]
      );
      if (estudianteQuery.rows.length > 0) {
        userData = { ...userData, ...estudianteQuery.rows[0] };
      }
    } else if (user.rol === 'docente') {
      const docenteQuery = await pool.query(
        'SELECT * FROM docentes WHERE usuario_id = $1',
        [user.id]
      );
      if (docenteQuery.rows.length > 0) {
        userData = { ...userData, ...docenteQuery.rows[0] };
      }
    } else if (user.rol === 'director') {
      const directorQuery = await pool.query(
        'SELECT * FROM directores WHERE usuario_id = $1',
        [user.id]
      );
      if (directorQuery.rows.length > 0) {
        userData = { ...userData, ...directorQuery.rows[0] };
      }
    }

    res.json({
      success: true,
      data: userData,
    });
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener usuario',
    });
  }
};

// Crear usuario
const createUser = async (req, res) => {
  const client = await pool.connect();

  try {
    const { email, password, rol, nombre, apellido, codigo_personal, plan, jornada, gradoCicloId } = req.body;

    // Validaciones
    if (!email || !password || !rol || !nombre || !apellido) {
      return res.status(400).json({
        success: false,
        message: 'Todos los campos son obligatorios',
      });
    }

    // Validar formato de email
    const allowedDomains = process.env.ALLOWED_DOMAINS.split(',');
    const domain = email.split('@')[1];
    if (!allowedDomains.includes(domain)) {
      return res.status(400).json({
        success: false,
        message: 'El email debe ser institucional (@liceotecpan.edu.gt o @liceotecpan.com)',
      });
    }

    // Validar rol
    if (!['estudiante', 'docente', 'director'].includes(rol)) {
      return res.status(400).json({
        success: false,
        message: 'Rol inválido',
      });
    }

    // Validar campos según rol
    if ((rol === 'estudiante' || rol === 'docente') && !codigo_personal) {
      return res.status(400).json({
        success: false,
        message: 'El código personal es obligatorio para estudiantes y docentes',
      });
    }

    if (rol === 'estudiante' && !plan) {
      return res.status(400).json({
        success: false,
        message: 'El plan es obligatorio para estudiantes',
      });
    }

    if (rol === 'docente' && !jornada) {
      return res.status(400).json({
        success: false,
        message: 'La jornada es obligatoria para docentes',
      });
    }

    await client.query('BEGIN');

    // Verificar si el email ya existe
    const emailCheck = await client.query(
      'SELECT id FROM usuarios WHERE email = $1',
      [email]
    );

    if (emailCheck.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'El email ya está registrado',
      });
    }

    // Verificar si el código personal ya existe (si aplica)
    if (codigo_personal) {
      const table = rol === 'estudiante' ? 'estudiantes' : 'docentes';
      const codigoCheck = await client.query(
        `SELECT id FROM ${table} WHERE codigo_personal = $1`,
        [codigo_personal]
      );

      if (codigoCheck.rows.length > 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          message: 'El código personal ya está registrado',
        });
      }
    }

    // Hashear contraseña
    const hashedPassword = await hashPassword(password);

    // Insertar en tabla usuarios
    const userResult = await client.query(
      'INSERT INTO usuarios (email, password, rol, activo) VALUES ($1, $2, $3, $4) RETURNING id',
      [email, hashedPassword, rol, true]
    );

    const userId = userResult.rows[0].id;
    let estudianteId = null;

    // Insertar en tabla específica según rol
    if (rol === 'estudiante') {
      const estudianteResult = await client.query(
        'INSERT INTO estudiantes (usuario_id, codigo_personal, nombre, apellido, plan) VALUES ($1, $2, $3, $4, $5) RETURNING id',
        [userId, codigo_personal, nombre, apellido, plan]
      );
      estudianteId = estudianteResult.rows[0].id;

      // ⭐ Si tiene gradoCicloId, inscribirlo automáticamente
      if (gradoCicloId) {
        // Obtener ciclo activo
        const cicloResult = await client.query(
          'SELECT id FROM ciclos_escolares WHERE activo = true LIMIT 1'
        );

        if (cicloResult.rows.length > 0) {
          const cicloId = cicloResult.rows[0].id;

          // Inscribir al estudiante
          await client.query(
            `INSERT INTO inscripciones (estudiante_id, grado_ciclo_id, ciclo_id, fecha_inscripcion, estado)
             VALUES ($1, $2, $3, CURRENT_DATE, 'activo')`,
            [estudianteId, gradoCicloId, cicloId]
          );
        }
      }
    } else if (rol === 'docente') {
      await client.query(
        'INSERT INTO docentes (usuario_id, codigo_personal, nombre, apellido, jornada) VALUES ($1, $2, $3, $4, $5)',
        [userId, codigo_personal, nombre, apellido, jornada]
      );
    } else if (rol === 'director') {
      await client.query(
        'INSERT INTO directores (usuario_id, nombre, apellido) VALUES ($1, $2, $3)',
        [userId, nombre, apellido]
      );
    }

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      message: 'Usuario creado exitosamente',
      data: {
        id: userId,
        email,
        rol,
      },
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error al crear usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear usuario',
    });
  } finally {
    client.release();
  }
};

// Actualizar usuario
const updateUser = async (req, res) => {
  const client = await pool.connect();

  try {
    const { id } = req.params;
    const { email, nombre, apellido, codigo_personal, plan, jornada, activo } = req.body;

    await client.query('BEGIN');

    // Verificar que el usuario existe
    const userCheck = await client.query(
      'SELECT rol FROM usuarios WHERE id = $1',
      [id]
    );

    if (userCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      });
    }

    const rol = userCheck.rows[0].rol;

    // Actualizar email y activo en tabla usuarios
    if (email !== undefined || activo !== undefined) {
      let updateQuery = 'UPDATE usuarios SET';
      const params = [];
      let paramCount = 1;

      if (email !== undefined) {
        // Verificar que el nuevo email no esté en uso
        const emailCheck = await client.query(
          'SELECT id FROM usuarios WHERE email = $1 AND id != $2',
          [email, id]
        );

        if (emailCheck.rows.length > 0) {
          await client.query('ROLLBACK');
          return res.status(400).json({
            success: false,
            message: 'El email ya está en uso',
          });
        }

        updateQuery += ` email = $${paramCount}`;
        params.push(email);
        paramCount++;
      }

      if (activo !== undefined) {
        if (paramCount > 1) updateQuery += ',';
        updateQuery += ` activo = $${paramCount}`;
        params.push(activo);
        paramCount++;
      }

      updateQuery += ` WHERE id = $${paramCount}`;
      params.push(id);

      await client.query(updateQuery, params);
    }

    // Actualizar tabla específica según rol
    if (rol === 'estudiante') {
      let updateQuery = 'UPDATE estudiantes SET';
      const params = [];
      let paramCount = 1;
      let hasUpdates = false;

      if (nombre !== undefined) {
        updateQuery += ` nombre = $${paramCount}`;
        params.push(nombre);
        paramCount++;
        hasUpdates = true;
      }

      if (apellido !== undefined) {
        if (hasUpdates) updateQuery += ',';
        updateQuery += ` apellido = $${paramCount}`;
        params.push(apellido);
        paramCount++;
        hasUpdates = true;
      }

      if (codigo_personal !== undefined) {
        if (hasUpdates) updateQuery += ',';
        updateQuery += ` codigo_personal = $${paramCount}`;
        params.push(codigo_personal);
        paramCount++;
        hasUpdates = true;
      }

      if (plan !== undefined) {
        if (hasUpdates) updateQuery += ',';
        updateQuery += ` plan = $${paramCount}`;
        params.push(plan);
        paramCount++;
        hasUpdates = true;
      }

      if (hasUpdates) {
        updateQuery += ` WHERE usuario_id = $${paramCount}`;
        params.push(id);
        await client.query(updateQuery, params);
      }
    } else if (rol === 'docente') {
      let updateQuery = 'UPDATE docentes SET';
      const params = [];
      let paramCount = 1;
      let hasUpdates = false;

      if (nombre !== undefined) {
        updateQuery += ` nombre = $${paramCount}`;
        params.push(nombre);
        paramCount++;
        hasUpdates = true;
      }

      if (apellido !== undefined) {
        if (hasUpdates) updateQuery += ',';
        updateQuery += ` apellido = $${paramCount}`;
        params.push(apellido);
        paramCount++;
        hasUpdates = true;
      }

      if (codigo_personal !== undefined) {
        if (hasUpdates) updateQuery += ',';
        updateQuery += ` codigo_personal = $${paramCount}`;
        params.push(codigo_personal);
        paramCount++;
        hasUpdates = true;
      }

      if (jornada !== undefined) {
        if (hasUpdates) updateQuery += ',';
        updateQuery += ` jornada = $${paramCount}`;
        params.push(jornada);
        paramCount++;
        hasUpdates = true;
      }

      if (hasUpdates) {
        updateQuery += ` WHERE usuario_id = $${paramCount}`;
        params.push(id);
        await client.query(updateQuery, params);
      }
    } else if (rol === 'director') {
      let updateQuery = 'UPDATE directores SET';
      const params = [];
      let paramCount = 1;
      let hasUpdates = false;

      if (nombre !== undefined) {
        updateQuery += ` nombre = $${paramCount}`;
        params.push(nombre);
        paramCount++;
        hasUpdates = true;
      }

      if (apellido !== undefined) {
        if (hasUpdates) updateQuery += ',';
        updateQuery += ` apellido = $${paramCount}`;
        params.push(apellido);
        paramCount++;
        hasUpdates = true;
      }

      if (hasUpdates) {
        updateQuery += ` WHERE usuario_id = $${paramCount}`;
        params.push(id);
        await client.query(updateQuery, params);
      }
    }

    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Usuario actualizado exitosamente',
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar usuario',
    });
  } finally {
    client.release();
  }
};

// Eliminar (desactivar) usuario
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que el usuario existe
    const userCheck = await pool.query(
      'SELECT id FROM usuarios WHERE id = $1',
      [id]
    );

    if (userCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      });
    }

    // Desactivar usuario en lugar de eliminarlo
    await pool.query('UPDATE usuarios SET activo = false WHERE id = $1', [id]);

    res.json({
      success: true,
      message: 'Usuario desactivado exitosamente',
    });
  } catch (error) {
    console.error('Error al desactivar usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al desactivar usuario',
    });
  }
};

// Activar usuario
const activateUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que el usuario existe
    const userCheck = await pool.query(
      'SELECT id FROM usuarios WHERE id = $1',
      [id]
    );

    if (userCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      });
    }

    // Activar usuario
    await pool.query('UPDATE usuarios SET activo = true WHERE id = $1', [id]);

    res.json({
      success: true,
      message: 'Usuario activado exitosamente',
    });
  } catch (error) {
    console.error('Error al activar usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al activar usuario',
    });
  }
};

// Obtener estadísticas
// Obtener estadísticas
const getStats = async (req, res) => {
  try {
    const stats = await pool.query(`
      SELECT 
        COUNT(*) FILTER (WHERE rol = 'estudiante') as total_estudiantes,
        COUNT(*) FILTER (WHERE rol = 'docente') as total_docentes,
        COUNT(*) FILTER (WHERE rol = 'director') as total_directores,
        COUNT(*) FILTER (WHERE activo = true) as usuarios_activos,
        COUNT(*) FILTER (WHERE activo = false) as usuarios_inactivos,
        COUNT(*) as total_usuarios
      FROM usuarios
    `);

    const estudiantesStats = await pool.query(`
      SELECT 
        COUNT(*) FILTER (WHERE plan = 'diario') as plan_diario,
        COUNT(*) FILTER (WHERE plan = 'fin_de_semana') as plan_fin_semana
      FROM estudiantes
    `);

    const docentesStats = await pool.query(`
      SELECT 
        COUNT(*) FILTER (WHERE jornada = 'diario') as jornada_diario,
        COUNT(*) FILTER (WHERE jornada = 'fin_de_semana') as jornada_fin_semana,
        COUNT(*) FILTER (WHERE jornada = 'ambas') as jornada_ambas
      FROM docentes
    `);

    // Estadísticas de inscripciones (ciclo activo)
    const inscripcionesStats = await pool.query(`
      SELECT 
        COUNT(DISTINCT i.estudiante_id) as estudiantes_inscritos
      FROM inscripciones i
      JOIN ciclos_escolares c ON i.ciclo_id = c.id
      WHERE c.activo = true AND i.estado = 'activo'
    `);

    const estudiantesInscritos = inscripcionesStats.rows[0].estudiantes_inscritos || 0;
    const totalEstudiantes = parseInt(stats.rows[0].total_estudiantes) || 0;
    const estudiantesNoInscritos = totalEstudiantes - estudiantesInscritos;

    res.json({
      success: true,
      data: {
        ...stats.rows[0],
        ...estudiantesStats.rows[0],
        ...docentesStats.rows[0],
        estudiantes_inscritos: estudiantesInscritos,
        estudiantes_no_inscritos: estudiantesNoInscritos,
      },
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas',
    });
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  activateUser,
  getStats,
};