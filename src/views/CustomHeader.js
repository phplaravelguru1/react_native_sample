import React, { useState } from "react";
import { View, Text, Image } from 'react-native';
import { image } from 'assets';

const CustomHeader = (props) => {

  return (
    <View>
    	<View style={{flexDirection: 'row',alignItems:'center', justifyContent: 'space-between',top:10}}>
		  <Image
		    style={{ height: 50, resizeMode: 'contain' }}
		    source={image.logo}
		  />  
		  {props.url != ''? (<Image
		    style={{ height: 70,width: 70,borderRadius: 40}}
		    source={{ uri: props.url }}
		  />):null}
		</View>
    </View>
  );
}


export default CustomHeader;
