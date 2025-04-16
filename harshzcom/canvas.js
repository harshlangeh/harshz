


export default function Canvas() {
    const canvas = document.getElementById("canvas")

    canvas.width = window.innerWidth
    canvas.height = 200

    let context = canvas.getContext('2d');


    canvas.style.background = "green"



    
    context.fillRect(0,0,100,100)
    context.fillRect(0,10,100,100)
    context.fillStyle = "red"
    context.fillRect(10,0,100,100)
    context.fillRect(100,100,100,100)

    context.beginPath()
    context.arc(100, 100, 50, 0, Math.PI*2, false)
    context.lineWidth = 20;
    context.strokeStyle = "white"
    context.stroke()
    context.closePath()

    return canvas
}

