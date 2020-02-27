// @flow
type State = {
  maxCacheSize: number,
  gridColumns: number,
  allowConcurrentAudio: boolean
};

type Action = {
  type: string,
  // eslint-disable-next-line flowtype/no-weak-types
  value: any
};

const defaultState: State = {
  maxCacheSize: 25,
  gridColumns: 6,
  allowConcurrentAudio: false
};

const settings = (state: State = defaultState, action: Action) => {
  switch (action.type) {
    case 'SET_MAX_CACHE_SIZE':
      return {
        ...state,

        maxCacheSize: action.value
      };
    case 'SET_GRID_COLUMNS':
      return {
        ...state,

        gridColumns: action.value
      };
    case 'SET_ALLOW_CONCURRENT_AUDIO':
      return {
        ...state,

        allowConcurrentAudio: action.value
      };
    default:
      return state;
  }
};

export default settings;
