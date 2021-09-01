import React, {Component } from 'react';
import { View, Text, Image,StyleSheet,TouchableOpacity,ScrollView,SafeAreaView} from 'react-native';
import { Container, Header, Content, Form, Item, Input, Label,Button, Toast, Icon } from 'native-base';
import { image, config,_showErrorMessage, Loader, _storeUser,_getAll,_storeData, _retrieveData,checkNet } from 'assets';
import styles from './styles';
import {getUser,getCustomerdata } from 'api';
import CustomHeader from '../../CustomHeader';
import NetInfo from "@react-native-community/netinfo";
import { measureConnectionSpeed } from 'react-native-network-bandwith-speed';

import { openDatabase } from 'react-native-sqlite-storage';
var db = openDatabase({ name: 'UserDatabase.db' });
import {Linking} from 'react-native'

class CustomerDetail extends Component {
constructor(props) {
    super(props);
    this.state = {
      isloading: false,
      isShowScanner:false,
      barcodes:[],
      customer_name:'',
      address:'',
      city:'',
      province:'',
      postal_code:'',
      email_address:'',
      phone_number:'',
      company_name:this.props?.route?.params?.company_name,
      loadId:'',
      user_avtar:'',
      date:'',
      stopId:this.props?.route?.params?.stopid,
      barcode:this.props?.route?.params?.barcode
    };

}

 
componentDidMount = () => {
  this._unsubscribe = this.props.navigation.addListener('focus', () => {
    console.log(this.props?.route?.params?.stopid);
    this.getDataInfo(this.props?.route?.params?.stopid,this.props?.route?.params?.barcode);
      getUser().then((res) => {
            this.setState({
              loadId: res.scanner_id
            });
      }); 

    _retrieveData('user_avtar')
    .then((res) => {
      if(res != null){
        this.setState({user_avtar:res});
      }
    });
  }); 
        
};

doCall(){
  Linking.openURL(`tel:${this.state.phone_number}`)
}

  getDataInfo = (stop_id,barcode) => {
    if(stop_id == 0) {
      this.getDataInfoOfflineWithBarcode(barcode);
    } else {
      this.getDataInfoOffline(stop_id);
    }
    //this.checkNetwork();
  	//this.setState({isloading:true});
     // checkNet().then((res) => {
     // 	this.setState({isloading:false});
     //  if (res == 1 || res == 2) {
          
     //      if(stop_id == 0) {
     //        this.getDataInfoOfflineWithBarcode(barcode);
     //      } else {
     //        this.getDataInfoOffline(stop_id);
     //      }
     //  } else {
     //     this.getDataInfoOnline(stop_id);
     //  }
     //  });
  }


  getDataInfoOfflineWithBarcode = (barcode) => {
  //this.setState({isloading:true});
    //console.log(stop_id);
  db.transaction((tx) => {
      tx.executeSql(
         'SELECT * FROM table_stops where barcode = ?',
        [barcode],
        (tx, results) => {
          let data = results.rows.item(0);
            this.setState({
              address:data.address,
              city:data.city,
              barcodes:data.barcode,
              province:data.province,
              postal_code:data.postal_code,
              customer_name:data.customer_name,
              phone_number:data.phone_number,
              email_address:data.email_address
            });
        }


      );
    });
  this.setState({isloading:false});
 }

  getDataInfoOffline = (stop_id) => {
  //this.setState({isloading:true});
    console.log(stop_id);
  db.transaction((tx) => {
      tx.executeSql(
         'SELECT * FROM table_stops where stop_id = ?',
        [stop_id],
        (tx, results) => {
          if(results.rows.length > 0) {
          let data = results.rows.item(0);
          console.log(data);
            this.setState({
              address:data.address,
              city:data.city,
              barcodes:data.barcode,
              province:data.province,
              postal_code:data.postal_code,
              customer_name:data.customer_name,
              phone_number:data.phone_number,
              email_address:data.email_address
            });
        } else {
          this.getDataInfoOnline(stop_id);
        }
      }

      );
    });
  this.setState({isloading:false});
 }

 getDataInfoOnline = (stop_id) => {
  this.setState({isloading:true});
      var postdata = { stop_id:stop_id };
         getCustomerdata(postdata).then((res) => {
            this.setState({
              isloading:false,
              address:res.data.address,
              city:res.data.city,
              barcodes:res.data.barcode,
              email_address:res.data.email_address,
              phone_number:res.data.phone_number,
              province:res.data.province,
              postal_code:res.data.postal_code,
              customer_name:res.data.customer_name,
              date:res.data.date,
            });
         }).catch(error => {
            this.setState({isloading:false});
          _showErrorMessage(error.message);
          });
  }
    /*Go to next page*/
  nextPage() {
    if(this.state.stopId == 0){
        this.props.navigation.navigate('ParcelDetail', { barcode:this.state.barcode, stopid: this.state.stopId,is_correction:this.props?.route?.params?.is_correction})
    } else {
        this.props.navigation.navigate('ParcelDetail', { stopid: this.state.stopId,is_correction:this.props?.route?.params?.is_correction})
      }
  } 

   notDeliverdPage() {
    if(this.state.stopId == 0){
        this.props.navigation.navigate('NotDelivered', { barcode:this.state.barcode, stopid: this.state.stopId,is_correction:this.props?.route?.params?.is_correction})
    } else {
        this.props.navigation.navigate('NotDelivered', { stopid: this.state.stopId,is_correction:this.props?.route?.params?.is_correction})
      }
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
  this.props.navigation.push('CustomerDetail', { stopid: this.state.stopId,company_name:this.state.company_name});
}

  render() {
    const {
      container,
      headerLogo,
      headerView,
      backButton,
      backSection,
      backIcon,
      nextIcon,
      backText,
      mainContainer,
      itemLabel,
      itemValue,
      itemValue1,
      itemSection,
      nextSection,
      blockSection,
      blockText,
      itemMain,
      spaceDivider,
      nextText,
      nextButton,
      itemMainSub
    } = styles;

    const {
      checked,
      setChecked,
      garbage,
      cleaning,
      accessories,
      fuel_tank,
      oil_change,tire_pressure,brakes,
      no_evidence_flood_damage,
      body_panel_inspection,bumper_fascia_inspection,
      doors_hood_roof_inspection,
      doors_hood_alignment,
      power_sliding_door_operation,
      windshield_side_rear_window_glass_inspection,
      wiper_blade_inspection,
      exterior_lights_back_side_front} = this.state;
     
    return (
      <Container>
          
         <Content>
            <CustomHeader {...this.props} url={this.state.user_avtar} />
          <View style={backSection}>
              <TouchableOpacity style={backButton} onPress={() => this.props.navigation.navigate('Delivery')}>
                <Icon type="FontAwesome" name='angle-left' style={backIcon}/>
                <Text style={{color:"#fff",fontWeight:'bold',marginTop:(Platform.OS == 'ios') ? 1 : 0, fontSize: 22,padding:10,textAlign:'center',paddingLeft:'4%'}}>CUSTOMER DETAILS</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => this.refreshPage()}>
            <Icon style={{color:'#fff',right:8,fontWeight:200}} name='sync' />
          </TouchableOpacity>
          </View>
          <View style={{paddingLeft:10,paddingRight:10}}>
          <View style={{flexDirection:'row',paddingTop:15}}>
          <View style={{flexDirection:'row',width:'50%'}}>
            <Text style={{fontSize:18,fontWeight:'bold'}}>Load:</Text>
            <Text style={{paddingLeft:10,fontSize:20}}>{this.state.loadId}</Text>
          </View>
            <View style={{flexDirection:'row-reverse',width:'50%'}}>
              <Text style={{fontSize:18,fontWeight:'bold'}}>{this.state.date}</Text>
            </View>
          </View>
          <View style={{borderColor: '#00c2f3',borderWidth: 1, marginTop:12}}>
          </View>
            <View style={mainContainer}>
            <Form>
              <Item stackedLabel>
                <Label error={true} style={{ fontWeight: 'bold' }}>Customer Name</Label>
                <Item>
                  <Icon  type="FontAwesome" name='user' style={{ color: '#00c2f3'}}/>
                  <Input disabled={true} placeholder="Enter Customer Name" value={this.state.customer_name} onChangeText={(customer_name) => this.setState({ customer_name: customer_name })}/>
                </Item>
              </Item>
               <Item stackedLabel>
                <Label style={{ fontWeight: 'bold' }}>Customer Address</Label>
                <Item style={{ borderBottomColor: '#00c2f3'}}>
                  <Icon type="FontAwesome" name='map-marker' style={{ color: '#00c2f3'}}/>
                  <Input disabled={true} placeholder="Enter Customer Address" value={this.state.address} onChangeText={(address) => this.setState({ address: address })}/>

                </Item>
              </Item>
              <Item stackedLabel>
                <Label style={{ fontWeight: 'bold' }}></Label>
              </Item>
                <Label style={{ fontSize:15, fontWeight: 'bold',marginLeft:12,color:'#595959' }}>City/Province/Postal</Label>
              <Item >
                <Item style={{ borderBottomColor: '#00c2f3', width:'40%'}}>
                  <Input disabled={true} placeholder="City" value={this.state.city} onChangeText={(city) => this.setState({ city: city })}/>
                  </Item>
                  <Item style={{ borderBottomColor: '#00c2f3',width:'20%',marginLeft:15}}>
                  <Input disabled={true} style={{paddingLeft:10}} placeholder="Province" value={this.state.province} onChangeText={(province) => this.setState({ province: province })}/>
                  </Item>
                  <Item style={{ borderBottomColor: '#00c2f3',width:'20%',marginLeft:40}}>
                  <Input disabled={true} placeholder="Postal" value={this.state.postal_code} onChangeText={(postal_code) => this.setState({ postal_code: postal_code })}/>
                  </Item>
              </Item>
               <Item stackedLabel>
                <Label style={{ fontWeight: 'bold' }}>Email</Label>
                <Item style={{ borderBottomColor: '#00c2f3'}}>
                  <Icon type="FontAwesome" name='envelope' style={{ color: '#00c2f3'}}/>
                  <Input disabled={true} placeholder="Enter Customer Email" value={this.state.email_address} onChangeText={(email_address) => this.setState({ email_address: email_address })}/>
                </Item>
              </Item>
               <Item stackedLabel>
                <Label style={{ fontWeight: 'bold' }}>Phone</Label>
                 {this.state.phone_number ?
                <Item style={{ borderBottomColor: '#00c2f3'}}>
                  <Icon type="FontAwesome" name='phone' style={{ color: '#00c2f3'}}/>
                  <Input disabled={true} placeholder="Enter Customer Phone" keyboardType = 'numeric' value={this.state.phone_number} onChangeText={(phone_number) => this.setState({ phone_number: phone_number })}/>
                 
                   <Icon  type="FontAwesome" name='phone-square' style={{ color: '#00c2f3'}} onPress={() => this.doCall()}/>
                </Item>

                :<Item style={{ borderBottomColor: '#00c2f3'}}>
                  <Icon type="FontAwesome" name='phone' style={{ color: '#00c2f3'}}/>
                  <Input disabled={true} placeholder="Enter Customer Phone" keyboardType = 'numeric' value={this.state.phone_number} onChangeText={(phone_number) => this.setState({ phone_number: phone_number })}/>
                   
                </Item>
              }

              </Item>
                </Form>
             </View>
          <View style={{ flexDirection: 'row', alignItems:'center'}}>
             <Button style={{width:'33%', backgroundColor: 'green', justifyContent: 'center',borderRadius:6}}
                onPress={() => this.nextPage()}>
                <Text style={{ textAlign: 'center', color: '#FFFFFF', fontSize: 14}}>DELIVERED</Text>
              </Button>
              <Button style={{width:'33%',marginLeft: 3, backgroundColor: '#054b8b', justifyContent: 'center',borderRadius:6}}
                onPress={() => this.props.navigation.navigate('NotDelivered',{ stopid: this.state.stopId,is_correction:this.props?.route?.params?.is_correction})}>
                <Text style={{ textAlign: 'center', color: '#FFFFFF', fontSize: 14 }}>NOT DELIVERED</Text>
              </Button>
              <Button style={{width:'33%',marginLeft: 3, backgroundColor: '#b10505', justifyContent: 'center',borderRadius:6}}
                onPress={() => this.props.navigation.navigate('Delivery')}>
                <Text style={{ textAlign: 'center', color: '#FFFFFF', fontSize: 14 }}>CANCEL</Text>
              </Button>
          </View>
          <View style={spaceDivider}></View>
          </View>
        </Content>
        {this.state.isloading && (
              <Loader />
          )}
          </Container>

    );
  }
}

export default CustomerDetail;