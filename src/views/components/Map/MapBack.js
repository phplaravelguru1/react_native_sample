import React, { Component } from 'react';
import { View, Text, Image,ScrollView, SafeAreaView, NetInfo, StyleSheet,Button,Dimensions,TouchableOpacity,FlatList,Modal } from 'react-native';
import { _retrieveWaypoints,image,_retrieveAddress,_retrieveWarehouse,_retrieveFulladdress,Loader,_retrieveUser,_showSuccessMessage, _storeNextPoint, _retrieveNextPoint,_storeWaypoints,_storeAddress,_storeFulladdress } from 'assets';
// import { StackActions } from '@react-navigation/native';
import { getUpdatedPoints } from 'api';
import { AsyncStorage } from 'react-native';
import MapViewDirections from 'react-native-maps-directions';
import MapView, { Marker, AnimatedRegion } from "react-native-maps";
import Geolocation from '@react-native-community/geolocation';
import List from './List';
import PushNotification from "react-native-push-notification";

navigator.geolocation = require('@react-native-community/geolocation');
const haversine = require('haversine');

 
const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;


const LATITUDE = 43.6038821;
const LONGITUDE = -79.5127419;
const LATITUDE_DELTA = 0.0;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;
const GOOGLE_MAPS_APIKEY = 'AIzaSyAeewuHY3zbXBGxOB8kR-4dFNVFoWyhNTo';

class Map extends Component { 
  constructor(props){
    super(props);  

    this.state = {

      latitude: null,
      longitude: null,
      maplatitude: 11,
      maplongitude: 11,
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
      LATITUDE_DELTA : 0.01,
      LONGITUDE_DELTA : LATITUDE_DELTA * ASPECT_RATIO,
      currentpointstatus:true,
      bottomMargin:null,
      title:'',
      modalVisible:false,
      totalDistance:'',
      totalDuration:'',
      drivername:'',
      currentAddress:'',
      isloading:false,
      curruntlistindex:'',
    }
    
}

componentDidMount = () => { 

  PushNotification.configure({
    
     onNotification:(notification) => {
         this.setState({isloading:true});
        getUpdatedPoints().then((res) => {
          if(res.type == 1){
            const address = [];

            for (const key of res.data.lat_long) {
            
                address.push({lat: key.latitude, lng:key.longitude,status:key.status,sequence:key.sequence});

            }  


            this.setState({FlatListItems:address});

            this.setState({fulladdress:res.data.lat_long});

            const waypointData = [];

             for (const key of res.data.lat_long) {
            
                waypointData.push({latitude: key.latitude, longitude:key.longitude});

            }
              
              this.setState({points:waypointData});

              this.setState({isloading:false});
           }
           else{
              _showErrorMessage(res.message);
              this.setState({isloading:false});
           }   
          
        })
        
    },

  }) 

_retrieveNextPoint().then((point) => {
  // console.log(point);
  if(point != null){
    this.setState({nextpoint:point})
  }
 
})            

setTimeout(()=>this.setState({statusBarHeight: 1}),500);

_retrieveUser().then((user) => {

    var userdata = JSON.parse(user);

    this.setState({drivername:userdata.userInfo.first_name+' '+userdata.userInfo.last_name})
})

  _retrieveAddress().then((address) => {
     
      this.setState({FlatListItems:JSON.parse(address)});

  })
  _retrieveFulladdress().then((address) => {
      console.log(address)
      this.setState({fulladdress:JSON.parse(address)});
  })  

  _retrieveWarehouse().then((address) => {

      this.setState({warehouse:address});
  })
  _retrieveWaypoints().then((points) => {
      
        var newpoints =  JSON.parse(points);
        
        var total = newpoints.length;
        this.setState({origin:{"latitude": newpoints[0].latitude, "longitude": newpoints[0].longitude}});
        // this.setState({destination:{"latitude": newpoints[0].latitude, "longitude": newpoints[0].longitude}});
        this.setState({destination:{"latitude":newpoints[total-1].latitude, "longitude": newpoints[total-1].longitude}});
        this.setState({maplatitude:newpoints[0].latitude});
        this.setState({maplongitude:newpoints[0].longitude});
        this.setState({points:newpoints});

    })


   
Geolocation.getCurrentPosition((info) => {
var latitude = info.coords.latitude;
var longitude = info.coords.longitude;
// console.log(latitude,longitude);
this.setState({
         latitude,
         longitude,
         prevLatLng: {
            latitude,
            longitude 
          }
       });

},
error => console.log(error),
{ enableHighAccuracy: true, timeout: 20000}


);


this.watchID = navigator.geolocation.watchPosition(

    position => {
      const { coordinate, routeCoordinates, distanceTravelled } =   this.state;
      const { latitude, longitude } = position.coords;
      // console.log(position.coords); 
      const newCoordinate = {
        latitude,
        longitude 
      };
      
      if (Platform.OS === "android") {
        if (this.marker) {
           // alert()
          this.marker.animateMarkerToCoordinate(
            newCoordinate,
            500
          ); 
         }
       } else {
         coordinate.timing(newCoordinate).start();
       }

       this.checkOnArrive(latitude, longitude);



     },
     error => console.log(error),
     { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000,distanceFilter:0 }
  );

}

checkOnArrive = (lat,long) => {

  if(this.state.nextpoint < this.state.points.length){

    const destinationltlg = {latitude:this.state.points[this.state.nextpoint].latitude,longitude:this.state.points[this.state.nextpoint].longitude}
 
    const start = {latitude: lat, longitude: long }
 
    const distance = Math.round(haversine(start,destinationltlg,  {unit: 'meter'}));
   
    if(distance < 30 && this.state.currentpointstatus == true){

        const address = this.getaddress(destinationltlg.latitude);
      
        this.setState({nextpoint:this.state.nextpoint+1,currentpointstatus:false,modalVisible:true,currentAddress:address}); 

        _storeNextPoint(this.state.nextpoint);

    }
    else{
      this.setState({currentpointstatus:true});
    }
    
 }

}

confirmDestination(){
  // demo().then((res) => {

  //   alert(res[0].title)

  // })
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

 handleGetDirections = (coordinate) => {

  const data = {
      destination: {
        latitude: coordinate.latitude,
        longitude: coordinate.longitude
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

  ChangeView(view){
  
    this.setState({
          showview:view,
        })
  
    }
convertnumber(d) {
    return (d < 10) ? '0' + d.toString() : d.toString();
}
  render() {
    // alert();
    return (
      <View style={styles.container}>
      
      <View style={{ width: '100%',flex:1}}>
        <MapView 
            ref={(ref) => { this.map = ref }} 
            initialRegion={{
              latitude: this.state.maplatitude,
              longitude: this.state.maplongitude,
              latitudeDelta: this.state.LATITUDE_DELTA,
              longitudeDelta: this.state.LONGITUDE_DELTA,
            }}
            mapPadding={{
                        top: 20,
                        right: 20,
                        bottom: 20,
                        left: 20
                    }}
            loadingEnabled={false}
            showsUserLocation
            userLocationPriority={'high'}
            followsUserLocation={true}
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
            onRegionChangeComplete = {(region) => {
             
                    }} 
            
          style={{
            marginBottom: this.state.bottomMargin,            
            ...StyleSheet.absoluteFillObject,
          }}
         
          mapType={Platform.OS == "android" ? "standard" : "standard"}
          onLayout = { (some) => {

          }}
          onMapReady={() => this.setState({ bottomMargin: 1 })}
            >
           
        {this.state.FlatListItems.map((coordinate, index) =>

          <MapView.Marker key={`coordinate_${index}`} pinColor="green" coordinate={{latitude:coordinate.lat,longitude:coordinate.lng}} onPress={() => this.handleGetDirections(coordinate)}>
          
          { coordinate.status != 'active' ?
            <Image source={require('../../../assets/images/complete.png')}  />

            :<View><Image source={require('../../../assets/images/pending.png')}  />
            <Text style={{textAlign: 'center',color:"#000",position:'absolute',right:15,top:6,fontWeight:'bold'}}>{index+1}</Text></View>
          }

          
          
          </MapView.Marker>
         
        )}

        <MapViewDirections   
            origin={this.state.origin}
            destination={this.state.destination}
            waypoints={this.state.points}
            apikey={GOOGLE_MAPS_APIKEY}
            splitWaypoints={true}
            strokeWidth={5}
            strokeColor="hotpink"
            optimizeWaypoints={false}
            timePrecision="now"
            mode="DRIVING"
            onReady={result => {
              this.setState({totalDistance:result.distance,totalDuration:result.duration});
              }}
          />

      </MapView> 
      </View>


        <View style={styles.driverheader}>
          <View style={styles.item}>
          <View style={styles.section}>
            <View style={styles.profileimg}>
            <Image source={require('../../../assets/images/driver.png')}  />
            </View>
             <View style={{width:"70%",paddingLeft:10}}>
                <Text style={{fontSize:16,fontWeight:'bold'}}>Driver Name:</Text>
                <Text style={{fontSize:14,fontWeight:'bold'}}>Date:</Text>
             </View>
             </View>
          </View>
          <View style={styles.section}>
            <View style={styles.item}>
              <Text style={{fontSize:16,fontWeight:'bold'}}>{this.state.drivername}</Text>
              <Text style={{fontSize:14,fontWeight:'bold'}}>{new Date().toDateString()}</Text>
            </View>
          </View>  
        </View>

        <View style={styles.indication}>

          <View style={styles.item2}>
            <View style={styles.section}>
              <View style={styles.profileimg2}>
              <Image source={require('../../../assets/images/blue.png')}  />
              </View>
               <View style={{width:"70%",paddingLeft:0}}>
                  <Text style={{fontSize:14,fontWeight:'bold',paddingTop:6}}>Delevered</Text>
               </View>
            </View>
          </View>

          <View style={styles.item2}>
            <View style={styles.section}>
              <View style={styles.profileimg2}>
              <Image source={require('../../../assets/images/red.png')}  />
              </View>
               <View style={{width:"70%",paddingLeft:0}}>
                  <Text style={{fontSize:14,fontWeight:'bold',paddingTop:6}}> Not Delevered</Text>
               </View>
            </View>
          </View>

          <View style={styles.item2}>
            <View style={styles.section}>
              <View style={styles.profileimg2}>
              <Image source={require('../../../assets/images/yellow.png')}  />
              </View>
               <View style={{width:"70%",paddingLeft:0}}>
                  <Text style={{fontSize:14,fontWeight:'bold',paddingTop:6}}> Pending</Text>
               </View>
            </View>
          </View>
            
        </View>


      <View style={{ width: '100%',height:"35%", backgroundColor:"#fff",padding:5 }}>
        <ScrollView>
          <View> 

           <View style={{flexDirection:'row',padding:10,backgroundColor:'#cbf2fc',borderRadius:15,marginBottom:10}}>
                  <View style={{width:'15%',backgroundColor:'#fff',padding:5,borderRadius:10,justifyContent: 'center',alignItems: 'center',
}}>
                  <Image source={require('../../../assets/images/startpoint.png')}  />
                  </View>
                  <View style={{width:"85%",paddingLeft:10}}>
                    <Text style={{fontSize:18,fontWeight:'bold',paddingTop:0,color:"#000"}}>Start Point</Text>
                    <Text style={{fontSize:14,fontWeight:'bold',paddingTop:0,color:"#000"}}>
                   {this.getaddress(this.state.maplatitude)}</Text>
                  </View>
          </View> 

       {

        this.state.FlatListItems.map((item, index) => {

                if(item.sequence !=0){

                if (item.status == 'active'){

                  

                return (
                 <View style={{flexDirection:'row',padding:10,backgroundColor:'#f3aa00',borderRadius:15,marginBottom:10}}>
                    <View style={{width:'15%',backgroundColor:'#fff',padding:10,borderRadius:10,justifyContent: 'center',alignItems: 'center'}}>
                    <Text style={{color:'#f3aa00',fontWeight:'bold',fontSize:16}}>{this.convertnumber(item.sequence)}</Text>
                    </View>
                    <View style={{width:"85%",paddingLeft:10,flexDirection:"row"}}>
                    <View style={{justifyContent: 'center',alignItems: 'center',paddingLeft:10}}>
                      <Image style={{paddingTop:15}} source={require('../../../assets/images/pin.png')}  />
                     </View>
                     <View style={{justifyContent: 'center',alignItems: 'center',paddingLeft:10,paddingRight:25,flexDirection:"row"}}> 
                        <Text style={{fontSize:14,fontWeight:'bold',paddingTop:0,color:"#fff",paddingLeft:10, paddingRight:15}}>
                        {this.getaddress(item.lat)}
                       </Text>
                     </View>
                    </View>

                  </View> 
                  )
                 }

               }

             })


           }

            {this.state.FlatListItems.map((item, index) => {

                if(item.sequence !=0){

               
                if (item.status == 'delivered'){

                return (
                 <View style={{flexDirection:'row',padding:10,backgroundColor:'#00c2f3',borderRadius:15,marginBottom:10}}>
                    <View style={{width:'15%',backgroundColor:'#fff',padding:10,borderRadius:10,justifyContent: 'center',alignItems: 'center'}}>
                    <Text style={{color:'#00c2f3',fontWeight:'bold',fontSize:16}}>{this.convertnumber(this.state.curruntlistindex)}</Text>
                    </View>
                    <View style={{width:"85%",paddingLeft:10,flexDirection:"row"}}>
                    <View style={{justifyContent: 'center',alignItems: 'center',paddingLeft:10}}>
                      <Image style={{paddingTop:15}} source={require('../../../assets/images/pin.png')}  />
                     </View>
                     <View style={{justifyContent: 'center',alignItems: 'center',paddingLeft:10}}> 
                        <Text style={{fontSize:14,fontWeight:'bold',paddingTop:0,color:"#fff",paddingLeft:10, paddingRight:15}}>
                        {this.getaddress(item.lat)}
                       </Text>
                     </View>
                    </View>

                  </View> 
                  )
                 }
                 
               }
              })}


            {this.state.FlatListItems.map((item, index) => {

                if(item.sequence !=0){

               
                 if(item.status ==  'not-delivered' || item.status == 'return'){

                  return (
                 <View style={{flexDirection:'row',padding:10,backgroundColor:'#f32525',borderRadius:15,marginBottom:10}}>
                    <View style={{width:'15%',backgroundColor:'#fff',padding:20,borderRadius:10,justifyContent: 'center',alignItems: 'center'}}>
                    <Text style={{color:'#f32525',fontWeight:'bold',fontSize:16}}>{this.convertnumber(item.sequence)}</Text>
                    </View>
                    <View style={{width:"85%",paddingLeft:10,flexDirection:"row"}}>
                    <View style={{justifyContent: 'center',alignItems: 'center',paddingLeft:10}}>
                      <Image style={{paddingTop:15}} source={require('../../../assets/images/pin.png')}  />
                     </View>
                     <View style={{justifyContent: 'center',alignItems: 'center',paddingLeft:10}}> 
                        <Text style={{fontSize:14,fontWeight:'bold',paddingTop:0,color:"#fff",paddingLeft:10, paddingRight:15}}>
                        {this.getaddress(item.lat)}
                       </Text>
                     </View>
                    </View>

                  </View> 
                  )

                 }
               }
             })}

        </View>
        </ScrollView>
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
            <Text style={{marginBottom:20}}>You are arive at {this.state.currentAddress}</Text>
            <Button style={styles.buttonlogout} onPress={()=> this.confirmDestination()} title="Confirm" />
        </View>  
    </View>
      </Modal>
      {this.state.showview == "map" &&
      <View style={{flexDirection:"row"}}>
      <Text style={{paddingTop:20,paddingLeft:10, width:"50%", fontWeight:"bold"}}>Total Distance: {this.state.totalDistance} KM</Text>
      <Text style={{paddingTop:20,paddingLeft:10, width:"50%", fontWeight:"bold"}}>Total Duration: {Math.round(this.state.totalDuration)} MIN</Text>
      </View>
    }
     {this.state.isloading && (
              <Loader />
          )}
    </View>
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
  container: {
   flex: 1,
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
    flex: 0,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    padding:10,
    marginTop:15,
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
    padding:10,
    backgroundColor: "#247ee8",
    borderRadius:10
  },
   profileimg2:{
    width:"30%",
  }, 
  indication:{
    marginBottom:10,
    flexDirection: 'row',
    paddingLeft:10,
    paddingRight:10
  },
  item2:{
    width: '33.333%'
  }
});

export default Map;

