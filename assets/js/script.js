let searchButton = document.querySelector('.search')
let todayEl = document.querySelector('.today')
let forecastAr = $('.forecast')
let dateAr = $('.date')
let historyEl = $('.history')
let iconURL =  'https://openweathermap.org/img/wn/'
let apiKey = '0b34c0c779002825da1931b61289722d'

// get search history from local storage
let searchHistory = JSON.parse(localStorage.getItem('searchHistory'));
if(searchHistory != null) {
    printHistory()
}

// load date to header
$('#currentDay').text(dayjs().format('MMMM D, YYYY'));

for(let i=0; i<dateAr.length; i++) {
    dateAr.eq(i).text(dayjs().add((i+1),'day').format('MMMM D, YYYY'))
}

// load state dropdown
let stateList=['AK', 'AL', 'AR', 'AS', 'AZ', 'CA', 'CO', 'CT', 'DC', 'DE', 'FL', 'GA', 'HI', 'IA', 'ID', 'IL', 'IN', 'KS', 'KY', 'LA', 'MA', 'MD', 'ME', 'MI', 'MN', 'MO', 'MS', 'MT', 'NC', 'ND', 'NE', 'NH', 'NJ', 'NM', 'NV', 'NY', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VA', 'VT', 'WA', 'WI', 'WV', 'WY']

for(let i=0; i<stateList.length; i++) {
    $("select").append($('<option>'+stateList[i]+'</option>'))
}

// functions

function fetchWeatherData(event) {
    event.preventDefault();
    let searchText = document.querySelector('#searchText').value.trim()
    $('img').remove()
    console.log(encodeURIComponent(searchText))
    
    let currentURL = 'https://api.openweathermap.org/data/2.5/weather?q='+encodeURIComponent(searchText)+'&appid='+apiKey+'&units=imperial'
    
    console.log(currentURL)
    fetch(currentURL)
    .then(function (response) {
        console.log(response.status)
        if (!response.ok) {
            alert('City not found... Try again')
        }
        return response.json();
    })
    .then(function (currentWeather){

        console.log(currentWeather)
        if(currentWeather.cod === 200) {
            let lat = currentWeather.coord.lat
            let long = currentWeather.coord.lon
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
                let weatherToday= [
                    currentWeather.name, 
                    'Temperatures '+forecastWeather.current.temp+' \u00B0F',
                    'Wind Speed: '+forecastWeather.current.wind_speed+' mph',
                    'Humidity: '+forecastWeather.current.humidity+'%',
                    'UV Index: '+forecastWeather.current.uvi,
                ]
        
                for(let i=0; i<weatherToday.length; i++) {
                    $($(todayEl).find('p')[i]).text(weatherToday[i])
                }   
                $('#cityName').append($('<img src=\''+iconURL+currentWeather.weather[0].icon+'.png\'>'))
                
                if(forecastWeather.current.uvi<3) {
                    $('.uv').attr('class','bg-success text-light text-center rounded-pill').addClass('uv col-2')
                }

                if(forecastWeather.current.uvi>=3&&forecastWeather.current.uvi<8) {
                    $('.uv').attr('class','bg-warning text-center rounded-pill').addClass('uv col-2')
                }

                if(forecastWeather.current.uvi>=8) {
                    $('.uv').attr('class','bg-danger text-light text-center rounded-pill').addClass('uv col-2')
                }

                for(let i=0; i<forecastAr.length; i++) {
                    let weatherAr = $(forecastAr[i]).find('p')
                    let weatherTxt = [
                        'Temperature: '+forecastWeather.daily[i+1].temp.day+' \u00B0F',
                        'Wind Speed: '+forecastWeather.daily[i+1].wind_speed+' mph',
                        'Humidity: '+forecastWeather.daily[i+1].humidity+'%'
                    ]
                    dateAr.eq(i).append($('<img src=\''+iconURL+forecastWeather.daily[i+1].weather[0].icon+'.png\'>'))
                    for(let j=1, k=0; j<weatherAr.length; j++, k++) {
                        weatherAr.eq(j).text(weatherTxt[k])
                        
                        
                    }
                    console.log(weatherAr)
                }
                if(searchHistory===null) {
                    searchHistory = [currentWeather.name]
                    console.log(searchHistory)
                    localStorage.setItem('searchHistory', JSON.stringify(searchHistory))
                } else {
                    for(let each of searchHistory) {
                        if(each === currentWeather.name) {
                            console.log(searchHistory)
                            printHistory()
                            return
                        }
                    }
                    searchHistory.push(currentWeather.name)
                    console.log(searchHistory)
                    localStorage.setItem('searchHistory', JSON.stringify(searchHistory))
                }
                printHistory()
            })
        }
    })

}

function printHistory(){
    $(historyEl).empty()
    for(let each of searchHistory){
        $(historyEl).append($('<button>'+each+'</button>')).children().attr("class","btn btn-primary m-2 historyItem")
    }
    let historyAr = $('.historyItem');
    console.log(historyAr)
    return historyAr
}

function addHistory(event) {
    document.querySelector('#searchText').value = event.currentTarget.innerHTML
    fetchWeatherData(event)
}


// event listeners
searchButton.addEventListener('click', fetchWeatherData)
historyEl.on('click','button',addHistory)