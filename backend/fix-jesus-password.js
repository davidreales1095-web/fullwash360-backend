// fix-jesus-password.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function fixJesusPassword() {
  try {
    await mongoose.connect('mongodb://localhost:27017/fullwash360');
    console.log('✅ Conectado a MongoDB');
    
    const usuariosCollection = mongoose.connection.collection('usuarios');
    
    // Buscar usuario por código
    const user = await usuariosCollection.findOne({ codigo: "ADMIN_001" });
    
    if (!user) {
      console.log('❌ Usuario ADMIN_001 no encontrado');
      return;
    }
    
    console.log('✅ Usuario encontrado:', user.nombre);
    
    // Generar nuevo hash para "fullwash3601"
    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash('fullwash3601', salt);
    
    // Actualizar contraseña
    await usuariosCollection.updateOne(
      { _id: user._id },
      { 
        $set: { 
          password: newHash,
          updated_at: new Date()
        }
      }
    );
    
    console.log('✅ Contraseña actualizada a "fullwash3601"');
    console.log('📋 Nuevo hash:', newHash);
    
    // Verificar actualización
    const updatedUser = await usuariosCollection.findOne(
      { codigo: "ADMIN_001" },
      { codigo: 1, nombre: 1, rol: 1 }
    );
    
    console.log('\n🔍 Usuario actualizado:');
    console.log('- Código:', updatedUser.codigo);
    console.log('- Nombre:', updatedUser.nombre);
    console.log('- Rol:', updatedUser.rol);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado de MongoDB');
  }
}

fixJesusPassword();