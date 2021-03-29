// Primitive actions:

export const addLogEntry = (componentName, instanceId, methodName) => (
  {type: 'ADD_LOG_ENTRY', componentName, instanceId, methodName}
);

// export const trace = (componentName, instanceId, methodName) => (dispatch, getState) => {
//   if (constants.shouldLogInConsole) {
//     /* eslint no-console: 0 */
//     console.log(`${util.getTimeStamp()} ${componentName}-${instanceId}: ${methodName}`);
//   }

//   setTimeout(() => { // Async, so we can log from render
//     const {logEntries, replayTimerId} = getState();
//     dispatch(addLogEntry(componentName, instanceId, '' + methodName));
//     if (replayTimerId === null) {
//       dispatch(setHighlight(logEntries.length));
//       dispatch(startReplay());
//     }
//   }, 0);
// };
