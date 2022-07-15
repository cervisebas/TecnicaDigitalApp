/**
 * @format
 */

import { AppRegistry } from 'react-native';
import BackgroundFetch from "react-native-background-fetch";
import { name as appName } from './app.json';
import Index from './src/Index';

AppRegistry.registerComponent(appName, ()=>Index);


let MyHeadlessTask = async (event) => {
  // Get task id from event {}:
  let taskId = event.taskId;
  let isTimeout = event.timeout;  // <-- true when your background-time has expired.
  if (isTimeout) {
    // This task has exceeded its allowed running-time.
    // You must stop what you're doing immediately finish(taskId)
    console.log('[BackgroundFetch] Headless TIMEOUT:', taskId);
    BackgroundFetch.finish(taskId);
    return;
  }
  console.log('[BackgroundFetch HeadlessTask] start: ', taskId);
  // Perform an example HTTP request.
  // Important:  await asychronous tasks when using HeadlessJS.
  let response = await fetch('https://reactnative.dev/movies.json');
  let responseJson = await response.json();
  console.log('[BackgroundFetch HeadlessTask] response: ', responseJson);
  // Required:  Signal to native code that your task is complete.
  // If you don't do this, your app could be terminated and/or assigned
  // battery-blame for consuming too much time in background.
  BackgroundFetch.finish(taskId);
}
// Register your BackgroundFetch HeadlessTask
BackgroundFetch.registerHeadlessTask(MyHeadlessTask);