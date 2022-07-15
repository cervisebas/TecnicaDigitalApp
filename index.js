/**
 * @format
 */

import { AppRegistry } from 'react-native';
import BackgroundFetch from "react-native-background-fetch";
import { name as appName } from './app.json';
import Index from './src/Index';

AppRegistry.registerComponent(appName, ()=>Index);


let MyHeadlessTask = async (event) => {
  let taskId = event.taskId;
  let isTimeout = event.timeout;
  if (isTimeout) {
    console.log('[BackgroundFetch] Headless TIMEOUT:', taskId);
    BackgroundFetch.finish(taskId);
    return;
  }
  console.log('[BackgroundFetch HeadlessTask] start: ', taskId);
  let response = await fetch('https://reactnative.dev/movies.json');
  let responseJson = await response.json();
  console.log('[BackgroundFetch HeadlessTask] response: ', responseJson);
  BackgroundFetch.finish(taskId);
}
BackgroundFetch.registerHeadlessTask(MyHeadlessTask);