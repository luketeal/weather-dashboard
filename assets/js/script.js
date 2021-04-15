let searchButton = document.querySelector('.search')
let todayEl = document.querySelector('.today')
let forecastEls = $('.forecast')

console.log(searchButton)
console.log(forecastEls)



// load date to header
$('#currentDay').text(dayjs().format('MMMM D, YYYY'));


let apiKey = '0b34c0c779002825da1931b61289722d'


// functions

function fetchWeatherData(event) {
    event.preventDefault();
    let searchText = document.querySelector('#searchText').value
    console.log(encodeURIComponent(searchText))
    
    let currentURL = 'https://api.openweathermap.org/data/2.5/weather?q='+encodeURIComponent(searchText)+'&appid='+apiKey+'&units=imperial'
    
    console.log(currentURL)
    fetch(currentURL)
    .then(function (response) {
        console.log(response.status)
        return response.json();
    })
    .then(function (currentWeather){

        console.log(currentWeather)
        let lat = currentWeather.coord.lat
        let long = currentWeather.coord.lat
        console.log(lat)
        let forecastURL = 'https://api.openweathermap.org/data/2.5/onecall?lat='+lat+'&lon='+long+'&exclude=minutely,hourly,alerts&appid='+apiKey+'&units=imperial'
        console.log(forecastURL)

        fetch(forecastURL)
        .then(function (response){
            console.log(response.status)
            return response.json();
        })
        .then(function (forecastWeather){
            console.log(forecastWeather)
            $(todayEl).append($('<ul><li>Temparature: '+forecastWeather.current.temp+'</li></ul>'))
            forecastEls.eq(0).append($('<ul><li>Temparature: '+forecastWeather.current.temp+'</li></ul>'))
        })
    })

}

// event listeners
searchButton.addEventListener('click', fetchWeatherData)