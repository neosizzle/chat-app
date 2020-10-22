const socket = io()

//elements
const $messageForm = document.querySelector("#messageInput")
const $messageFormButton = document.querySelector('#submit')
const $shareLocationButton = document.querySelector('#shareLocation')
const $chatBox = document.getElementById("demo")
const $userList = document.getElementById("userList")
const $roomTitle = document.getElementById("roomTitle")

//options
const {username , room} = Qs.parse(location.search,{ignoreQueryPrefix : true})


//set room title according to room
$roomTitle.innerHTML = room


//event listeners from the server

//receives a console message from server
socket.on('consoleMessage', (message,socket)=>{
    console.log("[" + moment(message.createdAt).format('h:mm:a') + "] " + message.text)
})

//receives a user message from server
socket.on('messageReceived', (message)=>{
    
    //create timestamp node
    var timestamp = document.createTextNode("[" + moment(message.createdAt).format('h:mm:a') + "] ")

    //creates user node
    var userNode = document.createElement('SPAN')
    userNode.appendChild(document.createTextNode(message.username + ": "))

    //creates the text message as a node
    var textMessage = document.createTextNode(message.text)

    //createst the list items as a node and set its atributes
    var node = document.createElement('LI')
    node.className = "list-group-item bg-light"
    node.appendChild(timestamp)
    node.appendChild(userNode)
    node.appendChild(textMessage)

    //append the list with a new list item
    $chatBox.scrollTop = $chatBox.scrollHeight - $chatBox.clientHeight;
    $chatBox.appendChild(node)
    
})

//receives a user location from server
socket.on('locationReceived',(response)=>{

         
                //create timestamp node
                var timestamp = document.createTextNode("[" + moment(response.timestamp).format('h:mm:a') + "] ")

                //creates user node
                var userNode = document.createElement('SPAN')
                userNode.appendChild(document.createTextNode(response.username+": "))


                //creates link
                var a = document.createElement('a');  
                var title = document.createTextNode("My Location"); 
                a.appendChild(title);   
                a.href = response.link;  

                //createst the list items as a node and set its atributes
                var node = document.createElement('LI');
                node.className = "list-group-item bg-light";
                node.appendChild(timestamp);
                node.appendChild(userNode);
                node.appendChild(a);


                // Append the list item node to the body. 
                $chatBox.scrollTop = $chatBox.scrollHeight - $chatBox.clientHeight;
                $chatBox.appendChild(node); 



                 
                   
                 
})

//refreshes user list
socket.on('roomData' , ({room, users})=>{

    $userList.innerHTML = ""
    users.forEach((user)=>{
    //creates username node
    var usernameNode = document.createTextNode(user.username)

    //creates user node and appends username node to li
    var userNode = document.createElement('LI')
    userNode.className = "list-group-item bg-light"
    userNode.appendChild(usernameNode)

    //appends li to ul
    $userList.appendChild(userNode)
    })
    
})

//sends user message
$messageFormButton.addEventListener('click', (event)=>{
    event.preventDefault()
    var inputMessage = $messageForm.value

    
    //disables the button to prevent double sending
    $messageFormButton.setAttribute('disabled','disabled')
    socket.emit('sendMessage',inputMessage,(error)=>{
        //reenable button
        $messageFormButton.removeAttribute('disabled')
        $messageForm.value = ""
        $messageForm.focus()

        if(error){
            return console.log(error)
        }

        console.log("The message was delivered!");
    })
})

//sends user location
$shareLocationButton.addEventListener('click', (event)=>{
    //disable send location button
    $shareLocationButton.setAttribute('disabled','disabled')

    //geolocation api for browsers
    if(!navigator.geolocation){
        $shareLocationButton.removeAttribute('disabled')
        event.preventDefault()
        return alert('geolocation service is not available')
    }


    event.preventDefault()
    //navigator bad, no async support
    navigator.geolocation.getCurrentPosition((position)=>{
     
        socket.emit('sendLocation',{
            lat : position.coords.latitude,
            long : position.coords.longitude,
            createdAt : moment(position.createdAt).format('h:mm:a')
        },(error)=>{
            $shareLocationButton.removeAttribute('disabled')
            if(error) return console.log(error)
            console.log("Location delivered!")
        }
        )



    })

})

//sends user join status
socket.emit('join',{username , room} , (error) =>{
    if(error){
        alert(error)
        location.href = "/"
    }
})
