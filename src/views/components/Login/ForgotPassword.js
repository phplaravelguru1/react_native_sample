import React, { Component } from 'react';
import { View, Text, Image, SafeAreaView } from 'react-native';
import { Container, Header, Content, Form, Item, Input, Label,Button, Toast, Icon } from 'native-base';
import { image, config, _showErrorMessage, _showSuccessMessage, Loader, _storeUser } from 'assets';
import { forgotPasswordApi } from 'api';
class ForgotPassword extends Component {
constructor(props){
  super(props); 
    this.state = {
      email: "",
      isloading: false,
    } 
  }

    submit = () => {
    
    const email = this.state.email;
    var error = false;
    var msg = '';
    var _this = this;
    if(email.trim() == '')
    {
      msg += 'Please enter username.\n';
      var error = true;
    }
    if(!error) {
      //check email valid
      let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      if (reg.test(email) === false) {
        msg += 'Please enter valid email.';
        var error = true;
      }
    }

    if(error)
    {
      _showErrorMessage(msg);       
    } else {
        this.setState({
          isloading: true,
        });
        var _this = this;
       
        var postdata = { email: email };

        forgotPasswordApi(postdata).then((res) => {
          this.setState({
            isloading: false,
          });
          if(res.type == 1) {
            _showSuccessMessage(res.message);
          } else {
            _showErrorMessage(res.message);
          }
        });      

      
    }
  }

  render() {
    return (
      <SafeAreaView style={{flex: 1}}>
          <View style={{ height: '100%' }}>
            <View style={{ backgroundColor: '#00c2f3', borderBottomLeftRadius: 80, borderBottomRightRadius: 80 }}>
              <Image
                style={{ height: 100, width: 200, resizeMode: 'contain', alignSelf: 'center', position: 'relative', top: '85%' }}
                source={image.logo}
              />  
            </View>
            <View style={{ height: '50%', width: '95%'}}>
              <Content style={{ marginTop: 50, padding: 10, flex: 1}}>
                <Form>
                  <Item stackedLabel>
                    <Label style={{ fontWeight: 'bold' }}>Email</Label>
                    <Item style={{ borderBottomColor: '#00c2f3'}}>
                      <Icon type="FontAwesome" name='user' style={{ color: '#00c2f3'}}/>
                      <Input placeholder="Enter your email" onChangeText={(email) => this.setState({ email: email })}/>
                    </Item>
                  </Item>
                </Form>
                <Button 
                    style={{ width: 300, height: 60, marginLeft: 25, marginRight: 20, marginTop: 20, backgroundColor: '#00c2f3', alignSelf:'center', justifyContent: 'center', borderRadius: 5}}
                    onPress={() =>
                        this.submit()
                      }
                  >
                    <Text style={{ textAlign: 'center', color: '#fff', fontSize: 22 }}>SUBMIT</Text>
                  </Button>
                <Button 
                    style={{ width: 300 , height: 60, marginLeft: 25, marginRight: 20, marginTop: 20, backgroundColor: '#00c2f3', alignSelf: 'center', justifyContent: 'center', borderRadius: 5}}
                    onPress={() =>
                        this.props.navigation.replace('Login')
                      }
                  >
                    <Text style={{ textAlign: 'center', color: '#fff', fontSize: 22 }}>CANCEL</Text>
                  </Button>
              </Content>
            </View>
          </View>
          {this.state.isloading && (
              <Loader />
          )}
      </SafeAreaView>
    );
  }
}

export default ForgotPassword;
