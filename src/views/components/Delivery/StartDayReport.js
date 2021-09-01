import React, {Component } from 'react';
import { LogBox,View, Text, Image,StyleSheet,TouchableOpacity,ScrollView,SafeAreaView,TextInput} from 'react-native';
import { Container,FlatlistContent, Header, Content, Form,Textarea, Item, Input, Label,Button, Toast, Icon, Accordion, } from 'native-base';
import { image, config, _showErrorMessage, _showSuccessMessage, Loader,_storeData, _storeUser,_retrieveData } from 'assets';
import styles from './styles';
import CheckBox from '@react-native-community/checkbox';
import { getData,getUser,saveRouteInfo,saveLocation } from 'api';
import CustomHeader from '../../CustomHeader';
import geolocation from '@react-native-community/geolocation';
import {Picker} from '@react-native-community/picker';
import NetInfo from "@react-native-community/netinfo";
LogBox.ignoreAllLogs(); 

class StartDayReport extends Component {
constructor(props) {
    super(props);
 
    this.state = { 
      isloading: true,
      user_avtar:'',
      TotalPackages:0,
      TotalStops:0,                                  
      Return:0,    
      Delivered:0, 
      PendingStops:0,
      Not_Delivered:0,
      retail_drops:0,
      retail_drop_stops_count:0,
      Employee_name:'',
      Helper_name:'',
      date:'',
      vehicle_number:'',
      scanner_id:'',
      door_knocker_count:0,
      liw_count:2,
      warehouse_name:'',
      company_name:'',
      row_id:'',
      showstartday:true,
      postal_code:'',
      t_number:'',
      time:''
    };
  }

componentDidMount = () => {

      _retrieveData('user_avtar') 
        .then((res) => {
          if(res != null){
            this.setState({user_avtar:res});
          }
        });

        _retrieveData('startday') 
        .then((res) => {
          if(res != null){
            if(res == 1 ){
              this.setState({showstartday:false});
            }
          }
        });

      this._unsubscribe = this.props.navigation.addListener('focus', () => {
        
        getData('warehouse_pickup').then((res) => {
          _storeData('warehouse_pickup',res.data.Warehouses).then();
        });

        getData('delivered_reasons').then((res) => {
            if(res.type == 1) {
            _storeData('delivered_reasons',res.data).then();
            }
          });

        getData('not_delivered_reasons').then((res) => {
          if(res.type == 1) {
          _storeData('not_delivered_reasons',res.data).then();
          }
        });
        
        this.checkNetwork();  
        getData('start_day_report').then((res) => {
          this.setState({
              isloading: false,
            });
          console.log(res);
        if(res.type == 1){
          console.log(res);
          this.setState({
                TotalPackages:res.data.TotalPackages,
                TotalStops:res.data.TotalStops, 
                Employee_name:res.data.Employee_name,
                Helper_name:res.data.Helper_name,
                date:res.data.date,
                vehicle_number:res.data.vehicle_number,
                scanner_id:res.data.scanner_id,
                liw_count:res.data.liw_stops_count,
                warehouse_name:res.data.warehouse_name,
                company_name:res.data.company_name,
                row_id:res.data.road_warrior_id,
                postal_code:res.data.PostalCodes,
                t_number:res.data.t_number_of_vehicle,
                time:res.data.time,
            });

            

        } else if(res.type == 2){
          //this.props.navigation.navigate('Delivery');
          //_showErrorMessage(res.message);
        } else {
            // console.log(res);
            _showErrorMessage('Please create a route first.');
            this.props.navigation.navigate('CreateRoute');
        }

       }).catch(error => {
          this.setState({isloading:false});
          _showErrorMessage(error.message);
        });
  });
};


componentWillUnmount() {
    this._unsubscribe();
  }

  checkNetwork () {
  NetInfo.fetch().then(state => {
  if(state.isConnected == false) {
     this.setState({
      isloading: false,
    });
    _showErrorMessage('Your phone not connect with internet. Please try again');
    return false;
  }
});
}

startday(){
  _storeData('startday',1).then();
  this.props.navigation.navigate('DELIVERY');
}

 refreshPage() {
    this.props.navigation.push('StartDayReport');
  }


  showBarcode() {
    var o = 3;
      const {
      labelMain,
      itemValueEndDay,
      itemBorder,
      itemLabel,
      itemValue
    } = styless;
     return (
      <Text style={{itemValueEndDay},{flexWrap: 'wrap',width:158,textAlign:'right'}}>
 {this.state.postal_code.split(',').map((step,i)=> {
                    

                  if(i == o) {
                    console.log("--------============")
                    o = o + 3;
                  } 
                  
                  console.log("o=="+o);
                  console.log("i=="+i);

                  if(i > o) {
                    console.log("if")
                    return (<Text>{step}{this.state.postal_code.split(',').length > (i+1) && ","} {"\n"}</Text>)
                  } else {
                    console.log("else")
                    return (<Text>{step}{this.state.postal_code.split(',').length > (i+1) && ","} </Text>)
                  }


                  
                })
}


    </Text>)
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
      mainContainer1,
      mainContainer,
      itemValue1,
      itemSectionEndDay,
      checkbox,
      checkbox1,
      nextSection,
      blockSection,
      blockText,
      itemMain,
      spaceDivider,
      nextText,
      nextButton,
      itemMainSub,
      pickerStyle,
      pickerMain,
      roundIcon,
      itemSection
    } = styles;

    const {
      labelMain,
      itemValueEndDay,
      itemBorder,
      itemLabel,
      itemValue
    } = styless;

    return (
      <Container>
         <Content>
          <CustomHeader {...this.props} url={this.state.user_avtar} />
          <View style={backSection}>
              <TouchableOpacity style={backButton} onPress={() => this.props.navigation.navigate('Route')}>
                <Icon type="FontAwesome" name='angle-left' style={backIcon}/>
                <Text style={{color:"#fff",fontWeight:'bold',marginTop:(Platform.OS == 'ios') ? 5 : 0, fontSize: 20,padding:10,textAlign:'center',paddingLeft:'4%'}}>START OF DAY SUMMARY</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => this.refreshPage()}>
            <Icon style={{color:'#fff',right:8,fontWeight:200}} name='sync' />
          </TouchableOpacity>
          </View>

          {!this.state.isloading?(<View style={{padding:5}}>
            <View style={{backgroundColor: '#fff',marginTop: '2%', borderColor: '#00c2f3', borderWidth: 1}}>
              <View style={labelMain}>
                <Text style={itemValueEndDay}>DATE TIME:</Text>
                <Text style={itemValueEndDay}>{this.state.date} {this.state.time}</Text>
              </View>

              <View style={labelMain}>
                <Text style={itemValueEndDay}>EMPLOYEE NAME:</Text>
                <Text style={itemValueEndDay}>{this.state.Employee_name}</Text>
              </View>
              { this.state.Helper_name != " "  ?
                <View style={labelMain}>
                  <Text style={itemValueEndDay}>HELPER NAME:</Text>
                  <Text style={itemValueEndDay}>{this.state.Helper_name}</Text>
                </View>:null
               }
              <View style={labelMain}>
                <Text style={itemValueEndDay}>SCANNER ID:</Text>
                <Text style={itemValueEndDay}>{this.state.scanner_id}</Text>
              </View>
               <View style={labelMain}>
                <Text style={itemValueEndDay}>LICENSE PLATE #:</Text>
                <Text style={itemValueEndDay}>{this.state.vehicle_number}</Text>
              </View>
              { this.state.t_number != " " &&
              <View style={labelMain}>
                <Text style={itemValueEndDay}>VEHICLE #:</Text>
                <Text style={itemValueEndDay}>{this.state.t_number}</Text>
              </View>
            }
              <View style={labelMain}>
                <Text style={itemValueEndDay}>COMPANY:</Text>
                <Text style={itemValueEndDay}>{this.state.company_name}</Text>
              </View>
              <View style={labelMain}>
                <Text style={itemValueEndDay}>WAREHOUSE:</Text>
                <Text style={itemValueEndDay}>{this.state.warehouse_name}</Text>
              </View>
              
              <View style={labelMain}>
                <Text style={itemValueEndDay}>RW ID:</Text>
                <Text style={itemValueEndDay}>{this.state.row_id}</Text>
              </View>
              
             
               <View style={labelMain}>
                <Text style={itemValueEndDay}>POSTAL CODE:</Text>
                
                
                  {this.showBarcode()}

              </View>
              
                <View style={{backgroundColor: 'white', borderRadius: 10, marginTop: 5, marginLeft: 8, marginRight: 8,borderColor: this.state.showMainBlockError?'red':'white',borderWidth: 1}}>
                </View>
              </View>
              <View style={{backgroundColor: '#fff',borderRadius: 6,marginTop: '1%'}}>
            <View style={itemSectionEndDay}>
                <Text style={itemLabel}>Total Stops:</Text>
                <Text style={{fontSize: 18,paddingLeft:1,marginTop: 2}}>{this.state.TotalStops}</Text>
              </View>
              <View style={itemBorder}></View>

              <View style={itemSectionEndDay}>
                <Text style={itemLabel}>Total Packages:</Text>
                <Text style={{fontSize: 18,paddingLeft:1,marginTop: 2}}>{this.state.TotalPackages}</Text>
              </View>
              <View style={itemBorder}></View>
              <View style={itemSectionEndDay}>  
                <Text style={itemLabel}>LIW:</Text>
                <Text style={{fontSize: 18,paddingLeft:1,marginTop: 2}}>{this.state.liw_count}</Text>
              </View>
              <View style={itemBorder}></View>
            </View><View style={{ flexDirection: 'row', marginTop: 25,justifyContent: 'center'}}>
            {this.state.showstartday ?
            
              <Button  style={{width:'100%', backgroundColor: '#AEACAB', justifyContent: 'center', borderRadius:10,width:200}}
                onPress={() => this.startday()}>
                <Text style={{ textAlign: 'center', color: '#FFFFFF', fontSize: 20,fontWeight:'bold'}}>START DAY</Text>
             </Button>
            
              :<Button style={{width:'100%', backgroundColor: '#00c2f3', justifyContent: 'center',borderRadius:10,width:200}}
                onPress={() => this.startday()}>
                <Text style={{ textAlign: 'center', color: '#FFFFFF', fontSize: 20,fontWeight:'bold'}}>START DAY</Text>
             </Button>
             
           }
          </View></View>):null}


          {this.state.isloading?(<View>
              <View style={{flexDirection: 'row',marginLeft: 20,marginRight: 20,alignSelf:'center'}}>
                <Text style={{color: 'black', fontSize: 16, marginTop: 4,marginLeft: 4, alignSelf:'center'}}>Loading...</Text>
              </View>                                                        
            </View>):null}

            <View style={spaceDivider}></View>
          </Content>
           {this.state.isloading && (
              <Loader />
          )}
          </Container>
       
    );
  }
}


const styless = StyleSheet.create({
  backSection: {
    borderColor: '#00c2f3',
    borderWidth: 1,
    backgroundColor: '#00c2f3',
    marginTop: '2%',
    //borderRadius: 6,
  },
  backButton: {
    flexDirection: 'row',
    justifyContent:'center'
  },
  backText: {
    color:"#fff",
    fontWeight: '100',
    fontSize: 18,
    padding:10,
    textAlign:'center',
    paddingLeft:'4%'
  },
  nextIcon: { 
    color: 'black',
    fontWeight: '100',
    padding:10,
    right:4
  },
  labelMain: {
    flexDirection: 'row',justifyContent: 'space-between',paddingLeft:5,paddingRight:5,marginTop:3
  },
  itemValueEndDay: {
    fontSize: 16,
    paddingLeft:1
  },
    itemLabel: { 
    color: 'black', 
    fontSize: 18, 
    marginTop: 1, 
    marginLeft: 4,
  },
  itemValue: {
    fontSize: 14,paddingLeft:1,marginTop: 0.5
  }, 
  itemBorder: {
    borderColor: '#00c2f3',borderWidth: 0.5, marginTop:-1,marginLeft:10,marginRight:10
  },
  backIcon: { 
    color: '#fff',
    fontWeight: '100',
    alignSelf:'flex-start',
    right:70
  },

});

export default StartDayReport;
