import type { Dispatch as ReduxDispatch, Store as ReduxStore } from 'redux';

export type settingsStateType = {
  +maxCacheSize: number,
  +gridColumns: number,
  +allowConcurrentAudio: boolean
};

export type Action = {
  +type: string,
  +value: mixed
};

export type GetState = () => settingsStateType;

export type Dispatch = ReduxDispatch<Action>;

export type Store = ReduxStore<GetState, Action>;
