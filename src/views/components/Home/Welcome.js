import React, { Component } from 'react';
import { View, Text,TextInput, Image,ScrollView, SafeAreaView, NetInfo, StyleSheet,Dimensions,TouchableOpacity,FlatList,Modal,Animated,TouchableHighlight,ImageBackground } from 'react-native';
import { Container,FlatlistContent, Header, Content, Form, Item, Input, Label,Button, Toast, Icon, Accordion } from 'native-base';
import { _retrieveWaypoints,image,_retrieveAddress,_retrieveWarehouse,_storeData,_retrieveData,_storeRouteApiStatus,_retrieveFulladdress,Loader,_retrieveRouteApiStatus,_retrieveUser,_showSuccessMessage, _storeNextPoint, _retrieveNextPoint,_showErrorMessage,_storeWaypoints,_storeAddress,_storeFulladdress } from 'assets';
// import { StackActions } from '@react-navigation/native';
import { getRoutes,markNumberToPackages,getUpdatedPoints,getPostalCode,getRouteApiStatus,getData,postData,get_rescue_last_load } from 'api';
import { AsyncStorage } from 'react-native';
import MapViewDirections from 'react-native-maps-directions';
import MapView, { Marker, AnimatedRegion,PROVIDER_GOOGLE,Polyline,Polygon } from "react-native-maps";
import {request, PERMISSIONS, RESULTS} from 'react-native-permissions';
import List from './List';
import PushNotification from "react-native-push-notification";

import getDirections from 'react-native-google-maps-directions' 

import 'react-native-gesture-handler';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Geolocation from 'react-native-geolocation-service';
import CustomHeader from '../../CustomHeader';
navigator.geolocation = require('@react-native-community/geolocation');
const haversine = require('haversine');
 
 
const { width, height } = Dimensions.get('window'); 
const ASPECT_RATIO = width / height;
 

const LATITUDE = 43.6038821;
const LONGITUDE = -79.5127419;
const LATITUDE_DELTA = 0.1;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;
const GOOGLE_MAPS_APIKEY = 'AIzaSyAeewuHY3zbXBGxOB8kR-4dFNVFoWyhNTo';
import MakeItRain from 'react-native-make-it-rain';
const WAYPOINT_LIMIT = 10;
class Welcome extends Component { 
  constructor(props){
    super(props);   
 
    this.state = {

      latitude: null,
      longitude: null,
      maplatitude: null,
      maplongitude: null,
      origin:null,
      destination:null,
      routeCoordinates: [],
      distanceTravelled: 0,
      prevLatLng: {},
      points:[],
      FlatListItems:[],
      points2:null,
      showview:'list',
      warehouse:'',
      fulladdress:[],
      nextpoint:0,
      LATITUDE_DELTA : 0.1,
      LONGITUDE_DELTA : LATITUDE_DELTA * ASPECT_RATIO,
      currentpointstatus:true,
      bottomMargin:null,
      title:'',
      modalVisible:false,
      retailmodalVisible:false,
      skipmodal:false,
      skipcomment:'',
      commentVisible:false,

      drivername:'',
      date:'',
      currentAddress:'',
      isloading:false,
      curruntlistindex:'',
      currenttime:'',
      rescuelist:'no',
      rescue_strtingAddress:'',
      bounceValue: new Animated.Value(600),
      iconName: "caret-down", 
      ishidden:true,
      temp:0,
      iconw:"",
      main_weather_title:'Clouds',
      employee_name:'',
      date:'',
      yard_address:'',
      yard_latitude:'',
      yard_longitude:'',
      schedule_warehouse:'',
      start_time:'',
      humidity:'',
      weather_description:'',
      wind:'',
      current_loc:'',
      current_time:'',
      user_avtar:'',
      yard_latitude:'',
      yard_longitude:'',
      gps_lat:null,
      gps_long:null,
      day_wish:'GOOD MORNING',
      milestoneModal:false,
      completed_stops:400,
      user_name:'test',
       stops:[],
      routeCoordinate:[],
      station_name:'',
      station_latitude:'',
      station_longitude:'',
      isloading:false,
      bottomMargin:null,
      totaltime:'',
      totaldistance:'',
      polygonpoint:[],
      deliverystartlat:'',
      deliverystartlon:'',
    }
    
}

componentDidMount = () => { 
  const _this = this;
  setTimeout(function(){
    if(_this.state.gps_lat != null) {
      _this.getWeathere();
      // _this.updateWaypoints();
    } else {
      _this.getCurrentPosition();
    }
    
  }, 20000);

  setTimeout(function(){
    if(_this.state.gps_lat != null) {
      _this.getWeathere();
      // _this.updateWaypoints();
    } else {
      _this.getCurrentPosition();
    }
    
  }, 40000);
  this.getMilestoneInfo();
  this.getLocationPermissions();
  //this.getWeathereDetail();
  this.getCurrentPosition();
  this.getUserInfo();

  var date = new Date;
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? '0'+minutes : minutes;
  var strTime = hours + ':' + minutes + ' ' + ampm;
  // return strTime;


     _retrieveData('user_avtar')
        .then((res) => {
          if(res != null){
            this.setState({user_avtar:res});
          }
        });


    const unsubscribe = this.props.navigation.addListener('tabPress', () => {
      this.getCurrentPosition();
    });



  get_rescue_last_load().then(res => {
    this.setState({isloading:true});
    if(res.type == 1){
      
      var stops = []; 
      var polygonpoints = []; 
      
         var count = 0;

         for (const key of res.data.LastDeliveryStops) {
          if(count != 0){
            stops.push({latitude:key.latitude,longitude:key.longitude})
          }

          count++ 
       }

        for (const key of res.data.RoutingPackages) {
          
            polygonpoints.push({latitude:key.latitude,longitude:key.longitude})
          }

       console.log(polygonpoints);

       this.setState({stops:stops,polygonpoint:polygonpoints,deliverystartlat:polygonpoints[0].latitude,deliverystartlon:polygonpoints[0].longitude});
       
       let startlatitude = '';
       let startlongitude = '';
       Geolocation.getCurrentPosition((position) => {

          startlatitude = position.coords.latitude;
          startlongitude = position.coords.longitude;
        

            this.getCenterPoint(startlatitude,startlongitude);
            // this.getCenterPoint(43.6639934,-79.4144121);


            },
            (error) => {
              _showErrorMessage(error.message+" Please try again");
            },
            {
        enableHighAccuracy: false,
        timeout: 15000
      });
     
    }
    else{
      this.setState({isloading:false}); 
      _showErrorMessage(res.message);
    }

  })


}

 

confirmDestination(){

  this.setState({currentpointstatus:true,modalVisible:false}); 
}

componentWillUnmount() {
  
}
 
getaddress(latitude){
 
   for (const key of this.state.fulladdress) {
        if(key.latitude == latitude){
          return key.address;
        }

     }
} 

 handleGetDirections = () => {
  
  const data = {
      destination: {
        latitude: this.state.station_latitude,
        longitude: this.state.station_longitude
      },
      params: [
        {
          key: "travelmode",
          value: "driving"        // may be "walking", "bicycling" or "transit" as well
        },
        {
          key: "dir_action",
          value: "navigate"       // this instantly initializes navigation using the given travel mode
        }
      ],
      waypoints: [
        
        
      ]
    }
 
    getDirections(data)
  
  }


async getCenterPoint (startlatitude,startlongitude){

if(startlatitude && startlongitude){
  var distance = [];
  for (const key of this.state.stops) {

    await fetch("https://route.ls.hereapi.com/routing/7.2/calculateroute.json?apiKey=hoeC8KKbZAQv2dVprjVcaN0LrXnojTkNThDzV9iG2kM&mode=fastest;car&waypoint0="+startlatitude+","+startlongitude+"&waypoint1="+key.latitude+","+key.longitude+"&height=5",{
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      }       
    })
    .then((response) => response.json())
    .then((res) => {
      if(res.response != undefined){
        distance.push({lat:key.latitude,lng:key.longitude,dist:res.response.route[0].summary.distance});
      }
      else{
        this.setState({isloading:false}); 
        _showErrorMessage('Wrong Address Found');
      }

    })
  }

if(distance.length > 0){
  this.getNearByPoint(distance,startlatitude,startlongitude);

}
else{
  this.setState({isloading:false}); 
  _showErrorMessage('No distance found');
}

}
else{
  this.setState({isloading:false}); 
  _showErrorMessage('Location not found');
}



}
 async getNearByPoint(distanceObj,startlatitude,startlongitude){

  var center = distanceObj.sort(function (a, b) {
    return a.dist - b.dist
 })

var center_lat  = center[0].lat;
var center_lng  = center[0].lng;
var place_url = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?key=dfsdfsd&location='+center_lat+','+center_lng+'&fields=formatted_address,geometry&radius=3500&type=gas_station';
await fetch(place_url,{
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      }       
    })
    .then((response) => response.json())
    .then((res) => {
      
      if(res.status == "OK" && res.results.length > 0){

        var gas_station_lat = res.results[0].geometry.location.lat;
        var gas_station_lng = res.results[0].geometry.location.lng;
        var gas_station_name = res.results[0].name; 
        var origin= {"latitude": startlatitude, "longitude": startlongitude};
        // var waypoint= [{"latitude": gas_station_lat, "longitude": gas_station_lng}];
        var destination= {"latitude": gas_station_lat, "longitude": gas_station_lng};
        this.setState({maplatitude:startlatitude,maplongitude:startlongitude,origin:origin,destination:destination,station_name:gas_station_name,station_latitude:gas_station_lat,station_longitude:gas_station_lng})
        
         this.fetchAndRenderRoute(origin,destination,[],[]);

         this.setState({isloading:false}); 

      } 
      else{
        this.setState({isloading:false}); 
        _showErrorMessage('No gas station found');
      }

    })
}


  decode(t) {
    let points = [];
    for (let step of t) {
      let encoded = step.polyline.points;
      let index = 0, len = encoded.length;
      let lat = 0, lng = 0;
      while (index < len) {
        let b, shift = 0, result = 0;
        do {
          b = encoded.charAt(index++).charCodeAt(0) - 63;
          result |= (b & 0x1f) << shift;
          shift += 5;
        } while (b >= 0x20);

        let dlat = ((result & 1) != 0 ? ~(result >> 1) : (result >> 1));
        lat += dlat;
        shift = 0;
        result = 0;
        do {
          b = encoded.charAt(index++).charCodeAt(0) - 63;
          result |= (b & 0x1f) << shift;
          shift += 5;
        } while (b >= 0x20);
        let dlng = ((result & 1) != 0 ? ~(result >> 1) : (result >> 1));
        lng += dlng;

        points.push({ latitude: (lat / 1E5), longitude: (lng / 1E5) });
      }
    }
    return points;
  }

  fetchAndRenderRoute = (origin,destination,waypoints,initialWaypoints) => {

    // let 
    
    var initialOrigin = origin;
    var initialDestination = destination;
    var directionsServiceBaseUrl = 'https://maps.googleapis.com/maps/api/directions/json';
    var mode = 'DRIVING';
    var language = 'en';
    var precision = 'low';
    var timePrecision = 'none';
    var language = 'en';
    var splitWaypoints = true;
    var optimizeWaypoints = false;

    var region;
    var apikey = GOOGLE_MAPS_APIKEY;
    var channel;
    
     
      

    if (!apikey) {
      console.warn(`MapViewDirections Error: Missing API Key`); // eslint-disable-line no-console
      return;
    }

    if (!initialOrigin || !initialDestination) {
      return;
    }

    const timePrecisionString = timePrecision==='none' ? '' : timePrecision;
    

    const routes = [];


    if (splitWaypoints && initialWaypoints && initialWaypoints.length > WAYPOINT_LIMIT) {
      // Split up waypoints in chunks with chunksize WAYPOINT_LIMIT
      const chunckedWaypoints = initialWaypoints.reduce((accumulator, waypoint, index) => {
        const numChunk = Math.floor(index / WAYPOINT_LIMIT); 
        accumulator[numChunk] = [].concat((accumulator[numChunk] || []), waypoint); 
        return accumulator;
      }, []);

      for (let i = 0; i < chunckedWaypoints.length; i++) {
        routes.push({
          waypoints: chunckedWaypoints[i],
          origin: (i === 0) ? initialOrigin : chunckedWaypoints[i-1][chunckedWaypoints[i-1].length - 1],
          destination: (i === chunckedWaypoints.length - 1) ? initialDestination : chunckedWaypoints[i+1][0],
        });
      }
    }
    

    else {
      routes.push({
        waypoints: initialWaypoints,
        origin: initialOrigin,
        destination: initialDestination,
      });
    }

    // Perform a Directions API Request for each route
    Promise.all(routes.map((route, index) => {
      let {
        origin,
        destination,
        waypoints,
      } = route;

      if (origin.latitude && origin.longitude) {
        origin = `${origin.latitude},${origin.longitude}`;
      }

      if (destination.latitude && destination.longitude) {
        destination = `${destination.latitude},${destination.longitude}`;
      }

      waypoints = waypoints
        .map(waypoint => (waypoint.latitude && waypoint.longitude) ? `${waypoint.latitude},${waypoint.longitude}` : waypoint)
        .join('|');

      if (optimizeWaypoints) {
        waypoints = `optimize:true|${waypoints}`;
      }

      return (
        this.fetchRoute(directionsServiceBaseUrl, origin, waypoints, destination, apikey, mode, language, region, precision, timePrecisionString, channel)
          .then(result => {
            return result;
          })
          .catch(errorMessage => {
            return Promise.reject(errorMessage);
          })
      );
    })).then(results => {
      // Combine all Directions API Request results into one
      const result = results.reduce((acc, { distance, duration, coordinates, fare, waypointOrder }) => {
        acc.coordinates = [
          ...acc.coordinates,
          ...coordinates,
        ];
        acc.distance += distance;
        acc.duration += duration;
        acc.fares = [
          ...acc.fares,
          fare,
        ];
        acc.waypointOrder = [
          ...acc.waypointOrder,
          waypointOrder,
        ];
          // console.log(acc);
        return acc;
      }, {
        coordinates: [],
        distance: 0,
        duration: 0,
        fares: [],
        waypointOrder: [],
      });
      
      //saveData
      var distance = parseFloat(result.distance).toFixed(2)+' KM';
      var time  = this.timeConvert(Math.round(result.duration));
      console.log(distance,time);
      // Plot it out and call the onReady callback
      this.setState({
        routeCoordinate: result.coordinates,
        totaltime:time,
        totaldistance:distance
      }, function(d) {
        

      });

    })
      .catch(errorMessage => {
        this.resetState();
        console.warn(`MapViewDirections Error: ${errorMessage}`); // eslint-disable-line no-console
        // onError && onError(errorMessage);
      });
  }


  fetchRoute(directionsServiceBaseUrl, origin, waypoints, destination, apikey, mode, language, region, precision, timePrecision, channel) {

    // Define the URL to call. Only add default parameters to the URL if it's a string.
    let url = directionsServiceBaseUrl;
    if (typeof (directionsServiceBaseUrl) === 'string') {
      url += `?origin=${origin}&waypoints=${waypoints}&destination=${destination}&key=${apikey}&mode=${mode.toLowerCase()}&language=${language}&region=${region}`;
      if(timePrecision){
        url+=`&departure_time=${timePrecision}`;
      }
      if(channel){
        url+=`&channel=${channel}`;
      }
    }

    return fetch(url)
      .then(response => response.json())
      .then(json => {

        if (json.status !== 'OK') {
          const errorMessage = json.error_message || json.status || 'Unknown error';
          return Promise.reject(errorMessage);
        }

        if (json.routes.length) {

          const route = json.routes[0];

          return Promise.resolve({
            distance: route.legs.reduce((carry, curr) => {
              return carry + curr.distance.value;
            }, 0) / 1000,
            duration: route.legs.reduce((carry, curr) => {
              return carry + (curr.duration_in_traffic ? curr.duration_in_traffic.value : curr.duration.value);
            }, 0) / 60,
            coordinates: (
              (precision === 'low') ?
                this.decode([{polyline: route.overview_polyline}]) :
                route.legs.reduce((carry, curr) => {
                  return [
                    ...carry,
                    ...this.decode(curr.steps),
                  ];
                }, [])
            ),
            fare: route.fare,
            waypointOrder: route.waypoint_order,
          });

        } else {
          return Promise.reject();
        }
      })
      .catch(err => {
        return Promise.reject(`Error on GMAPS route request: ${err}`);
      });
  }
 

timeConvert(n) {
var num = n;

var minutes = n;
var hours = (minutes / 60);
var rminutes = Math.floor(minutes);
var rhours = Math.floor(hours);
var minutes2 = (hours - rhours) * 60;
// console.log(minutes2,minutes);

return rhours + " HRS " + Math.floor(minutes2) + " MIN";
}




  getUserInfo () {
   getData('welcome_screen').then((res) => {
    console.log(res);
    if(res.type == 1) {
      var inf = res.data;
      this.setState({
        employee_name:inf.employee_name,
        date:inf.date,
        yard_address:inf.yard_address,
        schedule_warehouse:inf.schedule_warehouse,
        start_time:inf.start_time,
        current_time:inf.current_time,
        yard_latitude:inf.yard_latitude,
        yard_longitude:inf.yard_longitude,
        day_wish:inf.message,
        //yard_latitude:30.650931086197655,
        //yard_longitude:76.6626665,
      });
    }    
    });
  }

  getWeathereDetail(latitude,longitude) {
    //let latitude = 43.56236;
    //let longitude = 77.1892;
    let apiKey = 'a30afc4c6f9a9c4313d16ded089e5a37';

    let apiUrl = `https://api.openweathermap.org/data/2.5/weather?units=metric&lat=${latitude}&lon=${longitude}&units=imperial&appid=${apiKey}`
    fetch(apiUrl)
        .then(resp => resp.json())
        .then((res) => {
          this.setState({
            temp:res.main.temp||0,
            humidity:res.main.humidity||0,
            iconw:res.weather[0].icon||'04d',
            main_weather_title:res.weather[0].main||'Clear',
            wind:res.wind.speed||0,
            current_loc:res.name || ''
          });
        
        });  

  }


    getWeathere() {
    let latitude = this.state.gps_lat;
    let longitude = this.state.gps_long;
    let apiKey = 'a30afc4c6f9a9c4313d16ded089e5a37';

    let apiUrl = `https://api.openweathermap.org/data/2.5/weather?units=metric&lat=${latitude}&lon=${longitude}&units=imperial&appid=${apiKey}`
    fetch(apiUrl)
        .then(resp => resp.json())
        .then((res) => {
          this.setState({
            temp:res.main.temp||0,
            humidity:res.main.humidity||0,
            iconw:res.weather[0].icon||'04d',
            main_weather_title:res.weather[0].main||'Clear',
            wind:res.wind.speed||0,
            current_loc:res.name || ''
          });
        
        });  

  }


  getCurrentPosition2() {
    console.log("enter in location 2");
Geolocation.getCurrentPosition(
        (position) => {
          console.log(position);
          this.setState({
          gps_long: position.coords.longitude,
          gps_lat: position.coords.latitude
        });

      var postdata = { work_type:'Start of Day',gps_lat: position.coords.latitude,gps_long:position.coords.longitude };
      postData(postdata,'driver_work_step')
        .then((res) => {
          console.log(res);
        });
        },
        (error) => {
          _showErrorMessage(error.message)
        },
        { enableHighAccuracy: false, timeout: 15000 }
    );
}

  getCurrentPosition() {
  Geolocation.getCurrentPosition(
    //Will give you the current location
    (position) => {
      const currentLongitude = position.coords.longitude;
      const currentLatitude = position.coords.latitude;
      this.setCurrentLoc(currentLatitude,currentLongitude);

        var postdata = { work_type:'Start of Day',gps_lat: currentLatitude,gps_long:currentLongitude };
      console.log(postdata);
      postData(postdata,'driver_work_step')
        .then((res) => {
          console.log(res);
        });
    },
    (error) => {
      this.getCurrentPosition2();
    },
    {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 1000
    },
  );
}


setCurrentLoc(Lat,Lng){

  this.setState({origin:{"latitude": Lat, "longitude": Lng}});
  this.setState({maplatitude:Lat,maplongitude:Lng});
  this.setState({gps_lat:Lat,gps_long:Lng});

  this.getWeathereDetail(Lat,Lng);

  // this.updateWaypoints();
} 

  getLocationPermissions = async (): Promise<void> => {
  try {
    const granted = await request(
    Platform.select({
      android: PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION,
      ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
    }),
  );
  return granted === RESULTS.GRANTED;
    } catch (err) {
      console.log(err);  
    }
  }
  

  refreshPage() {
    this.props.navigation.push('Welcome');
  }

      getMilestoneInfo () {
        console.log("comemmmmm in m");
   getData('milestone_notifiaction').then((res) => {
    console.log(res);
    console.log(res);
    if(res.type == 1) {
      this.setState({
        milestoneModal:true,
        user_name:res.data.user_name,
        completed_stops:res.data.completed_stops
      });
    } else {
      this.setState({
        milestoneModal:false
      });
    }   
    });
  }

  handleMilestoneModal() {
    this.setState({milestoneModal:false});
  }

render() {
  const {
      container,
      headerLogo,
      headerView,
      backButton,
      backSection,
      backIcon,
      backText,
      blockSection,
      blockText,
      spaceDivider,
    } = styles;
    const {
      showstartbutton,
      is_rescue,
      main_weather_title,
      weather_description,
      temp,
      iconw,
      schedule_warehouse,
      start_time,
      date,
      employee_name,
      humidity,
      yard_address,
      wind,
      current_loc,
      current_time,
      day_wish
    } = this.state;
    return ( 

      <Container>
      <Modal animationType="slide" transparent={true} visible={this.state.milestoneModal}>
         <View style={{justifyContent: "center",alignItems: "center"}}>
          <View style={styles.modalView1}>
            <View style={{backgroundColor:'#cbf2fc', flex: 1, alignItems: 'center', justifyContent: 'center'}}>

        <View style={{alignItems:'center'}}>

         <Image
        style={{ height: 150,width: 150,borderRadius: 40,alignSelf:'center'}}
        source={{ uri: 'http://dev01.trans8.ca/cong.png' }}
      />
        <Text style={{fontSize:28,fontStyle: 'italic',fontWeight:'bold',color:'#bf8437',fontFamily:'verdana'}}>Congratulations</Text>
        <Text style={{fontSize:18,fontWeight:'bold',color:'#bf8437'}}>{this.state.user_name}</Text>
        <Text style={{fontSize:18,fontWeight:'bold',color:'#bf8437'}}>You did a great job.</Text>
        <Text style={{fontSize:18,fontWeight:'bold',color:'#bf8437'}}>You have done <Text style={{fontSize:28,fontStyle:'italic',fontWeight:'bold'}}>{this.state.completed_stops}</Text> stops.</Text>
        
        </View>
        <MakeItRain
          numItems={70}
          itemDimensions={{width: 50, height: 20}}
          itemComponent={<Text>BONUS</Text>}
          itemTintStrength={0.8}
          fallSpeed={30}
          itemColors={['#fd6f56', '#fe8b18', '#19d4f7','#05d557']}
        />
       
      </View>

      <View style={{ borderRadius: 15,alignItems: 'center',justifyContent:'center'}}>
              <Button rounded style={{height: 35, backgroundColor: '#00c2f3', alignSelf:'center',alignItems:'center',justifyContent:'center'}}
                    onPress={() => this.handleMilestoneModal()}>
                    <Text style={{ textAlign: 'center',width:100, color: '#fff', fontSize: 16,fontWeight:'bold' }}>CLOSE</Text>
              </Button>
          </View>
       
          </View>
        </View>
      </Modal>
        <CustomHeader {...this.props} url={this.state.user_avtar} />
        <Content>
          <View style={{backgroundColor:'#cbf2fc',height:500,marginTop:5}}>
          <Text style={{marginTop:5,marginLeft:15,fontSize:18,fontWeight:'bold'}}>{day_wish}, {employee_name}</Text>
          <View>
          <Text style={{marginTop:10,marginLeft:15,fontSize:18,fontWeight:'bold'}}>SCHEDULE FOR {date}</Text>
          <Text style={{marginTop:2,marginLeft:15,fontSize:15}}>{schedule_warehouse} - START TIME {start_time}</Text>
          </View>
          <View>
          <Text style={{marginTop:15,marginLeft:15,fontSize:18,fontWeight:'bold'}}>TODAY WEATHER DETAILS</Text>
          </View>
          <View style={{flexDirection:'row',alignItems:'center',marginTop:-15}}>
          <View style={{flexDirection:'row',alignItems:'center',width:'70%'}}>
          <Image 
          source={{uri: `http://openweathermap.org/img/wn/${iconw}@2x.png`}}
          style={{ height: 110,width:120}} />
          <Text style={{fontSize:18,fontWeight:'bold'}}>{Math.ceil(temp)}</Text>
          <Text style={{fontSize:16,top:-3}}> °C|°F</Text>
          </View>
          </View>
          <View style={{flexDirection:'row',marginTop:-25}}>
          <Text style={{marginLeft:15,fontSize:15}}>{current_time}, {main_weather_title}</Text>
          </View>

          {current_loc != '' ? (<View>
             <Text style={{marginTop:5,marginLeft:15,fontSize:18,fontWeight:'bold'}}>CURRENT LOCATION</Text>
            <View style={{flexDirection:'row',marginLeft:15,marginTop:5,width:'70%'}}>
            <Icon type="FontAwesome" name='map-marker' style={{ color: '#00c2f3'}}/>
            <Text style={{marginLeft:5,fontSize:16,flexWrap: 'wrap'}}>{current_loc}</Text>
            </View>
          </View>) : null}

            <View>
          <Text style={{marginTop:5,marginLeft:15,fontSize:18,fontWeight:'bold'}}>GAS STATION</Text>
           </View>
           <View style={{flexDirection:'row',marginLeft:15,marginTop:5,width:'70%'}}>
           <Icon type="FontAwesome" name='map-marker' style={{ color: '#00c2f3'}}/>
           <Text style={{marginLeft:5,fontSize:16,flexWrap: 'wrap'}}>{this.state.station_name}</Text>
          </View>

          <View style={{flexDirection:'row',justifyContent:'space-between'}}>
          <Text style={{marginTop:15,marginLeft:15,fontSize:12,fontWeight:'bold'}}>TOTAL DISTANCE: {this.state.totaldistance}</Text>
          <Text style={{marginTop:15,marginRight:15,fontSize:12,fontWeight:'bold'}}>TRAVEL TIME: {this.state.totaltime} </Text>
          </View>

          <View style={{flexDirection:'row',justifyContent:'center',marginTop:5}}>
          <Button 
        style={{ height: 30, marginLeft:10, width:'50%', backgroundColor: '#00c2f3', justifyContent: 'center', borderRadius: 5}}
        onPress={() => this.handleGetDirections()}>
        <Text style={{ textAlign: 'center',alignSelf:'center', color: '#fff', fontSize: 16 }}>GET DIRECTION</Text>
        </Button>
          </View>

          </View>
          
          
        <View style={{height:14}}></View>  
      <View style={{ width: '100%',height:200, flexDirection:'row',marginTop:-80}}>
      {this.state.maplatitude != null && this.state.maplongitude != null && this.state.destination != null ? (
        <MapView
            ref={(ref) => { this.map = ref }} 
            initialRegion={{
              latitude: this.state.maplatitude,
              longitude: this.state.maplongitude,
              latitudeDelta: 0.000001,
              longitudeDelta: this.state.LONGITUDE_DELTA,
            }}
            mapPadding={{
                        top: 20,
                        right: 20,
                        bottom: 20,
                        left: 20
                    }}        
            loadingEnabled={false}
            userLocationPriority={'high'}
            followsUserLocation={true}
            showsUserLocation={true}
            showsMyLocationButton={true}
            showsTraffic={false}
            zoomEnabled={true}
            zoomTapEnabled={true}
            zoomControlEnabled={true}
            rotateEnabled={true}
            scrollEnabled={true}
            toolbarEnabled={true}
            showsCompass={false}
            userInterfaceStyle={'dark'}
             
          style={{
            marginBottom: this.state.bottomMargin,            
            ...StyleSheet.absoluteFillObject,
          }}
         
          mapType={Platform.OS == "android" ? "standard" : "standard"}
          onLayout = { (some) => {

          }}
          onMapReady={() => this.setState({ bottomMargin: 1 })}
            >
           
          <MapView.Marker key={1} pinColor="green" coordinate={{latitude:this.state.origin.latitude,longitude:this.state.origin.longitude}}>
                  <View><Image source={require('../../../assets/images/startflag.png')}  />
                </View>

                </MapView.Marker>

                
                <MapView.Marker key={2} pinColor="green" coordinate={{latitude:this.state.station_latitude,longitude:this.state.station_longitude}}>
                  <View>
                  <ImageBackground source={require('../../../assets/images/pending.png')} style={styles.imagemarker}>
                  <Text style={{textAlign: "center",color:"#000",fontWeight:'bold',marginBottom: 22}}>R</Text>
                  </ImageBackground>
                </View>

                </MapView.Marker>

                <Polyline
          coordinates={this.state.routeCoordinate}
          strokeColor="#d66100" // fallback for when `strokeColors` is not supported by the map-provider
          strokeColors={[
            '#7F0000',
            '#00000000', // no color, creates a "long" gradient between the previous and next coordinate
            '#B24112',
            '#E5845C',
            '#238C23',
            '#7F0000'
          ]}
          strokeWidth={6}
        />

      </MapView>) :( 

      <Text> Loading
        </Text>)
        }
        
      </View>
     
      <View>
      <Animated.View
            style={[styles.subView,
              {transform: [{translateY: this.state.bounceValue}]}]}
          >
    </Animated.View>  
    </View>


    <Modal
        animationType="slide"
        transparent={true}
        visible={this.state.modalVisible}
        onRequestClose={() => {
          Alert.alert("Modal has been closed.");
          
        }}
      > 
      <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={{marginBottom:20,textAlign: 'center',fontSize:16,fontWeight:'bold'}}>You are arive at {this.state.yard_address}</Text>
            
            <Button 
        style={{ textAlign: 'center',alignSelf:'center',height: 50, backgroundColor: '#00c2f3', justifyContent: 'center', borderRadius: 5}}
        onPress={() => this.confirmDestination()}>
        <Text style={{ textAlign: 'center',alignSelf:'center', color: '#fff', fontSize: 16,padding:10 }}> Confirm </Text>
        </Button>
        </View>  
    </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={this.state.retailmodalVisible}
        onRequestClose={() => {
          Alert.alert("Modal has been closed.");
          
        }}
      > 
      <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={{fontSize: 18,marginBottom:20,fontWeight:'bold'}}>You have below parcels for retail drop. </Text>
                 

            <View style={{flexDirection:'row',width:'100%',marginTop:20}}>
            <View style={{width:'49%'}}>
              <Button style={{marginTop:20}} onPress={()=> this.confirmDestination()} title="Retail Drop" />
            </View>
            <View style={{width:'49%',marginLeft:20}}>
              <Button style={{marginTop:20}} onPress={()=> this.confirmDestination()} title="Skip" />
            </View>
            </View>
        </View>  
    </View>
      </Modal>


    <Modal
        animationType="slide"
        transparent={true}
        visible={this.state.skipmodal}
        onRequestClose={() => {
          Alert.alert("Modal has been closed.");
          
        }}
      > 
        <View style={styles.centeredView}>
            <View style={styles.modalView}>   
              <View style={{width:'100%'}}>
                <View style={{marginBottom:20,width:'100%',flexDirection:'row'}}>
                  <Text style={{fontSize:16,fontWeight:'bold',width:'30%'}}>Name:</Text>
                  <Text style={{fontSize:14,width:'70%'}}>{this.state.currentAddress}</Text>
                </View> 
                <View style={{marginBottom:20,flexDirection:'row',width:'100%'}}> 
                  <Text style={{fontSize:16,fontWeight:'bold',width:'25%'}}>Address:</Text>
                  <Text style={{fontSize:14,width:'70%'}}> {this.state.currentAddress}</Text>
                </View>
              </View>
              { this.state.commentVisible &&
              <View style={{flexDirection:'row',width:'100%',marginTop:20}}>
                  <TextInput style={{borderBottomWidth:1,borderBottomColor:"gray",color:'#000',width:'100%'}} placeholder="Please Enter Reason" value={this.state.skipcomment} onChangeText={(skipcomment) => this.checkskipcomment() } />
              </View>
            }
              <View style={{flexDirection:'row',width:'100%',marginTop:20}}>
              { this.state.commentVisible ?
                <View style={{width:'49%'}}>
                  <Button style={{marginTop:20}} onPress={()=> this.SubmitSkipStops()} title="Submit" />
                </View>
                :<View style={{width:'49%'}}>
                  <Button style={{marginTop:20}} onPress={()=> this.SkipStops()} title="Skip" />
                </View>
              }
                <View style={{width:'49%',marginLeft:20}}>
                  <Button style={{marginTop:20}} onPress={()=> this.closemodal()} title="Cancel" />
                </View>
              </View>
          </View>  
      </View>
      </Modal>


      {this.state.showview == "map" &&
      <View style={{flexDirection:"row"}}>
      <Text style={{marginTop:15,marginLeft:15,fontSize:14,fontWeight:'bold'}}>TOTAL DISTANCE: {this.state.totaldistance}</Text>
          <Text style={{marginTop:15,marginRight:15,fontSize:14,fontWeight:'bold'}}>TRAVEL TIME: {this.state.totaltime} </Text>
      </View>
    }

    <View style={{height:20}}>
    </View>
     <View style={{ flexDirection: 'row',justifyContent:'space-between',marginLeft:15,marginRight:15}}>
        <Button 
        style={{ height: 50, width:'40%', backgroundColor: '#00c2f3', justifyContent: 'center', borderRadius: 5}}
        onPress={() => this.refreshPage()}>
        <Text style={{ textAlign: 'center',alignSelf:'center', color: '#fff', fontSize: 22 }}>REFRESH</Text>
        </Button>

        <Button 
        style={{ height: 50, marginLeft:10, width:'40%', backgroundColor: '#00c2f3', justifyContent: 'center', borderRadius: 5}}
        onPress={() => this.props.navigation.navigate('DriverKitStart')}>
        <Text style={{ textAlign: 'center',alignSelf:'center', color: '#fff', fontSize: 22 }}>KIT SCAN</Text>
        </Button>
      </View>
      <View style={{height:20}}>
    </View>

    </Content>
           {this.state.isloading && (
              <Loader />
          )}
          </Container>
    );
  }
}

const styles = StyleSheet.create({
   buttonlogout:{
    marginTop:20,
  },
   centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 0,
    backgroundColor:"#1c1e2136"
  },
  modalView: {
  margin: 20,
  backgroundColor: "white",
  borderRadius: 20,
  padding: 35,
  alignItems: "center",
  shadowColor: "#000",
  shadowOffset: {
    width: 5,
    height: 2
  }
},
  modalView1: {
  marginTop: 80,
  backgroundColor: "#cbf2fc",
  borderColor:'#fff',
  borderWidth:2,
  borderRadius: 20,
  padding: 55,
  alignItems: "center",
  shadowColor: "#000",
  shadowOffset: {
    width: 5,
    height: 2
  }
},
  container: {
  flex:1,
  width:'100%',
  height:'90%',
  justifyContent: 'center',
  backgroundColor:"#fff",
  alignContent: 'center',
  },
  welcome: {
    fontSize: 20,  
    textAlign: 'left',
    margin: 10,
    paddingTop:40,
    color:"#000"

  },
  list: {
    fontSize: 20,  
    textAlign: 'right',
    margin: 10,
    paddingTop:20,

  },
  picker: {
    width: 100,
  },
  maps: {
    ...StyleSheet.absoluteFillObject

  },
   Active:{
    color: '#247ee8',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 18,
    alignSelf: 'center',
    padding: 10,
    flex: 1,
    flexDirection: 'row',
    borderBottomWidth :5,
    borderBottomColor: '#247ee8',
  },
  imgtext:{ 
    flexDirection:'row',
    alignItems:'center',
    width:"95%"
  },
  HeadStyle:{
    color: '#808080',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 18,
    alignSelf: 'center',
    padding: 10,
    flex: 1,
    flexDirection: 'row',
    borderBottomWidth :1,
    borderBottomColor: '#808080',
  },
  card:{
  flexDirection: "row",
  padding:20,

},
userImage:{
    height: 25,
    width: 25,
    alignSelf: 'flex-end',  

  },
  name:{
    fontSize:13,
    color:"#fff",
    fontWeight:'700',
    paddingLeft:20,
  },
  followButton: {
    marginTop:0,
    height:35,
    width:35,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius:80,
    backgroundColor: "#ea1780",
  },

  driverheader: {
    flexDirection: 'row',
    padding:10,
    marginTop:0,
    marginBottom:0,

   }, 
    DistanceHead: {
    flexDirection: 'row',
    padding:10,
    marginTop:0,
    marginBottom:0,

   }, 
  section: {
    flexDirection: 'row',
  },
  item: {
    width: '50%'
  },
  profileimg:{
    width:"30%",
    backgroundColor:"#000",
    padding:5,
    backgroundColor: "#247ee8",
    borderRadius:10
  },
   profileimg2:{
    width:"30%",
  },
  indication:{
    marginBottom:2,
    flexDirection: 'row',
    paddingLeft:10,
    paddingRight:10,
  },
  item2:{
    width: '33.333%'
  },
  subView: { 
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    height:500,
    marginBottom:15
  },
    imagemarker:{
    width:40,
    height:60,
    justifyContent: "center"
  }
}); 
export default Welcome;