import React from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';
import Signature from 'react-native-signature-canvas';
 
export const SignScreen = () => {
  const [signature, setSign] = useState(null);
 
  const handleSignature = signature => {
    console.log(signature);
    setSign(signature);
  };
 
  const handleEmpty = () => {
    console.log('Empty');
  }
 
  const style = `.m-signature-pad--footer
    .button {
      background-color: red;
      color: #FFF;
    }`;
  return (
    <View style={{ flex: 1 }}>
      <View style={styles.preview}>
        {this.state.signature ? (
          <Image
            resizeMode={"contain"}
            style={{ width: 335, height: 114 }}
            source={{ uri: this.state.signature }}
          />
        ) : null}
      </View>
      <Signature
          // handle when you click save button
          onOK={(img) => console.log(img)}
          onEmpty={() => console.log("empty")}
          // description text for signature
          descriptionText="Sign"
          // clear button text
          clearText="Clear"
          // save button text
          confirmText="Save"
          // String, webview style for overwrite default style, all style: https://github.com/YanYuanFE/react-native-signature-canvas/blob/master/h5/css/signature-pad.css
          webStyle={`.m-signature-pad--footer
            .button {
              background-color: red;
              color: #FFF;
            }`
          }
          autoClear={true}
          imageType={"image/svg+xml"}
        />
    </View>
  );
}
 
const styles = StyleSheet.create({
  preview: {
    width: 335,
    height: 114,
    backgroundColor: "#F8F8F8",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 15
  },
  previewText: {
    color: "#FFF",
    fontSize: 14,
    height: 40,
    lineHeight: 40,
    paddingLeft: 10,
    paddingRight: 10,
    backgroundColor: "#69B2FF",
    width: 120,
    textAlign: "center",
    marginTop: 10
  }
});