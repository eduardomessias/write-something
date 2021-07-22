const mongoose = require('mongoose')
const MONGO_URI = 'mongodb+srv://god:8fcgAQTPQbWfh5CE@cluster0.tvme0.mongodb.net/write-something?retryWrites=true&w=majority'
const MONGOOSE_OPTIONS = {
    useNewUrlParser:true,
    useUnifiedTopology:true,
    useFindAndModify:false,
    useCreateIndex:true
}
mongoose.connect(MONGO_URI,MONGOOSE_OPTIONS)


const Document = require('./Document')
const DEFAULT_VALUE = ""


const io = require ('socket.io')(3001, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ["GET","POST"]
    }
})


io.on ("connection",socket => {
    socket.on('get-document',async documentId => {
        const document = await findOrCreateDocument(documentId)
        socket.join(documentId)
        socket.emit('load-document',document.data)
        socket.on('send-change',delta => {
            socket.broadcast.to(documentId).emit('receive-change',delta)
        })
        socket.on('save-document',async data => {
            await Document.findByIdAndUpdate(documentId,{data})
        })
    })
    console.log("connected")
})


async function findOrCreateDocument(id) {
    if (id == null) return
    const document = await Document.findById(id)
    if (document) return document
    return await Document.create({_id:id,data:DEFAULT_VALUE})
}