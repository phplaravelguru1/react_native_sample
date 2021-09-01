import React , { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, Image, Alert,Platform } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Login,OfflineInspection,QrCode,OfflineEndInspection,WelcomeOffline, Splash, ForgotPassword, Home, Delivery, Load,LoadMain, Settings,Vehicle,LeftInWareHouse,HelperInformation, VehicleScan,Company,Inspection,ProductScan,ScanParcel,Route,CreateRoute,CustomerDetail, HomeMain, ParcelDetail,NotDelivered,EndInspection,AddStop,Pickup,PickupList,PickupRtw,EndDayReport,RetailDrop,SignUp,Settlement,Correction,Rtw,StartDayReport,Agrement,DriverKitEnd,DriverKitStart,PackageNumbering,Map,Direction,Rescue,OfflineUserStartDay,OfflineUserEndDay,OfflineUserReport,Welcome,OfflineHomeMain,AddMapStop,EditMapStop,OfflineVehicle,DriverKitEndOffline,DriverKitStartOffline,CenterPointRouteMap } from './components';
import { image, _removeUser,_retrieveData } from 'assets';
import { getData,getUser,saveRouteInfo,saveLocation } from 'api';
import { StackActions } from '@react-navigation/native';
import { logout } from 'api';
import DeviceInfo from 'react-native-device-info';

const AuthStack = createStackNavigator();

function AuthScreens() {
  return (
    <AuthStack.Navigator headerMode="None" initialRouteName="Login" >
      <AuthStack.Screen name="Splash" component={Splash} />
      <AuthStack.Screen name="Login" component={Login} />
      <AuthStack.Screen name="ForgotPassword" component={ForgotPassword} />
      <AuthStack.Screen name="SignUp" component={SignUp} />
    </AuthStack.Navigator>
  ); 
}

const HomStack = createStackNavigator();

function HomeScreens() {
  return (
    <HomStack.Navigator headerMode="None" initialRouteName="Home" >
      <HomStack.Screen name="Home" component={Home} />
      <HomStack.Screen name="HomeMain" component={HomeMain} />
      <HomStack.Screen name="VehicleScan" component={VehicleScan} />
      <HomStack.Screen name="ProductScan" component={ProductScan} />
      <HomStack.Screen name="Inspection" component={Inspection} />
      <HomStack.Screen name="CenterPointRouteMap" component={CenterPointRouteMap} />
      <HomStack.Screen name="HelperInformation" component={HelperInformation} />
      <HomStack.Screen name="Company" component={Company} />
      <HomStack.Screen name="Agrement" component={Agrement} />
      <HomStack.Screen name="DriverKitStart" component={DriverKitStart} />
      <HomStack.Screen name="OfflineUserStartDay" component={OfflineUserStartDay} />
      <HomStack.Screen name="OfflineUserEndDay" component={OfflineUserEndDay} />
      <HomStack.Screen name="OfflineUserReport" component={OfflineUserReport} />
      <HomStack.Screen name="Welcome" component={Welcome} />
      <HomStack.Screen name="OfflineHomeMain" component={OfflineHomeMain} />
      <HomStack.Screen name="OfflineVehicle" component={OfflineVehicle} />
      <HomStack.Screen name="OfflineInspection" component={OfflineInspection} />
      <HomStack.Screen name="OfflineEndInspection" component={OfflineEndInspection} />
      <HomStack.Screen name="DriverKitStartOffline" component={DriverKitStartOffline} />
      <HomStack.Screen name="DriverKitEndOffline" component={DriverKitEndOffline} />
      <HomStack.Screen name="WelcomeOffline" component={WelcomeOffline} />
      <HomStack.Screen name="QrCode" component={QrCode} />
    </HomStack.Navigator>
  );
}

function DeliveryScreens() { 
  return (
    <HomStack.Navigator headerMode="None" initialRouteName="Delivery" >
      <HomStack.Screen name="Delivery" component={Delivery} />
      <HomStack.Screen name="CustomerDetail" component={CustomerDetail} />
      <HomStack.Screen name="ParcelDetail" component={ParcelDetail} />
      <HomStack.Screen name="NotDelivered" component={NotDelivered} />
      <HomStack.Screen name="EndInspection" component={EndInspection} />
      <HomStack.Screen name="AddStop" component={AddStop} />
      <HomStack.Screen name="Pickup" component={Pickup} />
      <HomStack.Screen name="PickupList" component={PickupList} />
      <HomStack.Screen name="PickupRtw" component={PickupRtw} />
      <HomStack.Screen name="EndDayReport" component={EndDayReport} />
      <HomStack.Screen name="RetailDrop" component={RetailDrop} />
      <HomStack.Screen name="Settlement" component={Settlement} />
      <HomStack.Screen name="Correction" component={Correction} />
      <HomStack.Screen name="Rtw" component={Rtw} />
      <HomStack.Screen name="DriverKitEnd" component={DriverKitEnd} />  
      <HomStack.Screen name="REMAP" component={Map} />   
    </HomStack.Navigator>
  );
}


const LoadStack = createStackNavigator();

function LoadScreens() {
  return (
    <LoadStack.Navigator headerMode="None" initialRouteName="LOAD" >
      <LoadStack.Screen name="LOAD" component={Load} />
      <LoadStack.Screen name="LoadMain" component={LoadMain} />
      <LoadStack.Screen name="ScanParcel" component={ScanParcel} />
      <LoadStack.Screen name="Route" component={Route} />
      <LoadStack.Screen name="CreateRoute" component={CreateRoute} />
      <LoadStack.Screen name="LeftInWareHouse" component={LeftInWareHouse} />
      <LoadStack.Screen name="StartDayReport" component={StartDayReport} />      
      <LoadStack.Screen name="PickupList" component={PickupList} />      
      <LoadStack.Screen name="Pickup" component={Pickup} />      
      <LoadStack.Screen name="PackageNumbering" component={PackageNumbering} />      
      <LoadStack.Screen name="Rescue" component={Rescue} /> 
      <LoadStack.Screen name="REMAP" component={Map} />
    </LoadStack.Navigator> 
  );
}

const DashboardStack = createBottomTabNavigator();

function DashboardScreens() { 
const [tab, setTab] = useState(1);
 
_retrieveData('is_route_created').then((res) => {
  console.log(res)
  if(res == 'yes'){
    setTab((c) => {
      return 1;
    });  
  }
  else{
    setTab((c) => {
      return 2;
    });
  } 

console.log(tab)
})


  
  return (
    <DashboardStack.Navigator tabBar={props => <MyTabBar {...props} />} headerMode="None" initialRouteName="LOAD" >
      {tab == 2 ? (<DashboardStack.Screen name="HOME" component={HomeScreens} />) : <DashboardStack.Screen name="SETTINGS" component={Settings} />}
      <LoadStack.Screen name="LOAD" component={LoadScreens} />
      {tab == 1 ? (<DashboardStack.Screen name="DELIVERY" component={DeliveryScreens} />) : null}
      {tab == 1 ? (
      <DashboardStack.Screen name="MAP" component={Map} />) : <DashboardStack.Screen name="SETTINGS" component={Settings} />}
      <DashboardStack.Screen name="AddMapStop" component={AddMapStop} />     
      <DashboardStack.Screen name="EditMapStop" component={EditMapStop} /> 
      <AuthStack.Screen name="LOGOFF" component={Login} />
    </DashboardStack.Navigator>
  );
}

const DashboardStack2 = createBottomTabNavigator();

function DashboardScreens2() {
  return (
    <DashboardStack2.Navigator tabBar={props => <MyTabBar {...props} />} headerMode="None" initialRouteName="HOME" >
      <DashboardStack2.Screen name="HOME" component={HomeScreens} />
      <DashboardStack2.Screen name="SETTINGS" component={Settings} />
      <AuthStack.Screen name="LOGOFF" component={Login} />
    </DashboardStack2.Navigator>
  );
}

function MyTabBar({ state, descriptors, navigation }) {
  const focusedOptions = descriptors[state.routes[state.index].key].options;
  if (focusedOptions.tabBarVisible === false) {
    return null;
  }



  return (
    <SafeAreaView>
      <View style={{ height:62, backgroundColor: '#00c2f3' }}>
        <View style={{ flexDirection: 'row' }}>
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const label =
              options.tabBarLabel !== undefined
                ? options.tabBarLabel
                : options.title !== undefined
                ? options.title
                : route.name;
            const inactiveIcon = label.replace(" ", "_").toLowerCase();
            const activeIcon = inactiveIcon+"_white".toLowerCase();
            const activeImage = (typeof image[activeIcon] != "undefined")?image[activeIcon]:"";
            const inactiveImage = (typeof image[inactiveIcon] != "undefined")?image[inactiveIcon]:"";

            const isFocused = state.index === index;
            const onPress = () => {
              console.log("__Test__Onpress");
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                if(route.name == "LOGOFF") {
                     Alert.alert(
                      "Logout",
                      "Do you really want to log out?",
                      [
                        { 
                          text: "Cancel",
                          onPress: () => console.log("Cancel Pressed"),
                          style: "cancel"
                        },
                        { text: "Yes", onPress: () => {
                              //logout and return
                              let mac = '';
                              if(Platform.OS == 'ios') {
                                mac = DeviceInfo.getUniqueId();
                                logout(mac).then((res) => {
                                  if(res.status == 1){
                                    _removeUser().then((user) => {
                                      navigation.dispatch(
                                        StackActions.replace('Auth')
                                      );
                                    });
                                  }
                                  else{
                                    alert(res.message);
                                  }
                                  }).catch(error => {
                                          console.log(error);
                                    });
                              } else {
                                DeviceInfo.getMacAddress().then((macaddress) => {
                                logout(macaddress).then((res) => {
                                  if(res.status == 1){
                                    _removeUser().then((user) => {
                                      navigation.dispatch(
                                        StackActions.replace('Auth')
                                      );
                                    });
                                  }
                                  else{
                                    alert(res.message);
                                  }
                                  }).catch(error => {
                                          console.log(error);
                                    });
                              });
                              }
                            
                               
                            } 
                        }
                      ],
                      { cancelable: false }
                    );
                  
                } else {
                  navigation.navigate(route.name);
                }
              }
            };

            const onLongPress = () => {
              navigation.emit({
                type: 'tabLongPress',
                target: route.key,
              });
            };
            if(route.name == "HOME" || route.name == "LOAD" || route.name == "DELIVERY" || route.name == "MAP" || route.name == "SETTINGS" || route.name == "LOGOFF") {
              
            return (
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={options.tabBarAccessibilityLabel}
                testID={options.tabBarTestID}
                key={route.key}
                onPress={onPress}
                onLongPress={onLongPress}
                style={{ flex: 1, backgroundColor: isFocused ? '#054b8b': '#00c2f3', height:62, paddingTop: 5, paddingBottom: 5 }}
              >
                <View style={{alignSelf:'center'}} >
                  <Image source={isFocused ? activeImage : activeImage} resizeMode='contain' style={{transform: [{ scale: 0.80 }] }} />
                </View>
                <Text style={{ color: isFocused ? '#fff' : '#fff', textAlign: 'center', fontWeight: "400" }}>
                  { label == "LOGOFF" ? "LOG OFF": label }
                </Text>
              </TouchableOpacity>
            );
            }
            else {
              return null;
            }
          })}
        </View>
      </View>
    </SafeAreaView>
  );
}



const AppStack = createStackNavigator();

function AppScreens() {
  return (
    <AppStack.Navigator 
      screenOptions={{
      headerShown: false
    }}
    >
      <AppStack.Screen name="Splash" component={Splash} />
      <AppStack.Screen name="Auth" component={AuthScreens} />
      <AppStack.Screen name="Dashboard2" component={DashboardScreens2} />
      <AppStack.Screen name="Dashboard" component={DashboardScreens} />
    </AppStack.Navigator>
  );
}

export default AppScreens;