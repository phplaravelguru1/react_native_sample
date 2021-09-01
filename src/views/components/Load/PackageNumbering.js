import React, {Component } from 'react';
import { View, Text, Image,TouchableOpacity,TextInput,Dimensions, Platform,Alert} from 'react-native';
import { Container,FlatlistContent, Header, Content, Form,Textarea, Item, Input, Label,Button, Icon, Picker,Switch } from 'native-base';
import { image, config, _showErrorMessage, _showSuccessMessage, Loader,_retrieveData,_storeData } from 'assets';
import styles from './styles';
import { getData,submitRtw,saveLocation,submitLeftInWareHouse,postData,update_distance_time } from 'api';
import CustomHeader from '../../CustomHeader';
import geolocation from '@react-native-community/geolocation';
import ImagePicker from 'react-native-image-picker';
import QRCodeScanner from 'react-native-qrcode-scanner';
import SearchableDropdown from 'react-native-searchable-dropdown';

import { flashon, flashoff } from '../../../store/actions/index.js';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import { RNCamera } from 'react-native-camera';
import NetInfo from "@react-native-community/netinfo";
import { measureConnectionSpeed } from 'react-native-network-bandwith-speed';

class PackageNumbering extends Component {
constructor(props) {
    super(props);
    this.state = {
      isShowScanner:false,
      isloading: false,
      barcodes:[],
      placePic:null,
      manual_barcode:'',
      gps_long:'',
      gps_lat:'',
      user_avtar:'',
      shopId:0,
      items:[],
      warehouses:[],
      description:null,
      released_to:null,
      current_warehouse_id:0,
      warehouse_id:0,
      company_id:0,
      show_warehouse:true,
      address:'',
      sequence_number:0,
      sequenceNo:0,
      totalPkg:0,
      SequenceNumberMark:0,
      PendingSequenceNo:0,
      TotalPkgForStop:0,
      MarkPkgForStop:0,
      TotalStops:0,
      TotalStopsMark:0
    };
  }

componentDidMount = () => {

  _retrieveData('store_distance_time').then((rtime)=>{

    if(rtime == null){
    _retrieveData('updatedwaypoints').then((data)=>{
      this.setState({isloading:true});
      var url = 'https://wse.ls.hereapi.com/2/findsequence.json?apiKey=wSg9ZNFX0A6AGmgaH7Euid5UQM2yFgtubg1_FfO-iIg&start='+data[0].lat+','+data[0].lng+'&improveFor=distance&mode=fastest;car;traffic:disabled;&';

      var count = 0;
      var string = url;
      for (const key of data) {
          
          // console.log(key.barcode)
          if(count != 0 && key.barcode != ""){
            
            string+= 'destination'+count+'='+key.barcode+';'+key.lat+','+key.lng+'&'
          }

          count++;
      }

      this.sequenceWaypoints(string,data);
    }) 
  }

}) 


  this._unsubscribe = this.props.navigation.addListener('focus', () => {
    this.setState({ placePic:null,barcodes:[],manual_barcode:'',description:null,released_to:null});
    this.getCurrentPosition();

     _retrieveData('user_avtar')
        .then((res) => {
          if(res != null){
            this.setState({user_avtar:res});
          }
        });

        _retrieveData('warehouse_id').then((res) => {
          if(res > 0){
            console.log(res);
            this.setState({
            current_warehouse_id: res,
            warehouse_id: res,
            show_warehouse:false
          });
          }
        }); 
        _retrieveData('companyId')
        .then((res) => {
          if(res != null){
            this.setState({company_id:res});
          }
        });

        getData('warehouse_list').then((res) => {
            this.setState({warehouses:res.data.Warehouses});
        }); 
  });
};

componentWillUnmount() {
  this._unsubscribe();
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
async sequenceWaypoints(url,data){

 await fetch(url,{
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    }       
  })
  .then((response) => response.json())
  .then((res) => {
  if(res.results != null){

    var route_distance = parseFloat(res.results[0].distance/1000).toFixed(2)+' KM';
    var additional = data.length*3;
    var combaine = res.results[0].time/60;
    var time = parseFloat(additional+combaine).toFixed(2);
    var route_time = this.timeConvert(time);

      const formdata = new FormData();
      formdata.append('route_distance',  route_distance);
      formdata.append('route_time',  route_time);

      update_distance_time(formdata).then((res) => { 
        if(res.type == 1){
            
            _storeData('store_distance_time','yes');
            this.setState({isloading:false});
            _showSuccessMessage(res.message);
            
        }
        else
        {
          this.setState({isloading:false}); 
           _showErrorMessage(res.message);
          
         } 


      }) 
          
  }
  else 
  {
     _showErrorMessage(res.errors[0]);
     this.setState({isloading:false}); 
    
  }
 
 })
  
}

lapsList = () => {
 return this.state.warehouses.map((data) => {
  return (
    <Picker.Item key={data.id} label = {data.Warehouse_name} value = {data.id} />
  )
})
}


onScannerSuccess = e => {
  const { data } = e;
  const _this = this;
  this.setState({
      isloading: true
    }, () => {
      if (data) {
        this.setState({isShowScanner: false,isloading:false});
        var barcode = String(data);
        if(barcode.includes('*')){
          this.setState({ isloading: false });
          _showErrorMessage('Oops wrong barcode. Please scan barcode that start without  *');
        } else {
          this.setState({ manual_barcode: String(data) });
              this.setState({isShowScanner: false,isloading: false});
                setTimeout(function(){
                _this.scanParcel();
                }, 1000);
        }
      } else {
          this.setState({ isloading: false });
            Alert.alert(
          'Invalid QR Code',
          'This QR code is not Product code.',
          [
            { text: 'OK', onPress: () => console.log('OK Pressed') },
          ],
          { cancelable: false },
        );
      }
    })
}

takePhoto = () => {
  const options = {
    title: 'PLACE PHOTO',
    mediaType: 'photo',
    maxWidth:500,
    maxHeight:500
  };
  ImagePicker.launchCamera(options, response => {
    if (response.uri) {
    
      this.setState({ placePic: response.uri});
    }
  });
}

removePlaceImage() {
  this.setState({ placePic: null});
}

removeParcel(code) {
  if(this.state.barcodes.includes(code)) {
    const items = this.state.barcodes.filter(item => item !== code);
    this.setState({
      barcodes: items
    });
  } 
}

scanParcel() {
  let code = this.state.manual_barcode;
  if(code != ''){
    this.setState({isloading:true});
    var postdata = { barcode:this.state.manual_barcode};
     postData(postdata,'package_numbering').then((res) => {
      console.log(res);
      if(res.type == 1) {
        this.setState({isloading:false,sequenceNo:res.data.sequence_number,
      totalPkg:res.data.TotalPackages,
      SequenceNumberMark:res.data.SequenceNumberMarkCount,
      PendingSequenceNo:res.data.PendingSequenceNumberMarkCount,
      TotalPkgForStop:res.data.TotalPackagesForStop,
      MarkPkgForStop:res.data.MarkPackagesForStop,
      TotalStops:res.data.TotalStops,
      TotalStopsMark:res.data.TotalStopsMark,
      sequence_number:res.data.sequence_number,
      })
      } else {
        this.setState({isloading:false,
      sequenceNo:0,
      totalPkg:0,
      SequenceNumberMark:0,
      PendingSequenceNo:0,
      TotalPkgForStop:0,
      MarkPkgForStop:0,
      TotalStops:0,
      TotalStopsMark:0,
      sequence_number:0,
      })
        _showErrorMessage(res.message);
      }
     });
  }
}

getCurrentPosition() {
  geolocation.getCurrentPosition(
    //Will give you the current location
    (position) => {
      //setLocationStatus('You are Here');

      //getting the Longitude from the location json
      const currentLongitude = 
        JSON.stringify(position.coords.longitude);

      //getting the Latitude from the location json
      const currentLatitude = 
        JSON.stringify(position.coords.latitude);

      //Setting Longitude state
      this.setCurrentLongitude(currentLongitude);
      
      //Setting Longitude state
      this.setCurrentLatitude(currentLatitude);
      var postdata = { latitude: currentLatitude,longitude:currentLongitude };
      saveLocation(postdata)
        .then((res) => {
          console.log(res);
        });
    },
    (error) => {
      this.setLocationStatus(error.message);
    },
    {
      enableHighAccuracy: false,
      timeout: 30000,
      maximumAge: 1000
    },
  );
}

setCurrentLongitude(longitude){
  let longitude_ = parseFloat(longitude).toFixed(4);
  this.setState({
    gps_long: longitude_,
  });
} 

setCurrentLatitude(latitude){
  let latitude_ = parseFloat(latitude).toFixed(4);
  this.setState({
    gps_lat: latitude_,
  });
}

setLocationStatus(error){
  _showErrorMessage(error);
}
  
renderParcel() {
  return (
    <View style={{padding:5}}>
      {
        this.state.barcodes.map((res, i) => {
          return (<View key={i} style={{alignItems:'center',flexDirection:'row', justifyContent:'space-between',backgroundColor: '#00c2f3', flex:1,marginTop:7, borderRadius:5}}>
            <Text key={i} style={{width:'75%',fontSize:16, paddingLeft:21, color:'#fff', fontWeight:'bold'}}>{res}</Text>
            <Icon type="FontAwesome" name='times-circle' onPress={() => this.removeParcel(res)} style={{ color: '#fff',marginLeft: 20,fontWeight: 100}}/>
        </View>);
        })
      }
    </View>
  );
}

checkNetwork () {
  NetInfo.fetch().then(state => {
    if(state.isConnected == false) {
       this.setState({
        isloading: false,
      });
      _showErrorMessage('Your phone not connect with internet. Please try again');
      return false;
    } else {
     this.getNetworkBandwidth();
    }
  });
}

 getNetworkBandwidth = async (): Promise<void> => {
  try {
    const networkSpeed: NetworkBandwidthTestResults = await measureConnectionSpeed();
    if(networkSpeed.speed < 1){
    _showErrorMessage('Your internet speed is slow, Your net speed is '+networkSpeed.speed.toFixed(1)+' Mbps');
    
    } 
    } catch (err) {
      console.log(err);  
    }
  }

  refreshPage() {
    this.props.navigation.push('PackageNumbering');
  }

  NextScan() {
    this.props.navigation.push('PackageNumbering');
  }

render() {
  const {
    container,
    backButton,
    backSection,
    backIcon,
    backText,
    mainContainer1,
    spaceDivider,
  } = styles;
     
    return (
      <Container style={{flex:1}}>
      { (this.state.isShowScanner) ?
      (<View style={{ height: '100%'}}>
        <View style={container}>
            <CustomHeader {...this.props} url={this.state.user_avtar} />
          <View style={{ height: 40, borderColor: '#00c2f3', borderWidth: 1, backgroundColor: '#00c2f3',marginTop: 30,marginBottom:25, marginLeft: 20, marginRight: 20, justifyContent: 'center'}}>
            <TouchableOpacity style={{ flexDirection: 'row', alignItems:'center'}} onPress={() => this.setState({ isShowScanner: false })}>
              <Icon type="FontAwesome" name='angle-left' style={{ color: 'black',marginLeft: 20,fontWeight: 100}}/>
              <Text style={{color:"#fff",fontWeight:'bold',marginTop:(Platform.OS == 'ios') ? -4 : 0, fontSize: 22,padding:10,textAlign:'center',paddingLeft:'4%'}}>Scan </Text>
            </TouchableOpacity>
          </View>
          <View style={{flexDirection:'row', justifyContent:'space-between',marginLeft: 20, marginRight: 20}}>
              <Text style={{color:'black',fontSize:18,}}>Flash Light</Text>
              <Switch onValueChange={ (value) => {value == true?this.props.flashon():this.props.flashoff()}} 
                value={this.props.flashstatus == 'torch'?true:false} /> 
            </View>
          <View style={{flexDirection:'row',paddingTop:15}}>
            <QRCodeScanner markerStyle={{height: 120,width: 290}} cameraStyle={{ height: 220, marginTop: 10, width: 300, alignSelf: 'center', justifyContent: 'center', overflow: 'hidden' }} onRead={ (e) => this.onScannerSuccess(e) }
              reactivate={true}
              showMarker={true}
              flashMode={this.props.flashstatus == 'torch'?RNCamera.Constants.FlashMode.torch:RNCamera.Constants.FlashMode.off}
              reactivateTimeout={7000}
            />
          </View>
        </View>

      </View>
      ):null
      }
        { (!this.state.isShowScanner) ?
      (<Content>
          <CustomHeader {...this.props} url={this.state.user_avtar} />
          <View style={backSection}>
          <TouchableOpacity style={backButton} onPress={() => this.props.navigation.navigate('Route')}>
                <Icon type="FontAwesome" name='angle-left' style={backIcon}/>
              <Text style={{color:"#fff",fontWeight:'bold',marginTop:(Platform.OS == 'ios') ? 1 : 0, fontSize: 22,padding:10,textAlign:'center',paddingLeft:'4%'}}>PACKAGE NUMBERING</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => this.refreshPage()}>
            <Icon style={{color:'#fff',right:8,fontWeight:200}} name='sync' />
          </TouchableOpacity>
          </View>
          <View style={{paddingLeft:10,paddingRight:10}}>
          <View style={{ flexDirection: 'row', marginTop: 15}}>
            <Button style={{width:'100%', height:30, backgroundColor: '#00c2f3', justifyContent: 'center',borderRadius:6}}
                onPress={() => this.setState({ isShowScanner: true })}>
                <Text style={{ textAlign: 'center', color: '#FFFFFF', fontWeight:'bold', fontSize: 14}}>SCAN PARCEL</Text>
                <Icon name='scan' />
            </Button>
          </View>
          <View style={{ marginTop: 5, alignItems:'center'}}>
            <Text style={{ textAlign: 'center', fontSize: 14}}>OR</Text>
          </View>    
          <Form>
              <Item stackedLabel>
                <Label error={true} style={{ fontWeight: 'bold' }}>Enter Parcel Bar Code</Label>
              <Item>
                <Input placeholder="Enter Code" value={this.state.manual_barcode} onChangeText={(manual_barcode) => this.setState({ manual_barcode: manual_barcode })}/>   
                <Icon type="FontAwesome" onPress={() => this.scanParcel()} name='search' style={{ color: '#00c2f3',marginLeft: 20}}/>
              </Item>
            </Item>
          </Form>  
          
           
            <View style={{marginTop: 10}}>
                <Text style={{alignSelf:'center',fontSize:20,fontWeight:'bold',color:'#054b8b'}}>STOP NUMBER: {this.state.sequence_number}</Text>
            </View>
            <View style={{marginTop: 1}}>
                <Text style={{alignSelf:'center',fontSize:13,fontWeight:'bold',color:'#054b8b'}}>MULTIPLE PACKAGES FOR STOP {this.state.sequence_number}: {this.state.MarkPkgForStop}/{this.state.TotalPkgForStop} </Text>
            </View>
            <View style={{marginTop: 10}}>
                <Text style={{alignSelf:'center',fontSize:14,fontWeight:'bold',color:'#054b8b'}}>STOPS MARKED: {this.state.TotalStopsMark}/{this.state.TotalStops} </Text>
            </View>
            <View style={{marginTop: 10}}>
                <Text style={{alignSelf:'center',fontSize:14,fontWeight:'bold',color:'#054b8b'}}>TOTAL STOPS: {this.state.TotalStops}   TOTAL PACKAGES: {this.state.totalPkg}</Text>
            </View>
            
            {this.state.placePic ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', flexGrow: 0, justifyContent: 'flex-start',marginTop: 20, marginLeft: 10 }}>
              <View style={{ flexBasis: '100%', height: 200, marginBottom: 10 }}>
                {this.state.placePic ? (<Image style={{ height: 200 }} source={{ uri: this.state.placePic }}/>):null}
                {this.state.placePic ? (<TouchableOpacity onPress={() => this.removePlaceImage()}
                                  style={{ position: 'absolute', top: -5, right: -5, zIndex: 9 }}>
                  <Icon type="FontAwesome" name='times'  style={{ color: '#F9CCBE'}}/>
                </TouchableOpacity>):null}
              </View>
            </View>):null}
            <View style={spaceDivider}></View>
            <View style={{ flexDirection: 'row',alignItems:'center',justifyContent:'center'}}>
              {(this.state.SequenceNumberMark == this.state.totalPkg && this.state.totalPkg > 0) ? (
                <Button 
                style={{ height: 50, width:'45%', backgroundColor: '#00c2f3', justifyContent: 'center', borderRadius: 5}}
                onPress={() => this.props.navigation.push('StartDayReport')}>
                <Text style={{ textAlign: 'center', color: '#fff', fontSize: 22 }}>COMPLETE</Text>
              </Button>) : <Button 
                style={{ height: 50, width:'45%', backgroundColor: '#00c2f3', justifyContent: 'center', borderRadius: 5}}
                onPress={() => this.refreshPage()}>
                <Text style={{ textAlign: 'center', color: '#fff', fontSize: 22 }}>NEXT SCAN</Text>
              </Button>}
              </View>
              <View style={spaceDivider}></View>
              </View>
          </Content>):null}
           {this.state.isloading && (
              <Loader />
          )}
          </Container>
    );
  }
}

function mapStateToProps(state){
  return{
    flashstatus : state.flashstatus
  };
}
function matchDispatchToProps(dispatch){
  return bindActionCreators({flashon: flashon, flashoff: flashoff}, dispatch)
}
export default connect(mapStateToProps,matchDispatchToProps)(PackageNumbering);