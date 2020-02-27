// @flow
export const SET_MAX_CACHE_SIZE = 'SET_MAX_CACHE_SIZE';
export const SET_GRID_COLUMNS = 'SET_GRID_COLUMNS';
export const SET_ALLOW_CONCURRENT_AUDIO = 'SET_ALLOW_CONCURRENT_AUDIO';

export function setMaxCacheSize(value: number) {
  return {
    type: SET_MAX_CACHE_SIZE,
    value
  };
}

export function setGridColumns(value: number) {
  return {
    type: SET_GRID_COLUMNS,
    value
  };
}

export function setAllowConcurrentAudio(value: boolean) {
  return {
    type: SET_ALLOW_CONCURRENT_AUDIO,
    value
  };
}
