// Referencias HTML
const divBoard = document.querySelector('#board');
const table = document.querySelector('#tableid')
const divimg = document.querySelector('#img');
const divtabla = document.querySelector('#tabla');


const mostrarImagen = () => {
    divimg.classList.remove('oculto');
}
const mostrartabla = () => {
    divtabla.classList.remove('oculto');
}

let nameee = '';
let tilin = '';

let user1
let user2

const divRoomElection = document.querySelector('#room-election');
const divWaitingRoom = document.querySelector('#waiting-room');
const divMessage = document.querySelector('#message');
const divChat = document.querySelector('.chat-container');
const chat = document.querySelector('.chat');
const chatButton = document.querySelector('.chat-title');
const divOnlineU = document.querySelector('.online-users');
const divSidebar = document.querySelector('.sidebar');
const divContent = document.querySelector('.content');
const divGameBoard = document.querySelector('.game-board');
const divMainTitle = document.querySelector('.main-screen');

const gameStateContainer = document.querySelector('#game-state-msg');
const gameStateText = document.querySelector('#game-state-text');
const roomContainer = document.querySelector('.room-container');
const nameContainer = document.querySelector('.name-container');

const txtName = document.querySelector('#txtName');
const txtCode = document.querySelector('#txtCode');
const txtChat = document.querySelector('#txtChat');

const nameText = document.querySelector('#name-text');
const roomText = document.querySelector('#room-text');
const roomTextMsg = document.querySelector('#code');

const messageText = document.querySelector('.message-text');

const btnPlay = document.querySelector('#btnPlay');
const btnJoin = document.querySelector('#btnJoin');
const btnCreate = document.querySelector('#btnCreate');
const btnStart = document.querySelector('#btnStart');
const btnMessage = document.querySelector('#btnMessage');

const numPlayers = document.querySelector('#num-players');
const chatMessages = document.querySelector("#chat-messages");
const newMessageIndicator = document.querySelector("#new-message-indicator");
const listUsers = document.querySelector("#online-users-list");

const btnsCopy = document.getElementsByClassName('copy');



let socket;
let id;
let room;
let nombre;
let size = 7
let blocked = false;
let playing = false;

const mostrarMensaje = ({ msg, usuario }) => {
    let mensaje = ''
    let mostrar = '';
    if( usuario ){
        if (usuario.id === id){
            mensaje = `<span style="color: ${usuario.rgb};font-weight: bold">Tú:</span> ${msg}`;
            mostrar = 'none';
        }
        else{
            mensaje = `<span style="color: ${usuario.rgb};font-weight: bold">${usuario.nombre}:</span> ${msg}`;
        }
    }
    else{
        mensaje = `<i>${msg}</i>`;
    }    
    newMessageIndicator.style.display = mostrar;
    //console.log( mensaje );
    const msgLi = document.createElement('li');
    
    msgLi.innerHTML = mensaje;
    chatMessages.appendChild( msgLi );
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

const mostrarMensajeEstado = ({ victory, msg }) => {
    if( msg){
        location.reload();
    }
    else{
        let mensaje;
        if( victory ){
            mensaje = `
                <b style="color: ${victory.rgb}">${victory.nombre}</b> ganó
                <br>
            `;
        }
        else{
            mensaje = `
                Empate
                <br>
            `
        }   
        gameStateText.innerHTML = mensaje
    }
}




const enviarMensaje = ({ keyCode }) => {    
    const mensaje = txtChat.value;


    if( keyCode === 13 && mensaje.length > 0){
        var mensajeRegex = /^[a-zA-Z0-9 ¿?.]{1,200}$/;
    if (!mensajeRegex.test(mensaje)) {
        alert("no.");
      }
      else{
        socket.emit( 'message', {msg: mensaje} )


        mensajote(mensaje)

        txtChat.value = '';
        }
    }

    newMessageIndicator.style.display = 'none';
      
}

const setNombre = () => {


    nombre = txtName.value;

    nameText.innerHTML = `<b>${nombre}</b>`;
    
    /**
     * 
     * 
     * se muestran los div pa
     * 
     */

    divRoomElection.classList.add('show');

    roomContainer.classList.remove('show');

    /**
     * validaciones
     */
    var userRegex = /^[a-zA-Z0-9 ]{1,20}$/;

    if (!userRegex.test(nombre)) {
        alert("El nombre no es válido. Debe tener entre 1 y 20 caracteres y los números del 1 al 9.");
      }
      else{

        if(nombre.length < 2){

            alert("muy corto, minimo 2")

        }
        else{
            nameContainer.classList.add('show');
            divGameBoard.classList.add('show');
            divSidebar.classList.add('show');
            divMainTitle.classList.remove('show');
        }
}
}

const mostrarTablero = () => {
    playing = true;
    divWaitingRoom.classList.remove('show');
    divBoard.classList.add('show');
    divimg.classList.add('oculto');

}

const dibujarUsuarios = ({ usuarios, admin }) => {
    numPlayers.innerHTML = usuarios.length;
    listUsers.innerHTML = '';
    usuarios.forEach( element => {
        const msgLi = document.createElement('li');
        msgLi.innerHTML = `${element.id === admin ? "<i class='bx bxs-crown'></i>" : ""} <span style="color: ${element.rgb}">${element.nombre}`;
        listUsers.appendChild( msgLi );
    } );   

    if (id !== admin){
        btnStart.style.display = 'none';
    }
    else{
        btnStart.style.display = '';
    }
}

const errorMessage = ( msg ) => {
    divWaitingRoom.classList.remove('show');
    divRoomElection.classList.remove('show');
    divBoard.classList.remove('show');
    divMessage.classList.add('show');

    messageText.innerHTML = `Error: ${msg}`;
}

const comunicacionSockets = () => {
    socket = io({
        'extraHeaders': {
            'name': nombre,
            'room': room,
        }
    });

    // Conexiones de sockets
    socket.on( 'connect', () => {
        console.log('Socket online');
    });

    socket.on( 'welcome', ( payload ) => {
        room = payload.room;
        id = payload.id;
        roomText.innerHTML = `<b>${room}</b>`;;
        roomTextMsg.innerHTML = room;

        //divRoomElection.style.display = 'none';
        //divMessage.style.display = 'block';
        divRoomElection.classList.remove('show');
        divWaitingRoom.classList.add('show')
        roomContainer.classList.add('show');
        nameContainer.classList.add('show');        

        nombre = payload.nombre;
        nameText.innerHTML = `<b>${nombre}</b>`;


        divChat.classList.add('show');
        divOnlineU.classList.add('show');        
    });

    socket.on( 'error-full-room', () => errorMessage('sala llena'));
    socket.on( 'error-no-room', () => errorMessage('la sala no existe'));
    socket.on( 'error-not-enough-players', () => errorMessage('No hay suficientes jugadores'));
    socket.on( 'iniciar-juego', mostrarTablero);
    socket.on( 'message', mostrarMensaje);
    socket.on( 'game-status-message', mostrarMensajeEstado);
    socket.on( 'usuarios-activos', dibujarUsuarios);
    socket.on('usuarios', ({ usuarios }) => {

        let usere1 
        let usere2
        [usere1, usere2] = usuarios.map(usuario => usuario.nombre);

        user1 = usere1;
        user2 = usere2;

        return user1, user2;

    });

    
    socket.on('gano', (data) => {
        alert(`El usuario: ${data.user1} TE GANOOOO JUJUUU`);
        mostrartabla();
        divimg.classList.add('oculto');

        
    });
    socket.on('mensaje', (data) => {
        alert(`MENSAJE: ${data.info} ha sido seleccionado`);
    });
    socket.on('disconnect', () => {
        console.log('Socket offline');
    }); 
}
/**
 * 
 * 
 * AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
 * 
 * 
 * 
 */

function obtener(casilla){
    const id = casilla;
    console.log(id)
    return id;
};
function aaaaa(string){
    nameee = string;
    console.log(nameee)
    return nameee;
};
function mensajote(mss){
    tilin = mss;
    return tilin;
};

/**
 * 
 * 
 * AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
 * 
 * 
 * 
 */

const crearSala = () => {
    room = 'no-room';
    comunicacionSockets();
}

const conectarseSala = () => {
    room = txtCode.value;
    comunicacionSockets();
}

const iniciarJuego = () => {
    socket.emit( 'iniciar-juego');
}

const regresar = () => {
    divMessage.classList.remove('show');

    if( playing === true ){
        divWaitingRoom.classList.add('show');                
        playing = false;
    }
    else{
        divRoomElection.classList.add('show');        
    }
}
/**
 * 
 * 
 * AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
 * 
 * 
 * 
 */

const casilla = (event) => {
    let celda = event.target;
    let img;

    if (celda.tagName === 'IMG') {
        img = celda;
        celda = celda.parentNode;
    } else {
        img = celda.querySelector('img');
    }

    if (img) {
        const url = img.src;
        let partes = url.split("/"); 
        let nombreConExtension = partes[partes.length - 1]; 
        let nombre = nombreConExtension.split(".")[0]; 


        divtabla.classList.add('oculto');

        


        
        socket.emit( 'personaje', {per: nombre} )

        
        aaaaa(nombre)

    }
    mostrarImagen();
    
}
/**
 * 
 * 
 * AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
 * 
 * 
 * 
 */

table.addEventListener('click', casilla);

txtChat.addEventListener('keyup', enviarMensaje);
btnPlay.addEventListener( 'click', setNombre);
btnJoin.addEventListener( 'click', conectarseSala);
btnCreate.addEventListener( 'click', crearSala);
btnStart.addEventListener( 'click', iniciarJuego);
btnMessage.addEventListener( 'click', regresar);
chatButton.addEventListener( 'click', () => {
    chat.classList.toggle('minimized');
    if( !chat.classList.contains( 'minimized' ) ){
        newMessageIndicator.style.display = 'none';
    }
    
});
Array.from( btnsCopy )
.forEach( element => {
    element.addEventListener( 'click', () => {
        console.log(room);
        navigator.clipboard.writeText(room);
    })
});