let searchButton = document.querySelector('.search')
let todayEl = document.querySelector('.today')
let forecastAr = $('.forecast')
let dateAr = $('.date')
let historyEl = $('.history')
let iconURL =  'https://openweathermap.org/img/wn/'
let apiKey = '0b34c0c779002825da1931b61289722d'

// --------------- ON PAGE LOAD ------------------

// get search history from local storage and print to page if there is any
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

// ------------------------ FUNCTIONS ---------------------------------

// This function gets weather data for the city searched and updates the page with most of the information
function fetchWeatherData(event) {
    event.preventDefault();
    // trim accidental spaces
    let searchText = document.querySelector('#searchText').value.trim()

    // remove images any icons on the page
    $('img').remove()
    
    // declare the search api url for the current weather
    let currentURL = 'https://api.openweathermap.org/data/2.5/weather?q='+encodeURIComponent(searchText)+'&appid='+apiKey+'&units=imperial'
    
    // fetch the info for the current weather
    fetch(currentURL)
    .then(function (response) {

        // if the response is not ok alert the user
        if (!response.ok) {
            alert('City not found... Try again')
        }
        return response.json();
    })
    .then(function (currentWeather){

        // if the response for current weather is ok then go through the response object and put the info on the page.
        if(currentWeather.cod === 200) {

            // get the lat and long of the location for use in forecast search with onecall api
            let lat = currentWeather.coord.lat
            let long = currentWeather.coord.lon

            // declare the search api url for the onecall api to be used to get the forecast and the uvi
            let forecastURL = 'https://api.openweathermap.org/data/2.5/onecall?lat='+lat+'&lon='+long+'&exclude=minutely,hourly,alerts&appid='+apiKey+'&units=imperial'

            // fetch the info for the forecast weather from the onecall api
            fetch(forecastURL)
            .then(function (response){
                return response.json();
            })
            .then(function (forecastWeather){

                // -------- print the weather information to the page (both current and forecast) ----------

                // todays weather array
                let weatherToday= [
                    currentWeather.name, 
                    'Temperature: '+forecastWeather.current.temp+' \u00B0F',
                    'Wind Speed: '+forecastWeather.current.wind_speed+' mph',
                    'Humidity: '+forecastWeather.current.humidity+'%',
                    'UV Index: '+forecastWeather.current.uvi,
                ]
                
                // print todays weather to page
                for(let i=0; i<weatherToday.length; i++) {
                    $($(todayEl).find('p')[i]).text(weatherToday[i])
                }   

                // add icon for todays weather
                $('#cityName').append($('<img src=\''+iconURL+currentWeather.weather[0].icon+'.png\'>'))
                
                // add styling for uv index 
                if(forecastWeather.current.uvi<3) {
                    $('.uv').attr('class','bg-success text-light text-center rounded-pill').addClass('uv col-2')
                }

                if(forecastWeather.current.uvi>=3&&forecastWeather.current.uvi<8) {
                    $('.uv').attr('class','bg-warning text-center rounded-pill').addClass('uv col-2')
                }

                if(forecastWeather.current.uvi>=8) {
                    $('.uv').attr('class','bg-danger text-light text-center rounded-pill').addClass('uv col-2')
                }

                // get and print forecast weather to page
                for(let i=0; i<forecastAr.length; i++) {

                    // set weatherAr array to the p tags within each forecast day div
                    let weatherAr = $(forecastAr[i]).find('p')

                    // set the forcasted days weather array
                    let weatherTxt = [
                        'Temperature: '+forecastWeather.daily[i+1].temp.day+' \u00B0F',
                        'Wind Speed: '+forecastWeather.daily[i+1].wind_speed+' mph',
                        'Humidity: '+forecastWeather.daily[i+1].humidity+'%'
                    ]

                    // add the weather icon
                    dateAr.eq(i).append($('<img src=\''+iconURL+forecastWeather.daily[i+1].weather[0].icon+'.png\'>'))

                    // for each p tag within each forecast day div print the weather info 
                    for(let j=1, k=0; j<weatherAr.length; j++, k++) {
                        weatherAr.eq(j).text(weatherTxt[k])                     
                    }
                }

                // if there was nothing in search history to begin with, set the current search item into search history and local storage
                if(searchHistory===null) {
                    searchHistory = [currentWeather.name]
                    localStorage.setItem('searchHistory', JSON.stringify(searchHistory))
                } else {
                    // evaluate if the item searched is already in search history, if so print the search history and break out of the function
                    for(let each of searchHistory) {
                        if(each === currentWeather.name) {
                            printHistory()
                            return
                        }
                    }

                    // if the item searched was not already in search history, add the city name to the search history and local storage
                    searchHistory.push(currentWeather.name)
                    localStorage.setItem('searchHistory', JSON.stringify(searchHistory))
                }

                // print the search histor to the page with the printHistory function
                printHistory()
            })
        }
    })

}

// the print history function first clears what is on the page and then adds whatever is in the search history array
function printHistory(){
    $(historyEl).empty()
    for(let each of searchHistory){
        $(historyEl).append($('<button>'+each+'</button>')).children().attr("class","btn btn-primary m-2 historyItem")
    }
}

// if one of the search history buttons is pressed put the button text (which came from the city name in the api) into the search bar and run the fetch weather data function
function addHistory(event) {
    document.querySelector('#searchText').value = event.currentTarget.innerHTML
    fetchWeatherData(event)
}

// event listeners for search button and search history (delegated to the search history buttons)
searchButton.addEventListener('click', fetchWeatherData)
historyEl.on('click','button',addHistory)