let handleFail = function(err){
    console.log("Error : ",err)
}


let remoteContainer = document.getElementById("remote-container")
let canvasContainer = document.getElementById("canvas-container")

let addVideoStream = function(streamId){
    let div = document.createElement("div")
    div.id = streamId
    // div.style.transform = "rotateY(180deg)"
    remoteContainer.appendChild(div)
}

let removeVideoStream = function(evt){
    let stream = evt.stream
    stream.stop()

    let div = document.getElementById(String(stream.getId()))
    div.parentNode.removeChild(div)
    console.log("remote stream is removed "+ stream.getId())
}

let addCanvas = function(streamId){
    let video = document.getElementById(`video${streamId}`)
    let canvas = document.createElement("canvas")
    canvasContainer.appendChild(canvas)
    let ctx = canvas.getContext("2d")
    // ctx.rotate(180)

    video.addEventListener("loadmetadata", function(){
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
    })

    video.addEventListener("play", function(){
        var $this = this
        function loop(){
            if($this.paused && !$this.ended){
                canvas.width = video.videoWidth
                canvas.height = video.videoHeight
            }
            ctx.drawImage($this, 0, 0)
            setTimeout(loop, 1000 / 30)
        }
        loop()
    }, 0)
}

let client = AgoraRTC.createClient({
    mode: "live",
    codec: "h264"
})

client.init("33e600ebfad946eb96e88b90133769fe", () => {
    console.log("Client init")
})

client.join("00633e600ebfad946eb96e88b90133769feIAAPJK9BPk2qpoJWUKs+KcQHgMCXFpj3fc9JIQp99SB+BbavbpoAAAAAEAA1HXOdcjiLXwEAAQBxOItf", "agora-demo", null, (uid) => {
    let localStream = AgoraRTC.createStream({
        streamID: uid,
        audio: false,
        video: true,
        screen: false,
    })

    localStream.init(function(){
        localStream.play("me")
        client.publish(localStream)

        client.on("stream-added", function(evt){
            client.subscribe(evt.stream)
        })

        client.on("stream-subscribed", function(evt){
            let stream = evt.stream
            addVideoStream(String(stream.getId()))
            stream.play(String(stream.getId()))
            addCanvas(String(stream.getId()))
        })

        client.on("stream-removed", removeVideoStream)
    }, handleFail)
}, handleFail)