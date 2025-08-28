var sceneReadyBehavior = require('../behavior-scene/scene-ready');
Component({
  behaviors: [sceneReadyBehavior],
  properties: {
    url: {
      type: String,
      value: ''
    },
    scale: {
      type: String,
      value: ""
    },
    title: {
      type: String,
      value: ""
    },
  },
  data: {

  },
});