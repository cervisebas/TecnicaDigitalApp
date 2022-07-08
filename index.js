/**
 * @format
 */

import { AppRegistry, Platform } from 'react-native';
import App from './src/App';
import Index from './src/Index';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, ()=>Index);
