const speedElement = document.querySelector("#speed")
const starBtn = document.querySelector("#start")
const stopBtn = document.querySelector("#stop")

let watchID = null
let currentRide = null

starBtn.addEventListener("click", () => {

    if (watchID)
        return

    function handleSuccess(position) {
        addPosition(currentRide,position)
        speedElement.innerText = position.coords.speed ?
            (position.coords.speed * 3.6).toFixed(1) : 0

    }

    function handleError(error) {
        console.log(error.msg)

    }


    const options = { enableHighAccuracy: true }


    currentRide = createNewRide()

    watchID = navigator.geolocation.watchPosition(handleSuccess, handleError, options)
    
    starBtn.classList.add("d-none")
    stopBtn.classList.remove("d-none")


})

stopBtn.addEventListener("click", () => {

    if (!watchID) return

    navigator.geolocation.clearWatch(watchID)
    watchID = null

    updateStopTime(currentRide)

    const ride = getRideRecord(currentRide)

    if (!ride.data || ride.data.length < 2) {
        deleteRide(currentRide)

        alert("Não foi possível coletar dados suficientes")

        window.location.href = "./"
        return
    }

    window.location.href = "./"
})

