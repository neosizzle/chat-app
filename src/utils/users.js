
var users = []

//addUser, removeuser,getuser,getuserinroom

const addUser = ({id, username, room})=>{

    //check null data
    if(!username || !room) return{error : "No username and room received!"}

    //clean data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    //check existing data
    const existingUser = users.find((user)=>{
        return user.room == room & user.username == username
    })
    if(existingUser)return {error : "Username is taken!"}
    //storing said data
    const user = {id , username , room}
    users.push(user)
    return {user}

}


const removeUser = ((id) =>{
    const index = users.findIndex((user)=>user.id == id)

    if(index != -1) return users.splice(index , 1)[0]

    return {error : "User not found!"}

})

const getUser = (id)=>{
    return users.find((user)=>{
        return user.id == id
    })

}

const getUsersInRoom = (room)=>{
    return users.filter((user)=> user.room == room)
}

const getAllUsers = ()=>{
    return users
}


module.exports = {
    addUser,
    getUser,
    getUsersInRoom,
    removeUser,
    getAllUsers
}
