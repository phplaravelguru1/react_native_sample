import {_retrieveUser, _retrieveUserToken, _storeUser, _removeUser, _showErrorMessage, _showSuccessMessage } from '../assets/config/helper';
import { image, config } from 'assets';
import DeviceInfo from 'react-native-device-info';
import { StackActions } from '@react-navigation/native';

const fetchWithAuth = async (url, options = {}) => {
_retrieveUser().then((user) => {
    var user = JSON.parse(user);
    var token = user.userInfo.token;
    return fetch(url, {
      ...options,
      headers: {
        'Authorization': 'Bearer '+token,
      },
    });
  });
};

/*******************************************************************/
/* Get schedule info in home screen     */
/*******************************************************************/
export async function requestByTarget(target) {
 return _retrieveUser().then((user) => {
    var user = JSON.parse(user);
    var token = user.userInfo.token;
    return fetch('http://dev01.trans8.ca/api/schedule',{
          method: 'POST',
          headers: {
            'Authorization': 'Bearer '+token,        
          },    
        })
        .then((res) => res.json())
    });
          
}


/*******************************************************************/
/* Save Vehicle Inspection after barcode scan screen     */
/*******************************************************************/

export async function saveVehicleInspection(formdata) {

return _retrieveUser().then((user) => {
    var user = JSON.parse(user);
    var token = user.userInfo.token;
    return fetch(config.API_URL+'vehicle_inspection',{
                      method: 'POST',
                      headers: {
                          'Authorization': 'Bearer ' + token,
                          'Accept': 'application/json',
                          'Content-Type': 'multipart/form-data'
                      },
                      body: formdata
                    })
                    .then((res) => res.json())

           });


}

/*******************************************************************/
/* Get Vehicle information in Home vehicle barcode scan screen     */
/*******************************************************************/

export async function getVehicleInfo(data) {
  return _retrieveUserToken().then((token) => {
    return fetch(config.API_URL+'scan_vehicle_qr_code',{
                      method: 'POST',
                      headers: {
                          'Authorization': 'Bearer ' + token,
                          'Accept': 'application/json',
                          'Content-Type': 'application/json'
                      },
                      body:  JSON. stringify({vehicle_qr_code: data.barcode})
                    }).then((res) => res.json())
  });
}



/*******************************************************************/
/* Submit Vehicle detail in Home vehicle after barcode scan        */
/*******************************************************************/

export async function submitVehicleBarcode(data) {
  return _retrieveUserToken().then((token) => {
    return fetch(config.API_URL+'save_vehicle_qr_code',{
                      method: 'POST',
                      headers: {
                          'Authorization': 'Bearer ' + token,
                          'Accept': 'application/json',
                          'Content-Type': 'application/json'
                      },
                      body:  JSON.stringify(data)
                    }).then((res) => res.json())
  });
}


/*******************************************************************/
/* Get Login user info       */
/*******************************************************************/

export async function getUser() {
 return _retrieveUser().then((user) => {
    var user = JSON.parse(user);
    return user.userInfo;
    });
}


/*******************************************************************/
/* Submit driver location before barcode scan        */
/*******************************************************************/

export async function saveLocation(data) {
  var timeout = 9000;
  return _retrieveUserToken().then((token) => {
     return Promise.race([
        fetch(config.API_URL+'gps_device_location',{
                      method: 'POST',
                      headers: {
                          'Authorization': 'Bearer ' + token,
                          'Accept': 'application/json',
                          'Content-Type': 'application/json'
                      },
                      body:  JSON. stringify({latitude: data.latitude,longitude: data.longitude})
                    }).then((res) => res.json()),
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error('timeout')), timeout)
        )
    ]);
  });
}


/*******************************************************************/
/* Submit driver location before barcode scan        */
/*******************************************************************/

export async function getCompanies() {
  return _retrieveUserToken().then((token) => {
    return fetch(config.API_URL+'companies',{
                      method: 'GET',
                      headers: {
                          'Authorization': 'Bearer ' + token,
                          'Accept': 'application/json',
                          'Content-Type': 'application/json'
                      },
                    }).then((res) => res.json())
  });
}


/*******************************************************************/
/* Get Vehicle information in Home vehicle barcode scan screen     */
/*******************************************************************/

export async function saveProductInfo(formdata) {
  return _retrieveUserToken().then((token) => {
    return fetch(config.API_URL+'scanparcel',{
                      method: 'POST',
                      headers: {
                          'Authorization': 'Bearer ' + token,
                          'Accept': 'application/json',
                          'Content-Type': 'multipart/form-data'
                      },
                      body: formdata
                    }).then((res) => res.json())
  });
}

/*******************************************************************/
/* Get Vehicle information in Home vehicle barcode scan screen     */
/*******************************************************************/

export async function getData(target) {
  return _retrieveUserToken().then((token) => {
    return fetch(config.API_URL+target,{
                      method: 'GET',
                      headers: {
                          'Authorization': 'Bearer ' + token,
                          'Accept': 'application/json',
                          'Content-Type': 'application/json'
                      },
                    }).then((res) => res.json())
  });
}

/*******************************************************************/
/* Get Vehicle information in Home vehicle barcode scan screen     */
/*******************************************************************/

export async function forgotPasswordApi(data) {
    return fetch(config.API_URL+'forgot_password',{
                      method: 'POST',
                      headers: {
                          'Accept': 'application/json',
                          'Content-Type': 'application/json'
                      },
                      body:  JSON.stringify({email: data.email})
                    }).then((res) => res.json())
}

/*******************************************************************/
/* Get Vehicle information in Home vehicle barcode scan screen     */
/*******************************************************************/

export async function removeParcels(data) {
  return _retrieveUserToken().then((token) => {
    return fetch(config.API_URL+'deleteparcel',{
                      method: 'POST',
                      headers: {
                          'Authorization': 'Bearer ' + token,
                          'Accept': 'application/json',
                          'Content-Type': 'application/json'
                      },
                      body:  JSON.stringify(data)
                    }).then((res) => res.json())
  });
}


/*******************************************************************/
/* Post Route information in Home vehicle barcode scan screen     */
/*******************************************************************/

export async function saveRouteInfo(data) {
  return _retrieveUserToken().then((token) => {
    return fetch(config.API_URL+'createroute',{
                      method: 'POST',
                      headers: {
                          'Authorization': 'Bearer ' + token,
                          'Accept': 'application/json',
                          'Content-Type': 'application/json'
                      },
                      body:  JSON. stringify(data)
                    }).then((res) => res.json())
  });
}


/*******************************************************************/
/* Get customer data using stop id     */
/*******************************************************************/

export async function getCustomerdata(data) {
  return _retrieveUserToken().then((token) => {
    return fetch(config.API_URL+'delivery_customer_detail',{
                      method: 'POST',
                      headers: {
                          'Authorization': 'Bearer ' + token,
                          'Accept': 'application/json',
                          'Content-Type': 'application/json'
                      },
                      body:  JSON. stringify(data)
                    }).then((res) => res.json())
  });
}



/*******************************************************************/
/* Save Vehicle Inspection after barcode scan screen     */
/*******************************************************************/

export async function saveDeliveryData(formdata) {
  var timeout = 22000;
  return _retrieveUserToken().then((token) => {
     return Promise.race([
        fetch(config.API_URL+'delivered',{
                      method: 'POST',
                      headers: {
                          'Authorization': 'Bearer ' + token,
                          'Content-Type': 'multipart/form-data',
                          'Accept': 'application/json',
                      },
                      body: formdata
                    }).then((res) => res.json()),
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error('timeout')), timeout)
        )
    ]);
  });
}

export async function saveDeliveryData2(formdata) {
  var timeout = 40000;
  return _retrieveUserToken().then((token) => {
     return Promise.race([
        fetch(config.API_URL+'delivered',{
                      method: 'POST',
                      headers: {
                          'Authorization': 'Bearer ' + token,
                          'Content-Type': 'multipart/form-data',
                          'Accept': 'application/json',
                      },
                      body: formdata
                    }).then((res) => res.json()),
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error('timeout')), timeout)
        )
    ]);
  });
}


/*******************************************************************/
/* Save Vehicle Inspection after barcode scan screen     */
/*******************************************************************/

export async function notDelivered(formdata) {

return _retrieveUser().then((user) => {
    var user = JSON.parse(user);
    var token = user.userInfo.token;
    return fetch(config.API_URL+'not_delivered',{
                      method: 'POST',
                      headers: {
                          'Authorization': 'Bearer ' + token,
                          'Accept': 'application/json',
                          'Content-Type': 'multipart/form-data'
                      },
                      body: formdata
                    })
                    .then((res) => res.json())

           });


}


/*******************************************************************/
/* Save Vehicle Inspection after barcode scan screen     */
/*******************************************************************/

export async function saveVehicleEnddayInspection(formdata) {

return _retrieveUser().then((user) => {
    var user = JSON.parse(user);
    var token = user.userInfo.token;
    return fetch(config.API_URL+'vehicle_inspection_endday',{
                      method: 'POST',
                      headers: {
                          'Authorization': 'Bearer ' + token,
                          'Accept': 'application/json',
                          'Content-Type': 'multipart/form-data'
                      },
                      body: formdata
                    })
                    .then((res) => res.json())

           });


}



/*******************************************************************/
/* Get customer data using stop id     */
/*******************************************************************/

export async function searchParcel(data) {
  return _retrieveUserToken().then((token) => {
    return fetch(config.API_URL+'search_parcel',{
                      method: 'POST',
                      headers: {
                          'Authorization': 'Bearer ' + token,
                          'Accept': 'application/json',
                          'Content-Type': 'application/json'
                      },
                      body:  JSON. stringify(data)
                    }).then((res) => res.json())
  });
}


/*******************************************************************/
/* Get customer data using stop id     */
/*******************************************************************/

export async function searchParcelCorrection(data) {
  return _retrieveUserToken().then((token) => {
    return fetch(config.API_URL+'search_delivery_correction_barcode',{
                      method: 'POST',
                      headers: {
                          'Authorization': 'Bearer ' + token,
                          'Accept': 'application/json',
                          'Content-Type': 'application/json'
                      },
                      body:  JSON. stringify(data)
                    }).then((res) => res.json())
  });
}


/*******************************************************************/
/* Get customer data using stop id     */
/*******************************************************************/

export async function searchParcelUseAddress(data) {
  return _retrieveUserToken().then((token) => {
    return fetch(config.API_URL+'search_parcel_use_address',{
                      method: 'POST',
                      headers: {
                          'Authorization': 'Bearer ' + token,
                          'Accept': 'application/json',
                          'Content-Type': 'application/json'
                      },
                      body:  JSON. stringify(data)
                    }).then((res) => res.json())
  });
}

/*******************************************************************/
/* Get customer data using stop id     */
/*******************************************************************/

export async function searchParcelUseAddressCorrection(data) {
  return _retrieveUserToken().then((token) => {
    return fetch(config.API_URL+'search_delivery_correction_address',{
                      method: 'POST',
                      headers: {
                          'Authorization': 'Bearer ' + token,
                          'Accept': 'application/json',
                          'Content-Type': 'application/json'
                      },
                      body:  JSON. stringify(data)
                    }).then((res) => res.json())
  });
}


/*******************************************************************/
/* Get customer data using stop id     */
/*******************************************************************/

export async function searchParcelAddress(data) {
  return _retrieveUserToken().then((token) => {
    return fetch(config.API_URL+'search_parcel_canpar_ftp',{
                      method: 'POST',
                      headers: {
                          'Authorization': 'Bearer ' + token,
                          'Accept': 'application/json',
                          'Content-Type': 'application/json'
                      },
                      body:  JSON. stringify(data)
                    }).then((res) => res.json())
  });
}


/*******************************************************************/
/* Save Vehicle Inspection after barcode scan screen     */
/*******************************************************************/

export async function updateProfilePic(formdata) {

return _retrieveUser().then((user) => {
    var user = JSON.parse(user);
    var token = user.userInfo.token;
    return fetch(config.API_URL+'update_profile_photo',{
                      method: 'POST',
                      headers: {
                          'Authorization': 'Bearer ' + token,
                          'Accept': 'application/json',
                          'Content-Type': 'multipart/form-data'
                      },
                      body: formdata
                    })
                    .then((res) => res.json())

           });


}

export async function save_retail_drop(formdata) {

return _retrieveUser().then((user) => {
    var user = JSON.parse(user);
    var token = user.userInfo.token;
    return fetch(config.API_URL+'save_retail_drop',{
                      method: 'POST',
                      headers: {
                          'Authorization': 'Bearer ' + token,
                          'Accept': 'application/json',
                          'Content-Type': 'multipart/form-data'
                      },
                      body: formdata
                    })
                    .then((res) => res.json())

           });
}

/*******************************************************************/
/* Post Route information in Home vehicle barcode scan screen     */
/*******************************************************************/

export async function changePassword(data) {
  return _retrieveUserToken().then((token) => {
    return fetch(config.API_URL+'change_password',{
                      method: 'POST',
                      headers: {
                          'Authorization': 'Bearer ' + token,
                          'Accept': 'application/json',
                          'Content-Type': 'application/json'
                      },
                      body:  JSON. stringify(data)
                    }).then((res) => res.json())
  });
}

/*******************************************************************/
/* Post Route information in Home vehicle barcode scan screen     */
/*******************************************************************/

export async function updateDeliveryAddress(data) {
  return _retrieveUserToken().then((token) => {
    return fetch(config.API_URL+'update_delivery_address',{
                      method: 'POST',
                      headers: {
                          'Authorization': 'Bearer ' + token,
                          'Accept': 'application/json',
                          'Content-Type': 'application/json'
                      },
                      body:  JSON. stringify(data)
                    }).then((res) => res.json())
  });
}


/*******************************************************************/
/* Post Route information in Home vehicle barcode scan screen     */
/*******************************************************************/

export async function SignUpForm(data) {
    return fetch(config.API_URL+'registration',{
                      method: 'POST',
                      headers: {
                          'Accept': 'application/json',
                          'Content-Type': 'application/json'
                      },
                      body:  JSON. stringify(data)
                    }).then((res) => res.json())
}

export async function submitSettlement(formdata) {

return _retrieveUser().then((user) => {
    var user = JSON.parse(user);
    var token = user.userInfo.token;
    return fetch(config.API_URL+'settlement',{
                      method: 'POST',
                      headers: {
                          'Authorization': 'Bearer ' + token,
                          'Accept': 'application/json',
                          'Content-Type': 'multipart/form-data'
                      },
                      body: formdata
                    })
                    .then((res) => res.json())

           });
}


export async function submitRtw(formdata) {

return _retrieveUser().then((user) => {
    var user = JSON.parse(user);
    var token = user.userInfo.token;
    return fetch(config.API_URL+'return_to_warehouse',{
                      method: 'POST',
                      headers: {
                          'Authorization': 'Bearer ' + token,
                          'Accept': 'application/json',
                          'Content-Type': 'multipart/form-data'
                      },
                      body: formdata
                    })
                    .then((res) => res.json())

           });
}

export async function submitLeftInWareHouse(formdata) {
console.log(formdata);
return _retrieveUser().then((user) => {
    var user = JSON.parse(user);
    var token = user.userInfo.token;
    return fetch(config.API_URL+'left_in_warehouse',{
                      method: 'POST',
                      headers: {
                          'Authorization': 'Bearer ' + token,
                          'Accept': 'application/json',
                          'Content-Type': 'multipart/form-data'
                      },
                      body: formdata
                    })
                    .then((res) => res.json())

           });
}

export async function logout(mac) {

return  _retrieveUserToken().then((token) => {
 return fetch(config.API_URL+'logout',{
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + token,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body:  JSON.stringify({mac_address: mac})
      }).then(data => data.json())
      
      .catch(err => console.error(err));
    });
}

export async function submitHelperInformation(formdata) {

return _retrieveUser().then((user) => {
    var user = JSON.parse(user);
    var token = user.userInfo.token;
    // console.log(token);
    return fetch(config.API_URL+'save_selfie_photo',{ 
                      method: 'POST',
                      headers: {
                          'Authorization': 'Bearer ' + token,
                          'Accept': 'application/json',
                          'Content-Type': 'multipart/form-data'
                      },
                      body:  formdata
                      }).then(res => res.json())
                      .catch(err => console.error(err));
           });
}

export async function saveAgreementData(formdata) {

return _retrieveUser().then((user) => {
    var user = JSON.parse(user);
    var token = user.userInfo.token;
    return fetch(config.API_URL+'save_agreement',{
                      method: 'POST',
                      headers: {
                          'Authorization': 'Bearer ' + token,
                          'Accept': 'application/json',
                          'Content-Type': 'multipart/form-data'
                      },
                      body: formdata
                    })
                    .then((res) => res.json())

           });


}

export async function savePickup(data) {
  return _retrieveUserToken().then((token) => {
    return fetch(config.API_URL+'save_pickup_load',{
                      method: 'POST',
                      headers: {
                          'Authorization': 'Bearer ' + token,
                          'Accept': 'application/json',
                          'Content-Type': 'application/json'
                      },
                      body:  JSON.stringify(data)
                    }).then((res) => res.json())
    });
}

export async function checkPickupBarcode(barcode) {
  return _retrieveUserToken().then((token) => {
    return fetch(config.API_URL+'check_pickup_load',{
                      method: 'POST',
                      headers: {
                          'Authorization': 'Bearer ' + token,
                          'Accept': 'application/json',
                          'Content-Type': 'application/json'
                      },
                      body:  JSON. stringify({barcode: barcode})
                    }).then((res) => res.json())
  });
}

export async function submitPickupRtw(formdata) {

return _retrieveUser().then((user) => {
    var user = JSON.parse(user);
    var token = user.userInfo.token;
    return fetch(config.API_URL+'rtw_pickup_load',{
                      method: 'POST',
                      headers: {
                          'Authorization': 'Bearer ' + token,
                          'Accept': 'application/json',
                          'Content-Type': 'multipart/form-data'
                      },
                      body: formdata
                    })
                    .then((res) => res.json())

           });
}

export async function getWarehouseById(id) {
  return _retrieveUserToken().then((token) => {
    return fetch(config.API_URL+'company_warehouse_list',{
                      method: 'POST',
                      headers: {
                          'Authorization': 'Bearer ' + token,
                          'Accept': 'application/json',
                          'Content-Type': 'application/json'
                      },
                      body:  JSON. stringify({company_id: id})
                    }).then((res) => res.json())
  });
}

export async function postData(data,api_url) {
  return _retrieveUserToken().then((token) => {
    return fetch(config.API_URL+api_url,{
                      method: 'POST',
                      headers: {
                          'Authorization': 'Bearer ' + token,
                          'Accept': 'application/json',
                          'Content-Type': 'application/json'
                      },
                      body:  JSON.stringify(data)
                    }).then((res) => res.json())
  });
}

export async function postDataWithPic(formdata,api_url) {
return _retrieveUserToken().then((token) => {
    return fetch(config.API_URL+api_url,{
                      method: 'POST',
                      headers: {
                          'Authorization': 'Bearer ' + token,
                          'Accept': 'application/json',
                          'Content-Type': 'multipart/form-data'
                      },
                      body: formdata
                    })
                    .then((res) => res.json())
           });
}

// Map API's

export async function getRoutes() {
  return _retrieveUserToken().then((token) => {
    return fetch(config.API_URL+'create_my_route',{
                      method: 'GET',
                      headers: {
                          'Authorization': 'Bearer ' + token,
                          'Accept': 'application/json',
                          'Content-Type': 'application/json'
                      },
                    }).then((res) => res.json())
  });
}

export async function demo() {

    return fetch('https://my-json-server.typicode.com/typicode/demo/posts',{
                      method: 'GET',
                      headers: {
                          'Accept': 'application/json',
                          'Content-Type': 'application/json'
                      },
                    }).then((res) => res.json())
}

export async function getUpdatedPoints() {
  return _retrieveUserToken().then((token) => {
    return fetch(config.API_URL+'get_rescue_route',{
                      method: 'GET',
                      headers: {
                        'Authorization': 'Bearer '+token, 
                          'Accept': 'application/json',
                          'Content-Type': 'application/json'
                      },
                    }).then((res) => res.json())
  }); 
}


 
export async function markNumberToPackages(waypoints) {
  // console.log(waypoints);
 return _retrieveUserToken().then((token) => {
  // console.log(token);
    return fetch(config.API_URL+'mark_number_to_packages',{
          method: 'POST',
          headers: {
            'Authorization': 'Bearer '+token,        
          },    
          body: waypoints
        })
        .then((res) => res.json())
    }); 
            
} 


export async function getPostalCode(lat,lon) {
 
    return fetch('https://revgeocode.search.hereapi.com/v1/revgeocode?at='+lat+','+lon+'&lang=en-US&apiKey=hoeC8KKbZAQv2dVprjVcaN0LrXnojTkNThDzV9iG2kM',{
                      method: 'GET',
                      
                    }).then((res) => res.json())
}

export async function getRouteApiStatus() {
  return _retrieveUserToken().then((token) => {
    return fetch(config.API_URL+'check_route_type',{
                      method: 'GET',
                      headers: {
                        'Authorization': 'Bearer '+token, 
                          'Accept': 'application/json',
                          'Content-Type': 'application/json'
                      },
                    }).then((res) => res.json())
  }); 
}

export async function getDataTextract(formdata) {
  return _retrieveUserToken().then((token) => {
    return fetch(config.API_URL+'aws_textract',{
                      method: 'POST',
                      headers: {
                          'Authorization': 'Bearer ' + token,
                          'Accept': 'application/json',
                          'Content-Type': 'multipart/form-data'
                      },
                      body: formdata
                    }).then((res) => res.json())
  });
}

export async function getDataAwsRecog(formdata) {
  var timeout = 12000;
  return _retrieveUserToken().then((token) => {

     return Promise.race([
        fetch(config.API_URL+'aws_rekognition',{
                      method: 'POST',
                      headers: {
                          'Authorization': 'Bearer ' + token,
                          'Accept': 'application/json',
                          'Content-Type': 'multipart/form-data'
                      },
                      body: formdata
                    }).then((res) => res.json()),
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error('timeout')), timeout)
        )
    ]);
  });
}

export async function updateStop(data) {
  
  return _retrieveUserToken().then((token) => {
    return fetch(config.API_URL+'update_customer_address',{
                      method: 'POST',
                      headers: {
                          'Authorization': 'Bearer ' + token,
                          'Accept': 'application/json',
                          'Content-Type': 'multipart/form-data'
                      },
                      body:  data
                    }).then((res) => res.json())
  });
}

export async function delete_stop(formdata) {
  // var data = JSON.stringify([{stop_id: stop_id}])
  console.log(formdata);

 return _retrieveUserToken().then((token) => {
console.log(token);
    return fetch(config.API_URL+'delete_stop',{
          method: 'POST',
          headers: {
            'Authorization': 'Bearer '+token,     
            'Accept': 'application/json',
            'Content-Type': 'application/json'   
          },    
          body: JSON.stringify(formdata)
        })
        .then((res) => res.json())
    }); 
            
} 

export async function safezone_warehouse_list() {
  return _retrieveUserToken().then((token) => {
    return fetch(config.API_URL+'safezone_warehouse_list',{
                      method: 'GET',
                      headers: {
                        'Authorization': 'Bearer '+token, 
                          'Accept': 'application/json',
                          'Content-Type': 'application/json'
                      },
                    }).then((res) => res.json())
  }); 
}


export async function update_distance_time(waypoints) {
  console.log(waypoints);
 return _retrieveUserToken().then((token) => {
  // console.log(token);
    return fetch(config.API_URL+'update_distance_time',{
          method: 'POST',
          headers: {
            'Authorization': 'Bearer '+token,        
          },    
          body: waypoints
        })
        .then((res) => res.json())
    }); 
            
}

export async function complete_my_route(data) {
  
 return _retrieveUserToken().then((token) => {
  // console.log(token);
    return fetch(config.API_URL+'complete_my_route',{
          method: 'POST',
          headers: {
            'Authorization': 'Bearer '+token,  
            'Accept': 'application/json',
            'Content-Type': 'application/json'      
          },    
          body: JSON.stringify(data)
        })
        .then((res) => res.json())
    }); 
            
}

export async function save_skip_stop(data) {
  
 return _retrieveUserToken().then((token) => {
  // console.log(token);
    return fetch(config.API_URL+'save_skip_stop',{
          method: 'POST',
          headers: {
            'Authorization': 'Bearer '+token,  
            'Accept': 'application/json',
            'Content-Type': 'application/json'      
          },    
          body: JSON.stringify(data)
        })
        .then((res) => res.json())
    }); 
            
}

export async function save_rescue_pickup_location(data) {

 return _retrieveUserToken().then((token) => {
  // console.log(token);
    return fetch(config.API_URL+'save_rescue_pickup_location',{
          method: 'POST',
          headers: {
            'Authorization': 'Bearer '+token,  
            'Accept': 'application/json',
            'Content-Type': 'application/json'      
          },    
          body: JSON.stringify(data)
        })
        .then((res) => res.json())
    }); 
            
}

export async function get_rescue_last_load() {
  return _retrieveUserToken().then((token) => {
    return fetch(config.API_URL+'get_rescue_last_load',{
                      method: 'GET',
                      headers: {
                        'Authorization': 'Bearer '+token, 
                          'Accept': 'application/json',
                          'Content-Type': 'application/json'
                      },
                    }).then((res) => res.json())
  }); 
}

export async function create_rescue_route(data) {

 return _retrieveUserToken().then((token) => {
  // console.log(token);
    return fetch(config.API_URL+'create_rescue_route',{
          method: 'POST',
          headers: {
            'Authorization': 'Bearer '+token,  
            'Accept': 'application/json',
            'Content-Type': 'application/json'      
          },    
          body: JSON.stringify(data)
        })
        .then((res) => res.json())
    }); 
            
}