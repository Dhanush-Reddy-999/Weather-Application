import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import {HttpClient} from '@angular/common/http';
import { IWeather } from '../iweather';
import Chart from 'chart.js/auto';
import { withLatestFrom } from 'rxjs';
import { NgxSpinnerService } from 'ngx-spinner';
import { ApiService } from '../api.service';
import { error } from '@angular/compiler/src/util';

//const API_KEY = environment.API_KEY
//const API_URL = environment.API_URL


@Component({
  selector: 'app-weather',
  templateUrl: './weather.component.html',
  styleUrls: ['./weather.component.css']
})
export class WeatherComponent implements OnInit {

  temperature_conditions: any
  temp:any
  min_temp: any
  max_temp: any
  humidity: any
  humidity_daily: any
  pressure: any
  pressure_daily: any
  real_feel: any
  real_feel_daily: any
  weather_conditions: any

  weather_icon: any
  weather_icon_url: any
  description: any
  description_daily: any
  wind_speed: any
  wind_speed_daily:any
  city = ""
  city_temp= ''
  
  loading=true
  lat: any
  lon:any
  dailyData:any
  
  weather_conditions_daily : IWeather[] = []

  weather_icon_daily: Array<string> = []
  
  weather_icon_url_daily: Array<string> = []

  todayDate = new Date()
  weekday : Array<string> = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]
  nextDays : Array<string> = []
  dayTemps : Array<string> = []
  nightTemps : Array<string> = []
  myChart: any
  dates: Array<any> = []

  errorMessage: string | undefined
  

  constructor(private apiService:ApiService,private SpinnerService: NgxSpinnerService) { 
  
  }

  ngOnInit() { 
    
  }

  checkInputDataEmpty() {
    if(this.city.length===0) {
      console.log("City length "+this.city.length)
      this.dailyData=[]
      this.dayTemps=[]
      this.nightTemps=[]
      this.weather_conditions_daily=[]
      this.weather_icon_daily=[]
      this.weather_icon_url_daily=[]
      this.dates=[]
      this.myChart.destroy()
      this.loading=true
      this.errorMessage=undefined
    }
  }

  
  

  getCurrentDayWeatherData() {
      this.SpinnerService.show();
      //this.httpClient.get(`${API_URL}/weather?q=${this.city}&units=metric&appid=${API_KEY}`).subscribe((data:any)=> {
      this.apiService.getCurrentDayData(this.city)
      .subscribe(
        (data)=> {
        console.log(data)
      
        this.temperature_conditions = data['main']
        this.temp=this.temperature_conditions['temp']
        
        console.log(this.temp)
        
        this.humidity=this.temperature_conditions['humidity']
        this.pressure = this.temperature_conditions['pressure']
        this.real_feel=this.temperature_conditions['feels_like']
        this.min_temp=this.temperature_conditions['temp_min']
        this.max_temp=this.temperature_conditions['temp_max']
        this.weather_conditions = data['weather'][0]
        this.weather_icon = this.weather_conditions['icon']
        this.weather_icon_url = `http://openweathermap.org/img/wn/${this.weather_icon}.png`
        this.description = this.weather_conditions['description']
        this.wind_speed = data['wind']['speed']
        this.lat=data['coord']['lat']
        this.lon=data['coord']['lon']
        
        this.loading = false
        this.next7DaysForecast()
      }, 
      (error: string)=>{
        this.errorMessage=error
        this.SpinnerService.hide()
      })
  }

  next7DaysForecast() {
    //this.httpClient.get(`${API_URL}/onecall?lat=${this.lat}&lon=${this.lon}&units=metric&appid=${API_KEY}`).subscribe((forecastData : any)=>{
      this.apiService.get7daysForecast(this.lat,this.lon).subscribe((forecastData : any)=>{
      console.log(forecastData)
        
      this.dailyData=forecastData['daily']
      
      console.log(this.dailyData)
      
        this.dailyData.forEach((element:any) => {
          this.dayTemps.push((element.temp['day']).toFixed(0))
          this.nightTemps.push((element.temp['night']).toFixed(0))
        });
        console.log("Day and Night Temps"+" "+this.dayTemps+" "+this.nightTemps)
        

      this.dailyData.forEach((element:any) => {
        this.weather_conditions_daily.push(element.weather[0])
      });


      console.log(this.weather_conditions_daily)


      this.weather_conditions_daily.forEach((element:any) => {
        this.weather_icon_daily.push(element['icon'])
      })

      console.log(this.weather_icon_daily)

      this.weather_icon_daily.forEach((element:any) => {
        this.weather_icon_url_daily.push(`http://openweathermap.org/img/wn/${element}.png`)
      })

      console.log(this.weather_icon_url_daily)

      for(let i=0;i<8;i++) {
        this.dates.push(this.addDays(i))
      }

      console.log(this.dates)

      this.getChart()
      
      setTimeout(() => {
        this.SpinnerService.hide()
      }, 1000);

  })
  }

  addDays(days : number): string{
    var futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    var temp =futureDate.toDateString()
    var temp1=temp.substring(0,10)
    return temp1;
  }

  getChart() {
    console.log("Today"+this.weekday[this.todayDate.getDay()])

      for(let i=0;i<7;i++) {
        if(this.todayDate.getDay()+i < 6) {
          this.nextDays.push(this.weekday[this.todayDate.getDay()+i+1])
        }
        else {
          this.nextDays.push(this.weekday[this.todayDate.getDay()+i-6])
        }
      }
      this.nextDays.push(this.weekday[this.todayDate.getDay()-6])

      console.log("Next Days"+" "+this.nextDays)

    this.myChart = new Chart("myChart", {
      type: 'line',
      data: {
          labels: this.dates,
          
          datasets: [
            {
              label: 'Day Temperature',
              data: this.dayTemps,
              borderColor: 'red',
              borderWidth: 3
          },
          {
            label: 'Night Temperature',
            data: this.nightTemps,
            borderColor: 'black',
            borderWidth: 3
        }
        ]
      },
      options: {
         elements: {
            line : {
              tension:0.2
            }
         },
         plugins : {
            legend : {
              labels : {
                color: 'white'
              }
            }
         },
          scales: {
              xAxis : {
                ticks: {
                  color: 'white'
                },
                grid: {
                  color: 'white'
                }
              },
              yAxis: {
                  beginAtZero: true,
                  ticks: {
                    color: 'white',
                  },
                  grid: {
                    color: 'white'
                  }
              }
          }
      }
    }); 
  }
  
}



function next(next: any, arg1: (data: any) => void, arg2: (error: any) => void) {
  throw new Error('Function not implemented.');
}
//background-image: url("https://img.freepik.com/free-photo/light-blue-gradient-abstract-banner-background_8087-1851.jpg?size=626&ext=jpg&ga=GA1.2.76964913.1647761543");
    