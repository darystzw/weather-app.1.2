'use strict'
const search = document.querySelector('.searchBtn');
const weatherTab = document.querySelector('.weather');
const windSpeed = document.querySelector('.wind');
const humidityVal = document.querySelector('.humidity');
const tempValue = document.querySelector('.temp');
const city = document.querySelector('.cityName');
const cityValue = document.querySelector('.city');
const nullCity = document.querySelector('.noValue');
const weatherIcon = document.querySelector('.weatherIcon');
const card = document.querySelector('.card');
const cityLoc = document.querySelector('.location');
const cityNav = document.querySelector('.navbar');
const weekDay = document.querySelector('.week');
const dateNum = document.querySelector('#dateNum');
const monthValue = document.querySelector('#monthText');
const cityInput = document.querySelector('#cityInput');
const suggestions = document.querySelector('#suggestions');
const forecastSec = document.querySelector('.forecastSec');
const deteForecast = document.querySelector('#dateForecast');
const popover = document.querySelector('.popover');
const locationYes = document.querySelector('.yes');
const locationNo = document.querySelector('.no');
const tempText = document.querySelector('.tempForecast');
const tempSymbol = document.querySelector('#tempSymbol');

const apiUrl = `https://api.openweathermap.org/data/2.5/weather?`;
const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?`;
const apiKey = `34975d3489843481b4a7a97179bcf3df`;
const mapboxToken = 'pk.eyJ1IjoiZGFyeXN0enciLCJhIjoiY21hbnBnN2ZwMDE0ZzJwcjB2OWZzOXludyJ9.KiyIE3zN0g9QNwV9d3Ey7g';

const getSuggestions = async (unit)=>{
    const query = cityInput.value.trim();
    if(query.length < 2){
        suggestions.innerHTML = '';
        suggestions.style.display = 'none';
        return;
    }

    try{
        const mapboxUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${mapboxToken}&types=place&autocomplete=true&limit=5`;
        const response = await fetch(mapboxUrl);
        var data = await response.json();

        suggestions.innerHTML = '';

        data.features.forEach((feature) =>{
            const li = document.createElement('li');
            li.textContent = feature.place_name;
            li.addEventListener('click', ()=>{
                cityInput.value = feature.text;
                suggestions.innerHTML = '';
                suggestions.style.display = 'none';
                checkweather(unit);
            });
            suggestions.appendChild(li);
        })
        suggestions.style.display = 'block';
    }
    catch(error){
        console.log('error fetching suggestions', error);
        suggestions.innerHTML = '';
        suggestions.style.display = 'none';
    }
}
const checkweather = async function(units = 'metric', cityInput = null) {
    const cityName = cityInput || city.value.trim();
    if(!cityName){
        nullCity.style.display = 'block';
        weatherTab.style.display = 'none';
        suggestions.style.display = 'none';
    }
    else{
        try{
            const response = await fetch(apiUrl+ `units=${units}`+`&q=${cityName}`  + `&appid=${apiKey}`);
            var data = await response.json();
            console.log(data);
            
            if(data.cod != 200){
                nullCity.innerHTML = 'Please! Enter valid City name';
                nullCity.style.display = 'block';
                weatherTab.style.display = 'none';
            }

            tempValue.innerHTML = Math.round(data.main.temp)+ (units === 'metric' ?' °C':' °F');
            cityValue.innerHTML = `${data.weather[0].description}`;
            humidityVal.innerHTML = data.main.humidity+'%';
            windSpeed.innerHTML = data.wind.speed+' km/h';
            weatherIcon.src = `icons/${data.weather[0].main}.png`;
            cityLoc.innerHTML = `${data.name}`;
            cityNav.style.display = 'block';
            card.style.display = 'block';
            weatherTab.style.display = 'block';
            nullCity.style.display = 'none';
            localStorage.setItem('currentCity', data.name); 
        
            updateDateDay();
            getForecast(cityName, units);
    
        }
        catch (error){
            nullCity.style.display = 'block';
            weatherTab.style.display = 'none';
        }
    }
   
    
}
window.addEventListener('DOMContentLoaded', function(){
    if (popover.style.display === 'none' || popover.style.display === '') {
        popover.style.display = 'block';
      } else {
        popover.style.display = 'none';
      }
});
const findMyCoordinates = async (pos)=>{
    const crd = pos.coords;
    const latitude = crd.latitude;
    const longitude = crd.longitude;

        try{
            const response = await fetch(apiUrl + `lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`);
            var data = await response.json();
            console.log(data);

            if (data.cod !== 200) {
                throw new Error("Invalid response");
            }

            let cityName = data.name;
            popover.style.display ='none';

            tempValue.innerHTML = Math.round(data.main.temp)+' °C';
            cityValue.innerHTML = `${data.weather[0].description}`;
            humidityVal.innerHTML = data.main.humidity+'%';
            windSpeed.innerHTML = data.wind.speed+' km/h';
            weatherIcon.src = `icons/${data.weather[0].main}.png`;
            cityLoc.innerHTML = `${data.name}`;
            cityNav.style.display = 'block';
            card.style.display = 'block';
            weatherTab.style.display = 'block';
            forecastSec.style.display = 'block';
            forecastSec.style.display = 'flex';
            nullCity.style.display = 'none';
            localStorage.setItem('currentCity', data.name);

            
            updateDateDay();
            getForecast(cityName, 'metric');
    
        }
        catch (error){
            card.style.display = 'block';
            nullCity.style.display = 'none';
            weatherTab.style.display = 'none';
        }
    }

const updateDateDay = () => {
        const now = new Date();
    
        const weekDayText = now.toLocaleDateString(undefined, { weekday: 'long' });  // e.g., Tuesday
        const dateText = now.toLocaleDateString(undefined, {day: 'numeric'}); 
        const monthText = now.toLocaleDateString(undefined, {month: 'long'});

        weekDay.innerHTML = weekDayText+', ';
        dateNum.innerHTML = dateText;
        monthValue.innerHTML = monthText;
    };
const getForecast = async (cityName, units) => {
        if (!cityName) return;
    
        try {
            const response = await fetch(forecastUrl + `units=${units}&q=${cityName}&appid=${apiKey}`);
            const forecastData = await response.json();
    
            const dailyData = {};
            const today = new Date().toDateString();

            forecastData.list.forEach(entry => {
                const date = new Date(entry.dt_txt);
                const dayKey = date.toDateString();

                if (date.getHours() === 12 && dayKey !== today) {  
                    dailyData[dayKey] = entry;
                }
            });
    
            renderForecast(Object.values(dailyData).slice(0, 8), cityName, units);
        } catch (error) {
            console.error("Forecast fetch error:", error);
        }
    }; 
    const renderForecast = async (days, cityName, units) => {
        forecastSec.innerHTML = '';
    
        days.forEach(day => {
            const date = new Date(day.dt_txt);
            const dateStr = `${date.getDate()} `;
            const monthStr = `${date.toLocaleString('default', { month: 'short' })}`;
            const temp = Math.round(day.main.temp);
    
            const cardForecast = document.createElement('div');
            cardForecast.className = 'forecast';
            cardForecast.innerHTML = `
                <span class="date">
                    <sup id="dateForecast">${dateStr}</sup> 
                    <sub id="monthForecast">${monthStr}</sub>
                </span>
                <div class="forecastIcon">
                    <img src="icons/${day.weather[0].main}.png" alt="cloudy day" height="70px" class="forecast5Icon">
                </div>
                <h2 class="tempForecast">${temp} ${units === 'metric' ? '°C' : '°F'}</h2>
            `;
            forecastSec.appendChild(cardForecast);
        });
    }
    
locationYes.addEventListener('click', ()=>{
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            findMyCoordinates, 
            (error) => {
                console.error("Geolocation error:", error);
                nullCity.innerHTML = "Location access denied or unavailable.";
                nullCity.style.display = 'block';
                popover.style.display = 'none';
                card.style.display = 'block';
            }
        );
    } else {
        nullCity.innerHTML = "Geolocation not supported by your browser.";
        nullCity.style.display = 'block';
        popover.style.display = 'none';
        card.style.display = 'block';
    }    
});
locationNo.addEventListener('click', ()=>{
    card.style.display = 'block';
    popover.style.display ='none';
})
cityInput.addEventListener('input', ()=>{
    const unit = tempSymbol.value;
    getSuggestions(unit);
})
search.addEventListener('click', () => {
    const unit = tempSymbol.value;
    checkweather(unit);
});

search.addEventListener('click', () => {
    const unit = tempSymbol.value;
    checkweather(unit);
});

city.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        const unit = tempSymbol.value;
        checkweather(unit);
    }
});

tempSymbol.addEventListener('change', () => {
    let unit = tempSymbol.value;
    const savedCity = localStorage.getItem('currentCity');

    if (savedCity) {
        checkweather(unit, savedCity);
    }
    localStorage.setItem('currentSymbol', unit);
});