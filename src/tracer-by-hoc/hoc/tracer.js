import React from "react";
import {
  store as tracerStore
} from "../store/TracerStore";
import * as ActionCreators from "../store/actionCreators";

export default function traceLifecycle(ComponentToTrace) {
  const componentToTraceName =
    ComponentToTrace.displayName || ComponentToTrace.name || "Component";

  const instanceId = new Date().getTime();
  class TracedComponent extends ComponentToTrace {
    constructor(props, context) {
      tracerStore.dispatch(
        ActionCreators.addLogEntry(componentToTraceName, instanceId, "constructor")
      );
      super(props, context);
    }
  }

  return TracedComponent;
}