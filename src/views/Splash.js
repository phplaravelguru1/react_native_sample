import React, { Component } from 'react';
import { View, Text, Image, SafeAreaView, NetInfo } from 'react-native';
import { image, _retrieveUser,_retrieveData } from 'assets';
import { StackActions } from '@react-navigation/native';

class Splash extends Component {
  constructor(props){
    super(props); 
  }

  componentDidMount () {
  	let tabb = 'Dashboard2';
  	_retrieveData('secreenTab').then((res) => {
  		tabb = res;
  	})

  		_retrieveUser().then((user) => {
	    setTimeout(() => {
	    	if (user !== null) {
	    		const data = JSON.parse(user);

	    		console.log("==tabb");
	    		console.log(tabb);

	    		if(tabb == 'Dashboard') {
	    			this.props.navigation.dispatch(
				  		StackActions.replace('Dashboard')
					);	
	    		} else {
	    			this.props.navigation.dispatch(
				  	StackActions.replace('Dashboard2')
				);
	    		}
				
			} else {
				this.props.navigation.dispatch(
			 		StackActions.replace('Auth')
				);
			}
	    }, 2000);
	});
  }

  componentWillUnmount () {
  	//console.log("will mount");

  }
  render() {
  	return (
      	<SafeAreaView style={{flex: 1}}>
	      	<View style={{ height: '100%' }}>
	      	
	      		<View style={{ backgroundColor: '#f2f2f2', height: '100%', borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}>
	      			<Image
		      			style={{ height: "100%", width:"100%", alignSelf: 'center', position: 'relative', top: '0%' }}
			        	source={image.logog}
			      	/>	
	      		</View>

	      	</View>
	   	</SafeAreaView>
    );
  }
}

export default Splash;
