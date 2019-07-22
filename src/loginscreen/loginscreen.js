import React, { Component } from 'react';

import {StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    Image,
    ImageBackground,
    ScrollView,
    ActivityIndicator,
    KeyboardAvoidingView,
} from "react-native";

import AsyncStorage from '@react-native-community/async-storage';

import LoginForm from '../../components/loginform';

import { NavigationActions, StackActions } from 'react-navigation';

// For posting to tracker.transistorsoft.com
import DeviceInfo from 'react-native-device-info';

import {StyleProvider} from "native-base";
import Navigator from '../Navigator';

import App from '../App';

export default class LoginScreen extends Component {
    constructor(props) {
        super(props);
        let navigation = props.navigation;
        this.state = {
            usernameValue: '',
            passwordValue: '',
            token: '',
            loggingIn: false,
            loginError: false,
            loginErrorMessage: null
        }
        
        AsyncStorage.getItem('mmp_username').then((value) => {this.setState({usernameValue: value || ''})});
        AsyncStorage.getItem('mmp_password').then((value) => {this.setState({passwordValue: value || ''})});
        changeUsername = (text) => {
            this.state.usernameValue = text;
            console.log('Username is: ' + text);
            console.log('And in state - ' + this.state.usernameValue);
        }
        changePassword = (text) => {
            this.state.passwordValue = text;
            console.log('Password is: ' + text);
            console.log('And in state - ' + this.state.passwordValue);
        }
        onLoginPressButton = () => {
            console.log('State is: ' + JSON.stringify(this.state));
            this.setState({
                loggingIn: true,
                loginError: false,
                loginErrorMessage: null
            });                          

            fetch('https://managemyapi.azurewebsites.net/Mobile.asmx/AuthRequest', {
                method: 'POST',
                headers: {
                  Accept: 'application/json',
                  'Content-Type': 'application/json; charset=utf-8;',
                  'Data-Type': 'json'
                },
                body: JSON.stringify({
                  username: this.state.usernameValue,
                  password: this.state.passwordValue,
                  device_id: DeviceInfo.getUniqueID()
                }),
            })
            .then((response) => response.json())
            .then((responseJson) => {
                if(responseJson.d.auth_result == 0) {
                    AsyncStorage.setItem('@mmp:auth_token', responseJson.d.token);
                    console.log("Auth token is " + responseJson.d.token);
                    AsyncStorage.setItem('@mmp:user_id', responseJson.d.user.user_id.toString());
                    AsyncStorage.setItem('mmp_username', this.state.usernameValue);
                    AsyncStorage.setItem('mmp_password', this.state.passwordValue);
                    this.onClickNavigate('StartPage');    
                }
                else {
                    this.setState({
                        loggingIn: false,
                        loginError: true,
                        loginErrorMessage: 'Login failed'
                    });                    
                }
            })
            .catch((error) =>{
                console.error(error);
                this.setState({
                    loggingIn: false,
                    loginError: true,
                    loginErrorMessage: error
                });                          
            });
        }        
        AsyncStorage.setItem("@mmp:next_page", 'LoginScreen');
    }


    onClickNavigate(routeName) {
        navigateAction = NavigationActions.navigate({
            routeName: routeName,
            params: { username: this.state.username },
        });  
        this.props.navigation.dispatch(navigateAction);        
    }
        
render() {
    return (
            <KeyboardAvoidingView style={styles.container} behavior="padding" enabled>
                <View style={styles.logocontainer}>
                    <Image source={require('../../images/MMP.png')} style={styles.logo} />
                </View>
                <View style={styles.loginform}>
                    <TextInput underlineColorAndroid='transparent' defaultValue={this.state.usernameValue.toString().toLocaleLowerCase()} placeholder='Username' style={styles.textinput} autoCapitalize='none' onChangeText={changeUsername} />
                    <TextInput underlineColorAndroid='transparent' defaultValue={this.state.passwordValue} placeholder='Password' secureTextEntry={true} autoCapitalize='none' style={styles.textinput}  onChangeText={changePassword} />
                    <TouchableOpacity style={styles.loginbtn} onPress={onLoginPressButton}>
                        <Text style={styles.infotext}>Login</Text>
                    </ TouchableOpacity>
                    <ActivityIndicator size="large" color="darkorange" style={{opacity: this.state.loggingIn ? 1.0 : 0.0, marginTop: 10}}  animating={true} />
                    <Text style={{color: 'red', fontWeight: 'bold', opacity: this.state.loginError? 1.0: 0.0}}>
                        Login error:
                    </Text>
                    <Text style={{color: 'red', opacity: this.state.loginErrorMessage != null? 1.0: 0.0}}>
                        {this.state.loginErrorMessage}
                    </Text>
                </View>
            </KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
    infotext: {
        fontSize: 20,
        color: 'white'
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignSelf: 'stretch',
        width: null,
        padding: 20,
        backgroundColor: 'white',
    },
    horizontal: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 10
    },
    logocontainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logo: {
        flex: 1,
        width: 300,
        height: 150,
        resizeMode: 'contain'
    },
    loginform: {
        flex: 2,
    },
    loginformcontainer: {
        alignItems: 'center',
    },
    textinput: {
        color: 'white',
        alignSelf: 'stretch',
        padding: 12,
        marginBottom: 10,
        backgroundColor: 'orange',
        borderColor: 'grey',
        borderWidth: 0.8,
        fontSize: 20,
        borderRadius: 3,
    },
    switch: {
        padding: 12,
        marginBottom: 30,
        borderColor: '#fff',
        borderWidth: 0.6,
    },
    text: {
        fontSize: 20,
    },
    loginbtn: {
        backgroundColor: 'darkorange',
        alignSelf: 'stretch',
        alignItems: 'center',
        padding: 14,
        marginTop: 10,
        borderColor: 'grey',
        borderWidth: 0.8,
        borderRadius: 10,
    },
});
