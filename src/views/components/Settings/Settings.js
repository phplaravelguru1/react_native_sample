import React, {Component } from 'react';
import { LogBox,View, Text, Image,StyleSheet,TouchableOpacity,ScrollView,SafeAreaView,TextInput, Platform, Dimensions} from 'react-native';
import { Container,FlatlistContent, Header, Content, Form,Textarea, Item, Input, Label,Button, Toast, Icon, Accordion, Picker } from 'native-base';
import { image, config, _showErrorMessage, _showSuccessMessage, Loader, _storeData,_retrieveData } from 'assets';
import styles from './styles';
import { getData,getUser,updateProfilePic,changePassword } from 'api';
import CustomHeader from '../../CustomHeader';
import Diagnostic from './Diagnostic';
import ImagePicker from 'react-native-image-picker'; 
import {Linking} from 'react-native';
import DeviceInfo from 'react-native-device-info';
class Settings extends Component {
constructor(props) {
    super(props);

    this.state = {
      isloading: false,
      user_avtar:null,
      current_password:null,
      new_password:null,
      confirm_password:null,
      user_avtar:'',
      showPassword:false,
      is_helpline:false,
      is_diagnostic:false,
      yard_address:'5825 Dixie, Mississauga, ON L4W4V7',
      yard_time:'',
      helplineDetails:[],
      app_version:null,
      build_number:null,
      system_name:null,
      mainPage:true
    };
  }

componentDidMount = () => {
      this._unsubscribe = this.props.navigation.addListener('focus', () => {
       this.setState({mainPage:true,is_helpline:false,is_diagnostic:false,isloading:false});
        _retrieveData('user_avtar')
        .then((res) => {
          if(res != null){
            this.setState({user_avtar:res});
          }
        });
        this.getHelplineNumbers();
        this.setState({build_number:DeviceInfo.getBuildNumber(),app_version:DeviceInfo.getVersion(),system_name:DeviceInfo.getSystemName()});
  });
};


componentWillUnmount() {
    this._unsubscribe();
}

getHelplineNumbers () {
  getData('helpline_screen').then((res) => {

    if(res.type == 1) {
      this.setState({
        yard_address:res.data.yard_address,
        helplineDetails:res.data.HelplineDetail,
        yard_time:res.data.yard_time
      })
    }

  });
}

showList () {
  return (
    <View>
            {this.state.helplineDetails.map((res, i) => {
            return (
              <View>
              <View style={{height:8}}></View>
              <TouchableOpacity onPress={() => this.doCall(res.person_number)} style={{alignItems:'center',backgroundColor:'#cbf2fc',padding:10,borderWidth:1,borderRadius:6,justifyContent: 'space-between',flexDirection:'row',paddingTop:8}}>
          <View>
          <Text style={{fontSize:14,fontWeight:'bold'}}>{res.person_name?res.person_name+',':''} {res.designation}</Text>
          <Text style={{fontSize:14,fontWeight:'bold'}}>{res.person_number}</Text>
          </View><Icon  type="FontAwesome" name='phone-square' style={{ color: '#00c2f3'}} onPress={() => this.doCall(res.person_number)}/>
          </TouchableOpacity>
          </View>
              );
          })
        }
    </View>
    )
}

  doCall(phn){
  Linking.openURL(`tel:${phn}`)
}

   saveData = (uri) => {
    const formdata = new FormData();
        const _this = this;
          if(uri) {
            let filename = uri.substring(uri.lastIndexOf('/') + 1, uri.length)
            let image = {
              uri:  uri,
              name: filename,
              type: "image/png",
            };
          formdata.append('profile_pic', image);
          } else {
              _showErrorMessage('Profile image is required');
              return false;
          }
         this.setState({
          isloading: true,
        });


      updateProfilePic(formdata)
      .then((res) => {
        this.setState({
          isloading: false,
        });

        if(res.type == 1) {
          _storeData('user_avtar',res.data.latest_image_path).then();
           _showSuccessMessage(res.message);
        } else {
          _showErrorMessage(res.message);
        }
         
      });
  };



  changePassword = () => {
      let current_password = this.state.current_password;
      let new_password = this.state.new_password;
      let confirm_password = this.state.confirm_password;

      const _this = this;
      var postdata = { current_password:current_password, password:new_password,password_confirmation:confirm_password};

      if(current_password == '' || current_password == null){
        _showErrorMessage('Current password field is requried');
        return false;
      }

      if(new_password == '' || new_password == null){
        _showErrorMessage('New password field is requried');
        return false;
      }

      if(confirm_password == '' || confirm_password == null){
        _showErrorMessage('Confirm password field is requried');
        return false;
      }
     

      console.log(postdata);
      this.setState({ isloading: true });

      changePassword(postdata).then((res) => {
        console.log(res);
          if(res.type == 1) {
              this.setState({ current_password:null, new_password:null,confirm_password:null,isloading: false });
              _showSuccessMessage(res.message);
        } else {
          this.setState({ isloading: false });
          _showErrorMessage(res.message);
        }
    }).catch(function (error) {
      this.setState({ isloading: false });
      _showErrorMessage(error.message);
    });
    };

     takePhoto = () => {
        const options = {
          title: 'PROFILE PHOTO',
          mediaType: 'photo',
          maxWidth:300,
          maxHeight:300
        };
          ImagePicker.showImagePicker(options, response => {
            if (response.uri) {
              this.setState({ user_avtar: response.uri});
              this.saveData(response.uri);
            }
          });
   }


   helplineScreen() {
    this.getHelplineNumbers();
    this.setState({is_helpline:true,is_diagnostic:false,mainPage:false});
   }

   onLoder = () => {
    this.setState({ isloading: true });
   }

   offLoder = () => {
    this.setState({ isloading: false });
   }

   backPage = () => {
    this.setState({is_helpline:false,is_diagnostic:false,mainPage:true});
   }

   showDiagnostic() {
    this.setState({is_helpline:false,is_diagnostic:true,mainPage:false});
   }

   refreshHelplineScreen() {
    this.getHelplineNumbers();
   }

   refreshPage() {
    this.props.navigation.push('Settings');
   }



  render() {
     const {
     backSection,
     backButton,
     backIcon,
     spaceDivider
    } = styles;

    const {
      yard_address,
      yard_time,
      build_number,
      app_version,
      system_name
    } = this.state;

     
    return (
      <SafeAreaView style={{flex: 1}}>
        <Container>
        <CustomHeader {...this.props} url={this.state.user_avtar} />
        <Content>
          {this.state.is_diagnostic && <Diagnostic backPage={this.backPage} onLoder={this.onLoder} offLoder={this.offLoder} />}
          {this.state.mainPage?(<View>
          <View style={{borderColor: '#00c2f3',borderWidth: 1, top:10}}></View>
          <View style={spaceDivider}></View>
          <View style={{ flexDirection: 'row', justifyContent: 'center', alignContent:'center', marginLeft: 10 }}>
              <Image style={{ height: 80,width:80, borderRadius: 40 }} source={{ uri: this.state.user_avtar }}/>
          </View>
          <View style={{ flex:1, padding:10}}>
              <Button rounded style={{width:'40%', backgroundColor: '#00c2f3', justifyContent: 'center',alignItems: 'center',alignSelf: 'center'}}
                onPress={() => this.takePhoto()}>
                <Text style={{ textAlign: 'center', color: '#FFFFFF', fontSize: 14}}>Update Profile Pic</Text>
              </Button>
          </View>

          
          <View style={{alignSelf:'center',marginTop:6,borderColor:'#00c2f3',borderWidth:1,width:'85%'}}></View>
          <View style={{ flex:1, padding:10,flexDirection:'row',justifyContent:'center'}}>
           <Text style={{fontWeight:'bold',fontSize:18,color:'#054b8b'}}>App Version {app_version+' ('+build_number+') '+system_name}</Text> 
           </View>
           <View style={{ flex:1, padding:10,flexDirection:'row',justifyContent:'space-between'}}>

           <Button style={{borderRadius:6,width:'48%', backgroundColor: '#00c2f3', justifyContent: 'center',alignItems: 'center',alignSelf: 'center'}}
                onPress={() => this.helplineScreen()}>
                <Text style={{ textAlign: 'center', color: '#FFFFFF', fontSize: 18, fontWeight:'bold'}}>HELPLINE</Text>
              </Button>

              <Button style={{borderRadius:6,width:'48%', backgroundColor: '#00c2f3', justifyContent: 'center',alignItems: 'center',alignSelf: 'center'}}
                onPress={() => this.showDiagnostic()}>
                <Text style={{ textAlign: 'center', color: '#FFFFFF', fontSize: 18,fontWeight:'bold'}}>DIAGNOSTIC</Text>
              </Button>
          </View>
          { (!this.state.showPassword) && <Button style={{borderRadius:6,width:'48%', backgroundColor: '#00c2f3', justifyContent: 'center',alignItems: 'center',alignSelf: 'center'}}
                onPress={() => this.setState({showPassword:true})}>
                <Text style={{ textAlign: 'center', color: '#FFFFFF', fontSize: 16,fontWeight:'bold'}}>CHANGE PASSWORD</Text>
              </Button> }
          { (this.state.showPassword) &&
            <View>
            <Form>
              <Item stackedLabel last>
                <Label style={{ fontWeight: 'bold' }}>Current Password</Label>
                <Item style={{ borderBottomColor: '#00c2f3'}}>
                  <Icon type="FontAwesome" name='lock' style={{ color: '#00c2f3'}} />
                  <Input onChangeText={(password) => this.setState({ current_password: password })} secureTextEntry={true} placeholder="....."/>
                </Item>
              </Item>

              <Item stackedLabel last>
                <Label style={{ fontWeight: 'bold' }}>New Password</Label>
                <Item style={{ borderBottomColor: '#00c2f3'}}>
                  <Icon type="FontAwesome" name='lock' style={{ color: '#00c2f3'}} />
                  <Input onChangeText={(password) => this.setState({ new_password: password })} secureTextEntry={true} placeholder="....."/>
                </Item>
              </Item>

              <Item stackedLabel last>
                <Label style={{ fontWeight: 'bold' }}>Confirm Password</Label>
                <Item style={{ borderBottomColor: '#00c2f3'}}>
                  <Icon type="FontAwesome" name='lock' style={{ color: '#00c2f3'}} />
                  <Input onChangeText={(password) => this.setState({ confirm_password: password })} secureTextEntry={true} placeholder="....."/>
                </Item>
              </Item>
            </Form>
            <View style={{ flexDirection: 'row', height:'10%', marginTop: 15, marginLeft: 20, marginRight: 20}}>
              <Button 
                    style={{ height: 50, width:'45%',marginTop: 20, backgroundColor: '#00c2f3', justifyContent: 'center', borderRadius: 5}}
                    onPress={() => this.changePassword()}
                  >
                    <Text style={{ textAlign: 'center', color: '#fff', fontSize: 22 }}>Submit</Text>
                  </Button>
                  <Button 
                    style={{  height: 50, width:'45%', marginLeft: 35,borderColor: '#00c2f3', borderWidth: 1, marginTop: 20, backgroundColor: 'white', justifyContent: 'center', borderRadius: 5}}
                    onPress={() => this.setState({ showPassword: false })}
                  >
                    <Text style={{ textAlign: 'center', color: 'black', fontSize: 22 }}>Cancel</Text>
                  </Button>
              </View>
            
            </View> }
            <View style={spaceDivider}></View>
            </View>): null}
      {this.state.is_helpline?(
              <View style={{paddingLeft:5,paddingRight:5}}>
              <View style={backSection}>
              <TouchableOpacity style={[backButton,{alignItems:'center'}]} onPress={() => this.backPage()}>
                <Icon type="FontAwesome" name='angle-left' style={backIcon}/>
                <Text style={{color:"#fff",fontWeight:'bold',marginTop:(Platform.OS == 'ios') ? 5 : 0, fontSize: 18,padding:10,textAlign:'center',right:5,alignItems:'center'}}>HELPLINE SECTION</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => this.refreshHelplineScreen()}>
            <Icon style={{color:'#fff',marginRight:20,fontWeight:200}} name='sync' />
          </TouchableOpacity>
          </View>
            
          <View style={{marginTop:10, borderColor: '#00c2f3', borderWidth: 1,borderRadius:6}}>
              <View style={{height:10}}></View>
              <View style={{flexDirection: 'row',justifyContent: 'space-between',paddingLeft:5,paddingRight:5}}>
                <Text style={{fontSize: 14,fontWeight:'bold'}}>YARD ADDRESS:</Text>
                
                <Text style={{fontSize: 14,flex: 1,fontWeight:'bold', flexWrap: 'wrap',textAlign:'right'}}>{yard_address}</Text>
              </View>
              <View style={{height:4}}></View>
              <View style={{flexDirection: 'row',justifyContent: 'space-between',paddingLeft:5,paddingRight:5}}>
                <Text style={{fontSize: 14,fontWeight:'bold'}}>YARD START TIME:</Text>
                <Text style={{fontSize: 14,fontWeight:'bold',flex: 1, flexWrap: 'wrap',alignSelf:'center',textAlign:'right'}}>{yard_time}</Text>
              </View>
              <View style={{height:4}}></View>
          </View>

           <View style={{height:4}}></View>
          <View>
          <Text style={{textAlign:'center',fontSize:16,fontWeight:'bold',color:'#054b8b'}}>HELPLINE NUMBERS</Text>
          </View>
          <View style={{alignSelf:'center',marginTop:6,borderColor:'#00c2f3',borderWidth:1,width:'85%'}}></View>

          {this.showList()}

          </View>):null
              }
            
          </Content>
           {this.state.isloading && (
              <Loader />
          )}
          </Container>
          </SafeAreaView>
       
    );
  }
}

export default Settings;
