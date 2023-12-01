const { 
    rooms, 
    desconectarUsuario, 
    buscarNuevoAdmin
} = require('../shared/rooms');
const { v4: uuidv4 } = require('uuid');

const { makeID } = require('../helpers/utils');
const { createLogger } = require('vite');

const colors = [
    {'color': '#4285f4', 'name': 'blue'},
    {'color': '#ea4335', 'name': 'red'},
    {'color': '#34a853', 'name': 'green'},
    {'color': '#fbbc05', 'name': 'yellow'},
]
    let user1;
    let user2;
    let per1
    let per2
    let conjunto1 = {};
    let conjunto2 = {};


const getColorRBG = ( roomCode ) => {
    const values = Object.values( rooms[ roomCode ].users );

    for ( let i = 0; i< colors.length; i++){
        console.log( colors[i] );
        let existe = false;
    
        for ( let j=0; j< values.length; j++ ){
            if( colors[i].name === values[j].color ){
                existe = true;
                break;
            }
        }
    
        if( !existe ){            
            return {
                color: colors[i].name,
                rgb: colors[i].color
            }
        }
    }

    return {}
}



const socketController = async ( socket, io ) => {

    let name = socket.handshake.headers['name'];
    let roomCode = socket.handshake.headers['room'];
    let id;
    let user;
    let personaje;
    




    id = uuidv4();

    console.log('Intento de conexión')

    if( roomCode !== 'no-room'){
        console.log('    ',roomCode)
        if( !rooms[roomCode] ){
            socket.emit( 'error-no-room' );
            return socket.disconnect();
        }

        if( rooms[ roomCode ].players === 2 ){
            socket.emit( 'error-full-room' );
            return socket.disconnect();
        }        
    }
    else{
        console.log( '    ', 'Creando sala' );
        roomCode = makeID( 6 );

        rooms[ roomCode ] = {
            admin: id,
            code: roomCode,
            players: 0,
            users: {},
            status: 0
        }
    }

    rooms[ roomCode ].players++;
    num = rooms[ roomCode ].players;

    const { rgb, color } = getColorRBG( roomCode );

    if( !name || name.length < 2){
        name = color;
    }

    user = {
        id,
        nombre: name,
        room: roomCode,
        rgb,
        color
    }

    rooms[ roomCode ].users[ id ] = user;

    socket.join( roomCode );
    socket.emit( 'welcome', { room: roomCode, id, nombre:name, admin: rooms[ roomCode ].admin })
    io.to( roomCode ).emit('usuarios-activos', {
        usuarios: Object.values(rooms[ roomCode ].users),
        admin: rooms[ roomCode ].admin
    });
    io.to( roomCode ).emit( 'message', { msg: `¡Bienvenido, ${name}! ` } );

    if( rooms[ roomCode ].status === 1 ){
        io.to( roomCode ).emit( 'iniciar-juego');
    }


    socket.on( 'iniciar-juego', () => { 
        if( rooms[ roomCode ].admin === id ){
            if( rooms[ roomCode ].players >= 2 ){
                rooms[ roomCode ].status = 1

                io.to( roomCode ).emit( 'iniciar-juego');

                rooms[ roomCode ].status = 1;
            }
        }
    });
    
    socket.on( 'personaje', ({ per }) => {
        personaje = per; 
        usuarioss= Object.values(rooms[ roomCode ].users)
        io.to( roomCode ).emit('usuarios', {
            usuarios: Object.values(rooms[ roomCode ].users),
        });

        [user1, user2] = usuarioss.map(usuario => usuario.nombre);



        if (name == user1){

            per1 = per;

            conjunto1 = { user: user1, personaje: per1 };
            console.log('Personaje de user 1: ' + conjunto1.personaje);

           

        }
        if (name == user2){

            

            per2 = per;
            conjunto2 = { user: user2, personaje: per2 };
            console.log('Personaje de user 2: ' + conjunto2.personaje);
        }

        return conjunto1,conjunto2,user1,user2;



    } );

    let mensaje1
    let mensaje2


    socket.on( 'message', ({ msg }) => {
        io.to( roomCode ).emit( 'message', { msg, usuario: user } )
        console.log({msg , usuario: user.nombre})


        if (user.nombre == user1)
        {
            console.log(
                'el usuario 1 dice ' + msg 
                + ' como objeto aderido tiene '+
                conjunto1.user + " y "+conjunto1.personaje
                + ' su oponente trae ' + conjunto2.personaje
            )

            mensaje1 = msg;
            if (mensaje1.includes(conjunto2.personaje))
            {
                console.log(mensaje1 + conjunto2.personaje)
                io.emit("gano",{ user1: user1 })
                io.to( roomCode ).emit( 'message', { msg: `${user1} ha ganado` } ); 
            }

            

        }
        //else
        if (user.nombre == user2)
        {
            console.log(
                'el usuario 1 dice ' + msg 
                + ' como objeto aderido tiene '+
                conjunto2.user + " y "+conjunto2.personaje

                + ' su oponente trae ' + conjunto1.personaje
            )

            mensaje2=msg
            if (mensaje2.includes(conjunto1.personaje)){
                console.log(mensaje2 + conjunto1.personaje)
                io.emit("gano",{user2})
                io.to( roomCode ).emit( 'message', { msg: `${user2} ha ganado` } );
            }

        }
        

    /**
     * 
     * if (msg.includes(personaje)) {

            io.emit("gano",{nombre:personaje})
            io.to( roomCode ).emit( 'message', { msg: `${name} ha ganado` } );


        }   
     */
        
    } );

    socket.on('disconnect', () => {
        desconectarUsuario( roomCode, id );
        rooms[ roomCode ].players--;

        if( rooms[ roomCode ].players === 0 ){
            console.log( 'limpiando sala', roomCode )
            delete rooms[ roomCode ];            
            return socket.disconnect();
        }
        
        if( rooms[ roomCode ].admin === id ){
            rooms[ roomCode ].admin = buscarNuevoAdmin( roomCode );
            console.log('Cambio de admin');
        }

        io.to( roomCode ).emit( 'message', { msg: `${name} ha salido de la partida` } );
        io.to( roomCode ).emit('usuarios-activos', {
            usuarios: Object.values(rooms[ roomCode ].users),
            admin: rooms[ roomCode ].admin
        });
        

        if( rooms[ roomCode ].status === 1 ){
            if( rooms[ roomCode ].players === 1 ){
                console.log( 'Deteniendo juego' );
                io.to( roomCode ).emit( 'error-not-enough-players' );
                io.to( roomCode ).emit('message', { msg: `Esperando por más jugadores`});
                rooms[ roomCode ].status = 0;
            }
        }

    });         
}

module.exports = {
    socketController
}