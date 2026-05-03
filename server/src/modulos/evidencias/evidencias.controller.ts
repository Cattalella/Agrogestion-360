import { 
  Controller, 
  Get, 
  Post, 
  Delete, 
  Patch, 
  Body, 
  Param, 
  UseGuards, 
  Req, 
  ForbiddenException 
} from '@nestjs/common';
import { EvidenciasService } from './evidencias.service';
import { AutenticacionGuardia } from '../../compartido/guardias/autenticacion.guardia';

interface RequestConUsuario extends Request {
  usuario: {
    id_persona: number;
    nombre_rol: string;
    nombre_usuario: string;
    email: string;
    nombre_completo: string;
    id_rol: number;
  };
}

@Controller('evidencias')
@UseGuards(AutenticacionGuardia)
export class EvidenciasController {
  constructor(private evidenciasService: EvidenciasService) {}

  @Get()
  async obtener(@Req() req: RequestConUsuario) {
    console.log('🔍 [GET] Usuario:', {
      id: req.usuario.id_persona,
      nombre_rol: req.usuario.nombre_rol,
      nombre: req.usuario.nombre_usuario
    });

    const { nombre_rol, id_persona } = req.usuario;
    
    // Dueño ve todas las fotos
    if (nombre_rol === 'Dueño') {
      return this.evidenciasService.obtenerTodas();
    }
    // Administrador ve solo las suyas
    return this.evidenciasService.obtenerPorAdmin(id_persona);
  }

  @Get('origen/:origen')
  async obtenerPorOrigen(
    @Param('origen') origen: string,
    @Req() req: RequestConUsuario
  ) {
    const { nombre_rol, id_persona } = req.usuario;
    
    if (nombre_rol === 'Dueño') {
      return this.evidenciasService.obtenerPorOrigen(origen);
    }
    return this.evidenciasService.obtenerPorOrigen(origen, id_persona);
  }

  @Post()
  async crear(@Body() body: any, @Req() req: RequestConUsuario) {
    console.log('=========================================');
    console.log('📸 INTENTO DE SUBIR FOTO');
    console.log('📌 Usuario:', {
      id: req.usuario.id_persona,
      nombre_rol: req.usuario.nombre_rol,
      nombre: req.usuario.nombre_usuario
    });
    console.log('📌 Datos de la foto:', {
      url: body.url?.substring(0, 50),
      origen: body.origen,
      idReferencia: body.idReferencia
    });
    console.log('=========================================');
    
    const { nombre_rol, id_persona } = req.usuario;
    
    // Solo Administrador puede subir fotos
    if (nombre_rol !== 'Administrador') {
      throw new ForbiddenException(`Solo los administradores pueden subir fotos. Tu rol es: "${nombre_rol}"`);
    }
    
    console.log(`✅ Rol permitido: "${nombre_rol}", procediendo a guardar...`);
    
    return this.evidenciasService.crear({
      url: body.url,
      origen: body.origen || 'general',
      id_referencia: body.idReferencia,
      id_admin: id_persona
    });
  }

  @Patch(':id/like')
  async toggleLike(@Param('id') id: string, @Req() req: RequestConUsuario) {
    console.log('❤️ [LIKE] Usuario:', {
      id: req.usuario.id_persona,
      nombre_rol: req.usuario.nombre_rol,
      nombre: req.usuario.nombre_usuario,
      fotoId: id
    });

    const { nombre_rol } = req.usuario;
    
    // Solo Dueño puede dar like
    if (nombre_rol !== 'Dueño') {
      throw new ForbiddenException(`Solo el dueño puede dar like a las fotos. Tu rol es: "${nombre_rol}"`);
    }
    
    return this.evidenciasService.toggleLike(parseInt(id));
  }

  @Delete(':id')
  async eliminar(@Param('id') id: string, @Req() req: RequestConUsuario) {
    console.log('🗑️ [DELETE] Usuario:', {
      id: req.usuario.id_persona,
      nombre_rol: req.usuario.nombre_rol,
      nombre: req.usuario.nombre_usuario,
      fotoId: id
    });

    const { nombre_rol, id_persona } = req.usuario;
    
    // Solo Administrador puede eliminar fotos
    if (nombre_rol !== 'Administrador') {
      throw new ForbiddenException(`Solo los administradores pueden eliminar fotos. Tu rol es: "${nombre_rol}"`);
    }
    
    return this.evidenciasService.eliminar(parseInt(id), id_persona);
  }

  @Delete()
  async eliminarTodas(@Req() req: RequestConUsuario) {
    console.log('🗑️📸 [DELETE ALL] Usuario:', {
      id: req.usuario.id_persona,
      nombre_rol: req.usuario.nombre_rol,
      nombre: req.usuario.nombre_usuario
    });

    const { nombre_rol, id_persona } = req.usuario;
    
    // Solo Administrador puede eliminar todas sus fotos
    if (nombre_rol !== 'Administrador') {
      throw new ForbiddenException(`Solo los administradores pueden eliminar fotos. Tu rol es: "${nombre_rol}"`);
    }
    
    return this.evidenciasService.eliminarTodas(id_persona);
  }
}