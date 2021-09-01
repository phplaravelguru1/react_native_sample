import React, { Component } from 'react';
import { View, Text, Image, SafeAreaView, NetInfo, StyleSheet,Button,Dimensions,TouchableOpacity } from 'react-native';
import { image, config,_showErrorMessage, _showSuccessMessage, _storeRouteApiStatus, _retrieveRouteApiStatus, _retrieveUser,_storeWarehouse, _retrieveWarehouse, _retrieveWaypoints,_storeWaypoints,_storeAddress, Loader, _storeUser, _retrieveFulladdress,_storeFulladdress } from 'assets';
import { getRoutes,markNumberToPackages,getUpdatedPoints } from 'api';
import Geolocation from '@react-native-community/geolocation';
navigator.geolocation = require('@react-native-community/geolocation');

class Direction extends Component { 
  constructor(props){
    super(props); 

    this.state = {
      points:[],
      isloading:false
    }
    
}

componentDidMount = () => { 

this.props.navigation.replace("MAP"); 

_retrieveRouteApiStatus().then((status) => {
  console.log(status);
  if(status == 'null'){

      _storeRouteApiStatus(1);  
      this.getNewRoutes(); 
  }
  else{
     // _storeRouteApiStatus(null);     
    this.updateWaypoints();
  }
})


// // this.props.navigation.replace("Map")
// _storeWaypoints([
//   {latitude:29.513397217929786, longitude:76.71176883208344},  
//   {latitude:29.512944, longitude:76.711241},
//   {latitude:29.512430, longitude:76.711182}, 
//   {latitude:29.512812, longitude:76.710318 },
//   {latitude:29.513835, longitude:76.708816 },
//   {latitude:29.514683, longitude:76.707621 }
// ]);

// _storeFulladdress([
//     {address:"Address 1",latitude:29.513397217929786, longitude:76.71176883208344},
//     {address:"Parnit Furniture",latitude:29.512944, longitude:76.711241},
//     {address:"Punjab National Bank",latitude:29.512430, longitude:76.711182},
//     {address:"Address 4",latitude:29.512812, longitude:76.710318 },
//     {address:"address 5",latitude:29.513835, longitude:76.708816 },
//     {address:"address 6",latitude:29.514683, longitude:76.707621 }

// ]);

// _storeAddress([
//   {lat:29.513397217929786, lng:76.71176883208344,sequence:0,status:'delivered'},  
//   {lat:29.512944, lng:76.711241,sequence:1,status:'not-delivered'},
//   {lat:29.512430, lng:76.711182,sequence:2,status:'delivered'},
//   {lat:29.512812, lng:76.710318,sequence:3,status:'active' },
//   {lat:29.513835, lng:76.708816,sequence:4,status:'active' },
//   {lat:29.514683, lng:76.707621,sequence:5,status:'active' } 
// ]);

//   navigator.geolocation.getCurrentPosition(
//             (position) => {
             
//               this.props.navigation.replace("Map", { names: [position.coords.latitude,position.coords.longitude]});

//             },
//             (error) => console.warn(error.message),
//             { enableHighAccuracy: true, timeout: 10000 }
//           )


}

getNewRoutes(){

this.setState({isloading:true});

getRoutes().then((res) => {
  // console.log(res.data.lat_long)
  if(res.type == 1){
      _storeWarehouse(res.data.lat_long[0].address);
      _storeFulladdress(res.data.lat_long);
      //live
      var url = 'https://wse.ls.hereapi.com/2/findsequence.json?apiKey=wSg9ZNFX0A6AGmgaH7Euid5UQM2yFgtubg1_FfO-iIg&start='+res.data.lat_long[0].latitude+','+res.data.lat_long[0].longitude+'&improveFor=time&mode=shortest;car;traffic:disabled;&';
      // var url = 'https://wse.ls.hereapi.com/2/findsequence.json?apiKey=X-DD8Iw__H4RqFN03BfC3kBpmITPClOO9kk_xoVFGlc&start='+res.data.lat_long[0].latitude+','+res.data.lat_long[0].longitude+'&improveFor=distance&mode=shortest;car;traffic:disabled;&';
      var count = 0;
      var string = url;
      for (const key of res.data.lat_long) {

          if(key.latitude != +res.data.lat_long[0].latitude){

            string+= 'destination'+count+'='+key.barcode+';'+key.latitude+','+key.longitude+'&'
          }

          count++;
      }
      // console.log(string);
      this.sequenceWaypoints(string);
  }
  else{
    _showErrorMessage(res.message);
    this.setState({isloading:false});
  }


})

}

sequenceWaypoints(url){

fetch(url,{
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    }       
  })
  .then((response) => response.json())
  .then((res) => {
     // console.log(res)
    // alert(); 
  const obj=[];
  if(res.results != null){

    const markersData = [];

    for (const key of res.results[0].waypoints) {
          markersData.push({barcode:key.id,lat: key.lat, lng:key.lng,sequence:key.sequence,status:'active'});
     }

     _storeAddress(markersData);


     for (const key of res.results[0].waypoints) {
      
          obj.push({latitude: key.lat, longitude:key.lng});

     }
     
    _storeWaypoints(obj).then((res) => {
       const formdata = new FormData();
 
        formdata.append('number_packages', JSON.stringify(markersData));
      markNumberToPackages(formdata).then((res) => {
        // console.log(res);
         this.setState({isloading:false});

        navigator.geolocation.getCurrentPosition(
              (position) => {
               
                this.props.navigation.replace("Map", { names: [position.coords.latitude,position.coords.longitude]});

              },
              (error) => console.warn(error.message),
              { enableHighAccuracy: true, timeout: 10000 }
            )

      })


   })
 
  }
  else 
  {
     _showErrorMessage('Waypoints not found!');
   this.setState({isloading:false});
  }
 
  })
  

  
}

updateWaypoints(){
   this.setState({isloading:true});
  getUpdatedPoints().then((res) => {
    // console.log(res.data.lat_long);
    if(res.type == 1){
      const fullAddress = [];

      for (const key of res.data.lat_long) {
      
          fullAddress.push({lat: key.latitude, lng:key.longitude,status:key.status,sequence:key.sequence});

      }  

      _storeAddress(fullAddress);
      _storeFulladdress(res.data.lat_long);

      const waypointData = [];

       for (const key of res.data.lat_long) {
      
          waypointData.push({latitude: key.latitude, longitude:key.longitude});

      }

      _storeWaypoints(waypointData);
        // console.log(waypointData);
        this.setState({isloading:false});
        this.props.navigation.replace("Map");

     }
     else{
        _showErrorMessage(res.message);
        this.setState({isloading:false});
     }   
  })

}

  render() {

    

    return (
      <View style={styles.container}>
        <View>
        
        
      </View>
      
     {this.state.isloading && (
              <Loader />
          )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  container2: {

    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
     marginTop:20,
  },
  welcome: {
    fontSize: 20,  
    textAlign: 'center',
    margin: 10,
    paddingTop:20

  },
  buttonlogout:{
    marginTop:20,
    backgroundColor: '#fff',
  }
});

export default Direction;

