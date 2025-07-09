// admin/src/socket.js (yoki admin/renderer/socket.js)
import { io } from "socket.io-client"

// Bu yerda admin/serverning IP-manzili
const ADMIN_STATIC_IP = "192.168.1.10"

const socket = io(`http://${ADMIN_STATIC_IP}:3000`, {
    transports: ['websocket'],
    reconnection: true
})

// ❗️Diqqat: macaddress import QILINMAYDI!
// ❗️Diqqat: Hech qanday socket.emit('new-user', ...) YO‘Q!

export default socket
