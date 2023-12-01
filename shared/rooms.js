const rooms = {};

const desconectarUsuario = ( room, id ) => {
    if(rooms[room].users){
        delete rooms[room].users[id];
    }
}

const existeUsuario = ( room, id ) => {
    return rooms[room].users[id];
}

const usuariosConectadosEnSala = ( room ) => {
    return Object.keys(rooms[room].users).length;
}


const buscarNuevoAdmin = ( room ) => {
    const keys = Object.keys( rooms[room].users );
    return keys[0];
}

module.exports = {
    buscarNuevoAdmin,
    desconectarUsuario,
    existeUsuario,
    rooms,
    usuariosConectadosEnSala,
}