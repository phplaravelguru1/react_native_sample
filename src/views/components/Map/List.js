import React, { Component } from 'react';
import { View, Text, Image, SafeAreaView, NetInfo, StyleSheet,Button,Dimensions,TouchableOpacity,FlatList,Modal } from 'react-native';



class List extends Component { 
  constructor(props){
    super(props); 
    // console.log(props)
    this.state = {

      maplatitude:props?.startpoint,
      FlatListItems:props?.listdata,
      fulladdress:props?.addresses,
      startpoint:props?.startpoint,

    }
    
} 

componentDidMount = () => { 
  console.log(this.state.FlatListItems);
}     

getaddress(latitude){
 
   for (const key of this.state.fulladdress) {
      console.log
        if(key.latitude == latitude){
          return key.address;
        }

     }
}  
handleGetDirectionsFromList = (lat,lon) => {
 
  const data = {
      destination: {
        latitude: lat,
        longitude: lon
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
convertnumber(d) {
    return (d < 10) ? '0' + d.toString() : d.toString();
}
getaddress(latitude){
   for (const key of this.state.fulladdress) {
        if(key.latitude == latitude){
          return key.address;
        }

     }
}  
render(){

return (       
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
          <FlatList
                data={this.state.FlatListItems}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item, index })=>{

                if(item.sequence ==0){

                if (item.status == 'active'){
                  
                return (
                 <View style={{flexDirection:'row',padding:10,backgroundColor:'#f3aa00',borderRadius:15,marginBottom:10}}>
                    <View style={{width:'15%',backgroundColor:'#fff',padding:20,borderRadius:10,justifyContent: 'center',alignItems: 'center'}}>
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

                  }} 
                  />

            <FlatList
                data={this.state.FlatListItems}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item, index })=>{

                if(item.sequence !=0){

               
                if (item.status == 'delivered'){

                return (
                 <View style={{flexDirection:'row',padding:10,backgroundColor:'#00c2f3',borderRadius:15,marginBottom:10}}>
                    <View style={{width:'15%',backgroundColor:'#fff',padding:20,borderRadius:10,justifyContent: 'center',alignItems: 'center'}}>
                    <Text style={{color:'#00c2f3',fontWeight:'bold',fontSize:16}}>{this.convertnumber(item.sequence)}</Text>
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

                  }} 
                  />


            <FlatList
                data={this.state.FlatListItems}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item, index })=>{

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

                  }} 
                  />
        </View>

   )}               

}

export default List;                  