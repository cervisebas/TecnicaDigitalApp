/**
 * @format
 */

import { AppRegistry } from 'react-native';
import { name as appName } from './app.json';
import AppIndex from './src/AppIndex';

AppRegistry.registerComponent(appName, ()=>AppIndex);