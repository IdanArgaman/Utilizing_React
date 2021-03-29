const initialState = {
  logEntries: [],
};

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case 'ADD_LOG_ENTRY': {
      const {componentName, instanceId, methodName} = action;
      return {
        ...state,
        logEntries: [...state.logEntries, {componentName, instanceId, methodName}]
      };
    }
    default: {
      return state;
    }
  }
};
