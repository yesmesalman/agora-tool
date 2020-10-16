let handleFail = function(err){
    console.log("Error : "+err)
}


let remoteContainer = document.getElementById("remote-container")
let canvasContainer = document.getElementById("canvas-container")

let addVideoStream = function(streamId){
    let div = document.createElement("div")
    div.id = streamId
    div.style.transform = "rotateY(180deg)"
    remoteContainer.appendChild(div)
}

let removeVideoStream = function(evt){
    let stream = evt.stream
    stream.stop()

    let div = document.getElementById(stream.getId())
    div.parentNode.removeChild(div)
    console.log("remote stream is removed "+ stream.getId())
}

let addCanvas = function(streamId){
    let video = document.getElementById(`video${streamId}`)
    let canvas = document.createElement("canvas")
    canvasContainer.appendChild(canvas)
    let ctx = canvas.getContext("2d")

    video.addEventListener("loadmetadata", function(){
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
    })

    video.addEventListener("play", function(){
        var $this = this
        (function loop(){
            if($this.paused && !$this.ended){
                canvas.width = video.videoWidth
                canvas.height = video.videoHeight
            }
            ctx.drawImage($this, 0, 0)
            setTimeout(loop, 1000 / 30)
        })()
    }, 0)
}

let client = AgoraRTC.createClient({
    mode: "live",
    codec: "h264"
})

client.init("33e600ebfad946eb96e88b90133769fe", () => {
    console.log("Client init")
})

client.join(null, "agore-demo", null, (uid) => {
    let localStream = AgoraRTC.createStream({
        streamID: uid,
        audio: false,
        video: true,
        screen: false,
    })

    localStream.init(function(){
        localStream.play("me")
        client.publish(localStream.handleFail)

        client.on("stream-added", function(evt){
            client.subscribe(evt.stream.handleFail)
        })

        client.on("stream-subscribed", function(evt){
            let stream = evt.stream
            addVideoStream(stream.getId())
            stream.play(stream.getId())
            addCanvas(stream.getId())
        })

        client.on("stream-removed", removeVideoStream)
    }, handleFail)
}, handleFail)