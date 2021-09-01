import React, { Component } from 'react';

import { View, Text, Image, TouchableOpacity, SafeAreaView, ScrollView, KeyboardAvoidingView,TextInput,Platform} from 'react-native';
import { Container, Header, Content, Form, Item, Input, Label,Button, Toast, Icon,Tabs,Tab } from 'native-base';
import { image, _showErrorMessage, _showSuccessMessage, Loader, _storeUser,_retrieveData,_storeData } from 'assets';
import { requestByTarget,saveLocation ,getUser,saveAgreementData} from 'api';
import { WebView } from 'react-native-webview';
import CustomHeader from '../../CustomHeader';
import geolocation from '@react-native-community/geolocation';
import { CommonActions } from '@react-navigation/native';
import { StackActions } from '@react-navigation/native';
import Signature from 'react-native-signature-canvas';

class Agrement extends Component {

constructor(props) {
    super(props);
    this.state = {
      isloading: false,
      showContent: false,
      data:[],
      location:'',
      gps_long:'',
      gps_lat:'',
      longitude:null,
      latitude:null,
      user_avtar:'',
      driverName:'',
      showPage: true,
      showSign:false,
      signImg:null,
      showTab:1,
      vehicleInfo: this.props?.route?.params?.vehicleInfo,
      date:'',
      locationAttempt:0,
      vehicle_number:'',
      vehicle_id:'',
    };

  }

  getCurrentPosition() {
geolocation.getCurrentPosition((position) => {
      const currentLongitude = JSON.stringify(position.coords.longitude);
      const currentLatitude = JSON.stringify(position.coords.latitude);
      this.setState({
          gps_long: currentLongitude,
          gps_lat: currentLatitude
        });
  },(error) => {
            this.setLocationStatus(error.message);
          },
          {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 5000
    });
}

setLocationStatus(error){
  _showErrorMessage(error);
}

  saveAgreementData = () => {

    let currentLongitude = this.state.gps_long;
    let currentLatitude = this.state.gps_lat;

     if(this.state.gps_long == '' || this.state.gps_lat == '') {
      geolocation.getCurrentPosition((position) => {
          currentLongitude = JSON.stringify(position.coords.longitude);
          currentLatitude = JSON.stringify(position.coords.latitude);
            },
            (error) => {
              this.setLocationStatus(error.message);
            },
            {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 5000
      });
  }


    if(this.state.signImg == null) {
    	_showErrorMessage('Signature is required');
    	return false;
  	}


   if(currentLongitude == '' || currentLongitude == null) {
      this.getCurrentPosition();
        if(this.state.locationAttempt == 0) {
          this.setState({locationAttempt:1});
          _showErrorMessage('Location not Found please try again.');
          return false;  
        }
    }


  const formdata = new FormData();
  const _this = this;

  
  if(this.state.signImg != null){
    formdata.append('signature_photo', this.state.signImg);
  }

  formdata.append('full_name', this.state.driverName);
  

  formdata.append('vehicle_number', this.props?.route?.params?.vehicleInfo.vehicle_number || this.state.vehicle_number);
  formdata.append('vehicle_id', this.props?.route?.params?.vehicleInfo.vehicle_id || this.state.vehicle_id);
  
  

  
    formdata.append('gps_long', currentLongitude);
    formdata.append('gps_lat', currentLatitude);

  console.log(formdata);
    this.setState({isloading:true});
   saveAgreementData(formdata).then((res) => {
    this.setState({isloading:false});
    console.log(res);
    if(res.status === 0){
      _showErrorMessage(res.message);
    } else {
    	_storeData('agreement_submit','yes').then();
        _showSuccessMessage(res.message);
        this.props.navigation.navigate('HelperInformation', { vehicleInfo: this.props?.route?.params?.vehicleInfo})
           
    }
 

  }).catch(error => {
          this.setState({isloading:false});
          _showErrorMessage(error.message);
    });
       
       
    
 
};
 
  
  componentDidMount = () => {
    this._unsubscribe = this.props.navigation.addListener('focus', () => {
     
    this.getCurrentPosition();

    	_retrieveData('vehicle_plate_number')
            .then((res) => {
              if(res){
                this.setState({
                  vehicle_number: res
                });
              }
            });

            _retrieveData('vehicle_id')
            .then((res) => {
              if(res){
                this.setState({
                  vehicle_id: res
                });
              }
            });
     _retrieveData('user_avtar').then((res) => {
          if(res != null){
            this.setState({user_avtar:res});
          }
      });

      getUser()
          .then((res) => {
            this.setState({
              driverName: res.first_name+' '+res.last_name,
              date: res.date,
            });
        });

        });
      
  };

    componentWillUnmount() {
      this._unsubscribe();
  }


Signature = () => {
  this.setState({
    showSign:true
  })
}

handleSignature = signature => {
this.setState({
  signImg:signature,
  showSign:false,
});
}

clearSignature = () => {
this.setState({
  showSign:false,
});
}


  


  render() {

    const {
      showTab,
      date
    } = this.state;

    return (
      <Container padder>
         
            <CustomHeader {...this.props} url={this.state.user_avtar} />
            
             {this.state.showSign ? (
      <Signature
          onOK={this.handleSignature}
          onEmpty={() => console.log("empty")}
          onClear={this.clearSignature}
          descriptionText="Driver Sign"
          clearText="Close"
          confirmText="Save"
          webStyle={`.m-signature-pad--footer
            .button {
              background-color: #00c2f3;
              color: #FFF;
            }`
          }
          autoClear={true}
          imageType={"image/png"}
        />
        ) : null}
             {!this.state.showSign ? (<Content padder>
            <View style={{height: 20}}></View>
            
            <View style={{flexDirection: 'row',justifyContent: 'space-between',alignItems:'center'}}>
                <TouchableOpacity onPress={() => this.setState({ showTab: 1 })} style={{ borderRadius: 5,width:'33%',height:25,backgroundColor: showTab == 1?'#054b8b':'#00c2f3',justifyContent: "center" }}><Text style={{textAlign:'center',color: '#fff'}}>AGREEMENT 1</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => this.setState({ showTab: 2 })} style={{ borderRadius: 5,width:'33%',height:25,backgroundColor: showTab == 2?'#054b8b':'#00c2f3',justifyContent: "center" }}><Text style={{textAlign:'center',color: '#fff'}}>AGREEMENT 2</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => this.setState({ showTab: 3 })} style={{ borderRadius: 5,width:'33%',height:25,backgroundColor: showTab == 3?'#054b8b':'#00c2f3', justifyContent: "center"}}><Text style={{textAlign:'center',color: '#fff'}}>AGREEMENT 3</Text></TouchableOpacity>
                
            </View>


            {showTab == 1 && !this.state.showSign ? (<View>
              <View style={{textAlign:'center',marginTop:10}}>
            <Text style={{textAlign:'center',fontSize:14,fontWeight:'bold'}}>Authorization For Voluntary Payroll Deduction</Text>
            <Text style={{fontSize:15,textAlign:'center',fontWeight:'200'}}>{"All employees operating a company owned vehicle agree to operate the vehicle accordingto the following guidelines. Failure to adhere to these guidelines may result in revocation ofan employee's privilege to operate company vehicles or termination under somecircumstances."}</Text>
            </View>
            <View style={{flex:1,marginTop:10}}>
              <View style={{flexDirection: 'row'}}><Text>1</Text><Text> {".Employee must maintain a proper and current driver's license for the type of company vehicle that they are operating and notify management immediately if they no longer have a valid license."} </Text>
              </View>
              <View style={{flexDirection: 'row'}}><Text style={{marginTop:3}}>2</Text><Text style={{marginTop:3}}>{".Employee must conduct an inspection of vehicle at the start of the shift."}</Text>
              </View>
              <View style={{flexDirection: 'row'}}><Text style={{marginTop:3}}>3</Text><Text style={{marginTop:3}}>{".Employee will notify the company of any citations received while operating a company vehicle."}</Text>
              </View>
              <View style={{flexDirection: 'row'}}><Text style={{marginTop:3}}>4</Text><Text style={{marginTop:3}}>{".Employee must follow generally accepted safe driving practices and obey traffic regulations."}</Text>
              </View>
              <View style={{flexDirection: 'row'}}><Text style={{marginTop:3}}>5</Text><Text style={{marginTop:3}}>{".Employee are responsible to lock vehicles"}</Text>
              </View>
              <View style={{flexDirection: 'row'}}><Text style={{marginTop:3}}>6</Text><Text style={{marginTop:3}}>{".Employee are not allowed to smoke in any company vehicle."}</Text>
              </View>
              <View style={{flexDirection: 'row'}}><Text style={{marginTop:3}}>7</Text><Text style={{marginTop:3}}>{".Employee are financially responsible for the specific parking ticket (fire hydrant, fireroute, handicap parking) or traffic violations while operating a company owned vehicles"}</Text>
              </View>
              <View style={{flexDirection: 'row'}}><Text style={{marginTop:3}}>8</Text><Text style={{marginTop:3}}>{".Employee must report all accident within 12 hours of the occurrence to their supervisor/manager."}</Text>
              </View>
              <View style={{flexDirection: 'row'}}><Text style={{marginTop:3}}>9</Text><Text style={{marginTop:3}}>{".Employee will be held responsible to pay any deductible in the event an accident is deemed avoidable at fault"}</Text>
              </View>
              <View style={{flexDirection: 'row'}}><Text style={{marginTop:3}}>10</Text><Text style={{marginTop:3}}>{".Employee will be held responsible for refueling the vehicle at the end of his/her shift."}</Text>
              </View>
              <View style={{flexDirection: 'row'}}><Text style={{marginTop:3}}>11</Text><Text style={{marginTop:3}}>{".Notify supervisor/manager scheduled maintenance."}</Text>
              </View>
              <View style={{flexDirection: 'row'}}><Text style={{marginTop:3}}>12</Text><Text style={{marginTop:3}}>{".No non-employees can operate vehicles."}</Text>
              </View>
              <View style={{flexDirection: 'row'}}><Text style={{marginTop:3}}>13</Text><Text style={{marginTop:3}}>{".Employee must remove all garbage at the end of the shift."}</Text>
              </View>
              <View style={{flexDirection: 'row'}}><Text style={{marginTop:3}}>14</Text><Text style={{marginTop:3}}>{".Employee   is responsible for parking vehicles in safe and legal areas off public ways."}</Text>
              </View>
              <View style={{flexDirection: 'row'}}><Text style={{marginTop:3}}>15</Text><Text style={{marginTop:3}}>{".The use of alcohol and controlled substances prior to and during operation of anyvehicle is prohibited."}</Text>
              </View>
            </View>

            
            <View style={{marginTop:10}}>
              <Text style={{fontSize:15,textAlign:'left',justifyContent: "center"}}>{"This authorization may be terminated by the company at any time."}</Text>
            </View>
            <View style={{marginTop:10,padding:0}}>
              <Text style={{fontSize:15,textAlign:'left',justifyContent: "center"}}>{"I have read, understand, and agree to comply with the above conditions authorizing me to drive a company vehicle"}</Text>
            </View>

              <View style={{marginTop:10,flexDirection: 'row',justifyContent: 'space-between'}}>
			 <Text style={{fontSize:14,fontWeight:'bold'}}>Employee:</Text>
			 <TextInput style={{marginLeft:-30,marginTop:(Platform.OS == 'ios') ? -5 : -15,paddingBottom:(Platform.OS == 'ios') ? -20 : -50,width:120, borderBottomWidth: 1,borderBottomColor: 'gray'}}
			value={this.state.driverName} onChangeText={(driverName) => this.setState({ driverName: driverName })} />
			  <Text style={{fontSize:14,fontWeight:'bold'}}>Date: {date}</Text>
			</View>

            

            <View style={{ justifyContent: 'center',alignItems:'center',marginTop:20}}>
            <Button rounded style={{width:100,height:35,backgroundColor: '#00c2f3', justifyContent: 'center', alignSelf:'center'}}
                onPress={() => this.setState({ showTab: 2 })}>
                <Text style={{ textAlign: 'center', color: '#fff', fontSize: 16 }}>Continue</Text>
              </Button>
            </View>
            </View>):null}


            {showTab == 2 && !this.state.showSign ? (<View>
              <View style={{textAlign:'center',marginTop:10}}>
            <Text style={{textAlign:'center',fontSize:14,fontWeight:'bold'}}>Authorization For Voluntary Payroll Deduction </Text>
            </View>


            <View style={{marginTop:10,flexDirection: 'row'}}>
              
           
            <Text style={{fontSize:13}}>I, </Text>
             <TextInput style={{marginTop:(Platform.OS == 'ios') ? -5 : -15,paddingBottom:(Platform.OS == 'ios') ? -20 : -50,width:120, borderBottomWidth: 1,borderBottomColor: 'gray'}}
        value={this.state.driverName} onChangeText={(driverName) => this.setState({ driverName: driverName })}
      /><Text>understand and agree that my</Text>
              
            </View>


            <View style={{flex:1}}>
            <Text style={{alignSelf:'flex-start'}}>employer, TRANS8 may deduct money from my pay from time to time for reasons that fall into the following categories:</Text>
            </View>
            <View style={{flex:1,marginTop:10}}>
              <View style={{flexDirection: 'row'}}><Text>1</Text><Text> .If I receive an overpayment of wages for any reason, repayment to the Company of such
overpayments (the deduction for such a repayment will equal the entire amount of the
overpayment, unless the Company   and I agree in writing to a series of smaller deductions in
specified amounts);. </Text>
              </View>
              <View style={{flexDirection: 'row'}}><Text style={{marginTop:3}}>2. </Text><Text style={{marginTop:3}}> The cost of repairing or replacing any Company supplies, materials, equipment, money, or
other property that I may damage (other than normal wear and tear), lose, fail to return, or take
without appropriate authorization from the Company during my employment (except in the case
of misappropriation of money by me, I understand that no such deduction will take my pay
below minimum wage);</Text>
              </View>
              <View style={{flexDirection: 'row'}}><Text style={{marginTop:3}}>3. </Text><Text style={{marginTop:3}}>If I receive any fines due to driving infractions or violations of the Highway Traffic Act, R.S.O.
1990, c. H.8 or fees accumulated due to the use of toll routes during my workday;</Text>
              </View>
              <View style={{flexDirection: 'row'}}><Text style={{marginTop:3}}>4. </Text><Text style={{marginTop:3}}> Administrative fees in connection with court-ordered garnishments or legally-required wage
attachments of my pay, limited in extent to the amount or amounts allowed under applicable
laws;</Text>
              </View>
              <View style={{flexDirection: 'row'}}><Text style={{marginTop:3}}>5. </Text><Text style={{marginTop:3}}>Installment payments on loans based upon store credit that I use for my own personal
purchases, including the value of merchandise or services that I purchase or have purchased
for personal, non-business reasons using my employee charge account or credit card, an
account or credit card assigned to another employee, or a general company account or credit
card, regardless of whether such purchase was authorized, and if there is a balance remaining
when I leave the Company, the balance of such store credit or charges.</Text>
              </View>
              
            </View>

            
            <View style={{marginTop:10}}>
              <Text style={{fontSize:15,textAlign:'left',justifyContent: "center"}}>I agree that the Company may deduct money from   my pay under the above circumstances. I
further understand that the Company   has stated its intention to abide by all applicable federal
and provincial wage and hour laws and that if I believe that any such law has not been 
followed, I have the right to file a wage claim with appropriate provincial and federal agencies.</Text>
            </View>
          

              <View style={{marginTop:10,flexDirection: 'row',justifyContent: 'space-between'}}>
			 <Text style={{fontSize:14,fontWeight:'bold'}}>Employee:</Text>
			 <TextInput style={{marginLeft:-30,marginTop:(Platform.OS == 'ios') ? -5 : -15,paddingBottom:(Platform.OS == 'ios') ? -20 : -50,width:120, borderBottomWidth: 1,borderBottomColor: 'gray'}}
			value={this.state.driverName} onChangeText={(driverName) => this.setState({ driverName: driverName })} />
			  <Text style={{fontSize:14,fontWeight:'bold'}}>Date: {date}</Text>
			</View>


            <View style={{ justifyContent: 'center',alignItems:'center',marginTop:20}}>
            <Button rounded style={{width:100,height:35,backgroundColor: '#00c2f3', justifyContent: 'center', alignSelf:'center'}}
                onPress={() => this.setState({ showTab: 3 })}>
                <Text style={{ textAlign: 'center', color: '#fff', fontSize: 16 }}>Continue</Text>
              </Button>
            </View>
            </View>):null}
            
            {showTab == 3 && !this.state.showSign ? (<View>
            <View style={{textAlign:'center',marginTop:10}}>
            <Text style={{textAlign:'center',fontSize:14,fontWeight:'bold'}}>AUTHORIZATION & CONSENT FOR SHARED INFORMATION </Text>
            </View>


            

            
            <View style={{marginTop:10}}>
              <Text style={{fontSize:15,textAlign:'left',justifyContent: "center"}}>I authorize and give full permission to Trans8 to share with its partners, ("TRANS8") the
results of drug and alcohol tests, compensation information, performance review or documents,
information regarding disciplinary actions, personally identifiable payroll data, financial account
numbers, and any other information that partner may request from the Company in connection
with partner's right to audit Company records. Any confidential and/or private information about
you provided to TRANS8 partner will be kept confidential by TRANS8, and access to your information will be limited to those with a business need to know. I acknowledge that my signing of this authorization and consent form is a voluntary act on my part and that I have not been concerned into signing this document by anyone.</Text>
            </View>
          

             <View style={{marginTop:10,flexDirection: 'row',justifyContent: 'space-between'}}>
			 <Text style={{fontSize:14,fontWeight:'bold'}}>Employee:</Text>
			 <TextInput style={{marginLeft:-30,marginTop:(Platform.OS == 'ios') ? -5 : -15,paddingBottom:(Platform.OS == 'ios') ? -20 : -50,width:120, borderBottomWidth: 1,borderBottomColor: 'gray'}}
			value={this.state.driverName} onChangeText={(driverName) => this.setState({ driverName: driverName })} />
			  <Text style={{fontSize:14,fontWeight:'bold'}}>Date: {date}</Text>
			</View>
        
            <View style={{marginTop:15,flexDirection: 'row'}}>
              <Text style={{fontSize:14,fontWeight:'bold'}}>Signature:</Text>
              {!this.state.signImg ? (<TouchableOpacity onPress={() => this.Signature()}>
                <Text>Click Here To Sign</Text>
              </TouchableOpacity>):null}
              {this.state.signImg ? (
                     <Image
                    resizeMode={"contain"}
                    style={{ marginLeft:-25,width: 200, height: 40 }}
                    source={{ uri: this.state.signImg }}
                  />
                ) : null}
            </View>


            <View style={{ justifyContent: 'center',alignItems:'center',marginTop:20}}>
            <Button rounded style={{width:100,height:35,backgroundColor: '#00c2f3', justifyContent: 'center', alignSelf:'center'}}
                onPress={() => this.saveAgreementData()}>
                <Text style={{ textAlign: 'center', color: '#fff', fontSize: 16 }}>Complete</Text>
              </Button>
            </View>
            </View>):null}

           </Content>):null}
           {this.state.isloading && (
              <Loader />
          )}
      </Container>
    );
  }
}

export default Agrement;