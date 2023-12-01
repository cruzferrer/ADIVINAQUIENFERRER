const express = require('express');
const cors = require('cors');


const { socketController } = require('../sockets/controller');

class Server {

    constructor() {
        this.app  = express();
        this.port = process.env.PORT;
        this.server = require('http').createServer( this.app );
        this.io = require('socket.io')(this.server);

        this.paths = {
            connect: '/api/connect'
        }

        // Middlewares
        this.middlewares();

        // Sockets
        this.sockets();
    }

    /**
     * 
     * son los mediadores entre el public y el server,
     * se necesitan porque el metodo va de carpe en carpe, quiero tacos.
     * 
     */


    middlewares() {

        this.app.use( express.json() );
        // ni de pedo voy a usar cors
        this.app.use( express.static('public') );
        /*
         *
         * 
         * esto entra al public mi pilin 
         * 
         */
        
    }

    sockets(){
        this.io.on('connection', ( socket ) => socketController(socket, this.io));
    }

    listen() {
        this.server.listen( this.port, () => {
            console.log('Servidor corriendo en puerto', this.port );
        });
    }

}




module.exports = Server;
