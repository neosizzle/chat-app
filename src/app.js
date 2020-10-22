const express = require('express')
const http = require('http')
const path = require('path')
const socketio = require('socket.io')
const Filter = require('bad-words')
const {generateMessage} = require('./utils/messages')
const {addUser,getUser,getUsersInRoom, removeUser,getAllUsers} = require('./utils/users')

const app = express()
const port = process.env.PORT || 3000
const publicDirPath = path.join(__dirname,"../public")

//USE static asset eg html or client side js
app.use(express.static(publicDirPath))
const server = http.createServer(app)

//socketio expects a raw httpserver 
const io = socketio(server)

app.get('/', (req,res)=>{
    res.render("index.html")
})




//socket event listener, expects a socket parameter
io.on('connection', (socket)=>{
    console.log("Connection established")

    //listen to events sent by client
    //user joins a room
    socket.on('join',({username , room} , callback)=>{
       const {error , user} =  addUser({id : socket.id , username , room})
       if(error){
        callback(error)
        return
       }

        socket.join(user.room)//joins room according to tis name

        socket.emit('consoleMessage',generateMessage("Welcome!"))//second parameter can be access by client js callback at first param
        socket.to(user.room).broadcast.emit("messageReceived", generateMessage("SERVER",user.username + ' has joined!'))//tells every1 a new user joined
        io.to(user.room).emit('roomData' , {
            room : user.room,
            users : getUsersInRoom(user.room)
        })
        callback()
    })

    //client sends a message
    socket.on('sendMessage', (message,callback)=>{
        const user = getUser(socket.id)
        const filter = new Filter()

        //filterout bad words
        if(filter.isProfane(message)){
            return callback('Profanity is not allowed!')
        }
        if(!message){
            return callback('No message received!')
        }

        callback()
        // socket.emit("countUpdate",count) does not work because it only emits to one connection
        io.to(user.room).emit("messageReceived",generateMessage(user.username,message))//tells every conenction that a message has been received/sends message to every connection
    })

    //tells everyone that a user has left
    socket.on('disconnect',()=>{
        const user = removeUser(socket.id)
        if(!user) return

        io.to(user.room).emit("messageReceived",generateMessage("SERVER",user.username + " has left!"))
        io.to(user.room).emit('roomData' , {
            room : user.room,
            users : getUsersInRoom(user.room)
        })
    })

    //client wants to share location
    socket.on('sendLocation', (position,callback)=>{
        const user = getUser(socket.id)
        callback()
        io.to(user.room).emit("locationReceived",{
            link : "https://google.com/maps?q=" + position.lat + ","+ position.long,
            timesteamp : position.createdAt,
            username : user.username
        })
    })
})


//server startup
server.listen(port,()=>{
    console.log(`Server is up on port ${port}`)
})